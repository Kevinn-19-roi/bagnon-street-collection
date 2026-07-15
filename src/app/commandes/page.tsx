import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCustomerOrdersByEmail } from '@/lib/database/orders'
import { formatDate, formatPrice } from '@/lib/helpers/slugify'
import { orderTrackingLabel, paymentLabel } from '@/lib/whatsapp'
import type { OrderStatusFilter } from '@/types/database'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Mes commandes - Bagnon Street Collection',
  robots: { index: false, follow: false },
}

type OrdersPageProps = {
  searchParams: Promise<{ page?: string; status?: string }>
}

const filters: Array<{ label: string; value: string }> = [
  { label: 'Toutes', value: '' },
  { label: 'En attente', value: 'received' },
  { label: 'Payees', value: 'paid' },
  { label: 'Expediees', value: 'shipped' },
  { label: 'Livrees', value: 'delivered' },
  { label: 'Annulees', value: 'cancelled' },
]

const orderStatusVariants: Record<string, string> = {
  pending: '#F6C177',
  confirmed: '#8DB5FF',
  shipped: '#5BE28A',
  delivered: '#5BE28A',
  cancelled: '#F2B8BE',
}

export default async function CustomerOrdersPage({ searchParams }: OrdersPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) redirect('/connexion?redirect=/commandes')

  const params = await searchParams
  const page = Math.max(1, Number(params.page || 1) || 1)
  const status = params.status as OrderStatusFilter | 'paid' | undefined
  const orders = await getCustomerOrdersByEmail({ email: user.email, status, page, per_page: 6 })

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <header style={{ padding: '18px var(--px)', borderBottom: '1px solid var(--border)', background: 'var(--nav-bg)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
          <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>
            Retour a la boutique
          </Link>
          <Link href="/profil" style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--red)' }}>
            Mon compte
          </Link>
        </div>
      </header>

      <section style={{ padding: 'clamp(30px,6vw,70px) var(--px)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 10 }}>Compte client</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,7vw,62px)', lineHeight: 1, letterSpacing: '-.03em', marginBottom: 14 }}>Mes commandes</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.8, maxWidth: 620, marginBottom: 22 }}>
            Retrouve tes commandes passees avec ce compte.
          </p>

          <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 20 }}>
            {filters.map(filter => {
              const active = (status || '') === filter.value
              const href = filter.value ? `/commandes?status=${filter.value}` : '/commandes'
              return (
                <Link key={filter.value} href={href} style={{ flexShrink: 0, fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', background: active ? 'var(--btn)' : 'var(--pill)', color: active ? 'var(--btn-t)' : 'var(--text2)', border: '1px solid var(--border)', borderRadius: 3, padding: '8px 12px' }}>
                  {filter.label}
                </Link>
              )
            })}
          </div>

          {orders.data.length === 0 ? (
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: 24 }}>
              <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>Aucune commande trouvee pour ce filtre.</p>
              <Link href="/#collection" style={{ display: 'inline-flex', background: 'var(--btn)', color: 'var(--btn-t)', borderRadius: 3, padding: '12px 16px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Decouvrir la boutique</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {orders.data.map(order => {
                const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
                return (
                  <article key={order.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: 16, display: 'grid', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, letterSpacing: '.04em' }}>{order.order_number}</p>
                        <p style={{ color: 'var(--text3)', fontSize: 12, marginTop: 4 }}>{formatDate(order.created_at)} · {itemCount} article{itemCount > 1 ? 's' : ''}</p>
                      </div>
                      <strong style={{ fontFamily: 'var(--font-display)', fontSize: 15 }}>{formatPrice(order.total)}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ background: orderStatusVariants[order.order_status] || 'var(--bg3)', color: '#081018', borderRadius: 999, padding: '5px 9px', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>{orderTrackingLabel(order.order_status)}</span>
                      <span style={{ background: order.payment_status === 'paid' ? '#5BE28A' : 'var(--bg3)', color: order.payment_status === 'paid' ? '#081018' : 'var(--text2)', borderRadius: 999, padding: '5px 9px', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>{paymentLabel(order.payment_status)}</span>
                      <span style={{ color: 'var(--text3)', fontFamily: 'var(--font-display)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', alignSelf: 'center' }}>{order.payment_method?.replace('_', ' ')}</span>
                    </div>
                    <Link href={`/commandes/${order.order_number}`} style={{ width: 'fit-content', background: 'var(--btn)', color: 'var(--btn-t)', borderRadius: 3, padding: '10px 14px', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                      Voir le detail
                    </Link>
                  </article>
                )
              })}
            </div>
          )}

          {orders.total_pages > 1 && (
            <nav aria-label="Pagination commandes" style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
              {Array.from({ length: orders.total_pages }, (_, index) => index + 1).map(nextPage => (
                <Link key={nextPage} href={`/commandes?page=${nextPage}${status ? `&status=${status}` : ''}`} style={{ width: 34, height: 34, display: 'grid', placeItems: 'center', background: nextPage === page ? 'var(--btn)' : 'var(--bg2)', color: nextPage === page ? 'var(--btn-t)' : 'var(--text2)', border: '1px solid var(--border)', borderRadius: 3, fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800 }}>
                  {nextPage}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </section>
    </main>
  )
}
