export const dynamic = 'force-dynamic'

import AdminShell from '@/components/admin/layout/AdminShell'
import PageHeader from '@/components/admin/ui/PageHeader'
import Badge from '@/components/admin/ui/Badge'
import ConfirmSubmitForm from '@/components/admin/forms/ConfirmSubmitForm'
import ResponsiveTable from '@/components/admin/ui/ResponsiveTable'
import { getAllCategoriesAdmin } from '@/lib/database/categories'
import { createCategory, deleteCategory } from '@/lib/actions/categories'
import { formatDate } from '@/lib/helpers/slugify'

export const metadata = { title: 'Catégories — Admin BSC' }

export default async function CategoriesPage() {
  const categories = await getAllCategoriesAdmin()

  const inputStyle = {
    background: '#0A0A0C', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 3, padding: '9px 12px', color: '#F2F1ED',
    fontSize: 13, outline: 'none', fontFamily: 'var(--font-display)', width: '100%',
  }
  const labelStyle = {
    display: 'block', fontFamily: 'var(--font-display)', fontSize: 10,
    fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase' as const,
    color: '#94938E', marginBottom: 6,
  }

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Catalogue"
        title="Catégories"
        subtitle={`${categories.length} catégorie${categories.length > 1 ? 's' : ''}`}
      />
      <style>{`
        @media(max-width:980px){
          .admin-split-grid{grid-template-columns:1fr!important;}
        }
      `}</style>

      <div className="admin-split-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 16 }}>
        <ResponsiveTable minWidth={680}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Nom', 'Slug', 'Ordre', 'Statut', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#4D4D52' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#4D4D52', fontFamily: 'var(--font-display)', fontSize: 13 }}>Aucune catégorie</td></tr>
              ) : categories.map((cat, i) => (
                <tr key={cat.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#F2F1ED' }}>{cat.name}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-display)', fontSize: 11, color: '#4D4D52' }}>{cat.slug}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-display)', fontSize: 13, color: '#94938E' }}>{cat.display_order}</td>
                  <td style={{ padding: '12px 16px' }}><Badge label={cat.active ? 'Active' : 'Inactive'} variant={cat.active ? 'success' : 'default'} /></td>
                  <td style={{ padding: '12px 16px' }}>
                    <ConfirmSubmitForm action={deleteCategory.bind(null, cat.id)} message={`Supprimer "${cat.name}" ?`}>
                      <button type="submit" style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', background: 'rgba(122,22,32,0.15)', color: '#EF5350', border: '1px solid rgba(239,83,80,0.3)', borderRadius: 3, padding: '4px 10px', cursor: 'pointer' }}>
                        Supprimer
                      </button>
                    </ConfirmSubmitForm>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ResponsiveTable>

        <div style={{ background: '#17171B', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: 20, height: 'fit-content' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#F2F1ED', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            Nouvelle catégorie
          </p>
          <form action={createCategory} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Nom *</label>
              <input name="name" required style={inputStyle} placeholder="Ex: T-shirts" />
            </div>
            <div>
              <label style={labelStyle}>Slug *</label>
              <input name="slug" required style={inputStyle} placeholder="tshirts" />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <input name="description" style={inputStyle} placeholder="Description..." />
            </div>
            <div>
              <label style={labelStyle}>Ordre d'affichage</label>
              <input name="display_order" type="number" defaultValue={0} style={inputStyle} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" name="active" value="true" defaultChecked style={{ accentColor: '#7A1620' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: '#94938E' }}>Active</span>
            </label>
            <button type="submit" style={{ background: '#7A1620', color: '#fff', border: 'none', borderRadius: 3, padding: '11px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', marginTop: 4 }}>
              Créer la catégorie
            </button>
          </form>
        </div>
      </div>
    </AdminShell>
  )
}
