'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/admin/ui/Button'
import { createVideoItemsFromUrls } from '@/lib/actions/media'
import { createClient } from '@/lib/supabase/client'
import { isCompatibleVideoFile, MAX_VIDEO_UPLOAD_BYTES } from '@/lib/media/video'

type QueuedVideo = {
  id: string
  file: File
  progress: number
  status: 'pret' | 'analyse' | 'poster' | 'upload-video' | 'upload-poster' | 'termine' | 'erreur'
  message?: string
  warning?: string
}

type UploadedVideo = {
  videoUrl: string
  posterUrl: string | null
}

const inputStyle = {
  width: '100%',
  background: '#0A0A0C',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 3,
  padding: '10px 12px',
  color: '#F2F1ED',
  fontSize: 13,
  outline: 'none',
  fontFamily: 'var(--font-display)',
}

const labelStyle = {
  display: 'block',
  fontFamily: 'var(--font-display)',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '.15em',
  textTransform: 'uppercase' as const,
  color: '#94938E',
  marginBottom: 6,
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`
}

function isProcessing(status: QueuedVideo['status']) {
  return status === 'analyse' || status === 'poster' || status === 'upload-video' || status === 'upload-poster'
}

function safeStorageName(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4'
  const base = file.name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'video'

  return `videos/${Date.now()}-${crypto.randomUUID()}-${base}.${ext}`
}

function safePosterStorageName(file: File) {
  const base = file.name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'video'

  return `videos/posters/${Date.now()}-${crypto.randomUUID()}-${base}.jpg`
}

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

async function generatePosterBlob(file: File) {
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

export default function VideoCreateForm({ nextOrder }: { nextOrder: number }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<QueuedVideo[]>([])
  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [posterUrl, setPosterUrl] = useState('')
  const [active, setActive] = useState(true)
  const [featured, setFeatured] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPending, setIsPending] = useState(false)

  const maxSizeLabel = useMemo(() => formatBytes(MAX_VIDEO_UPLOAD_BYTES), [])

  function handleFiles(files: FileList | null) {
    setMessage(null)
    if (!files) return

    const next: QueuedVideo[] = []
    for (const file of Array.from(files).slice(0, 6)) {
      const validation = isCompatibleVideoFile(file)
      next.push({
        id: crypto.randomUUID(),
        file,
        progress: validation.valid ? 0 : 100,
        status: validation.valid ? 'pret' : 'erreur',
        message: validation.message || undefined,
      })
    }

    setItems(next)
  }

  function removeItem(id: string) {
    setItems(current => current.filter(item => item.id !== id))
  }

  async function uploadQueuedVideos() {
    const supabase = createClient()
    const uploaded: UploadedVideo[] = []

    for (const item of items) {
      if (item.status === 'erreur') continue

      try {
        setItems(current => current.map(currentItem => currentItem.id === item.id ? { ...currentItem, status: 'analyse', progress: 10, message: 'Analyse...' } : currentItem))
        let posterBlob: Blob | null = null
        let posterWarning: string | undefined

        try {
          setItems(current => current.map(currentItem => currentItem.id === item.id ? { ...currentItem, status: 'poster', progress: 25, message: 'Generation de la miniature...' } : currentItem))
          posterBlob = await generatePosterBlob(item.file)
        } catch {
          posterWarning = 'La video a ete ajoutee, mais la miniature automatique n a pas pu etre generee.'
        }

        setItems(current => current.map(currentItem => currentItem.id === item.id ? { ...currentItem, status: 'upload-video', progress: 55, message: 'Upload video...', warning: posterWarning } : currentItem))
        const path = safeStorageName(item.file)
        const { data, error } = await supabase.storage.from('banners').upload(path, item.file, {
          cacheControl: '3600',
          contentType: item.file.type,
          upsert: false,
        })

        if (error) {
          throw new Error(error.message.includes('mime') || error.message.includes('not allowed')
            ? 'Supabase Storage refuse ce format. Verifie que le bucket banners accepte video/mp4, video/webm et video/ogg.'
            : error.message)
        }

        const { data: publicData } = supabase.storage.from('banners').getPublicUrl(data.path)
        let posterPublicUrl: string | null = null

        if (posterBlob) {
          setItems(current => current.map(currentItem => currentItem.id === item.id ? { ...currentItem, status: 'upload-poster', progress: 80, message: 'Upload miniature...', warning: posterWarning } : currentItem))
          const posterPath = safePosterStorageName(item.file)
          const { data: posterData, error: posterError } = await supabase.storage.from('banners').upload(posterPath, posterBlob, {
            cacheControl: '3600',
            contentType: 'image/jpeg',
            upsert: false,
          })

          if (posterError) {
            posterWarning = 'La video a ete ajoutee, mais l upload de la miniature a echoue.'
          } else {
            const { data: posterPublicData } = supabase.storage.from('banners').getPublicUrl(posterData.path)
            posterPublicUrl = posterPublicData.publicUrl
          }
        }

        uploaded.push({ videoUrl: publicData.publicUrl, posterUrl: posterPublicUrl })
        setItems(current => current.map(currentItem => currentItem.id === item.id ? { ...currentItem, status: 'termine', progress: 100, message: 'Termine', warning: posterWarning } : currentItem))
      } catch (error) {
        setItems(current => current.map(currentItem => currentItem.id === item.id ? {
          ...currentItem,
          status: 'erreur',
          progress: 100,
          message: error instanceof Error ? error.message : 'Import video impossible.',
        } : currentItem))
      }
    }

    return uploaded
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isPending) return
    setMessage(null)
    setIsPending(true)

    try {
      const uploadedVideos = items.length ? await uploadQueuedVideos() : []
      const manualUrl = videoUrl.trim()

      if (!uploadedVideos.length && !manualUrl) {
        setMessage({ type: 'error', text: 'Ajoute une video ou une URL video directe.' })
        setIsPending(false)
        return
      }

      const entries = [
        ...uploadedVideos.map(item => ({ video_url: item.videoUrl, poster_url: item.posterUrl })),
        ...(manualUrl ? [{ video_url: manualUrl, poster_url: posterUrl.trim() || null }] : []),
      ]

      const result = await createVideoItemsFromUrls(entries.map((entry, index) => ({
        title: index === 0 ? title : null,
        caption: index === 0 ? caption : null,
        video_url: entry.video_url,
        poster_url: entry.poster_url,
        display_order: nextOrder + index,
        active,
        featured: index === 0 ? featured : false,
      })))

      setMessage({ type: result.success ? 'success' : 'error', text: result.message })
      if (result.success) {
        setItems([])
        setTitle('')
        setCaption('')
        setVideoUrl('')
        setPosterUrl('')
        if (inputRef.current) inputRef.current.value = ''
        router.refresh()
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Import video impossible.',
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: '#17171B', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: 18, display: 'grid', gap: 14, alignSelf: 'start' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#F2F1ED' }}>Ajouter des videos</p>
      {message && (
        <p role={message.type === 'error' ? 'alert' : 'status'} style={{ background: message.type === 'error' ? 'rgba(122,22,32,.14)' : 'rgba(76,175,80,.12)', border: `1px solid ${message.type === 'error' ? 'rgba(122,22,32,.34)' : 'rgba(76,175,80,.28)'}`, color: message.type === 'error' ? '#F2B8BE' : '#4CAF50', borderRadius: 6, padding: 10, fontFamily: 'var(--font-display)', fontSize: 12 }}>
          {message.text}
        </p>
      )}
      <label><span style={labelStyle}>Titre</span><input value={title} onChange={event => setTitle(event.target.value)} placeholder="Optionnel" style={inputStyle} disabled={isPending} /></label>
      <label><span style={labelStyle}>Legende</span><input value={caption} onChange={event => setCaption(event.target.value)} placeholder="Optionnel" style={inputStyle} disabled={isPending} /></label>
      <label>
        <span style={labelStyle}>Importer jusqu a 6 videos</span>
        <input ref={inputRef} type="file" multiple accept="video/mp4,video/webm,video/ogg" onChange={event => handleFiles(event.target.files)} style={inputStyle} disabled={isPending} />
      </label>
      <p style={{ color: '#94938E', fontSize: 11, lineHeight: 1.6 }}>
        Formats compatibles : MP4 H.264/AAC, WebM ou Ogg. Maximum {maxSizeLabel} par fichier. Les fichiers MOV/iPhone HEVC sont refuses pour eviter une lecture cassee.
      </p>
      {items.length > 0 && (
        <div style={{ display: 'grid', gap: 8 }}>
          {items.map(item => (
            <div key={item.id} style={{ background: '#0A0A0C', border: '1px solid rgba(255,255,255,.08)', borderRadius: 4, padding: 10, display: 'grid', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                <span style={{ color: '#F2F1ED', fontSize: 12, overflowWrap: 'anywhere' }}>{item.file.name}</span>
                <button type="button" onClick={() => removeItem(item.id)} disabled={isPending || isProcessing(item.status)} style={{ color: '#F2B8BE', fontFamily: 'var(--font-display)', fontSize: 10, textTransform: 'uppercase' }}>Retirer</button>
              </div>
              <span style={{ color: '#94938E', fontSize: 11 }}>
                {formatBytes(item.file.size)} - {
                  item.status === 'pret' ? 'Pret'
                    : item.status === 'analyse' ? 'Analyse...'
                      : item.status === 'poster' ? 'Generation de la miniature...'
                        : item.status === 'upload-video' ? 'Upload video...'
                          : item.status === 'upload-poster' ? 'Upload miniature...'
                            : item.status === 'termine' ? 'Termine'
                              : item.message
                }
              </span>
              {item.warning && <span style={{ color: '#F6C177', fontSize: 11 }}>{item.warning}</span>}
              <div aria-hidden="true" style={{ height: 4, background: 'rgba(255,255,255,.08)', borderRadius: 999, overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: `${item.progress}%`, background: item.status === 'erreur' ? '#EF5350' : '#4CAF50', transition: 'width .2s ease' }} />
              </div>
            </div>
          ))}
        </div>
      )}
      <label><span style={labelStyle}>Ou URL video directe</span><input value={videoUrl} onChange={event => setVideoUrl(event.target.value)} placeholder="https://.../video.mp4" style={inputStyle} disabled={isPending} /></label>
      <p style={{ color: '#94938E', fontSize: 11, lineHeight: 1.6 }}>
        Liens compatibles : URL directe MP4/WebM/Ogg ou URL publique Supabase Storage. Les pages Instagram, TikTok, YouTube ou Google Drive ne sont pas lisibles directement dans ce lecteur.
      </p>
      <label><span style={labelStyle}>URL miniature optionnelle</span><input value={posterUrl} onChange={event => setPosterUrl(event.target.value)} placeholder="https://..." style={inputStyle} disabled={isPending} /></label>
      <label style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#F2F1ED', fontFamily: 'var(--font-display)', fontSize: 12 }}><input checked={active} onChange={event => setActive(event.target.checked)} type="checkbox" disabled={isPending} style={{ accentColor: '#7A1620' }} />Active</label>
      <label style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#F2F1ED', fontFamily: 'var(--font-display)', fontSize: 12 }}><input checked={featured} onChange={event => setFeatured(event.target.checked)} type="checkbox" disabled={isPending} style={{ accentColor: '#7A1620' }} />Mise en avant</label>
      <Button type="submit" fullWidth disabled={isPending || items.some(item => isProcessing(item.status))}>
        {isPending || items.some(item => isProcessing(item.status)) ? 'Import en cours...' : 'Ajouter'}
      </Button>
    </form>
  )
}
