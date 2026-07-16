import AdminShell from '@/components/admin/layout/AdminShell'
import PageHeader from '@/components/admin/ui/PageHeader'
import ConfirmSubmitForm from '@/components/admin/forms/ConfirmSubmitForm'
import { getOrderById } from '@/lib/database/orders'
import { cancelOrder, confirmManualWavePayment, deleteOrder, markOrderAsDelivered, markOrderAsShipped } from '@/lib/actions/orders'
import { formatPrice, formatDate } from '@/lib/helpers/slugify'
import { buildAdminCustomerWhatsappMessage, buildWhatsappUrl, ORDER_TRACKING_STEPS, orderTrackingLabel, paymentLabel, TRACKING_DONE_MARK } from '@/lib/whatsapp'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export const revalidate = 0

type Query = {
  success?: string
  error?: string
}

const successMessages: Record<string, string> = {
  'payment-confirmed': 'Paiement Wave confirm\u00e9. Le stock a \u00e9t\u00e9 d\u00e9cr\u00e9ment\u00e9 une seule fois.',
  shipped: 'Commande marqu\u00e9e comme exp\u00e9di\u00e9e.',
  delivered: 'Commande marqu\u00e9e comme livr\u00e9e.',
  'status-updated': 'Statut mis \u00e0 jour.',
  cancelled: 'Commande annulee. Le stock a ete restaure si cette commande l avait deja decremente.',
}

const errorMessages: Record<string, string> = {
  'wave-rpc-missing': "La fonction de confirmation Wave n'est pas encore install\u00e9e dans Supabase. Veuillez appliquer la migration 006_payment_tracking_rpc.sql.",
  'wave-confirm-failed': 'La confirmation Wave a \u00e9chou\u00e9. V\u00e9rifie la migration 006, le stock et la r\u00e9f\u00e9rence de transaction.',
  'payment-required': "Cette commande n'est pas encore pay\u00e9e. Confirme d'abord le paiement Wave avant exp\u00e9dition.",
  'invalid-transition': `Transition impossible. Le suivi doit passer par ${ORDER_TRACKING_STEPS.join(', puis ')}.`,
  'order-not-found': 'Commande introuvable.',
  'status-update-failed': 'Impossible de mettre \u00e0 jour le statut de commande.',
  'cancel-rpc-missing': "La fonction d'annulation securisee n'est pas encore installee dans Supabase. Veuillez appliquer la migration 007_order_cancel_restore.sql.",
  'cancel-failed': "Impossible d'annuler cette commande. Verifie le statut et la migration 007.",
  'delivered-cancel-refused': 'Une commande livree ne peut pas etre annulee automatiquement.',
  'delete-rpc-missing': "La fonction de suppression definitive n'est pas encore installee dans Supabase. Veuillez appliquer la migration 008_delete_order_with_stock_restore.sql.",
  'delete-failed': 'Impossible de supprimer cette commande.',
}

