'use client'

function waitForVideoEvent(video: HTMLVideoElement, eventName: keyof HTMLMediaElementEventMap, timeoutMs = 8000) {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup()
      reject(new Error('La video met trop de temps a etre analysee.'))
    }, timeoutMs)

    function cleanup() {
      window.clearTimeout(timeout)
      video.removeEventListener(eventName, onEvent)
      video.removeEventListener('error', onError)
    }

    function onEvent() {
      cleanup()
      resolve()
    }

    function onError() {
      cleanup()
      reject(new Error('Le navigateur ne peut pas lire cette video.'))
    }

    video.addEventListener(eventName, onEvent, { once: true })
    video.addEventListener('error', onError, { once: true })
  })
}

export async function generatePosterBlob(file: File) {
  const objectUrl = URL.createObjectURL(file)
  const video = document.createElement('video')
  video.preload = 'metadata'
  video.muted = true
  video.playsInline = true
  video.src = objectUrl

  try {
    await waitForVideoEvent(video, 'loadedmetadata')
    const duration = Number.isFinite(video.duration) ? video.duration : 0
    const targetTime = duration > 1.2 ? 1 : Math.max(duration * 0.1, 0)

    if (targetTime > 0) {
      video.currentTime = targetTime
      await waitForVideoEvent(video, 'seeked')
    }

    const sourceWidth = video.videoWidth || 720
    const sourceHeight = video.videoHeight || 960
    const targetWidth = Math.min(720, sourceWidth)
    const targetHeight = Math.max(1, Math.round(targetWidth * (sourceHeight / sourceWidth)))
    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Capture miniature indisponible.')
    context.drawImage(video, 0, 0, targetWidth, targetHeight)

    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.82))
    if (!blob) throw new Error('Miniature impossible a generer.')
    return blob
  } finally {
    video.removeAttribute('src')
    video.load()
    URL.revokeObjectURL(objectUrl)
  }
}
