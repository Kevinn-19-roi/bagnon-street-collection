import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProductBySlug, getProducts } from '@/lib/database/products'
import { formatPrice } from '@/lib/helpers/slugify'
import ProductMediaGallery from '@/components/product/ProductMediaGallery'
import ProductPurchasePanel from '@/components/product/ProductPurchasePanel'
import RelatedProductCard from '@/components/product/RelatedProductCard'
import { toProductDetailViewModel } from '@/components/product/product-view-model'
import FavoriteButton from '@/components/FavoriteButton'
import type { Product, SiteSettings } from '@/types/database'

export const dynamic = 'force-dynamic'

const SITE_URL = 'https://bagnon-street-collection-ci.vercel.app'

type ProductPageProps = {
  params: Promise<{ slug: string }>
}

function isValidSlug(slug: string) {
  return /^[a-z0-9-]{2,120}$/.test(slug)
}

async function getSiteSettings(): Promise<Pick<SiteSettings, 'shipping_cost' | 'free_shipping_from'> | null> {
  try {
    const adminClient = createAdminClient()
    const { data } = await adminClient
      .from('site_settings')
      .select('shipping_cost, free_shipping_from')
      .limit(1)
      .maybeSingle()

    return data || null
  } catch {
    return null
  }
}

async function getSimilarProducts(product: Product) {
  const related: Product[] = []
  const seen = new Set<string>([product.id])

  async function addProducts(products: Product[]) {
    for (const item of products) {
      if (seen.has(item.id)) continue
      seen.add(item.id)
      related.push(item)
      if (related.length >= 4) break
    }
  }

  if (product.collection_id) {
    const byCollection = await getProducts({ collection_id: product.collection_id, per_page: 5 })
    await addProducts(byCollection.data)
  }

  if (related.length < 4 && product.category_id) {
    const byCategory = await getProducts({ category_id: product.category_id, per_page: 8 })
    await addProducts(byCategory.data)
  }

  return related.slice(0, 4)
}

async function loadProduct(slug: string) {
  if (!isValidSlug(slug)) return null
  return getProductBySlug(slug)
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await loadProduct(slug)

  if (!product) {
    return {
      title: 'Produit introuvable',
      robots: { index: false, follow: false },
    }
  }

  const viewModel = toProductDetailViewModel(product)
  const description = viewModel.shortDescription || viewModel.description || `${viewModel.name} chez Bagnon Street Collection.`
  const url = `${SITE_URL}/produit/${viewModel.slug}`
  const image = viewModel.images[0]

  return {
    title: viewModel.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${viewModel.name} | Bagnon Street Collection`,
      description,
      url,
      type: 'website',
      images: image ? [{ url: image, alt: viewModel.name }] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: viewModel.name,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await loadProduct(slug)

  if (!product) notFound()

  const [settings, similarProducts] = await Promise.all([
    getSiteSettings(),
    getSimilarProducts(product),
  ])

  const viewModel = toProductDetailViewModel(product)
  const whatsappText = encodeURIComponent(`${viewModel.name} - ${formatPrice(viewModel.price)} ${SITE_URL}/produit/${viewModel.slug}`)
  const whatsappShareUrl = `https://wa.me/?text=${whatsappText}`
  const stockLabel = viewModel.stock <= 0
    ? 'Rupture de stock'
    : viewModel.stock <= 3
      ? `Plus que ${viewModel.stock} article${viewModel.stock > 1 ? 's' : ''} disponible${viewModel.stock > 1 ? 's' : ''}`
      : 'Disponible'

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <header style={{ borderBottom: '1px solid var(--border)', padding: '14px var(--px)', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>
            ← Retour à la boutique
          </Link>
          <Link href="/#collection" style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
            Catalogue
          </Link>
        </div>
      </header>

      <section style={{ padding: 'clamp(24px,5vw,56px) var(--px)' }}>
        <div className="product-detail-grid" style={{ maxWidth: 1440, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(320px, .95fr)', gap: 'clamp(24px,5vw,64px)', alignItems: 'start' }}>
          <ProductMediaGallery images={viewModel.images} productName={viewModel.name} />

          <div style={{ display: 'grid', gap: 22 }}>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {viewModel.collection && <span style={{ border: '1px solid var(--border2)', borderRadius: 3, padding: '5px 9px', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text2)' }}>{viewModel.collection}</span>}
                {viewModel.category && <span style={{ border: '1px solid var(--border2)', borderRadius: 3, padding: '5px 9px', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text2)' }}>{viewModel.category}</span>}
                {viewModel.discount > 0 && <span style={{ background: 'var(--red)', color: '#fff', borderRadius: 3, padding: '5px 9px', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>-{viewModel.discount}%</span>}
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px,6vw,58px)', fontWeight: 700, lineHeight: .98, letterSpacing: '-.03em', flex: 1 }}>
                  {viewModel.name}
                </h1>
                <FavoriteButton productId={viewModel.id} size={22} style={{ flexShrink: 0 }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px,4vw,30px)', fontWeight: 700 }}>{formatPrice(viewModel.price)}</span>
                {viewModel.oldPrice && <span style={{ color: 'var(--text3)', textDecoration: 'line-through', fontSize: 14 }}>{formatPrice(viewModel.oldPrice)}</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 10, padding: '16px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: viewModel.stock > 0 ? '#4CAF50' : 'var(--red)' }}>
                {stockLabel}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
                Stock total : {viewModel.stock}
              </p>
            </div>

            {(viewModel.shortDescription || viewModel.description) && (
              <div style={{ display: 'grid', gap: 10 }}>
                {viewModel.shortDescription && <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.8 }}>{viewModel.shortDescription}</p>}
                {viewModel.description && <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.85 }}>{viewModel.description}</p>}
              </div>
            )}

            <ProductPurchasePanel product={viewModel} />

            <div style={{ display: 'grid', gap: 10, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: 16 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase' }}>Livraison</p>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>Livraison disponible en Côte d’Ivoire.</p>
              {settings?.shipping_cost !== undefined && <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>Frais de livraison indicatifs : {formatPrice(Number(settings.shipping_cost))}</p>}
              {settings?.free_shipping_from !== undefined && <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>Livraison offerte dès {formatPrice(Number(settings.free_shipping_from))}.</p>}
            </div>

            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ width: 'fit-content', border: '1px solid var(--border2)', borderRadius: 4, padding: '10px 14px', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text2)' }}
            >
              Partager sur WhatsApp
            </a>
          </div>
        </div>
      </section>

      {similarProducts.length > 0 && (
        <section style={{ padding: '0 var(--px) clamp(56px,8vw,88px)', borderTop: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 1440, margin: '0 auto', paddingTop: 'clamp(28px,5vw,48px)' }}>
            <div style={{ marginBottom: 22 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 8 }}>Produits similaires</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,4vw,34px)', fontWeight: 700 }}>Vous aimerez aussi</h2>
            </div>
            <div className="related-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
              {similarProducts.map(item => <RelatedProductCard key={item.id} product={item} />)}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
