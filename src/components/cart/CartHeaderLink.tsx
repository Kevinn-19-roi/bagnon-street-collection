'use client'

import Link from 'next/link'
import { useCart } from '@/hooks/useCart'

export default function CartHeaderLink() {
  const count = useCart(state => state.count)
  const itemCount = count()

  return (
    <Link href="/panier" style={{ position: 'relative', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text)' }}>
      Panier
      {itemCount > 0 && (
        <span style={{ marginLeft: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, borderRadius: 999, background: 'var(--red)', color: '#fff', fontSize: 10, lineHeight: 1 }}>
          {itemCount}
        </span>
      )}
    </Link>
  )
}