function trackingStepIndex(status: string) {
  if (status === 'delivered') return 2
  if (status === 'shipped') return 1
  return 0
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams?: Promise<Query>
}) {
  const { id } = await params
  const query = searchParams ? await searchParams : {}
  const order = await getOrderById(id)
  if (!order) notFound()

  const stepIndex = trackingStepIndex(order.order_status)
  const canConfirmWavePayment = order.payment_method === 'wave' && order.payment_status !== 'paid'
  const canShip = order.payment_status === 'paid' && ['pending', 'confirmed'].includes(order.order_status)
  const canDeliver = order.order_status === 'shipped'
  const canCancel = order.order_status !== 'cancelled' && order.order_status !== 'delivered'
  const adminWhatsappUrl = buildWhatsappUrl(order.customer?.phone, buildAdminCustomerWhatsappMessage(order))

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
          Retour aux commandes
        </Link>
      </div>

      <PageHeader
        eyebrow="Commande"
        title={order.order_number}
        subtitle={`Cr\u00e9\u00e9e le ${formatDate(order.created_at)}`}
      />

      {query.success && successMessages[query.success] && (
        <p style={{ background: 'rgba(76,175,80,.12)', border: '1px solid rgba(76,175,80,.28)', color: '#4CAF50', borderRadius: 6, padding: 12, fontFamily: 'var(--font-display)', fontSize: 12, marginBottom: 16 }}>
          {successMessages[query.success]}
        </p>
      )}
      {query.error && errorMessages[query.error] && (
        <p role="alert" style={{ background: 'rgba(122,22,32,.14)', border: '1px solid rgba(122,22,32,.34)', color: '#F2B8BE', borderRadius: 6, padding: 12, fontFamily: 'var(--font-display)', fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
          {errorMessages[query.error]}
        </p>
      )}

      <style>{`
        @media(max-width:980px){
          .order-detail-grid,
          .order-customer-grid{grid-template-columns:1fr!important;}
          .order-item-row{align-items:flex-start!important;}
          .order-item-price{text-align:left!important;}
        }
        @media(max-width:640px){
          .tracking-line{display:none!important;}
          .tracking-steps{grid-template-columns:1fr!important;}
        }
        @media(max-width:520px){
          .order-item-row{flex-wrap:wrap!important;}
          .order-item-price{width:100%!important;}
        }
      `}</style>

      <div className="order-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 330px', gap: 16 }}>
        <div>
          <div style={sectionStyle}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#F2F1ED', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              Suivi
            </p>
            <div style={{ position: 'relative' }}>
              <div className="tracking-line" style={{ position: 'absolute', top: 18, left: '16%', right: '16%', height: 1, background: 'rgba(255,255,255,0.09)' }} />
              <div className="tracking-steps" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, position: 'relative' }}>
                {ORDER_TRACKING_STEPS.map((label, index) => {
                  const done = index < stepIndex
                  const active = index === stepIndex
                  return (
                    <div key={label} style={{ display: 'grid', justifyItems: 'center', gap: 8, textAlign: 'center', color: done || active ? '#F2F1ED' : '#4D4D52' }}>
                      <span style={{ width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center', background: done ? '#4CAF50' : active ? '#7A1620' : '#0A0A0C', border: `1px solid ${done || active ? 'transparent' : 'rgba(255,255,255,0.09)'}`, fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800 }}>
                        {done ? TRACKING_DONE_MARK : index + 1}
                      </span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>{label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

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
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#94938E' }}>Qt\u00e9: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="order-item-price" style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#F2F1ED' }}>
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#4D4D52' }}>{formatPrice(item.price)} / unit\u00e9</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={sectionStyle}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#F2F1ED', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              Informations client
            </p>
            <div className="order-customer-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'Nom complet', value: order.customer?.fullname },
                { label: 'T\u00e9l\u00e9phone', value: order.customer?.phone },
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
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#F2F1ED', marginBottom: 14 }}>
              Action suivante
            </p>
            <div style={{ display: 'grid', gap: 10 }}>
              {canConfirmWavePayment && (
                <ConfirmSubmitForm
                  action={confirmManualWavePayment.bind(null, id)}
                  message="Confirmer ce paiement Wave apr\u00e8s v\u00e9rification dans le dashboard Wave ? Cette action d\u00e9cr\u00e9mente le stock."
                  style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                >
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span style={labelStyle}>R\u00e9f\u00e9rence transaction Wave</span>
                    <input name="provider_transaction_id" placeholder="Optionnel mais recommand\u00e9" style={{ width: '100%', background: '#0A0A0C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, padding: '9px 12px', color: '#F2F1ED', fontSize: 13, outline: 'none', fontFamily: 'var(--font-display)' }} />
                  </label>
                  <button type="submit" style={{ background: '#4CAF50', color: '#08110A', border: 'none', borderRadius: 3, padding: '11px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}>
                    Confirmer paiement Wave
                  </button>
                </ConfirmSubmitForm>
              )}
              {canShip && (
                <ConfirmSubmitForm action={markOrderAsShipped.bind(null, id)} message="Marquer cette commande comme exp\u00e9di\u00e9e ?" style={{ display: 'grid' }}>
                  <button type="submit" style={{ background: '#1A2A6C', color: '#fff', border: 'none', borderRadius: 3, padding: '11px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}>
                    Marquer comme exp\u00e9di\u00e9e
                  </button>
                </ConfirmSubmitForm>
              )}
              {canDeliver && (
                <ConfirmSubmitForm action={markOrderAsDelivered.bind(null, id)} message="Marquer cette commande comme livr\u00e9e ?" style={{ display: 'grid' }}>
                  <button type="submit" style={{ background: '#4CAF50', color: '#08110A', border: 'none', borderRadius: 3, padding: '11px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}>
                    Marquer comme livr\u00e9e
                  </button>
                </ConfirmSubmitForm>
              )}
              {!canConfirmWavePayment && !canShip && !canDeliver && (
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: '#94938E', lineHeight: 1.7 }}>
                  Aucune action principale disponible pour le moment.
                </p>
              )}
              {canCancel && (
                <ConfirmSubmitForm action={cancelOrder.bind(null, id)} message="Annuler cette commande ? Si le stock a deja ete decremente, il sera restaure une seule fois." style={{ display: 'grid' }}>
                  <button type="submit" style={{ background: 'rgba(245,158,11,.14)', color: '#F6C177', border: '1px solid rgba(245,158,11,.35)', borderRadius: 3, padding: '11px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}>
                    Annuler la commande
                  </button>
                </ConfirmSubmitForm>
              )}
              <ConfirmSubmitForm action={deleteOrder.bind(null, id)} message={`Êtes-vous sûr de vouloir supprimer définitivement cette commande ?

Cette action est irréversible.`} style={{ display: 'grid' }}>
                <button type="submit" style={{ background: 'rgba(122,22,32,.18)', color: '#F2B8BE', border: '1px solid rgba(122,22,32,.45)', borderRadius: 3, padding: '11px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  Supprimer définitivement
                </button>
              </ConfirmSubmitForm>
              {adminWhatsappUrl && (
                <a href={adminWhatsappUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', justifyContent: 'center', background: 'rgba(37,211,102,.12)', color: '#5BE28A', border: '1px solid rgba(37,211,102,.28)', borderRadius: 3, padding: '10px', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                  WhatsApp client
                </a>
              )}
            </div>
          </div>

          <div style={sectionStyle}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#F2F1ED', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              Resume
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Suivi', value: orderTrackingLabel(order.order_status) },
                { label: 'Paiement', value: paymentLabel(order.payment_status) },
                { label: 'M\u00e9thode', value: order.payment_method?.replace('_', ' ').toUpperCase() },
                { label: 'Transaction', value: order.provider_transaction_id || '-' },
                { label: 'Pay\u00e9e le', value: order.paid_at ? formatDate(order.paid_at) : '-' },
                { label: 'Stock d\u00e9cr\u00e9ment\u00e9', value: order.stock_decremented_at ? formatDate(order.stock_decremented_at) : '-' },
                { label: 'Stock restaure', value: order.stock_restored_at ? formatDate(order.stock_restored_at) : '-' },
                { label: 'Articles', value: `${order.items?.length || 0} article${(order.items?.length || 0) > 1 ? 's' : ''}` },
                { label: 'Cr\u00e9\u00e9e le', value: formatDate(order.created_at) },
                { label: 'Total', value: formatPrice(order.total) },
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
