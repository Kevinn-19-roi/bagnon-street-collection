export const dynamic = 'force-dynamic'
import { loginAdmin } from '@/lib/actions/auth'
import Image from 'next/image'

export const metadata = { title: 'Admin — Bagnon Street' }

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>
}) {
  const params = await searchParams

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0C', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'Space Grotesk', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px', border: '1px solid rgba(255,255,255,0.15)', position: 'relative' }}>
            <Image src="/brand/logo-round.jpg" alt="BSC" fill style={{ objectFit: 'cover' }} sizes="56px" />
          </div>
          <h1 style={{ color: '#F2F1ED', fontSize: 18, fontWeight: 700, letterSpacing: '.05em' }}>BAGNON STREET</h1>
          <p style={{ color: '#94938E', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', marginTop: 4 }}>Administration</p>
        </div>

        {/* Form */}
        <form action={loginAdmin} style={{ background: '#17171B', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <input type="hidden" name="redirect" value={params.redirect || '/admin/dashboard'} />

          {params.error && (
            <div style={{ background: 'rgba(122,22,32,0.15)', border: '1px solid rgba(122,22,32,0.4)', borderRadius: 4, padding: '12px 16px', color: '#ff6b6b', fontSize: 13 }}>
              {params.error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ color: '#94938E', fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase' }}>Email</label>
            <input
              type="email"
              name="email"
              required
              placeholder="admin@bagnonstreet.com"
              style={{ background: '#0A0A0C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '12px 14px', color: '#F2F1ED', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ color: '#94938E', fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase' }}>Mot de passe</label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              style={{ background: '#0A0A0C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '12px 14px', color: '#F2F1ED', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
            />
          </div>

          <button
            type="submit"
            style={{ background: '#7A1620', color: '#fff', border: 'none', borderRadius: 4, padding: '14px', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer', marginTop: 4 }}
          >
            Se connecter
          </button>
        </form>

        <p style={{ color: '#4D4D52', fontSize: 11, textAlign: 'center', marginTop: 24 }}>
          Bagnon Street Collection © 2025
        </p>
      </div>
    </div>
  )
}
