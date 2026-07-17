'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'

type Props = {
  action: (formData: FormData) => void | Promise<void>
  defaultOrder: number
  inputStyle: React.CSSProperties
  labelStyle: React.CSSProperties
}

const maxFiles = 10
const maxFileSize = 5 * 1024 * 1024
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

function formatSize(size: number) {
  return `${(size / 1024 / 1024).toFixed(1)} Mo`
}

export default function GalleryCreateForm({ action, defaultOrder, inputStyle, labelStyle }: Props) {
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const previews = useMemo(() => files.map(file => ({
    file,
    url: URL.createObjectURL(file),
  })), [files])

  useEffect(() => {
    return () => {
      previews.forEach(preview => URL.revokeObjectURL(preview.url))
    }
  }, [previews])

  function onFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files || [])
    const next = [...files, ...selected].slice(0, maxFiles)
    const invalid = next.find(file => !allowedTypes.includes(file.type))
    const tooLarge = next.find(file => file.size > maxFileSize)

    if (selected.length + files.length > maxFiles) {
      setError('Maximum 10 images par import.')
    } else if (invalid) {
      setError(`Format non accepte : ${invalid.name}. Utilise JPG, PNG, WEBP ou AVIF.`)
    } else if (tooLarge) {
      setError(`${tooLarge.name} depasse 5 Mo.`)
    } else {
      setError(null)
      setFiles(next)
    }
    event.currentTarget.value = ''
  }

  function removeFile(index: number) {
    setFiles(current => current.filter((_, i) => i !== index))
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!files.length) {
      setError('Selectionne au moins une image.')
      return
    }
    const formData = new FormData(event.currentTarget)
    formData.delete('image_files')
    files.forEach(file => formData.append('image_files', file))
    startTransition(() => {
      void action(formData)
    })
  }

  return (
    <form onSubmit={submit} style={{ background: '#17171B', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: 18, display: 'grid', gap: 14, alignSelf: 'start' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#F2F1ED' }}>Import rapide galerie</p>
      <label>
        <span style={labelStyle}>Images (1 a 10)</span>
        <input name="image_files" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={onFilesChange} style={inputStyle} />
      </label>
      <input name="display_order" type="hidden" value={defaultOrder} />
      <label style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#F2F1ED', fontFamily: 'var(--font-display)', fontSize: 12 }}>
        <input name="active" type="checkbox" defaultChecked style={{ accentColor: '#7A1620' }} />
        Actives sur l'accueil
      </label>
      {error && <p role="alert" style={{ color: '#F2B8BE', fontFamily: 'var(--font-display)', fontSize: 12 }}>{error}</p>}
      {previews.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 8 }}>
          {previews.map(({ file, url }, index) => (
            <div key={`${file.name}-${index}`} style={{ border: '1px solid rgba(255,255,255,.1)', borderRadius: 4, overflow: 'hidden', background: '#0A0A0C' }}>
              <img src={url} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: 8, display: 'grid', gap: 6 }}>
                <p style={{ color: '#F2F1ED', fontFamily: 'var(--font-display)', fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                <p style={{ color: '#94938E', fontSize: 10 }}>{formatSize(file.size)}</p>
                <button type="button" onClick={() => removeFile(index)} style={{ color: '#EF5350', fontFamily: 'var(--font-display)', fontSize: 10, textAlign: 'left' }}>Retirer</button>
              </div>
              <input type="hidden" name="selected_file_names" value={file.name} />
            </div>
          ))}
        </div>
      )}
      <p style={{ color: '#94938E', fontSize: 11, lineHeight: 1.5 }}>
        Les legendes restent optionnelles. Tu pourras modifier chaque image apres l'import.
      </p>
      <button
        type="submit"
        disabled={isPending}
        style={{
          width: '100%',
          background: '#7A1620',
          color: '#fff',
          border: '1px solid transparent',
          borderRadius: 3,
          padding: '9px 18px',
          fontFamily: 'var(--font-display)',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          opacity: isPending ? .55 : 1,
          cursor: isPending ? 'not-allowed' : 'pointer',
        }}
      >
        {isPending ? 'Import en cours...' : 'Importer'}
      </button>
    </form>
  )
}
