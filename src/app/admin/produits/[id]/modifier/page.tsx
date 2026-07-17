export const dynamic = 'force-dynamic'
import AdminShell from '@/components/admin/layout/AdminShell'
import PageHeader from '@/components/admin/ui/PageHeader'
import ProductForm from '@/components/admin/forms/ProductForm'
import ConfirmSubmitForm from '@/components/admin/forms/ConfirmSubmitForm'
import { getAllCategoriesAdmin, getCollections } from '@/lib/database/categories'
import { updateProduct, deleteProduct, deleteProductImage, duplicateProduct } from '@/lib/actions/products'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import PendingSubmitButton from '@/components/admin/forms/PendingSubmitButton'
import PublicMediaImage from '@/components/PublicMediaImage'

export const metadata = { title: 'Modifier produit — Admin BSC' }

async function getProductAdmin(id: string) {
  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('products')
    .select('*, images:product_images(*), sizes:product_sizes(*), colors:product_colors(*)')
    .eq('id', id)
    .single()
  return data
}

function hasTemporaryImageUrl(value?: string | null) {
  if (!value) return true
  return value.startsWith('blob:')
    || value.startsWith('data:')
    || value.startsWith('file:')
    || value.includes('/storage/v1/object/sign/')
}

export default async function ModifierProduitPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ success?: string }>
}) {
  const { id } = await params
  const query = await searchParams
  const [product, categories, collections] = await Promise.all([
    getProductAdmin(id),
    getAllCategoriesAdmin(),
    getCollections(),
  ])

  if (!product) notFound()

  const updateWithId = updateProduct.bind(null, id)
  const deleteWithId = deleteProduct.bind(null, id)
  const duplicateWithId = duplicateProduct.bind(null, id)

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Catalogue"
        title={`Modifier — ${product.name}`}
        subtitle={`SKU: ${product.sku}`}
        action={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <ConfirmSubmitForm action={duplicateWithId} message="Dupliquer ce produit ?">
              <PendingSubmitButton idle="Dupliquer" pending="Duplication..." variant="secondary" size="sm" />
            </ConfirmSubmitForm>
            <ConfirmSubmitForm action={deleteWithId} message="Supprimer ce produit ?">
              <PendingSubmitButton idle="Supprimer" pending="Suppression..." variant="danger" size="sm" />
            </ConfirmSubmitForm>
          </div>
        }
      />

      {query.success === 'duplicated' && (
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
          Produit duplique avec succes. Tu peux maintenant modifier le nom, la couleur, les images et le stock avant publication.
        </div>
      )}

      {/* Current images */}
      {product.images && product.images.length > 0 && (
        <div style={{ background: '#17171B', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: 20, marginBottom: 16 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#94938E', marginBottom: 14 }}>
            Images actuelles ({product.images.length})
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {product.images
              .sort((a: any, b: any) => a.display_order - b.display_order)
              .map((img: any) => (
                <div key={img.id} style={{ position: 'relative' }}>
                  <div style={{ width: 90, height: 110, position: 'relative', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <PublicMediaImage src={img.image_url} alt="Image produit" fill style={{ objectFit: 'cover' }} sizes="90px" />
                  </div>
                  {hasTemporaryImageUrl(img.image_url) && (
                    <p style={{ width: 90, color: '#F2B8BE', fontSize: 9, lineHeight: 1.3, marginTop: 5 }}>
                      URL temporaire ou invalide. Supprime puis reimporte cette image.
                    </p>
                  )}
                  <form action={deleteProductImage.bind(null, img.id, id)}>
                    <button type="submit" style={{
                      position: 'absolute', top: 4, right: 4,
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'rgba(239,83,80,0.9)', color: '#fff',
                      border: 'none', cursor: 'pointer', fontSize: 11,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>✕</button>
                  </form>
                </div>
              ))}
          </div>
        </div>
      )}

      <ProductForm
        categories={categories}
        collections={collections}
        product={product}
        onSubmit={updateWithId}
        isEdit
      />
    </AdminShell>
  )
}
