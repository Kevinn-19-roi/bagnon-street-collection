import Image from 'next/image'
import Link from 'next/link'
import { registerClient, resendSignupConfirmation } from '@/lib/actions/auth'
import AuthSubmitButton from '@/components/auth/AuthSubmitButton'
import PasswordInput from '@/components/auth/PasswordInput'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: "Inscription - Bagnon Street",
  robots: { index: false, follow: false },
}

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; confirmation?: string; email?: string; resend?: string; resendError?: string }>
}) {
  const params = await searchParams
  const confirmationEmail = params.confirmation === 'email' && params.email ? params.email : null

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

        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16, color: 'var(--text2)', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase' }}>
          ← Retour à la boutique
        </Link>

        {confirmationEmail ? (
          <section style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span aria-hidden="true" style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--text)', color: 'var(--bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 }}>✓</span>
              <div>
                <p style={{ margin: 0, color: 'var(--text2)', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase' }}>Compte créé</p>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, margin: '4px 0 0' }}>Inscription réussie !</h1>
              </div>
            </div>

            <div style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.8 }}>
              <p style={{ margin: '0 0 12px' }}>Nous venons de t’envoyer un email de confirmation.</p>
              <p style={{ margin: '0 0 12px' }}>Ouvre ta boîte mail et clique sur le lien reçu pour activer ton compte Bagnon Street.</p>
              <p style={{ margin: 0 }}>Si tu ne vois pas l’email, pense à vérifier tes courriers indésirables.</p>
            </div>

            <div style={{ background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 4, padding: '12px 14px', color: 'var(--text2)', fontSize: 13 }}>
              Email envoyé à : <strong style={{ color: 'var(--text)' }}>{confirmationEmail}</strong>
            </div>

            {params.resend === 'sent' && (
              <div role="status" style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.28)', borderRadius: 4, padding: '12px 14px', color: 'var(--blue)', fontSize: 13 }}>
                Email de confirmation renvoyé. Vérifie aussi tes courriers indésirables.
              </div>
            )}

            {params.resendError && (
              <div role="alert" style={{ background: 'rgba(122,22,32,0.14)', border: '1px solid rgba(122,22,32,0.35)', borderRadius: 4, padding: '12px 14px', color: 'var(--red)', fontSize: 13 }}>
                {params.resendError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
              <Link href="/connexion" style={{ display: 'inline-flex', justifyContent: 'center', background: 'var(--btn)', color: 'var(--btn-t)', borderRadius: 4, padding: '13px 16px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                Retour à la connexion
              </Link>

              <form action={resendSignupConfirmation}>
                <input type="hidden" name="email" value={confirmationEmail} />
                <AuthSubmitButton idleLabel="Renvoyer l’email de confirmation" pendingLabel="Renvoi..." style={{ width: '100%', background: 'transparent', color: 'var(--text)', border: '1px solid var(--border2)', borderRadius: 4, padding: '13px 16px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }} />
              </form>
            </div>
          </section>
        ) : (
        <form className="register-form" action={registerClient} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <style>{`
            @media(max-width:640px){
              .register-form{grid-template-columns:1fr!important;}
              .register-two-col{grid-column:1 / -1!important;}
            }
          `}</style>
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

          <label className="register-two-col" style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>
            Téléphone
            <input name="phone" required autoComplete="tel" style={{ background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 4, padding: '12px 14px', color: 'var(--text)', outline: 'none' }} />
          </label>

          <label className="register-two-col" style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>
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
            <PasswordInput name="password" required autoComplete="new-password" minLength={8} inputStyle={{ background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 4, padding: '12px 14px', color: 'var(--text)', outline: 'none' }} />
          </label>

          <AuthSubmitButton idleLabel="Créer le compte" pendingLabel="Création..." style={{ gridColumn: '1 / -1', background: 'var(--btn)', color: 'var(--btn-t)', borderRadius: 4, padding: '13px 16px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }} />
        </form>
        )}

        {!confirmationEmail && (
          <p style={{ textAlign: 'center', marginTop: 18, color: 'var(--text2)', fontSize: 13 }}>
            Déjà un compte ? <Link href="/connexion" style={{ color: 'var(--text)', fontWeight: 700 }}>Se connecter</Link>
          </p>
        )}
      </section>
    </main>
  )
}
