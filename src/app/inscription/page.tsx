import Image from 'next/image'
import Link from 'next/link'
import { registerClient } from '@/lib/actions/auth'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Inscription — Bagnon Street' }

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px var(--px)' }}>
      <section style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: 'var(--text)' }}>
            <span style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border2)', position: 'relative', display: 'inline-block' }}>
              <Image src="/brand/logo-round.jpg" alt="BSC" fill style={{ objectFit: 'cover' }} sizes="44px" />
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>Bagnon Street</span>
          </Link>
        </div>

        <form action={registerClient} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Créer un compte</h1>
            <p style={{ color: 'var(--text2)', fontSize: 13 }}>Tes informations seront utilisées pour préparer tes futures commandes.</p>
          </div>

          {params.error && (
            <div style={{ gridColumn: '1 / -1', background: 'rgba(122,22,32,0.14)', border: '1px solid rgba(122,22,32,0.35)', borderRadius: 4, padding: '12px 14px', color: 'var(--red)', fontSize: 13 }}>
              {params.error}
            </div>
          )}

          <label style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>
            Nom et prénom
            <input name="fullname" required autoComplete="name" style={{ background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 4, padding: '12px 14px', color: 'var(--text)', outline: 'none' }} />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>
            Téléphone
            <input name="phone" required autoComplete="tel" style={{ background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 4, padding: '12px 14px', color: 'var(--text)', outline: 'none' }} />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>
            Ville / commune
            <input name="city" autoComplete="address-level2" style={{ background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 4, padding: '12px 14px', color: 'var(--text)', outline: 'none' }} />
          </label>

          <label style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>
            Adresse
            <input name="address" autoComplete="street-address" style={{ background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 4, padding: '12px 14px', color: 'var(--text)', outline: 'none' }} />
          </label>

          <label style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>
            Email
            <input name="email" type="email" required autoComplete="email" style={{ background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 4, padding: '12px 14px', color: 'var(--text)', outline: 'none' }} />
          </label>

          <label style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>
            Mot de passe
            <input name="password" type="password" required autoComplete="new-password" minLength={8} style={{ background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 4, padding: '12px 14px', color: 'var(--text)', outline: 'none' }} />
          </label>

          <button type="submit" style={{ gridColumn: '1 / -1', background: 'var(--btn)', color: 'var(--btn-t)', borderRadius: 4, padding: '13px 16px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
            Créer le compte
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 18, color: 'var(--text2)', fontSize: 13 }}>
          Déjà un compte ? <Link href="/connexion" style={{ color: 'var(--text)', fontWeight: 700 }}>Se connecter</Link>
        </p>
      </section>
    </main>
  )
}
