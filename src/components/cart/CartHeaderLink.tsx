'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useCart } from '@/hooks/useCart'

const BagIcon = (
  <svg aria-hidden="true" viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8h12l-1 12H7L6 8z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
)

export default function CartHeaderLink() {
  const count = useCart(state => state.count)
  const itemCount = count()
  const previousCount = useRef(itemCount)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (itemCount > previousCount.current) {
      setAnimate(true)
      const timeout = window.setTimeout(() => setAnimate(false), 320)
      previousCount.current = itemCount
      return () => window.clearTimeout(timeout)
    }

    previousCount.current = itemCount
    return undefined
  }, [itemCount])

  return (
    <Link href="/panier" aria-label={`Panier${itemCount > 0 ? `, ${itemCount} article${itemCount > 1 ? 's' : ''}` : ''}`} title="Panier" style={{ position: 'relative', width: 38, height: 38, border: '1px solid var(--border)', borderRadius: 999, display: 'inline-grid', placeItems: 'center', color: 'var(--text)' }}>
      {BagIcon}
      {itemCount > 0 && (
        <span className={animate ? 'cart-badge-pop' : undefined} style={{ position: 'absolute', top: -5, right: -5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, borderRadius: 999, background: 'var(--red)', color: '#fff', fontSize: 10, lineHeight: 1, paddingInline: 5 }}>
          {itemCount}
        </span>
      )}
    </Link>
  )
}
