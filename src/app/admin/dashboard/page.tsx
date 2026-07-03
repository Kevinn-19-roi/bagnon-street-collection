import { getCurrentAdmin } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import { logoutAdmin } from '@/lib/actions/auth'

export const metadata = { title: 'Dashboard — Admin BSC' }

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0C', fontFamily: "'Space Grotesk', sans-serif", color: '#F2F1ED' }}>
      {/* Topbar */}
      <div style={{ background: '#17171B', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4CAF50' }} />
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.05em' }}>BAGNON STREET — Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 12, color: '#94938E' }}>
            {admin.fullname} · <span style={{ color: '#7A1620', textTransform: 'uppercase', fontSize: 10, fontWeight: 700 }}>{admin.role}</span>
          </span>
          <form action={logoutAdmin}>
            <button type="submit" style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 3, padding: '6px 14px', color: '#94938E', fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>
              Déconnexion
            </button>
          </form>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 40, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.35em', textTransform: 'uppercase', color: '#7A1620', marginBottom: 8 }}>Vue d'ensemble</p>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-.02em' }}>Dashboard</h1>
          <p style={{ color: '#94938E', fontSize: 14, marginTop: 8 }}>Backend configuré avec succès. Prêt pour l'étape 2.</p>
        </div>

        {/* Status Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, marginBottom: 40 }}>
          {[
            { label: 'Base de données', status: '✓ Supabase', color: '#4CAF50' },
            { label: 'Authentification', status: '✓ Active', color: '#4CAF50' },
            { label: 'Storage', status: '⟳ À configurer', color: '#F5C84B' },
            { label: 'RLS Policies', status: '✓ Sécurisé', color: '#4CAF50' },
          ].map(c => (
            <div key={c.label} style={{ background: '#17171B', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 4, padding: '24px' }}>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: '#94938E', marginBottom: 10 }}>{c.label}</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: c.color }}>{c.status}</p>
            </div>
          ))}
        </div>

        <div style={{ background: '#17171B', border: '1px solid rgba(26,42,108,0.4)', borderRadius: 4, padding: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#1A2A6C', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Prochaine étape</p>
          <p style={{ fontSize: 14, color: '#94938E', lineHeight: 1.7 }}>
            Étape 2 : Dashboard Admin complet — gestion des produits, commandes, clients, catégories et paramètres du site.
          </p>
        </div>
      </div>
    </div>
  )
}
