import Link from 'next/link'
import RelatedProductCard from '@/components/product/RelatedProductCard'
import type { Product } from '@/types/database'

type PublicProductListingProps = {
  eyebrow: string
  title: string
  description?: string | null
  products: Product[]
  currentPage?: number
  totalPages?: number
  basePath?: string
  emptyTitle?: string
  emptyCtaLabel?: string
}

export default function PublicProductListing({
  eyebrow,
  title,
  description,
  products,
  currentPage = 1,
  totalPages = 1,
  basePath,
  emptyTitle = 'Aucun produit actif dans cette selection pour le moment.',
  emptyCtaLabel = 'Decouvrir la boutique',
}: PublicProductListingProps) {
  const hasPrevious = currentPage > 1
  const hasNext = currentPage < totalPages
  const pageHref = (page: number) => {
    if (!basePath) return '#'
    const separator = basePath.includes('?') ? '&' : '?'
    return page <= 1 ? basePath : `${basePath}${separator}page=${page}`
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <header style={{ padding: '18px var(--px)', borderBottom: '1px solid var(--border)', background: 'var(--nav-bg)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
          <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>
            Retour a la boutique
          </Link>
          <Link href="/#collection" style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--red)' }}>
            Catalogue
          </Link>
        </div>
      </header>

      <style>{`
        @media(max-width:760px){
          .public-product-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;}
        }
        @media(max-width:390px){
          .public-product-grid{grid-template-columns:1fr!important;}
        }
      `}</style>

      <section style={{ padding: 'clamp(34px,7vw,76px) var(--px)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 10 }}>
            {eyebrow}
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,7vw,62px)', lineHeight: 1, letterSpacing: '-.03em', marginBottom: 12 }}>
            {title}
          </h1>
          {description && (
            <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.8, maxWidth: 620, marginBottom: 26 }}>
              {description}
            </p>
          )}

          {products.length > 0 ? (
            <>
              <div className="public-product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 12 }}>
                {products.map(product => <RelatedProductCard key={product.id} product={product} />)}
              </div>
              {basePath && totalPages > 1 && (
                <nav aria-label="Pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 28, flexWrap: 'wrap' }}>
                  <Link
                    href={hasPrevious ? pageHref(currentPage - 1) : pageHref(1)}
                    aria-disabled={!hasPrevious}
                    style={{ pointerEvents: hasPrevious ? 'auto' : 'none', opacity: hasPrevious ? 1 : .45, border: '1px solid var(--border2)', borderRadius: 3, padding: '10px 14px', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text2)' }}
                  >
                    Precedent
                  </Link>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--text3)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                    Page {currentPage} / {totalPages}
                  </span>
                  <Link
                    href={hasNext ? pageHref(currentPage + 1) : pageHref(totalPages)}
                    aria-disabled={!hasNext}
                    style={{ pointerEvents: hasNext ? 'auto' : 'none', opacity: hasNext ? 1 : .45, background: 'var(--btn)', color: 'var(--btn-t)', borderRadius: 3, padding: '10px 14px', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}
                  >
                    Suivant
                  </Link>
                </nav>
              )}
            </>
          ) : (
            <div style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 24, background: 'var(--bg2)' }}>
              <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                {emptyTitle}
              </p>
              <Link href="/#collection" style={{ display: 'inline-flex', background: 'var(--btn)', color: 'var(--btn-t)', borderRadius: 3, padding: '12px 16px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                {emptyCtaLabel}
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
