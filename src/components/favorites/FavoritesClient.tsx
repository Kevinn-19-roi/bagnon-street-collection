'use client'

import Image from 'next/image'
import Link from 'next/link'
import FavoriteButton from '@/components/FavoriteButton'
import { useFavorites } from '@/hooks/useFavorites'
import { productPath } from '@/lib/helpers/product-url'
import type { Product } from '@/types/database'

type FavoritesClientProps = {
  products: Product[]
}

function firstImage(product: Product) {
  return [...(product.images || [])].sort((a, b) => a.display_order - b.display_order)[0]?.image_url
}

export default function FavoritesClient({ products }: FavoritesClientProps) {
  const { favorites } = useFavorites()
  const favoriteProducts = products.filter(product => favorites.has(product.id))

  if (favoriteProducts.length === 0) {
    return (
      <section style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: '64px var(--px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 420 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 12 }}>
            Favoris
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,7vw,46px)', lineHeight: 1, marginBottom: 14 }}>
            Aucun favori pour le moment
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
            Ajoute tes pièces préférées avec le cœur rouge, elles resteront ici sur cet appareil.
          </p>
          <Link href="/#collection" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--btn)', color: 'var(--btn-t)', borderRadius: 3, padding: '13px 22px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
            Découvrir la boutique
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section style={{ padding: 'clamp(28px,6vw,64px) var(--px) clamp(80px,10vw,110px)' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 8 }}>
            Favoris
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px,6vw,56px)', lineHeight: 1, letterSpacing: '-.03em' }}>
            Tes pièces sauvegardées
          </h1>
        </div>

        <div className="favorites-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 12 }}>
          {favoriteProducts.map(product => {
            const image = firstImage(product)
            const discount = product.old_price ? Math.max(0, Math.round((1 - product.price / product.old_price) * 100)) : 0
            const href = productPath(product)

            return (
              <article key={product.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ position: 'relative', aspectRatio: '4 / 5', background: 'var(--bg3)' }}>
                  <Link href={href} prefetch={false} aria-label={`Voir ${product.name}`} style={{ position: 'absolute', inset: 0 }}>
                    {image ? (
                      <Image src={image} alt={product.name} fill sizes="(max-width:640px) 46vw, (max-width:1024px) 30vw, 260px" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'rgba(128,128,128,.12)' }}>BSC</div>
                    )}
                  </Link>
                  {discount > 0 && (
                    <span style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,.78)', color: '#fff', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 2 }}>
                      -{discount}%
                    </span>
                  )}
                  <FavoriteButton productId={product.id} size={18} style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }} />
                </div>
                <div style={{ padding: '12px 13px 14px' }}>
                  <Link href={href} prefetch={false}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, lineHeight: 1.35, marginBottom: 7 }}>{product.name}</h2>
                  </Link>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700 }}>{product.price.toLocaleString('fr-FR')} F</span>
                    {product.old_price && <span style={{ fontSize: 10, color: 'var(--text3)', textDecoration: 'line-through' }}>{product.old_price.toLocaleString('fr-FR')} F</span>}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
