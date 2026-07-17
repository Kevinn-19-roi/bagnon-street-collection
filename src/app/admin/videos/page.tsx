import Image from 'next/image'
import AdminShell from '@/components/admin/layout/AdminShell'
import PageHeader from '@/components/admin/ui/PageHeader'
import ConfirmSubmitForm from '@/components/admin/forms/ConfirmSubmitForm'
import Button from '@/components/admin/ui/Button'
import Badge from '@/components/admin/ui/Badge'
import { createVideoItem, deleteVideoItem, updateVideoItem } from '@/lib/actions/media'
import { getVideoItemsAdmin } from '@/lib/database/media'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Vidéos - Admin BSC' }

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

function Message({ success, error }: { success?: string; error?: string }) {
  const successText = success === 'created' ? 'Video ajoutee.' : success === 'updated' ? 'Video mise a jour.' : success === 'deleted' ? 'Video supprimee.' : null
  const errorText = error === 'migration-missing'
    ? 'La migration 009_gallery_video_items.sql doit etre appliquee dans Supabase.'
    : error === 'active-limit'
      ? "Maximum 6 videos actives sur l'accueil. Desactive une video avant d'en activer une autre."
      : error === 'video-required'
        ? 'URL video et poster sont obligatoires.'
        : error ? "L'operation a echoue." : null

  if (!successText && !errorText) return null

  return (
    <p role={errorText ? 'alert' : 'status'} style={{ background: errorText ? 'rgba(122,22,32,.14)' : 'rgba(76,175,80,.12)', border: `1px solid ${errorText ? 'rgba(122,22,32,.34)' : 'rgba(76,175,80,.28)'}`, color: errorText ? '#F2B8BE' : '#4CAF50', borderRadius: 6, padding: 12, fontFamily: 'var(--font-display)', fontSize: 12, marginBottom: 16 }}>
      {errorText || successText}
    </p>
  )
}

export default async function AdminVideosPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const query = await searchParams
  const items = await getVideoItemsAdmin()
  const activeCount = items.filter(item => item.active).length

  return (
    <AdminShell>
      <PageHeader eyebrow="Accueil" title="Vidéos" subtitle={`${activeCount}/6 videos actives sur l'accueil`} />
      <Message success={query.success} error={query.error} />

      <style>{`
        @media(max-width:900px){
          .video-admin-grid{grid-template-columns:1fr!important;}
          .video-admin-card{grid-template-columns:1fr!important;}
        }
      `}</style>

      <div className="video-admin-grid" style={{ display: 'grid', gridTemplateColumns: '360px minmax(0,1fr)', gap: 16 }}>
        <form action={createVideoItem} style={{ background: '#17171B', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: 18, display: 'grid', gap: 14, alignSelf: 'start' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#F2F1ED' }}>Ajouter une video</p>
          <label><span style={labelStyle}>Titre</span><input name="title" placeholder="Optionnel" style={inputStyle} /></label>
          <label><span style={labelStyle}>Legende</span><input name="caption" placeholder="Optionnel" style={inputStyle} /></label>
          <label><span style={labelStyle}>URL video *</span><input name="video_url" required placeholder="https://..." style={inputStyle} /></label>
          <label><span style={labelStyle}>Poster image *</span><input name="poster_file" type="file" accept="image/*" style={inputStyle} /></label>
          <label><span style={labelStyle}>Ou URL poster</span><input name="poster_url" placeholder="https://..." style={inputStyle} /></label>
          <label><span style={labelStyle}>Ordre</span><input name="display_order" type="number" defaultValue={items.length + 1} style={inputStyle} /></label>
          <label style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#F2F1ED', fontFamily: 'var(--font-display)', fontSize: 12 }}><input name="active" type="checkbox" defaultChecked style={{ accentColor: '#7A1620' }} />Active</label>
          <label style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#F2F1ED', fontFamily: 'var(--font-display)', fontSize: 12 }}><input name="featured" type="checkbox" style={{ accentColor: '#7A1620' }} />Mise en avant</label>
          <Button type="submit" fullWidth>Ajouter</Button>
        </form>

        <div style={{ display: 'grid', gap: 12 }}>
          {items.length === 0 ? (
            <div style={{ background: '#17171B', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: 28, color: '#94938E', fontFamily: 'var(--font-display)', fontSize: 13 }}>
              Aucune video pour le moment.
            </div>
          ) : items.map(item => (
            <div key={item.id} className="video-admin-card" style={{ display: 'grid', gridTemplateColumns: '150px minmax(0,1fr)', gap: 14, background: '#17171B', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: 14 }}>
              <div style={{ position: 'relative', aspectRatio: '9/12', borderRadius: 4, overflow: 'hidden', background: '#0A0A0C' }}>
                <Image src={item.poster_url} alt={item.title || 'Video Bagnon Street'} fill style={{ objectFit: 'cover' }} sizes="150px" />
              </div>
              <form action={updateVideoItem.bind(null, item.id)} style={{ display: 'grid', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Badge label={item.active ? 'Active' : 'Inactive'} variant={item.active ? 'success' : 'default'} />
                    {item.featured && <Badge label="Mise en avant" variant="info" />}
                  </div>
                  <ConfirmSubmitForm action={deleteVideoItem.bind(null, item.id)} message="Supprimer cette video ?">
                    <Button type="submit" variant="danger" size="sm">Supprimer</Button>
                  </ConfirmSubmitForm>
                </div>
                <input name="title" defaultValue={item.title || ''} placeholder="Titre" style={inputStyle} />
                <input name="caption" defaultValue={item.caption || ''} placeholder="Legende" style={inputStyle} />
                <input name="video_url" defaultValue={item.video_url} required style={inputStyle} />
                <input name="poster_url" defaultValue={item.poster_url} required style={inputStyle} />
                <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr', gap: 10 }}>
                  <input name="display_order" type="number" defaultValue={item.display_order} style={inputStyle} />
                  <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#F2F1ED', fontFamily: 'var(--font-display)', fontSize: 12 }}><input name="active" type="checkbox" defaultChecked={item.active} style={{ accentColor: '#7A1620' }} />Active</label>
                  <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#F2F1ED', fontFamily: 'var(--font-display)', fontSize: 12 }}><input name="featured" type="checkbox" defaultChecked={item.featured} style={{ accentColor: '#7A1620' }} />Avant</label>
                </div>
                <input name="poster_file" type="file" accept="image/*" style={inputStyle} />
                <Button type="submit" variant="secondary" size="sm">Enregistrer</Button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  )
}
