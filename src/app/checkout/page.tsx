import Link from 'next/link'
import CheckoutClient from '@/components/checkout/CheckoutClient'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Checkout — Bagnon Street Collection',
  description: 'Finalisez votre commande Bagnon Street Collection.',
}

function splitName(fullname?: string | null, fallbackEmail?: string | null) {
  const source = fullname?.trim() || fallbackEmail?.split('@')[0] || ''
  const parts = source.split(' ').filter(Boolean)
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
  }
}

async function getCheckoutContext() {
  const adminClient = createAdminClient()

  const settingsPromise = adminClient
    .from('site_settings')
    .select('shipping_cost, free_shipping_from')
    .limit(1)
    .maybeSingle()

  let currentEmail: string | null = null
  let metadataName: string | null = null

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    currentEmail = user?.email || null
    metadataName = user?.user_metadata?.fullname || user?.user_metadata?.name || null
  } catch {
    currentEmail = null
  }

  const profilePromise = currentEmail
    ? adminClient
      .from('customers')
      .select('fullname, phone, email, address, city')
      .eq('email', currentEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    : Promise.resolve({ data: null })

  const [settingsResult, profileResult] = await Promise.all([settingsPromise, profilePromise])
  const profile = profileResult.data
  const names = splitName(profile?.fullname || metadataName, currentEmail)

  return {
    prefill: {
      firstName: names.firstName,
      lastName: names.lastName,
      phone: profile?.phone || '',
      email: profile?.email || currentEmail || '',
      city: profile?.city || '',
      address: profile?.address || '',
    },
    shippingCost: Number(settingsResult.data?.shipping_cost || 0),
    freeShippingFrom: Number(settingsResult.data?.free_shipping_from || 0),
  }
}

export default async function CheckoutPage() {
  const context = await getCheckoutContext()

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <header style={{ padding: '18px var(--px)', borderBottom: '1px solid var(--border)', background: 'var(--nav-bg)', backdropFilter: 'blur(18px)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <Link href="/panier" style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>
            ← Retour au panier
          </Link>
          <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--red)' }}>
            Boutique
          </Link>
        </div>
      </header>

      <CheckoutClient {...context} />
    </main>
  )
}
