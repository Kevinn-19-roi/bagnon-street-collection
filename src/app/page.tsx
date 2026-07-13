import HomeClient from '@/components/HomeClient'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

async function getHomeProducts() {
  const adminClient = createAdminClient()

  const [featuredRes, newRes, bestsellersRes, allRes] = await Promise.all([
    adminClient.from('products').select('*, images:product_images(image_url, display_order), category:categories(name, slug)').eq('active', true).eq('featured', true).order('created_at', { ascending: false }).limit(6),
    adminClient.from('products').select('*, images:product_images(image_url, display_order), category:categories(name, slug)').eq('active', true).eq('new_arrival', true).order('created_at', { ascending: false }).limit(6),
    adminClient.from('products').select('*, images:product_images(image_url, display_order), category:categories(name, slug)').eq('active', true).eq('on_sale', true).order('created_at', { ascending: false }).limit(6),
    adminClient.from('products').select('*, images:product_images(image_url, display_order), category:categories(name, slug)').eq('active', true).order('created_at', { ascending: false }).limit(20),
  ])

  function normalize(products: any[]) {
    return (products || []).map(p => ({
      ...p,
      images: (p.images || []).sort((a: any, b: any) => a.display_order - b.display_order).map((img: any) => img.image_url),
      inStock: (p.stock || 0) > 0,
      isNew: p.new_arrival,
      compareAt: p.old_price,
      discount: p.old_price ? Math.round((1 - p.price / p.old_price) * 100) : 0,
      tags: [],
    }))
  }

  return {
    featured: normalize(featuredRes.data || []),
    newItems: normalize(newRes.data || []),
    bestsellers: normalize(bestsellersRes.data || []),
    allProducts: normalize(allRes.data || []),
  }
}

async function getCurrentUser() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const adminClient = createAdminClient()
    const { data: admin } = await adminClient
      .from('admins')
      .select('id, role, fullname, email')
      .eq('id', user.id)
      .maybeSingle()

    const { data: customer } = user.email
      ? await adminClient
        .from('customers')
        .select('id, fullname, phone, email, address, city, country')
        .eq('email', user.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      : { data: null }

    const fullname = admin?.fullname
      || customer?.fullname
      || user.user_metadata?.fullname
      || user.user_metadata?.name
      || user.email?.split('@')[0]
      || 'Client'

    return {
      id: user.id,
      email: user.email || admin?.email || customer?.email || null,
      fullname,
      role: admin?.role || 'client',
      isAdmin: Boolean(admin),
      profile: customer || null,
    }
  } catch {
    return null
  }
}

async function getSiteSettings() {
  try {
    const adminClient = createAdminClient()
    const { data } = await adminClient
      .from('site_settings')
      .select('whatsapp, facebook, instagram, tiktok, address, email, phone')
      .limit(1)
      .maybeSingle()

    return data || null
  } catch {
    return null
  }
}

export default async function HomePage() {
  const [products, currentUser, siteSettings] = await Promise.all([
    getHomeProducts(),
    getCurrentUser(),
    getSiteSettings(),
  ])

  return (
    <HomeClient
      featured={products.featured}
      newItems={products.newItems}
      bestsellers={products.bestsellers}
      allProducts={products.allProducts}
      currentUser={currentUser}
      siteSettings={siteSettings}
    />
  )
}
