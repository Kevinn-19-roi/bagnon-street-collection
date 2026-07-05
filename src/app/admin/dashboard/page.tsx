import AdminShell from '@/components/admin/layout/AdminShell'
import PageHeader from '@/components/admin/ui/PageHeader'
import StatCard from '@/components/admin/ui/StatCard'
import { getDashboardStats } from '@/lib/database/orders'
import { formatPrice, formatDate } from '@/lib/helpers/slugify'
import Link from 'next/link'

export const metadata = { title: 'Dashboard — Admin BSC' }
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Vue d'ensemble"
        title="Dashboard"
        subtitle={`Dernière mise à jour : ${formatDate(new Date().toISOString())}`}
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, marginBottom: 28 }}>
        <StatCard
          label="Commandes totales"
          value={stats.total_orders}
          color="blue"
          icon={<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>}
        />
        <StatCard
          label="Chiffre d'affaires"
          value={formatPrice(stats.total_revenue)}
          color="green"
          icon={<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
        />
        <StatCard
          label="Clients"
          value={stats.total_customers}
          color="red"
          icon={<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>}
        />
        <StatCard
          label="Produits actifs"
          value={stats.active_products}
          color="blue"
          icon={<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 7H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z"/></svg>}
        />
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, marginBottom: 28 }}>
        {[
          { href: '/admin/produits/nouveau', label: '+ Nouveau produit', color: '#7A1620' },
          { href: '/admin/commandes', label: 'Voir les commandes', color: '#1A2A6C' },
          { href: '/admin/categories', label: 'Gérer catégories', color: '#1A2A6C' },
          { href: '/admin/parametres', label: 'Paramètres', color: '#2A2A2E' },
        ].map(a => (
          <Link key={a.href} href={a.href} style={{
            display: 'block',
            background: a.color,
            borderRadius: 4,
            padding: '16px 20px',
            fontFamily: 'var(--font-display)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            color: '#fff',
            textDecoration: 'none',
            transition: 'opacity .2s',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {a.label}
          </Link>
        ))}
      </div>

      {/* Info */}
      <div style={{ background: '#17171B', border: '1px solid rgba(26,42,108,0.3)', borderRadius: 4, padding: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#1A2A6C', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-display)' }}>Étape 2 en cours</p>
        <p style={{ fontSize: 13, color: '#94938E', lineHeight: 1.7 }}>
          Dashboard Admin complet — gestion des produits, commandes, clients, catégories et paramètres du site.
        </p>
      </div>
    </AdminShell>
  )
}
