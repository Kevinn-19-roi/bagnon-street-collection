import AdminShell from '@/components/admin/layout/AdminShell'
import PageHeader from '@/components/admin/ui/PageHeader'
import Badge from '@/components/admin/ui/Badge'
import ResponsiveTable from '@/components/admin/ui/ResponsiveTable'
import ConfirmSubmitForm from '@/components/admin/forms/ConfirmSubmitForm'
import { getProductsAdminList } from '@/lib/database/products'
import { deleteProduct, duplicateProduct } from '@/lib/actions/products'
import { formatPrice, formatDate } from '@/lib/helpers/slugify'
import Link from 'next/link'
import PublicMediaImage from '@/components/PublicMediaImage'

export const metadata = { title: 'Produits — Admin BSC' }
export const dynamic = 'force-dynamic'

export default async function ProduitsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; category?: string; success?: string; error?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page || 1)
  const search = params.search || ''
  const successMessage = params.success === 'created'
    ? 'Produit créé avec succès.'
    : params.success === 'updated'
      ? 'Produit modifié avec succès.'
      : params.success === 'deleted'
        ? 'Produit supprimé avec succès.'
      : null
  const errorMessage = params.error === 'delete'
    ? 'Impossible de supprimer le produit. Réessayez ou vérifiez les éléments liés.'
    : params.error === 'duplicate'
      ? 'Impossible de dupliquer le produit. Réessayez depuis la liste produits.'
      : null

  const { data: products, total, total_pages } = await getProductsAdminList({
    search: search || undefined,
    active: null,
    page,
    per_page: 20,
  })

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Catalogue"
        title="Produits"
        subtitle={`${total} produit${total > 1 ? 's' : ''} au total`}
        action={
          <Link href="/admin/produits/nouveau" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#7A1620', color: '#fff', borderRadius: 3,
            padding: '9px 18px', fontFamily: 'var(--font-display)',
            fontSize: 12, fontWeight: 700, letterSpacing: '.06em',
            textTransform: 'uppercase', textDecoration: 'none',
          }}>
            + Nouveau produit
          </Link>
        }
      />

      {successMessage && (
        <div
          role="status"
          style={{
            background: 'rgba(76,175,80,0.12)',
            border: '1px solid rgba(76,175,80,0.32)',
            color: '#81C784',
            borderRadius: 3,
            padding: '10px 14px',
            marginBottom: 16,
            fontFamily: 'var(--font-display)',
            fontSize: 12,
          }}
        >
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          style={{
            background: 'rgba(239,83,80,0.12)',
            border: '1px solid rgba(239,83,80,0.32)',
            color: '#EF5350',
            borderRadius: 3,
            padding: '10px 14px',
            marginBottom: 16,
            fontFamily: 'var(--font-display)',
            fontSize: 12,
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Search */}
      <form style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, maxWidth: 500, flexWrap: 'wrap' }}>
          <input
            name="search"
            defaultValue={search}
            placeholder="Rechercher un produit..."
            style={{
              flex: '1 1 240px', background: '#17171B', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 3, padding: '10px 14px', color: '#F2F1ED',
              fontSize: 13, outline: 'none', fontFamily: 'var(--font-display)',
            }}
          />
          <button type="submit" style={{
            background: '#1A2A6C', color: '#fff', border: 'none', borderRadius: 3,
            padding: '10px 18px', fontFamily: 'var(--font-display)', fontSize: 12,
            fontWeight: 700, cursor: 'pointer',
          }}>
            Chercher
          </button>
        </div>
      </form>

      {/* Table */}
      <ResponsiveTable minWidth={980}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Produit', 'Catégorie', 'Prix', 'Stock', 'Statut', 'Créé le', 'Actions'].map(h => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: 'left',
                  fontFamily: 'var(--font-display)', fontSize: 10,
                  fontWeight: 700, letterSpacing: '.2em',
                  textTransform: 'uppercase', color: '#4D4D52',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#4D4D52', fontFamily: 'var(--font-display)', fontSize: 13 }}>
                  Aucun produit trouvé
                </td>
              </tr>
            ) : products.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                {/* Product */}
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 50, background: '#0A0A0C', borderRadius: 3, flexShrink: 0, overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.07)' }}>
                      {p.images && p.images[0] ? (
                        <PublicMediaImage src={p.images[0].image_url} alt={p.name} fill style={{ objectFit: 'cover' }} sizes="40px" />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#4D4D52', fontFamily: 'var(--font-display)' }}>BSC</div>
                      )}
                    </div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#F2F1ED' }}>{p.name}</p>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#4D4D52', marginTop: 2 }}>SKU: {p.sku}</p>
                    </div>
                  </div>
                </td>
                {/* Category */}
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: '#94938E' }}>{p.category?.name || '—'}</span>
                </td>
                {/* Price */}
                <td style={{ padding: '12px 16px' }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#F2F1ED' }}>{formatPrice(p.price)}</p>
                    {p.old_price && <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#4D4D52', textDecoration: 'line-through' }}>{formatPrice(p.old_price)}</p>}
                  </div>
                </td>
                {/* Stock */}
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: p.stock < 5 ? '#EF5350' : '#F2F1ED', fontWeight: p.stock < 5 ? 700 : 400 }}>
                    {p.stock}
                  </span>
                </td>
                {/* Status */}
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Badge label={p.active ? 'Actif' : 'Brouillon'} variant={p.active ? 'success' : 'default'} />
                    {p.featured && <Badge label="Vedette" variant="info" />}
                    {p.new_arrival && <Badge label="Nouveau" variant="warning" />}
                    {p.on_sale && <Badge label="Promo" variant="error" />}
                  </div>
                </td>
                {/* Date */}
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: '#4D4D52' }}>{formatDate(p.created_at)}</span>
                </td>
                {/* Actions */}
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', whiteSpace: 'nowrap' }}>
                    <Link href={`/admin/produits/${p.id}/modifier`} style={{
                      fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700,
                      letterSpacing: '.08em', textTransform: 'uppercase',
                      background: 'rgba(26,42,108,0.2)', color: '#5C7CFA',
                      border: '1px solid rgba(26,42,108,0.4)', borderRadius: 3,
                      padding: '5px 10px', textDecoration: 'none',
                    }}>
                      Modifier
                    </Link>
                    <ConfirmSubmitForm action={duplicateProduct.bind(null, p.id)} message={`Dupliquer "${p.name}" ?`}>
                      <button type="submit" style={{
                        fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700,
                        letterSpacing: '.08em', textTransform: 'uppercase',
                        background: 'rgba(76,175,80,0.12)', color: '#81C784',
                        border: '1px solid rgba(76,175,80,0.3)', borderRadius: 3,
                        padding: '5px 10px', cursor: 'pointer',
                      }}>
                        Dupliquer
                      </button>
                    </ConfirmSubmitForm>
                    <ConfirmSubmitForm action={deleteProduct.bind(null, p.id)} message={`Supprimer "${p.name}" ?`}>
                      <button type="submit" style={{
                        fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700,
                        letterSpacing: '.08em', textTransform: 'uppercase',
                        background: 'rgba(122,22,32,0.15)', color: '#EF5350',
                        border: '1px solid rgba(239,83,80,0.3)', borderRadius: 3,
                        padding: '5px 10px', cursor: 'pointer',
                      }}>
                        Supprimer
                      </button>
                    </ConfirmSubmitForm>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ResponsiveTable>

      {/* Pagination */}
      {total_pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          {Array.from({ length: total_pages }, (_, i) => i + 1).map(p => (
            <Link key={p} href={`?page=${p}${search ? `&search=${search}` : ''}`} style={{
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: p === page ? '#7A1620' : '#17171B',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 3, fontFamily: 'var(--font-display)', fontSize: 12,
              fontWeight: 700, color: p === page ? '#fff' : '#94938E', textDecoration: 'none',
            }}>
              {p}
            </Link>
          ))}
        </div>
      )}
    </AdminShell>
  )
}
