'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/admin/ui/Button'
import { createVideoItemsFromUrls } from '@/lib/actions/media'
import { createClient } from '@/lib/supabase/client'
import { isCompatibleVideoFile, MAX_VIDEO_UPLOAD_BYTES } from '@/lib/media/video'

type QueuedVideo = {
  id: string
  file: File
  progress: number
  status: 'pret' | 'upload' | 'termine' | 'erreur'
  message?: string
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
  const [isPending, startTransition] = useTransition()

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
    const uploaded: string[] = []

    for (const item of items) {
      if (item.status === 'erreur') throw new Error(item.message || 'Un fichier video est invalide.')

      setItems(current => current.map(currentItem => currentItem.id === item.id ? { ...currentItem, status: 'upload', progress: 20 } : currentItem))
      const path = safeStorageName(item.file)
      const { data, error } = await supabase.storage.from('banners').upload(path, item.file, {
        cacheControl: '3600',
        contentType: item.file.type,
        upsert: false,
      })

      if (error) {
        setItems(current => current.map(currentItem => currentItem.id === item.id ? { ...currentItem, status: 'erreur', progress: 100, message: error.message } : currentItem))
        throw new Error(error.message.includes('mime') || error.message.includes('not allowed')
          ? 'Supabase Storage refuse ce format. Verifie que le bucket banners accepte video/mp4, video/webm et video/ogg.'
          : error.message)
      }

      const { data: publicData } = supabase.storage.from('banners').getPublicUrl(data.path)
      uploaded.push(publicData.publicUrl)
      setItems(current => current.map(currentItem => currentItem.id === item.id ? { ...currentItem, status: 'termine', progress: 100 } : currentItem))
    }

    return uploaded
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)

    try {
      const uploadedUrls = items.length ? await uploadQueuedVideos() : []
      const urls = [...uploadedUrls, videoUrl.trim()].filter(Boolean)

      if (!urls.length) {
        setMessage({ type: 'error', text: 'Ajoute une video ou une URL video directe.' })
        return
      }

      startTransition(async () => {
        const result = await createVideoItemsFromUrls(urls.map((url, index) => ({
          title: index === 0 ? title : null,
          caption: index === 0 ? caption : null,
          video_url: url,
          poster_url: posterUrl,
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
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Import video impossible.',
      })
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
                <button type="button" onClick={() => removeItem(item.id)} disabled={isPending || item.status === 'upload'} style={{ color: '#F2B8BE', fontFamily: 'var(--font-display)', fontSize: 10, textTransform: 'uppercase' }}>Retirer</button>
              </div>
              <span style={{ color: '#94938E', fontSize: 11 }}>{formatBytes(item.file.size)} - {item.status === 'pret' ? 'Pret' : item.status === 'upload' ? `Import ${item.progress}%` : item.status === 'termine' ? 'Importe' : item.message}</span>
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
      <Button type="submit" fullWidth disabled={isPending || items.some(item => item.status === 'upload')}>
        {isPending || items.some(item => item.status === 'upload') ? 'Import en cours...' : 'Ajouter'}
      </Button>
    </form>
  )
}
