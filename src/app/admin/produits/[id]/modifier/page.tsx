export const dynamic = 'force-dynamic'
import AdminShell from '@/components/admin/layout/AdminShell'
import PageHeader from '@/components/admin/ui/PageHeader'
import ProductForm from '@/components/admin/forms/ProductForm'
import { getAllCategoriesAdmin, getCollections } from '@/lib/database/categories'
import { updateProduct, deleteProduct, deleteProductImage } from '@/lib/actions/products'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Button from '@/components/admin/ui/Button'

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

export default async function ModifierProduitPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [product, categories, collections] = await Promise.all([
    getProductAdmin(id),
    getAllCategoriesAdmin(),
    getCollections(),
  ])

  if (!product) notFound()

  const updateWithId = updateProduct.bind(null, id)
  const deleteWithId = deleteProduct.bind(null, id)

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Catalogue"
        title={`Modifier — ${product.name}`}
        subtitle={`SKU: ${product.sku}`}
        action={
          <form action={deleteWithId} onSubmit={e => { if (!confirm('Supprimer ce produit ?')) e.preventDefault() }}>
            <Button type="submit" variant="danger" size="sm">
              Supprimer
            </Button>
          </form>
        }
      />

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
                    <Image src={img.image_url} alt="" fill style={{ objectFit: 'cover' }} sizes="90px" />
                  </div>
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
