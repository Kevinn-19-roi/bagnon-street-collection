import AdminShell from '@/components/admin/layout/AdminShell'
import PageHeader from '@/components/admin/ui/PageHeader'
import AdminOrdersClient from '@/components/admin/orders/AdminOrdersClient'
import { getOrders } from '@/lib/database/orders'

export const metadata = { title: 'Commandes - Admin BSC' }
export const dynamic = 'force-dynamic'

export default async function CommandesPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const params = await searchParams
  const successMessage = params.success === 'deleted'
    ? 'Commande supprimée définitivement.'
    : null
  const errorMessage = params.error === 'order-not-found'
    ? 'Commande introuvable.'
    : null

  const { data: orders, total } = await getOrders({ page: 1, per_page: 500 })

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Ventes"
        title="Commandes"
        subtitle={`${total} commande${total > 1 ? 's' : ''} au total`}
      />

      {successMessage && (
        <p style={{ background: 'rgba(76,175,80,.12)', border: '1px solid rgba(76,175,80,.28)', color: '#4CAF50', borderRadius: 6, padding: 12, fontFamily: 'var(--font-display)', fontSize: 12, marginBottom: 16 }}>
          {successMessage}
        </p>
      )}
      {errorMessage && (
        <p role="alert" style={{ background: 'rgba(122,22,32,.14)', border: '1px solid rgba(122,22,32,.34)', color: '#F2B8BE', borderRadius: 6, padding: 12, fontFamily: 'var(--font-display)', fontSize: 12, marginBottom: 16 }}>
          {errorMessage}
        </p>
      )}

      <AdminOrdersClient orders={orders} total={total} />
    </AdminShell>
  )
}
