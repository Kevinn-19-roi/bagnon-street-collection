import Image from 'next/image'
import AdminShell from '@/components/admin/layout/AdminShell'
import PageHeader from '@/components/admin/ui/PageHeader'
import ConfirmSubmitForm from '@/components/admin/forms/ConfirmSubmitForm'
import PendingSubmitButton from '@/components/admin/forms/PendingSubmitButton'
import Badge from '@/components/admin/ui/Badge'
import GalleryCreateForm from '@/components/admin/media/GalleryCreateForm'
import { createGalleryItems, deleteGalleryItem, updateGalleryItem } from '@/lib/actions/media'
import { getGalleryItemsAdmin } from '@/lib/database/media'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Galerie - Admin BSC' }

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
  const successText = success === 'created' ? 'Image ajoutee.' : success === 'updated' ? 'Image mise a jour.' : success === 'deleted' ? 'Image supprimee.' : null
  const errorText = error === 'migration-missing'
    ? 'La migration 009_gallery_video_items.sql doit etre appliquee dans Supabase.'
    : error === 'image-required'
      ? 'Ajoute une image ou une URL publique.'
      : error ? "L'operation a echoue." : null

  if (!successText && !errorText) return null

  return (
    <p role={errorText ? 'alert' : 'status'} style={{ background: errorText ? 'rgba(122,22,32,.14)' : 'rgba(76,175,80,.12)', border: `1px solid ${errorText ? 'rgba(122,22,32,.34)' : 'rgba(76,175,80,.28)'}`, color: errorText ? '#F2B8BE' : '#4CAF50', borderRadius: 6, padding: 12, fontFamily: 'var(--font-display)', fontSize: 12, marginBottom: 16 }}>
      {errorText || successText}
    </p>
  )
}

export default async function AdminGaleriePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const query = await searchParams
  const items = await getGalleryItemsAdmin()

  return (
    <AdminShell>
      <PageHeader eyebrow="Accueil" title="Galerie" subtitle="Images affichees dans la galerie publique" />
      <Message success={query.success} error={query.error} />

      <style>{`
        @media(max-width:900px){
          .gallery-admin-grid{grid-template-columns:1fr!important;}
          .gallery-admin-card{grid-template-columns:1fr!important;}
        }
      `}</style>

      <div className="gallery-admin-grid" style={{ display: 'grid', gridTemplateColumns: '360px minmax(0,1fr)', gap: 16 }}>
        <GalleryCreateForm action={createGalleryItems} defaultOrder={items.length + 1} inputStyle={inputStyle} labelStyle={labelStyle} />

        <div style={{ display: 'grid', gap: 12 }}>
          {items.length === 0 ? (
            <div style={{ background: '#17171B', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: 28, color: '#94938E', fontFamily: 'var(--font-display)', fontSize: 13 }}>
              Aucune image pour le moment.
            </div>
          ) : items.map(item => (
            <div key={item.id} className="gallery-admin-card" style={{ display: 'grid', gridTemplateColumns: '160px minmax(0,1fr)', gap: 14, background: '#17171B', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: 14 }}>
              <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 4, overflow: 'hidden', background: '#0A0A0C' }}>
                <Image src={item.image_url} alt={item.caption || 'Galerie Bagnon Street'} fill style={{ objectFit: 'cover' }} sizes="160px" />
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                  <Badge label={item.active ? 'Active' : 'Inactive'} variant={item.active ? 'success' : 'default'} />
                  <ConfirmSubmitForm action={deleteGalleryItem.bind(null, item.id)} message="Supprimer cette image de la galerie ?">
                    <PendingSubmitButton idle="Supprimer" pending="Suppression..." variant="danger" size="sm" />
                  </ConfirmSubmitForm>
                </div>
                <form action={updateGalleryItem.bind(null, item.id)} style={{ display: 'grid', gap: 10 }}>
                  <input name="image_url" defaultValue={item.image_url} style={inputStyle} />
                  <input name="caption" defaultValue={item.caption || ''} placeholder="Legende" style={inputStyle} />
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10 }}>
                    <input name="display_order" type="number" defaultValue={item.display_order} style={inputStyle} />
                    <label style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#F2F1ED', fontFamily: 'var(--font-display)', fontSize: 12 }}>
                      <input name="active" type="checkbox" defaultChecked={item.active} style={{ accentColor: '#7A1620' }} />
                      Active
                    </label>
                  </div>
                  <input name="image_file" type="file" accept="image/*" style={inputStyle} />
                  <PendingSubmitButton idle="Enregistrer" pending="Enregistrement..." variant="secondary" size="sm" />
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  )
}
