import Link from 'next/link'

type LegalPlaceholderPageProps = {
  title: string
  description: string
  neededContent: string[]
}

export default function LegalPlaceholderPage({ title, description, neededContent }: LegalPlaceholderPageProps) {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <header style={{ padding: '18px var(--px)', borderBottom: '1px solid var(--border)', background: 'var(--nav-bg)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
          <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>
            Retour a la boutique
          </Link>
        </div>
      </header>
      <section style={{ padding: 'clamp(34px,7vw,76px) var(--px)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 10 }}>
            Informations legales
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,7vw,62px)', lineHeight: 1, letterSpacing: '-.03em', marginBottom: 14 }}>
            {title}
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.8, maxWidth: 680, marginBottom: 26 }}>
            {description}
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: 20 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 14 }}>
              Contenu a fournir avant lancement public
            </p>
            <ul style={{ display: 'grid', gap: 10, paddingLeft: 18, color: 'var(--text2)', fontSize: 13, lineHeight: 1.7 }}>
              {neededContent.map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}
