import AdminShell from '@/components/admin/layout/AdminShell'
import PageHeader from '@/components/admin/ui/PageHeader'
import ConfirmSubmitForm from '@/components/admin/forms/ConfirmSubmitForm'
import { getOrderById } from '@/lib/database/orders'
import { confirmManualWavePayment, updateOrderStatus } from '@/lib/actions/orders'
import { formatPrice, formatDate } from '@/lib/helpers/slugify'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { OrderStatus, PaymentStatus } from '@/types/database'

export const revalidate = 0

const orderStatuses: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmee' },
  { value: 'preparing', label: 'Preparation' },
  { value: 'shipped', label: 'Expediee' },
  { value: 'delivered', label: 'Livree' },
  { value: 'cancelled', label: 'Annulee' },
]

const paymentStatuses: { value: PaymentStatus; label: string }[] = [
  { value: 'unpaid', label: 'Non paye' },
  { value: 'paid', label: 'Paye' },
  { value: 'failed', label: 'Echoue' },
  { value: 'refunded', label: 'Rembourse' },
]

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ success?: string }>
}) {
  const { id } = await params
  const query = searchParams ? await searchParams : {}
  const order = await getOrderById(id)
  if (!order) notFound()

  const canConfirmWavePayment = order.payment_method === 'wave' && order.payment_status !== 'paid'

  const sectionStyle = {
    background: '#17171B',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 6,
    padding: 20,
    marginBottom: 16,
  }

  const labelStyle = {
    fontFamily: 'var(--font-display)',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '.15em',
    textTransform: 'uppercase' as const,
    color: '#4D4D52',
    marginBottom: 4,
  }

  return (
    <AdminShell>
      <div style={{ marginBottom: 20 }}>
        <Link href="/admin/commandes" style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: '#94938E', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          ← Retour aux commandes
        </Link>
      </div>

      <PageHeader
        eyebrow="Commande"
        title={order.order_number}
        subtitle={`Creee le ${formatDate(order.created_at)}`}
      />

      {query.success === 'payment-confirmed' && (
        <p style={{ background: 'rgba(76,175,80,.12)', border: '1px solid rgba(76,175,80,.28)', color: '#4CAF50', borderRadius: 6, padding: 12, fontFamily: 'var(--font-display)', fontSize: 12, marginBottom: 16 }}>
          Paiement Wave confirme. Le stock a ete decremente une seule fois.
        </p>
      )}

      <style>{`
        @media(max-width:980px){
          .order-detail-grid,
          .order-customer-grid{grid-template-columns:1fr!important;}
          .order-item-row{align-items:flex-start!important;}
          .order-item-price{text-align:left!important;}
        }
        @media(max-width:520px){
          .order-item-row{flex-wrap:wrap!important;}
          .order-item-price{width:100%!important;}
        }
      `}</style>

      <div className="order-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 16 }}>
        <div>
          <div style={sectionStyle}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#F2F1ED', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              Articles commandes
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {order.items?.map((item: any) => (
                <div className="order-item-row" key={item.id} style={{ display: 'flex', gap: 12, padding: '12px', background: '#0A0A0C', borderRadius: 4, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ width: 56, height: 70, background: '#17171B', borderRadius: 3, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                    {item.product?.images?.[0] && (
                      <Image src={item.product.images[0].image_url} alt="" fill style={{ objectFit: 'cover' }} sizes="56px" />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#F2F1ED', marginBottom: 4 }}>{item.product?.name}</p>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {item.selected_size && <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#94938E' }}>Taille: {item.selected_size}</span>}
                      {item.selected_color && <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#94938E' }}>Couleur: {item.selected_color}</span>}
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#94938E' }}>Qte: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="order-item-price" style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#F2F1ED' }}>
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#4D4D52' }}>{formatPrice(item.price)} / unite</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: '#94938E' }}>Sous-total</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: '#F2F1ED' }}>{formatPrice(order.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: '#94938E' }}>Livraison</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: order.shipping_cost === 0 ? '#4CAF50' : '#F2F1ED' }}>
                  {order.shipping_cost === 0 ? 'Gratuit' : formatPrice(order.shipping_cost)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#F2F1ED' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#F2F1ED' }}>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#F2F1ED', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              Informations client
            </p>
            <div className="order-customer-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'Nom complet', value: order.customer?.fullname },
                { label: 'Telephone', value: order.customer?.phone },
                { label: 'Email', value: order.customer?.email || '-' },
                { label: 'Ville', value: order.customer?.city || '-' },
                { label: 'Adresse', value: order.customer?.address || '-' },
                { label: 'Pays', value: order.customer?.country },
              ].map(f => (
                <div key={f.label}>
                  <p style={labelStyle}>{f.label}</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: '#F2F1ED' }}>{f.value}</p>
                </div>
              ))}
            </div>
            {order.notes && (
              <div style={{ marginTop: 16, padding: 12, background: '#0A0A0C', borderRadius: 4 }}>
                <p style={labelStyle}>Notes</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: '#94938E' }}>{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <div style={sectionStyle}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#F2F1ED', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              Statuts
            </p>

            <form action={async (formData: FormData) => {
              'use server'
              const orderStatus = formData.get('order_status') as OrderStatus
              const paymentStatus = formData.get('payment_status') as PaymentStatus
              await updateOrderStatus(id, orderStatus, paymentStatus === 'paid' ? undefined : paymentStatus)
            }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Statut commande</label>
                <select name="order_status" defaultValue={order.order_status} style={{ width: '100%', background: '#0A0A0C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, padding: '9px 12px', color: '#F2F1ED', fontSize: 13, outline: 'none', fontFamily: 'var(--font-display)', appearance: 'none' }}>
                  {orderStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Statut paiement</label>
                <select name="payment_status" defaultValue={order.payment_status} style={{ width: '100%', background: '#0A0A0C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, padding: '9px 12px', color: '#F2F1ED', fontSize: 13, outline: 'none', fontFamily: 'var(--font-display)', appearance: 'none' }}>
                  {paymentStatuses.filter(s => s.value !== 'paid' || order.payment_status === 'paid').map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                {order.payment_status !== 'paid' && (
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#94938E', lineHeight: 1.5, marginTop: 6 }}>
                    Le statut paye est reserve a la confirmation Wave securisee afin de decremeter le stock correctement.
                  </p>
                )}
              </div>
              <button type="submit" style={{ background: '#7A1620', color: '#fff', border: 'none', borderRadius: 3, padding: '11px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}>
                Mettre a jour
              </button>
            </form>
          </div>

          {canConfirmWavePayment && (
            <div style={sectionStyle}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#F2F1ED', marginBottom: 12 }}>
                Confirmation Wave manuelle
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: '#94938E', lineHeight: 1.7, marginBottom: 14 }}>
                Confirme uniquement apres verification du paiement dans le dashboard Wave Business. Cette action marque la commande payee, confirme la commande et decremente le stock dans une transaction atomique.
              </p>
              <ConfirmSubmitForm
                action={confirmManualWavePayment.bind(null, id)}
                message="Confirmer ce paiement Wave apres verification dans le dashboard Wave ? Cette action decremente le stock."
                style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={labelStyle}>Reference transaction Wave</span>
                  <input
                    name="provider_transaction_id"
                    placeholder="Optionnel mais recommande"
                    style={{ width: '100%', background: '#0A0A0C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, padding: '9px 12px', color: '#F2F1ED', fontSize: 13, outline: 'none', fontFamily: 'var(--font-display)' }}
                  />
                </label>
                <button type="submit" style={{ background: '#4CAF50', color: '#08110A', border: 'none', borderRadius: 3, padding: '11px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  Confirmer paiement Wave
                </button>
              </ConfirmSubmitForm>
            </div>
          )}

          <div style={sectionStyle}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#F2F1ED', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              Resume
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Methode paiement', value: order.payment_method?.replace('_', ' ').toUpperCase() },
                { label: 'Transaction', value: order.provider_transaction_id || '-' },
                { label: 'Payee le', value: order.paid_at ? formatDate(order.paid_at) : '-' },
                { label: 'Stock decremente', value: order.stock_decremented_at ? formatDate(order.stock_decremented_at) : '-' },
                { label: 'Articles', value: `${order.items?.length || 0} article${(order.items?.length || 0) > 1 ? 's' : ''}` },
                { label: 'Creee le', value: formatDate(order.created_at) },
              ].map(f => (
                <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: '#4D4D52', textTransform: 'uppercase', letterSpacing: '.1em' }}>{f.label}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: '#F2F1ED', fontWeight: 600, textAlign: 'right' }}>{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
