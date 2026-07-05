import AdminShell from '@/components/admin/layout/AdminShell'
import PageHeader from '@/components/admin/ui/PageHeader'
import Badge from '@/components/admin/ui/Badge'
import { getOrderById } from '@/lib/database/orders'
import { updateOrderStatus } from '@/lib/actions/orders'
import { formatPrice, formatDate } from '@/lib/helpers/slugify'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { OrderStatus, PaymentStatus } from '@/types/database'

export const revalidate = 0

const orderStatuses: { value: OrderStatus; label: string }[] = [
  { value: 'pending',   label: 'En attente' },
  { value: 'confirmed', label: 'Confirmée' },
  { value: 'preparing', label: 'Préparation' },
  { value: 'shipped',   label: 'Expédiée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' },
]

const paymentStatuses: { value: PaymentStatus; label: string }[] = [
  { value: 'unpaid',   label: 'Non payé' },
  { value: 'paid',     label: 'Payé' },
  { value: 'failed',   label: 'Échoué' },
  { value: 'refunded', label: 'Remboursé' },
]

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrderById(id)
  if (!order) notFound()

  const sectionStyle = {
    background: '#17171B', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 6, padding: 20, marginBottom: 16,
  }

  const labelStyle = {
    fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700,
    letterSpacing: '.15em', textTransform: 'uppercase' as const, color: '#4D4D52', marginBottom: 4,
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
        subtitle={`Créée le ${formatDate(order.created_at)}`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        {/* LEFT */}
        <div>
          {/* Items */}
          <div style={sectionStyle}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#F2F1ED', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              Articles commandés
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {order.items?.map((item: any) => (
                <div key={item.id} style={{ display: 'flex', gap: 12, padding: '12px', background: '#0A0A0C', borderRadius: 4, border: '1px solid rgba(255,255,255,0.04)' }}>
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
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#94938E' }}>Qté: {item.quantity}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#F2F1ED' }}>
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#4D4D52' }}>{formatPrice(item.price)} / unité</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
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

          {/* Customer */}
          <div style={sectionStyle}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#F2F1ED', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              Informations client
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'Nom complet', value: order.customer?.fullname },
                { label: 'Téléphone', value: order.customer?.phone },
                { label: 'Email', value: order.customer?.email || '—' },
                { label: 'Ville', value: order.customer?.city || '—' },
                { label: 'Adresse', value: order.customer?.address || '—' },
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

        {/* RIGHT */}
        <div>
          {/* Status update */}
          <div style={sectionStyle}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#F2F1ED', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              Statuts
            </p>

            <form action={async (formData: FormData) => {
              'use server'
              const orderStatus = formData.get('order_status') as OrderStatus
              const paymentStatus = formData.get('payment_status') as PaymentStatus
              await updateOrderStatus(id, orderStatus, paymentStatus)
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
                  {paymentStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <button type="submit" style={{ background: '#7A1620', color: '#fff', border: 'none', borderRadius: 3, padding: '11px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}>
                Mettre à jour
              </button>
            </form>
          </div>

          {/* Order info */}
          <div style={sectionStyle}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#F2F1ED', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              Résumé
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Méthode paiement', value: order.payment_method?.replace('_', ' ').toUpperCase() },
                { label: 'Articles', value: `${order.items?.length || 0} article${(order.items?.length || 0) > 1 ? 's' : ''}` },
                { label: 'Créée le', value: formatDate(order.created_at) },
              ].map(f => (
                <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: '#4D4D52', textTransform: 'uppercase', letterSpacing: '.1em' }}>{f.label}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: '#F2F1ED', fontWeight: 600 }}>{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
