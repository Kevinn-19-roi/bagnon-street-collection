import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { updateClientPassword } from '@/lib/actions/auth'
import AuthSubmitButton from '@/components/auth/AuthSubmitButton'
import PasswordInput from '@/components/auth/PasswordInput'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Nouveau mot de passe - Bagnon Street',
  robots: { index: false, follow: false },
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/connexion?error=Ouvre le lien sécurisé reçu par email pour créer un nouveau mot de passe.')
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px var(--px)' }}>
      <section style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: 'var(--text)' }}>
            <span style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border2)', position: 'relative', display: 'inline-block' }}>
              <Image src="/brand/logo-round.jpg" alt="BSC" fill style={{ objectFit: 'cover' }} sizes="44px" />
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>Bagnon Street</span>
          </Link>
        </div>

        <form action={updateClientPassword} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Nouveau mot de passe</h1>
            <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.7 }}>Choisis un mot de passe d'au moins 8 caractères.</p>
          </div>

          {params.error && (
            <div role="alert" style={{ background: 'rgba(122,22,32,0.14)', border: '1px solid rgba(122,22,32,0.35)', borderRadius: 4, padding: '12px 14px', color: 'var(--red)', fontSize: 13 }}>
              {params.error}
            </div>
          )}

          <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>
            Nouveau mot de passe
            <PasswordInput name="password" required autoComplete="new-password" minLength={8} inputStyle={{ background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 4, padding: '12px 14px', color: 'var(--text)', outline: 'none' }} />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>
            Confirmer le mot de passe
            <PasswordInput name="confirmPassword" required autoComplete="new-password" minLength={8} inputStyle={{ background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 4, padding: '12px 14px', color: 'var(--text)', outline: 'none' }} />
          </label>

          <AuthSubmitButton idleLabel="Modifier le mot de passe" pendingLabel="Modification..." style={{ background: 'var(--btn)', color: 'var(--btn-t)', borderRadius: 4, padding: '13px 16px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }} />
        </form>
      </section>
    </main>
  )
}
