'use client'

import Link from 'next/link'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: 'var(--bg)', color: 'var(--text)' }}>
      <section style={{ width: 'min(520px, 100%)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 24, textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 10 }}>
          Une erreur est survenue
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 7vw, 42px)', lineHeight: 1, marginBottom: 12 }}>
          La page n a pas pu se charger.
        </h1>
        <p style={{ color: 'var(--text2)', lineHeight: 1.6, marginBottom: 20 }}>
          Tu peux reessayer ou revenir a l accueil. L equipe Bagnon Street peut verifier les medias si le probleme persiste.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
          <button onClick={reset} style={{ background: 'var(--btn)', color: 'var(--btn-t)', borderRadius: 4, padding: '12px 18px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>
            Reessayer
          </button>
          <Link href="/" style={{ border: '1px solid var(--border2)', borderRadius: 4, padding: '12px 18px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>
            Retour a l accueil
          </Link>
        </div>
      </section>
    </main>
  )
}
