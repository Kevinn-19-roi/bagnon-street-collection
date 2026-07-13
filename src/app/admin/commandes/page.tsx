import AdminShell from '@/components/admin/layout/AdminShell'
import PageHeader from '@/components/admin/ui/PageHeader'
import Badge from '@/components/admin/ui/Badge'
import ResponsiveTable from '@/components/admin/ui/ResponsiveTable'
import { getOrders } from '@/lib/database/orders'
import { formatPrice, formatDate } from '@/lib/helpers/slugify'
import Link from 'next/link'
import { OrderStatus, PaymentStatus } from '@/types/database'

export const metadata = { title: 'Commandes — Admin BSC' }
export const dynamic = 'force-dynamic'

const orderStatusLabels: Record<OrderStatus, { label: string; variant: any }> = {
  pending:    { label: 'En attente',  variant: 'warning' },
  confirmed:  { label: 'Confirmée',   variant: 'info' },
  preparing:  { label: 'Préparation', variant: 'info' },
  shipped:    { label: 'Expédiée',    variant: 'success' },
  delivered:  { label: 'Livrée',      variant: 'success' },
  cancelled:  { label: 'Annulée',     variant: 'error' },
}

const paymentStatusLabels: Record<PaymentStatus, { label: string; variant: any }> = {
  unpaid:   { label: 'Non payé',  variant: 'error' },
  paid:     { label: 'Payé',      variant: 'success' },
  failed:   { label: 'Échoué',    variant: 'error' },
  refunded: { label: 'Remboursé', variant: 'warning' },
}

export default async function CommandesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page || 1)
  const status = params.status as OrderStatus | undefined
  const search = params.search

  const { data: orders, total, total_pages } = await getOrders({
    status,
    search,
    page,
    per_page: 20,
  })

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Ventes"
        title="Commandes"
        subtitle={`${total} commande${total > 1 ? 's' : ''} au total`}
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Toutes', value: '' },
          { label: 'En attente', value: 'pending' },
          { label: 'Confirmées', value: 'confirmed' },
          { label: 'Préparation', value: 'preparing' },
          { label: 'Expédiées', value: 'shipped' },
          { label: 'Livrées', value: 'delivered' },
          { label: 'Annulées', value: 'cancelled' },
        ].map(f => (
          <Link key={f.value} href={`?status=${f.value}`} style={{
            fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600,
            letterSpacing: '.06em', textTransform: 'uppercase',
            background: status === f.value || (!status && !f.value) ? '#7A1620' : '#17171B',
            color: status === f.value || (!status && !f.value) ? '#fff' : '#94938E',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 3, padding: '7px 12px', textDecoration: 'none',
            transition: 'all .2s',
          }}>
            {f.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <ResponsiveTable minWidth={900}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['N° Commande', 'Client', 'Total', 'Statut', 'Paiement', 'Date', 'Actions'].map(h => (
                <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#4D4D52' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#4D4D52', fontFamily: 'var(--font-display)', fontSize: 13 }}>
                  Aucune commande
                </td>
              </tr>
            ) : orders.map((order, i) => (
              <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: '#F2F1ED', letterSpacing: '.05em' }}>
                    {order.order_number}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#F2F1ED' }}>{order.customer?.fullname}</p>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#4D4D52', marginTop: 2 }}>{order.customer?.phone}</p>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#F2F1ED' }}>{formatPrice(order.total)}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <Badge
                    label={orderStatusLabels[order.order_status]?.label || order.order_status}
                    variant={orderStatusLabels[order.order_status]?.variant || 'default'}
                  />
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <Badge
                    label={paymentStatusLabels[order.payment_status]?.label || order.payment_status}
                    variant={paymentStatusLabels[order.payment_status]?.variant || 'default'}
                  />
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: '#4D4D52' }}>{formatDate(order.created_at)}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <Link href={`/admin/commandes/${order.id}`} style={{
                    fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700,
                    letterSpacing: '.08em', textTransform: 'uppercase',
                    background: 'rgba(26,42,108,0.2)', color: '#5C7CFA',
                    border: '1px solid rgba(26,42,108,0.4)', borderRadius: 3,
                    padding: '5px 10px', textDecoration: 'none',
                  }}>
                    Détails
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ResponsiveTable>

      {/* Pagination */}
      {total_pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          {Array.from({ length: total_pages }, (_, i) => i + 1).map(p => (
            <Link key={p} href={`?page=${p}${status ? `&status=${status}` : ''}`} style={{
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: p === page ? '#7A1620' : '#17171B',
              border: '1px solid rgba(255,255,255,0.07)', borderRadius: 3,
              fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
              color: p === page ? '#fff' : '#94938E', textDecoration: 'none',
            }}>
              {p}
            </Link>
          ))}
        </div>
      )}
    </AdminShell>
  )
}
