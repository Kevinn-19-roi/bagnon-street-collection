import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getOrderByNumber } from '@/lib/database/orders'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatPrice, formatDate } from '@/lib/helpers/slugify'
import { getWaveManualPaymentUrl } from '@/lib/payments/wave'
import { buildClientOrderWhatsappMessage, buildWhatsappUrl, orderTrackingLabel, paymentLabel } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Commande confirmee - Bagnon Street Collection',
}

type ConfirmationPageProps = {
  params: Promise<{ reference: string }>
}

function trackingStepIndex(status: string) {
  if (status === 'delivered') return 2
  if (status === 'shipped') return 1
  return 0
}

async function getSiteWhatsapp() {
  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('site_settings')
    .select('whatsapp')
    .limit(1)
    .maybeSingle()

  return data?.whatsapp || null
}

export default async function OrderConfirmationPage({ params }: ConfirmationPageProps) {
  const { reference } = await params
  const [order, siteWhatsapp] = await Promise.all([
    getOrderByNumber(reference),
    getSiteWhatsapp(),
  ])

  if (!order) notFound()

  const stepIndex = trackingStepIndex(order.order_status)
  const showWaveManualPayment = order.payment_method === 'wave' && order.payment_status !== 'paid'
  const clientWhatsappUrl = buildWhatsappUrl(siteWhatsapp, buildClientOrderWhatsappMessage(order))

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <header style={{ padding: '18px var(--px)', borderBottom: '1px solid var(--border)', background: 'var(--nav-bg)', backdropFilter: 'blur(18px)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>
            ← Retour a la boutique
          </Link>
          <Link href="/profil" style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--red)' }}>
            Mon compte
          </Link>
        </div>
      </header>

      <style>{`
        @media(max-width:760px){
          .client-order-grid{grid-template-columns:1fr!important;}
          .client-tracking-line{display:none!important;}
          .client-tracking-steps{grid-template-columns:1fr!important;}
        }
      `}</style>

      <section style={{ padding: 'clamp(30px,6vw,70px) var(--px)' }}>
        <div className="client-order-grid" style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,360px)', gap: 'clamp(22px,4vw,42px)', alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 18 }}>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.28em', textTransform: 'uppercase', color: '#4CAF50', marginBottom: 10 }}>Commande creee</p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px,6vw,58px)', lineHeight: 1, letterSpacing: '-.03em', marginBottom: 12 }}>Merci pour ta commande</h1>
              <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.8 }}>Reference : <strong style={{ color: 'var(--text)' }}>{order.order_number}</strong></p>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: 16 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 16 }}>Suivi de commande</p>
              <div style={{ position: 'relative' }}>
                <div className="client-tracking-line" style={{ position: 'absolute', top: 18, left: '16%', right: '16%', height: 1, background: 'var(--border)' }} />
                <div className="client-tracking-steps" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, position: 'relative' }}>
                  {['Commande recue', 'Expediee', 'Livree'].map((label, index) => {
                    const done = index < stepIndex
                    const active = index === stepIndex
                    return (
                      <div key={label} style={{ display: 'grid', justifyItems: 'center', gap: 8, textAlign: 'center', color: done || active ? 'var(--text)' : 'var(--text3)' }}>
                        <span style={{ width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center', background: done ? '#4CAF50' : active ? 'var(--red)' : 'var(--bg3)', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800 }}>
                          {done ? '✓' : index + 1}
                        </span>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>{label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: 16 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 14 }}>Articles</p>
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
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 14 }}>Informations client</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
                {[
                  ['Nom', order.customer?.fullname],
                  ['Telephone', order.customer?.phone],
                  ['Email', order.customer?.email || 'Non renseigne'],
                  ['Ville', order.customer?.city],
                  ['Adresse', order.customer?.address],
                ].map(([label, value]) => (
                  <div key={label || ''}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: 'var(--text3)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</p>
                    <p style={{ fontSize: 13, color: 'var(--text)' }}>{value || 'Non renseigne'}</p>
                  </div>
                ))}
              </div>
              {order.notes && <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.7, marginTop: 14, whiteSpace: 'pre-wrap' }}>{order.notes}</p>}
            </div>
          </div>

          <aside style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: 18, position: 'sticky', top: 82 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 16 }}>Resume</p>
            <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: 'var(--text2)', fontSize: 13 }}><span>Sous-total</span><span>{formatPrice(order.subtotal)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: 'var(--text2)', fontSize: 13 }}><span>Livraison</span><span>{order.shipping_cost === 0 ? 'Offerte' : formatPrice(order.shipping_cost)}</span></div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', gap: 12 }}><span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Total</span><strong style={{ fontFamily: 'var(--font-display)', fontSize: 17 }}>{formatPrice(order.total)}</strong></div>
            </div>
            <div style={{ display: 'grid', gap: 9, color: 'var(--text2)', fontSize: 13, marginBottom: 16 }}>
              <p>Suivi : {orderTrackingLabel(order.order_status)}</p>
              <p>Paiement : {paymentLabel(order.payment_status)}</p>
              <p>Date : {formatDate(order.created_at)}</p>
            </div>
            {clientWhatsappUrl && (
              <a href={clientWhatsappUrl} target="_blank" rel="noopener noreferrer" style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#25D366', color: '#041018', borderRadius: 3, padding: '13px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                Informer Bagnon Street sur WhatsApp
              </a>
            )}
            {showWaveManualPayment && (
              <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
                <a href={getWaveManualPaymentUrl()} target="_blank" rel="noopener noreferrer" style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#1EC6FF', color: '#041018', borderRadius: 3, padding: '13px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                  Payer avec Wave
                </a>
                <p style={{ color: 'var(--text3)', fontSize: 12, lineHeight: 1.7 }}>
                  Note ta reference {order.order_number}. Le paiement sera verifie manuellement dans Wave Business avant confirmation de la commande.
                </p>
              </div>
            )}
            <p style={{ color: 'var(--text3)', fontSize: 12, lineHeight: 1.7 }}>La commande reste en attente tant que le paiement n est pas verifie par l equipe Bagnon Street Collection.</p>
          </aside>
        </div>
      </section>
    </main>
  )
}
