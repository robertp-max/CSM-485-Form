type CompletionPayload = {
  event: 'training.completed'
  module: string
  completedAt: string
  trainingMinutes: number
  checkpointsCompleted: number
  challengeScore: number
  challengePassed: boolean
  personalizedRecapTopics: string[]
}

export type CompletionConfig = {
  completionEndpoint?: string | null
  ltiTargetOrigin?: string | null
  xapiEndpoint?: string | null
  xapiAuth?: string | null
  xapiActorName?: string | null
  xapiActorEmail?: string | null
  xapiActivityId?: string | null
}

export type CompletionResult = {
  scorm: boolean
  webhook: boolean
  xapi: boolean
  postMessage: boolean
  errors: string[]
}

export type LmsEnvironmentDiagnostics = {
  inIframe: boolean
  scormVersion: 'SCORM_2004' | 'SCORM_1_2' | null
  hasScormApi2004: boolean
  hasScormApi12: boolean
  hasParentWindow: boolean
}

type ScormApi12 = {
  LMSInitialize: (arg: string) => string
  LMSSetValue: (element: string, value: string) => string
  LMSCommit: (arg: string) => string
  LMSFinish: (arg: string) => string
}

type ScormApi2004 = {
  Initialize: (arg: string) => string
  SetValue: (element: string, value: string) => string
  Commit: (arg: string) => string
  Terminate: (arg: string) => string
}

const findApi = <T>(apiName: 'API' | 'API_1484_11'): T | null => {
  let currentWindow: Window | null = window
  let attempts = 0

  while (currentWindow && attempts < 20) {
    const candidate = (currentWindow as unknown as Record<string, unknown>)[apiName]
    if (candidate) {
      return candidate as T
    }

    if (currentWindow.parent === currentWindow) {
      break
    }

    attempts += 1
    currentWindow = currentWindow.parent
  }

  return null
}

const sendScormCompletion = (payload: CompletionPayload): boolean => {
  const api2004 = findApi<ScormApi2004>('API_1484_11')
  if (api2004) {
    try {
      api2004.Initialize('')
      api2004.SetValue('cmi.completion_status', 'completed')
      api2004.SetValue('cmi.success_status', payload.challengePassed ? 'passed' : 'failed')
      api2004.SetValue('cmi.score.raw', String(payload.challengeScore))
      api2004.SetValue('cmi.score.scaled', String(payload.challengeScore / 100))
      api2004.SetValue('cmi.exit', 'normal')
      api2004.Commit('')
      api2004.Terminate('')
      return true
    } catch {
      return false
    }
  }

  const api12 = findApi<ScormApi12>('API')
  if (api12) {
    try {
      api12.LMSInitialize('')
      api12.LMSSetValue('cmi.core.lesson_status', payload.challengePassed ? 'passed' : 'completed')
      api12.LMSSetValue('cmi.core.score.raw', String(payload.challengeScore))
      api12.LMSSetValue('cmi.core.exit', 'logout')
      api12.LMSCommit('')
      api12.LMSFinish('')
      return true
    } catch {
      return false
    }
  }

  return false
}

const sendXapiCompletion = async (payload: CompletionPayload, config: CompletionConfig): Promise<boolean> => {
  if (!config.xapiEndpoint || !config.xapiActorEmail) {
    return false
  }

  const actorName = config.xapiActorName || 'Learner'
  const activityId = config.xapiActivityId || `${window.location.origin}/activities/csm-485-training`

  const statement = {
    actor: {
      name: actorName,
      mbox: `mailto:${config.xapiActorEmail}`,
    },
    verb: {
      id: 'http://adlnet.gov/expapi/verbs/completed',
      display: {
        'en-US': 'completed',
      },
    },
    object: {
      id: activityId,
      definition: {
        name: {
          'en-US': payload.module,
        },
        type: 'http://adlnet.gov/expapi/activities/lesson',
      },
    },
    result: {
      completion: true,
      success: payload.challengePassed,
      score: {
        scaled: payload.challengeScore / 100,
        raw: payload.challengeScore,
        min: 0,
        max: 100,
      },
      extensions: {
        'https://homehealth.example/xapi/extensions/checkpointsCompleted': payload.checkpointsCompleted,
        'https://homehealth.example/xapi/extensions/trainingMinutes': payload.trainingMinutes,
      },
    },
    timestamp: payload.completedAt,
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Experience-API-Version': '1.0.3',
  }

  if (config.xapiAuth) {
    headers.Authorization = config.xapiAuth
  }

  await fetch(config.xapiEndpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(statement),
  })

  return true
}

const sendWebhookCompletion = async (payload: CompletionPayload, config: CompletionConfig): Promise<boolean> => {
  if (!config.completionEndpoint) {
    return false
  }

  await fetch(config.completionEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return true
}

const sendLtiCompletionMessage = (payload: CompletionPayload, targetOrigin: string): boolean => {
  if (window.parent === window) {
    return false
  }

  try {
    window.parent?.postMessage(
      {
        type: 'lms.completion',
        payload,
      },
      targetOrigin,
    )
    return true
  } catch {
    return false
  }
}

export const getLmsEnvironmentDiagnostics = (): LmsEnvironmentDiagnostics => {
  const hasScormApi2004 = Boolean(findApi<ScormApi2004>('API_1484_11'))
  const hasScormApi12 = Boolean(findApi<ScormApi12>('API'))

  return {
    inIframe: window.self !== window.top,
    scormVersion: hasScormApi2004 ? 'SCORM_2004' : hasScormApi12 ? 'SCORM_1_2' : null,
    hasScormApi2004,
    hasScormApi12,
    hasParentWindow: window.parent !== window,
  }
}

export const getCompletionConfigFromQuery = (): CompletionConfig => {
  const query = new URLSearchParams(window.location.search)
  return {
    completionEndpoint: query.get('completionEndpoint'),
    ltiTargetOrigin: query.get('ltiTargetOrigin') || '*',
    xapiEndpoint: query.get('xapiEndpoint'),
    xapiAuth: query.get('xapiAuth'),
    xapiActorName: query.get('xapiActorName'),
    xapiActorEmail: query.get('xapiActorEmail'),
    xapiActivityId: query.get('xapiActivityId'),
  }
}

export const sendTrainingCompletion = async (
  payload: CompletionPayload,
  config: CompletionConfig,
): Promise<CompletionResult> => {
  const result: CompletionResult = {
    scorm: false,
    webhook: false,
    xapi: false,
    postMessage: false,
    errors: [],
  }

  result.scorm = sendScormCompletion(payload)

  try {
    result.webhook = await sendWebhookCompletion(payload, config)
  } catch {
    result.errors.push('Webhook completion failed')
  }

  try {
    result.xapi = await sendXapiCompletion(payload, config)
  } catch {
    result.errors.push('xAPI statement failed')
  }

  result.postMessage = sendLtiCompletionMessage(payload, config.ltiTargetOrigin || '*')

  return result
}
