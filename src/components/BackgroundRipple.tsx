import { useEffect, useRef } from 'react'

type Ripple = {
  x: number
  y: number
  time: number
  amplitudeScale: number
}

export const BackgroundRipple = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ripplesRef = useRef<Ripple[]>([])
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (prefersReduced) return
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) {
      return
    }

    const config = isDarkMode ? {
      baseColor: { r: 0, g: 121, b: 112 }, // Brand Teal
      highlightColor: { r: 199, g: 70, b: 1 }, // Brand Orange
      dotRadius: 1.5,
      gridSpacing: 15,
      waveSpeed: 0.16,
      waveFrequency: 0.015,
      waveAmplitude: 20,
      rippleLifespan: 6000,
      maxRipples: 12,
      background: '#09090b', // Dark background
    } : {
      baseColor: { r: 0, g: 121, b: 112 },
      highlightColor: { r: 199, g: 70, b: 1 },
      dotRadius: 1.5,
      gridSpacing: 15,
      waveSpeed: 0.16,
      waveFrequency: 0.015,
      waveAmplitude: 20,
      rippleLifespan: 6000,
      maxRipples: 12,
      background: '#FAFBF8',
    }

    const addRipple = (x: number, y: number, amplitudeScale = 1) => {
      ripplesRef.current.push({ x, y, time: performance.now(), amplitudeScale })
      if (ripplesRef.current.length > config.maxRipples) {
        ripplesRef.current.splice(0, ripplesRef.current.length - config.maxRipples)
      }
    }

    const randomPoint = () => ({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight })

    let frameId = 0
    const timeoutIds: ReturnType<typeof setTimeout>[] = []

    const render = () => {
      const width = canvas.width
      const height = canvas.height
      const now = performance.now()

      ctx.fillStyle = config.background
      ctx.fillRect(0, 0, width, height)

      ripplesRef.current = ripplesRef.current.filter((ripple) => now - ripple.time < config.rippleLifespan)

      const rows = Math.ceil(height / config.gridSpacing)
      const cols = Math.ceil(width / config.gridSpacing)

      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          const x = col * config.gridSpacing
          const y = row * config.gridSpacing

          let displacementX = 0
          let displacementY = 0
          let waveHeight = 0
          let affected = false

          for (let index = 0; index < ripplesRef.current.length; index++) {
            const ripple = ripplesRef.current[index]
            const age = now - ripple.time
            const maxRadius = age * config.waveSpeed + 300

            if (Math.abs(x - ripple.x) > maxRadius || Math.abs(y - ripple.y) > maxRadius) {
              continue
            }

            const dx = x - ripple.x
            const dy = y - ripple.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            const currentRadius = age * config.waveSpeed

            if (Math.abs(distance - currentRadius) < 200) {
              const phase = distance * config.waveFrequency - age * 0.002
              const decay = 1 - age / config.rippleLifespan
              const distanceDecay = Math.max(0, 1 - distance / 1500)
              const strength = Math.sin(phase) * decay * distanceDecay

              if (Math.abs(strength) > 0.05) {
                affected = true
                const angle = Math.atan2(dy, dx)
                displacementX += Math.cos(angle) * strength * config.waveAmplitude * ripple.amplitudeScale
                displacementY += Math.sin(angle) * strength * config.waveAmplitude * ripple.amplitudeScale
                waveHeight += strength * ripple.amplitudeScale
              }
            }
          }

          if (!affected) {
            ctx.fillStyle = `rgba(${config.baseColor.r}, ${config.baseColor.g}, ${config.baseColor.b}, 0.2)`
            ctx.beginPath()
            ctx.arc(x, y, config.dotRadius, 0, Math.PI * 2)
            ctx.fill()
            continue
          }

          const finalX = x + displacementX
          const finalY = y + displacementY
          let radius = Math.max(0.5, config.dotRadius + waveHeight * 1.5)
          let alpha = 0.3
          let red = config.baseColor.r
          let green = config.baseColor.g
          let blue = config.baseColor.b

          if (waveHeight > 0) {
            const intensity = Math.min(1, Math.abs(waveHeight) * 2)
            red += (config.highlightColor.r - red) * intensity
            green += (config.highlightColor.g - green) * intensity
            blue += (config.highlightColor.b - blue) * intensity
            alpha = 0.3 + intensity * 0.4
          }

          ctx.fillStyle = `rgba(${Math.floor(red)}, ${Math.floor(green)}, ${Math.floor(blue)}, ${alpha})`
          ctx.beginPath()
          ctx.arc(finalX, finalY, radius, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      frameId = requestAnimationFrame(render)
    }

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) {
        return
      }

      const isInteractive = Boolean(target.closest('button, a, input, select, textarea, label, [role="button"]'))
      const isInsideCard = Boolean(target.closest('.interactive-card'))

      if (isInteractive || isInsideCard) {
        return
      }

      addRipple(event.clientX, event.clientY, 1)

      timeoutIds.push(
        setTimeout(() => {
          const point = randomPoint()
          addRipple(point.x, point.y, 0.95 + Math.random() * 0.2)
        }, 500),
      )

      timeoutIds.push(
        setTimeout(() => {
          const point = randomPoint()
          addRipple(point.x, point.y, 1.1)
        }, 700),
      )

      timeoutIds.push(
        setTimeout(() => {
          const point = randomPoint()
          addRipple(point.x, point.y, 1.15)
        }, 1400),
      )

      timeoutIds.push(
        setTimeout(() => {
          addRipple(event.clientX, event.clientY, 2.35)
        }, 1700),
      )
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('click', handleClick)
    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('click', handleClick)
      timeoutIds.forEach((id) => clearTimeout(id))
      cancelAnimationFrame(frameId)
    }
  }, [isDarkMode])

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 bg-transparent" />
}
