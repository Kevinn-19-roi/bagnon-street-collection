import Link from 'next/link'
import CartPageClient from '@/components/cart/CartPageClient'

export const metadata = {
  title: 'Panier — Bagnon Street Collection',
  description: 'Consultez les articles sauvegardes dans votre panier Bagnon Street Collection.',
  robots: { index: false, follow: false },
}

export default function CartPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <header style={{ padding: '18px var(--px)', borderBottom: '1px solid var(--border)', background: 'var(--nav-bg)', backdropFilter: 'blur(18px)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>
            ← Retour à la boutique
          </Link>
          <Link href="/#collection" style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--red)' }}>
            Catalogue
          </Link>
        </div>
      </header>

      <CartPageClient />
    </main>
  )
}
