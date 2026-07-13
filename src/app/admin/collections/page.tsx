import AdminShell from '@/components/admin/layout/AdminShell'
import PageHeader from '@/components/admin/ui/PageHeader'
import Badge from '@/components/admin/ui/Badge'
import ConfirmSubmitForm from '@/components/admin/forms/ConfirmSubmitForm'
import { createAdminClient } from '@/lib/supabase/admin'
import { createCollection, deleteCollection } from '@/lib/actions/categories'
import { formatDate } from '@/lib/helpers/slugify'

export const metadata = { title: 'Collections — Admin BSC' }
export const dynamic = 'force-dynamic'

async function getCollectionsAdmin() {
  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('collections')
    .select('*')
    .order('created_at', { ascending: false })
  return data || []
}

export default async function CollectionsPage() {
  const collections = await getCollectionsAdmin()

  const inputStyle = {
    background: '#0A0A0C', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 3, padding: '9px 12px', color: '#F2F1ED',
    fontSize: 13, outline: 'none', fontFamily: 'var(--font-display)', width: '100%',
  }

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Catalogue"
        title="Collections"
        subtitle={`${collections.length} collection${collections.length > 1 ? 's' : ''}`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>
        {/* List */}
        <div style={{ background: '#17171B', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Nom', 'Slug', 'Statut', 'Créée le', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#4D4D52' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {collections.map((col: any, i: number) => (
                <tr key={col.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#F2F1ED' }}>{col.name}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-display)', fontSize: 11, color: '#4D4D52' }}>{col.slug}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge label={col.active ? 'Active' : 'Inactive'} variant={col.active ? 'success' : 'default'} />
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-display)', fontSize: 11, color: '#4D4D52' }}>{formatDate(col.created_at)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <ConfirmSubmitForm action={deleteCollection.bind(null, col.id)} message={`Supprimer "${col.name}" ?`}>
                      <button type="submit" style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', background: 'rgba(122,22,32,0.15)', color: '#EF5350', border: '1px solid rgba(239,83,80,0.3)', borderRadius: 3, padding: '4px 10px', cursor: 'pointer' }}>
                        Supprimer
                      </button>
                    </ConfirmSubmitForm>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add form */}
        <div style={{ background: '#17171B', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: 20, height: 'fit-content' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#F2F1ED', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            Nouvelle collection
          </p>
          <form action={createCollection} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#94938E', marginBottom: 6 }}>Nom *</label>
              <input name="name" required style={inputStyle} placeholder="Ex: Summer 2026" />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#94938E', marginBottom: 6 }}>Slug *</label>
              <input name="slug" required style={inputStyle} placeholder="summer-2026" />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#94938E', marginBottom: 6 }}>Description</label>
              <textarea name="description" rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Description de la collection..." />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" name="active" value="true" defaultChecked style={{ accentColor: '#7A1620' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: '#94938E' }}>Active</span>
            </label>
            <button type="submit" style={{ background: '#1A2A6C', color: '#fff', border: 'none', borderRadius: 3, padding: '11px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', marginTop: 4 }}>
              Créer la collection
            </button>
          </form>
        </div>
      </div>
    </AdminShell>
  )
}
