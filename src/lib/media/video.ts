const DIRECT_VIDEO_EXTENSION = /\.(mp4|webm|ogg|ogv)(\?|#|$)/i
const STORAGE_PUBLIC_MARKER = '/storage/v1/object/public/'

const BLOCKED_VIDEO_HOSTS = [
  'youtube.',
  'youtu.be',
  'tiktok.',
  'instagram.',
  'drive.google.',
  'facebook.',
]

export const ACCEPTED_VIDEO_MIME_TYPES = ['video/mp4', 'video/webm', 'video/ogg']
export const MAX_VIDEO_UPLOAD_BYTES = 50 * 1024 * 1024

export function isDirectVideoUrl(value?: string | null) {
  const trimmed = value?.trim()
  if (!trimmed) return false
  if (trimmed.startsWith('blob:') || trimmed.startsWith('file:')) return false

  try {
    const url = new URL(trimmed)
    if (!['http:', 'https:'].includes(url.protocol)) return false
    const host = url.hostname.toLowerCase()
    if (BLOCKED_VIDEO_HOSTS.some(blocked => host.includes(blocked))) return false

    const pathAndSearch = `${url.pathname}${url.search}`
    return DIRECT_VIDEO_EXTENSION.test(pathAndSearch) || pathAndSearch.includes(STORAGE_PUBLIC_MARKER)
  } catch {
    return false
  }
}

export function isCompatibleVideoFile(file: File) {
  const name = file.name.toLowerCase()
  if (name.endsWith('.mov') || file.type === 'video/quicktime') {
    return {
      valid: false,
      message: 'Ce format video n est pas compatible. Utilise une video MP4 encodee en H.264.',
    }
  }

  if (!ACCEPTED_VIDEO_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      message: 'Format video incompatible. Utilise MP4, WebM ou Ogg.',
    }
  }

  if (file.size > MAX_VIDEO_UPLOAD_BYTES) {
    return {
      valid: false,
      message: 'Video trop lourde. La limite actuelle est de 50 Mo par fichier.',
    }
  }

  return { valid: true, message: null }
}

export function isInvalidStoredVideoUrl(value?: string | null) {
  return !isDirectVideoUrl(value)
}
