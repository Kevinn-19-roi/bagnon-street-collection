'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Badge from '@/components/admin/ui/Badge'
import ResponsiveTable from '@/components/admin/ui/ResponsiveTable'
import ConfirmSubmitForm from '@/components/admin/forms/ConfirmSubmitForm'
import { cancelOrder, confirmManualWavePayment, deleteOrder, markOrderAsDelivered, markOrderAsShipped } from '@/lib/actions/orders'
import { formatDate, formatPrice } from '@/lib/helpers/slugify'
import { buildAdminCustomerWhatsappMessage, buildWhatsappUrl, orderTrackingLabel, paymentLabel } from '@/lib/whatsapp'
import type { Order, OrderStatus, PaymentStatus } from '@/types/database'

type FilterValue = 'all' | 'received' | OrderStatus

const filters: Array<{ label: string; value: FilterValue }> = [
  { label: 'Toutes', value: 'all' },
  { label: 'Commande reçue', value: 'received' },
  { label: 'Confirmée', value: 'confirmed' },
  { label: 'Expédiée', value: 'shipped' },
  { label: 'Livrée', value: 'delivered' },
  { label: 'Annulée', value: 'cancelled' },
]

const orderStatusVariants: Record<string, any> = {
  pending: 'warning',
  confirmed: 'info',
  preparing: 'info',
  shipped: 'success',
  delivered: 'success',
  cancelled: 'error',
}

const paymentStatusVariants: Record<PaymentStatus, any> = {
  unpaid: 'error',
  paid: 'success',
  failed: 'error',
  refunded: 'warning',
}

const deleteConfirmation = `Êtes-vous sûr de vouloir supprimer définitivement cette commande ?

Cette action est irréversible.`

function orderStatusLabel(status: OrderStatus) {
  if (status === 'pending') return 'Commande reçue'
  if (status === 'confirmed') return 'Confirmée'
  if (status === 'preparing') return 'En préparation'
  if (status === 'shipped') return 'Expédiée'
  if (status === 'delivered') return 'Livrée'
  if (status === 'cancelled') return 'Annulée'
  return orderTrackingLabel(status)
}

function matchesFilter(order: Order, filter: FilterValue) {
  if (filter === 'all') return true
  if (filter === 'received') return order.order_status === 'pending' || order.order_status === 'confirmed'
  return order.order_status === filter
}

