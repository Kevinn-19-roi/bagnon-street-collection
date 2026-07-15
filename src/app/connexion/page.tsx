import Image from 'next/image'
import Link from 'next/link'
import { loginClient } from '@/lib/actions/auth'
import AuthSubmitButton from '@/components/auth/AuthSubmitButton'
import PasswordInput from '@/components/auth/PasswordInput'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: "Connexion - Bagnon Street",
  robots: { index: false, follow: false },
}

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const params = await searchParams

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px var(--px)' }}>
      <section style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: 'var(--text)' }}>
            <span style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border2)', position: 'relative', display: 'inline-block' }}>
              <Image src="/brand/logo-round.jpg" alt="BSC" fill style={{ objectFit: 'cover' }} sizes="44px" />
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>Bagnon Street</span>
          </Link>
        </div>

        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16, color: 'var(--text2)', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase' }}>
          ← Retour à la boutique
        </Link>

        <form action={loginClient} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Connexion</h1>
            <p style={{ color: 'var(--text2)', fontSize: 13 }}>Accède à ton profil Bagnon Street.</p>
          </div>

          {params.error && (
            <div style={{ background: 'rgba(122,22,32,0.14)', border: '1px solid rgba(122,22,32,0.35)', borderRadius: 4, padding: '12px 14px', color: 'var(--red)', fontSize: 13 }}>
              {params.error}
            </div>
          )}

          {params.message && (
            <div style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.28)', borderRadius: 4, padding: '12px 14px', color: 'var(--blue)', fontSize: 13 }}>
              {params.message}
            </div>
          )}

          <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>
            Email
            <input name="email" type="email" required autoComplete="email" style={{ background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 4, padding: '12px 14px', color: 'var(--text)', outline: 'none' }} />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>
            Mot de passe
            <PasswordInput name="password" required autoComplete="current-password" inputStyle={{ background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 4, padding: '12px 14px', color: 'var(--text)', outline: 'none' }} />
          </label>

          <AuthSubmitButton idleLabel="Se connecter" pendingLabel="Connexion..." style={{ background: 'var(--btn)', color: 'var(--btn-t)', borderRadius: 4, padding: '13px 16px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }} />
        </form>

        <p style={{ textAlign: 'center', marginTop: 18, color: 'var(--text2)', fontSize: 13 }}>
          Pas encore de compte ? <Link href="/inscription" style={{ color: 'var(--text)', fontWeight: 700 }}>Créer un compte</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 12, color: 'var(--text3)', fontSize: 12 }}>
          <Link href="/admin/login" style={{ color: 'var(--text3)' }}>Administration</Link>
        </p>
      </section>
    </main>
  )
}
