const SPEECH_START_TIMEOUT_MS = 1400

const findGoogleVoice = (): SpeechSynthesisVoice | undefined => {
  const voices = window.speechSynthesis.getVoices()

  return (
    voices.find((voice) => /google/i.test(voice.name)) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith('en')) ??
    voices[0]
  )
}

const speakText = (text: string, voice: SpeechSynthesisVoice) =>
  new Promise<boolean>((resolve) => {
    let settled = false

    const settle = (value: boolean) => {
      if (settled) {
        return
      }
      settled = true
      resolve(value)
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = voice
    utterance.lang = voice.lang || 'en-US'
    utterance.rate = 1
    utterance.pitch = 1

    const startTimeoutId = window.setTimeout(() => {
      window.speechSynthesis.cancel()
      settle(false)
    }, SPEECH_START_TIMEOUT_MS)

    utterance.onstart = () => {
      window.clearTimeout(startTimeoutId)
      settle(true)
    }

    utterance.onend = () => {
      window.clearTimeout(startTimeoutId)
      settle(true)
    }

    utterance.onerror = () => {
      window.clearTimeout(startTimeoutId)
      settle(false)
    }

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  })

export const narrateWithGoogleVoice = async (text: string) => {
  if (!text.trim() || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false
  }

  let voice = findGoogleVoice()
  if (voice) {
    return speakText(text, voice)
  }

  voice = await new Promise<SpeechSynthesisVoice | undefined>((resolve) => {
    const timeoutId = window.setTimeout(() => resolve(undefined), 1000)

    const handleVoicesChanged = () => {
      const selected = findGoogleVoice()
      if (selected) {
        window.clearTimeout(timeoutId)
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged)
        resolve(selected)
      }
    }

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged)
    handleVoicesChanged()
  })

  if (!voice) {
    return false
  }

  return speakText(text, voice)
}
