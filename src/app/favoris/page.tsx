import Link from 'next/link'
import FavoritesClient from '@/components/favorites/FavoritesClient'
import { getProducts } from '@/lib/database/products'

export const metadata = {
  title: 'Favoris — Bagnon Street Collection',
  description: 'Retrouvez les pièces Bagnon Street Collection que vous avez sauvegardées.',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function FavorisPage() {
  const { data: products } = await getProducts({ active: true, per_page: 100 })

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <header style={{ padding: '18px var(--px)', borderBottom: '1px solid var(--border)', background: 'var(--nav-bg)', backdropFilter: 'blur(18px)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>
            ← Retour à la boutique
          </Link>
          <Link href="/#collection" style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--red)' }}>
            Catalogue
          </Link>
        </div>
      </header>

      <FavoritesClient products={products} />
    </main>
  )
}
