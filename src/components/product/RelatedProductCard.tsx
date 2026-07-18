import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/types/database'
import FavoriteButton from '@/components/FavoriteButton'
import { productPath } from '@/lib/helpers/product-url'

type RelatedProductCardProps = {
  product: Product
}

function firstImage(product: Product) {
  return [...(product.images || [])].sort((a, b) => a.display_order - b.display_order)[0]?.image_url
}

export default function RelatedProductCard({ product }: RelatedProductCardProps) {
  const image = firstImage(product)
  const discount = product.old_price ? Math.max(0, Math.round((1 - product.price / product.old_price) * 100)) : 0
  const href = productPath(product)

  return (
    <Link
      href={href}
      prefetch={false}
      style={{
        display: 'block',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '4 / 5', background: 'var(--bg3)', overflow: 'hidden' }}>
        {image ? (
          <Image src={image} alt={product.name} fill sizes="(max-width: 768px) 45vw, 220px" style={{ objectFit: 'cover' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'rgba(128,128,128,.12)' }}>BSC</div>
        )}
        {discount > 0 && (
          <span style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,.78)', color: '#fff', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 2 }}>
            -{discount}%
          </span>
        )}
        <FavoriteButton productId={product.id} size={18} style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }} />
      </div>
      <div style={{ padding: '11px 12px 13px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, lineHeight: 1.35, marginBottom: 7 }}>{product.name}</h3>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>{product.price.toLocaleString('fr-FR')} F</span>
          {product.old_price && <span style={{ fontSize: 10, color: 'var(--text3)', textDecoration: 'line-through' }}>{product.old_price.toLocaleString('fr-FR')} F</span>}
        </div>
      </div>
    </Link>
  )
}
