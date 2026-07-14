'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useCart } from '@/hooks/useCart'

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
    <Link href="/panier" style={{ position: 'relative', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text)' }}>
      Panier
      {itemCount > 0 && (
        <span className={animate ? 'cart-badge-pop' : undefined} style={{ marginLeft: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, borderRadius: 999, background: 'var(--red)', color: '#fff', fontSize: 10, lineHeight: 1 }}>
          {itemCount}
        </span>
      )}
    </Link>
  )
}
