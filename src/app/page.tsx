import HomeClient from '@/components/HomeClient'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import { getActiveGalleryItems, getActiveVideoItems } from '@/lib/database/media'

export const dynamic = 'force-dynamic'

const getHomeProducts = unstable_cache(async () => {
  const adminClient = createAdminClient()

  const { data } = await adminClient
    .from('products')
    .select('*, images:product_images(image_url, display_order), category:categories(name, slug), sizes:product_sizes(size, stock), colors:product_colors(color_name, color_hex, stock)')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(24)

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

  const products = normalize(data || [])

  return {
    featured: products.filter(p => p.featured).slice(0, 6),
    newItems: products.filter(p => p.new_arrival).slice(0, 6),
    bestsellers: products.filter(p => p.on_sale).slice(0, 6),
    allProducts: products.slice(0, 20),
  }
}, ['home-products'], { revalidate: 300, tags: ['home-products', 'site-products'] })

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

const getSiteSettings = unstable_cache(async () => {
  try {
    const adminClient = createAdminClient()
    const { data } = await adminClient
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle()

    return data || null
  } catch {
    return null
  }
}, ['site-settings'], { revalidate: 300, tags: ['site-settings'] })

const getHomeMarqueeItems = unstable_cache(async () => {
  try {
    const adminClient = createAdminClient()
    const [categoriesRes, collectionsRes] = await Promise.all([
      adminClient.from('categories').select('name, slug').eq('active', true).order('display_order', { ascending: true }).limit(8),
      adminClient.from('collections').select('name, slug').eq('active', true).order('created_at', { ascending: false }).limit(6),
    ])

    const categories = (categoriesRes.data || []).map(item => ({
      label: item.name.toLowerCase() === 'hoodies' ? 'Sweats' : item.name,
      href: `/categorie/${item.slug}`,
    }))
    const collections = (collectionsRes.data || []).map(item => ({
      label: item.name.toLowerCase().includes('summer') ? 'Collection été' : item.name,
      href: `/collection/${item.slug}`,
    }))

    return [
      ...categories,
      { label: 'Nouveautés', href: '#nouveautes' },
      { label: 'Éditions limitées', href: '#collection' },
      ...collections,
    ]
  } catch {
    return []
  }
}, ['home-marquee-items'], { revalidate: 300, tags: ['site-products'] })

export default async function HomePage() {
  const [products, currentUser, siteSettings, galleryItems, videoItems, marqueeItems] = await Promise.all([
    getHomeProducts(),
    getCurrentUser(),
    getSiteSettings(),
    getActiveGalleryItems(),
    getActiveVideoItems(),
    getHomeMarqueeItems(),
  ])

  return (
    <HomeClient
      featured={products.featured}
      newItems={products.newItems}
      bestsellers={products.bestsellers}
      allProducts={products.allProducts}
      currentUser={currentUser}
      siteSettings={siteSettings}
      galleryItems={galleryItems}
      videoItems={videoItems}
      marqueeItems={marqueeItems}
    />
  )
}