export default function AdminOrdersClient({
  orders,
  total,
}: {
  orders: Order[]
  total: number
}) {
  const [filter, setFilter] = useState<FilterValue>('all')

  const filteredOrders = useMemo(
    () => orders.filter(order => matchesFilter(order, filter)),
    [orders, filter]
  )

  const visibleTotal = filter === 'all' ? total : filteredOrders.length

  return (
    <>
      <style>{`
        .admin-order-filters {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          overflow-x: auto;
          padding-bottom: 4px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .admin-order-filters::-webkit-scrollbar { display: none; }
        .admin-order-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }
        @media(max-width: 760px) {
          .admin-order-actions { min-width: 260px; }
        }
      `}</style>

      <div className="admin-order-filters" aria-label="Filtres commandes">
        {filters.map(item => {
          const active = filter === item.value
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              aria-pressed={active}
              style={{
                flex: '0 0 auto',
                fontFamily: 'var(--font-display)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                background: active ? '#7A1620' : '#17171B',
                color: active ? '#fff' : '#94938E',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 3,
                padding: '7px 12px',
                cursor: 'pointer',
                transition: 'all .2s',
                whiteSpace: 'nowrap',
              }}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: '#94938E', marginBottom: 12 }}>
        {visibleTotal} commande{visibleTotal > 1 ? 's' : ''} affichée{visibleTotal > 1 ? 's' : ''}
      </p>

      <ResponsiveTable minWidth={1180}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Référence', 'Client', 'Montant', 'Commande', 'Paiement', 'Date', 'WhatsApp', 'Actions'].map(h => (
                <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#4D4D52' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#4D4D52', fontFamily: 'var(--font-display)', fontSize: 13 }}>
                  Aucune commande
                </td>
              </tr>
            ) : filteredOrders.map((order, i) => {
              const canConfirmWavePayment = order.payment_method === 'wave' && order.payment_status !== 'paid'
              const canShip = order.payment_status === 'paid' && ['pending', 'confirmed'].includes(order.order_status)
              const canDeliver = order.order_status === 'shipped'
              const canCancel = order.order_status !== 'cancelled' && order.order_status !== 'delivered'
              const whatsappUrl = buildWhatsappUrl(order.customer?.phone, buildAdminCustomerWhatsappMessage(order))

              return (
                <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: '#F2F1ED', letterSpacing: '.05em' }}>
                      {order.order_number}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', minWidth: 170 }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#F2F1ED' }}>{order.customer?.fullname}</p>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#4D4D52', marginTop: 2 }}>{order.customer?.phone}</p>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#F2F1ED' }}>{formatPrice(order.total)}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge label={orderStatusLabel(order.order_status)} variant={orderStatusVariants[order.order_status] || 'default'} />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge label={paymentLabel(order.payment_status)} variant={paymentStatusVariants[order.payment_status] || 'default'} />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: '#4D4D52' }}>{formatDate(order.created_at)}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {whatsappUrl ? (
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#5BE28A', textDecoration: 'none' }}>
                        WhatsApp
                      </a>
                    ) : (
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#4D4D52' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', minWidth: 300 }}>
                    <div className="admin-order-actions">
                      {canConfirmWavePayment && (
                        <ConfirmSubmitForm action={confirmManualWavePayment.bind(null, order.id)} message="Confirmer ce paiement Wave après vérification dans le dashboard Wave ?">
                          <button type="submit" style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', background: '#4CAF50', color: '#08110A', border: 'none', borderRadius: 3, padding: '6px 10px', cursor: 'pointer' }}>
                            Confirmer Wave
                          </button>
                        </ConfirmSubmitForm>
                      )}
                      {canShip && (
                        <ConfirmSubmitForm action={markOrderAsShipped.bind(null, order.id)} message="Marquer cette commande comme expédiée ?">
                          <button type="submit" style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', background: '#1A2A6C', color: '#fff', border: 'none', borderRadius: 3, padding: '6px 10px', cursor: 'pointer' }}>
                            Expédier
                          </button>
                        </ConfirmSubmitForm>
                      )}
                      {canDeliver && (
                        <ConfirmSubmitForm action={markOrderAsDelivered.bind(null, order.id)} message="Marquer cette commande comme livrée ?">
                          <button type="submit" style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', background: '#4CAF50', color: '#08110A', border: 'none', borderRadius: 3, padding: '6px 10px', cursor: 'pointer' }}>
                            Livrer
                          </button>
                        </ConfirmSubmitForm>
                      )}
                      <Link href={`/admin/commandes/${order.id}`} style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', background: 'rgba(26,42,108,0.2)', color: '#5C7CFA', border: '1px solid rgba(26,42,108,0.4)', borderRadius: 3, padding: '5px 10px', textDecoration: 'none' }}>
                        Détails
                      </Link>
                      {canCancel && (
                        <ConfirmSubmitForm action={cancelOrder.bind(null, order.id)} message="Annuler cette commande ? Si le stock a déjà été décrémenté, il sera restauré une seule fois.">
                          <button type="submit" style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', background: 'rgba(245,158,11,.14)', color: '#F6C177', border: '1px solid rgba(245,158,11,.35)', borderRadius: 3, padding: '6px 10px', cursor: 'pointer' }}>
                            Annuler
                          </button>
                        </ConfirmSubmitForm>
                      )}
                      <ConfirmSubmitForm action={deleteOrder.bind(null, order.id)} message={deleteConfirmation}>
                        <button type="submit" style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', background: 'rgba(122,22,32,.18)', color: '#F2B8BE', border: '1px solid rgba(122,22,32,.45)', borderRadius: 3, padding: '6px 10px', cursor: 'pointer' }}>
                          Supprimer
                        </button>
                      </ConfirmSubmitForm>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </ResponsiveTable>
    </>
  )
}
