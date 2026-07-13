import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { logoutUser } from '@/lib/actions/auth'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Profil — Bagnon Street' }

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/connexion')

  const adminClient = createAdminClient()

  const { data: admin } = await adminClient
    .from('admins')
    .select('id, fullname, role')
    .eq('id', user.id)
    .maybeSingle()

  const { data: profile } = user.email
    ? await adminClient
      .from('customers')
      .select('id, fullname, phone, email, address, city, country')
      .eq('email', user.email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    : { data: null }

  const fullname = profile?.fullname || admin?.fullname || user.user_metadata?.fullname || user.email?.split('@')[0] || 'Client'

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '32px var(--px)' }}>
      <section style={{ maxWidth: 820, margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 28 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: 'var(--text)' }}>
            <span style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border2)', position: 'relative', display: 'inline-block' }}>
              <Image src="/brand/logo-round.jpg" alt="BSC" fill style={{ objectFit: 'cover' }} sizes="42px" />
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>Bagnon Street</span>
          </Link>

          <form action={logoutUser}>
            <button type="submit" style={{ color: 'var(--red)', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>
              Déconnexion
            </button>
          </form>
        </header>

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: 'clamp(22px,4vw,34px)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18, borderBottom: '1px solid var(--border)', paddingBottom: 22, marginBottom: 22 }}>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.22em', color: admin ? 'var(--blue)' : 'var(--red)', textTransform: 'uppercase', marginBottom: 8 }}>
                {admin ? 'Administrateur' : 'Client'}
              </p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,5vw,36px)', fontWeight: 700 }}>{fullname}</h1>
              <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 6 }}>{user.email}</p>
            </div>

            {admin && (
              <Link href="/admin/dashboard" style={{ background: 'var(--blue)', color: '#fff', borderRadius: 4, padding: '10px 14px', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                BSC Admin
              </Link>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
            {[
              ['Téléphone', profile?.phone || 'Non renseigné'],
              ['Ville / commune', profile?.city || 'Non renseigné'],
              ['Adresse', profile?.address || 'Non renseignée'],
              ['Pays', profile?.country || "Côte d'Ivoire"],
            ].map(([label, value]) => (
              <div key={label} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: 16 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 8 }}>{label}</p>
                <p style={{ fontSize: 14, color: 'var(--text)' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
