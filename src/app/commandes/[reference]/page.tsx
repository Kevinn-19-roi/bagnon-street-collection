import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCustomerOrderByNumberAndEmail } from '@/lib/database/orders'
import { formatDate, formatPrice } from '@/lib/helpers/slugify'
import { ORDER_TRACKING_STEPS, orderTrackingLabel, paymentLabel, TRACKING_DONE_MARK } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Detail commande - Bagnon Street Collection',
  robots: { index: false, follow: false },
}

type CustomerOrderDetailProps = {
  params: Promise<{ reference: string }>
}

function trackingStepIndex(status: string) {
  if (status === 'delivered') return 2
  if (status === 'shipped') return 1
  return 0
}

export default async function CustomerOrderDetailPage({ params }: CustomerOrderDetailProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) redirect('/connexion?redirect=/commandes')

  const { reference } = await params
  const order = await getCustomerOrderByNumberAndEmail(reference, user.email)
  if (!order) notFound()

  const stepIndex = trackingStepIndex(order.order_status)

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <header style={{ padding: '18px var(--px)', borderBottom: '1px solid var(--border)', background: 'var(--nav-bg)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
          <Link href="/commandes" style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>
            Retour aux commandes
          </Link>
          <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--red)' }}>
            Boutique
          </Link>
        </div>
      </header>

      <style>{`
        @media(max-width:760px){
          .client-order-detail-grid{grid-template-columns:1fr!important;}
          .client-tracking-line{display:none!important;}
          .client-tracking-steps{grid-template-columns:1fr!important;}
        }
      `}</style>

      <section style={{ padding: 'clamp(30px,6vw,70px) var(--px)' }}>
        <div className="client-order-detail-grid" style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,360px)', gap: 'clamp(22px,4vw,42px)', alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 18 }}>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 10 }}>Commande</p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px,6vw,58px)', lineHeight: 1, letterSpacing: '-.03em', marginBottom: 12 }}>{order.order_number}</h1>
              <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.8 }}>{formatDate(order.created_at)}</p>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: 16 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 16 }}>Suivi de commande</p>
              <div style={{ position: 'relative' }}>
                <div className="client-tracking-line" style={{ position: 'absolute', top: 18, left: '16%', right: '16%', height: 1, background: 'var(--border)' }} />
                <div className="client-tracking-steps" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, position: 'relative' }}>
                  {ORDER_TRACKING_STEPS.map((label, index) => {
                    const done = index < stepIndex
                    const active = index === stepIndex
                    return (
                      <div key={label} style={{ display: 'grid', justifyItems: 'center', gap: 8, textAlign: 'center', color: done || active ? 'var(--text)' : 'var(--text3)' }}>
                        <span style={{ width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center', background: done ? '#4CAF50' : active ? 'var(--red)' : 'var(--bg3)', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800 }}>
                          {done ? TRACKING_DONE_MARK : index + 1}
                        </span>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>{label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: 16 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 14 }}>Produits</p>
              <div style={{ display: 'grid', gap: 12 }}>
                {order.items?.map((item: any) => (
                  <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '58px 1fr', gap: 10, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ position: 'relative', width: 58, height: 72, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
                      {item.product?.images?.[0]?.image_url && <Image src={item.product.images[0].image_url} alt={item.product.name || ''} fill sizes="58px" style={{ objectFit: 'cover' }} />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700 }}>{item.product?.name}</p>
                      {[item.selected_size ? `Taille ${item.selected_size}` : null, item.selected_color].filter(Boolean).length > 0 && (
                        <p style={{ color: 'var(--text3)', fontSize: 11, marginTop: 3 }}>{[item.selected_size ? `Taille ${item.selected_size}` : null, item.selected_color].filter(Boolean).join(' · ')}</p>
                      )}
                      <p style={{ color: 'var(--text2)', fontSize: 12, marginTop: 5 }}>{item.quantity} x {formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: 16 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 14 }}>Livraison</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
                {[
                  ['Nom', order.customer?.fullname],
                  ['Telephone', order.customer?.phone],
                  ['Ville', order.customer?.city],
                  ['Adresse', order.customer?.address],
                ].map(([label, value]) => (
                  <div key={label || ''}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: 'var(--text3)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</p>
                    <p style={{ fontSize: 13 }}>{value || 'Non renseigne'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: 18, position: 'sticky', top: 82 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 16 }}>Resume</p>
            <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: 'var(--text2)', fontSize: 13 }}><span>Sous-total</span><span>{formatPrice(order.subtotal)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: 'var(--text2)', fontSize: 13 }}><span>Livraison</span><span>{order.shipping_cost === 0 ? 'Offerte' : formatPrice(order.shipping_cost)}</span></div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', gap: 12 }}><span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Total</span><strong style={{ fontFamily: 'var(--font-display)', fontSize: 17 }}>{formatPrice(order.total)}</strong></div>
            </div>
            <div style={{ display: 'grid', gap: 9, color: 'var(--text2)', fontSize: 13 }}>
              <p>Commande : {orderTrackingLabel(order.order_status)}</p>
              <p>Paiement : {paymentLabel(order.payment_status)}</p>
              <p>Methode : {order.payment_method?.replace('_', ' ')}</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
