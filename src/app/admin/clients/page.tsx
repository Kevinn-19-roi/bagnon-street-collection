import AdminShell from '@/components/admin/layout/AdminShell'
import PageHeader from '@/components/admin/ui/PageHeader'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatDate } from '@/lib/helpers/slugify'

export const metadata = { title: 'Clients — Admin BSC' }
export const dynamic = 'force-dynamic'

async function getClients(search?: string, page = 1) {
  const adminClient = createAdminClient()
  const per_page = 25
  let query = adminClient
    .from('customers')
    .select('*, orders:orders(id, total, order_status)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * per_page, page * per_page - 1)

  if (search) query = query.ilike('fullname', `%${search}%`)

  const { data, count } = await query
  return { data: data || [], total: count || 0, total_pages: Math.ceil((count || 0) / per_page) }
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page || 1)
  const search = params.search

  const { data: clients, total, total_pages } = await getClients(search, page)

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Clients"
        title="Clients"
        subtitle={`${total} client${total > 1 ? 's' : ''} enregistré${total > 1 ? 's' : ''}`}
      />

      {/* Search */}
      <form style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, maxWidth: 500 }}>
          <input
            name="search"
            defaultValue={search}
            placeholder="Rechercher un client..."
            style={{
              flex: 1, background: '#17171B',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 3, padding: '10px 14px',
              color: '#F2F1ED', fontSize: 13, outline: 'none',
              fontFamily: 'var(--font-display)',
            }}
          />
          <button type="submit" style={{
            background: '#1A2A6C', color: '#fff', border: 'none',
            borderRadius: 3, padding: '10px 18px',
            fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>
            Chercher
          </button>
        </div>
      </form>

      <div style={{ background: '#17171B', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Nom', 'Téléphone', 'Email', 'Ville', 'Commandes', 'Inscrit le'].map(h => (
                <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#4D4D52' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#4D4D52', fontFamily: 'var(--font-display)', fontSize: 13 }}>
                  Aucun client
                </td>
              </tr>
            ) : clients.map((client: any, i: number) => (
              <tr key={client.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                <td style={{ padding: '12px 16px' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#F2F1ED' }}>{client.fullname}</p>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: '#94938E' }}>{client.phone}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: '#94938E' }}>{client.email || '—'}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: '#94938E' }}>{client.city || '—'}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
                    color: client.orders?.length > 0 ? '#F2F1ED' : '#4D4D52',
                    background: client.orders?.length > 0 ? 'rgba(26,42,108,0.2)' : 'transparent',
                    padding: client.orders?.length > 0 ? '2px 8px' : '0',
                    borderRadius: 3,
                  }}>
                    {client.orders?.length || 0}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: '#4D4D52' }}>{formatDate(client.created_at)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total_pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          {Array.from({ length: total_pages }, (_, i) => i + 1).map(p => (
            <a key={p} href={`?page=${p}${search ? `&search=${search}` : ''}`} style={{
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: p === page ? '#7A1620' : '#17171B',
              border: '1px solid rgba(255,255,255,0.07)', borderRadius: 3,
              fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
              color: p === page ? '#fff' : '#94938E', textDecoration: 'none',
            }}>
              {p}
            </a>
          ))}
        </div>
      )}
    </AdminShell>
  )
}
