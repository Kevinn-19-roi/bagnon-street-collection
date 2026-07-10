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
      .select('id, role, fullname')
      .eq('id', user.id)
      .single()

    return admin || null
  } catch {
    return null
  }
}

export default async function HomePage() {
  const [products, currentUser] = await Promise.all([
    getHomeProducts(),
    getCurrentUser(),
  ])

  return (
    <HomeClient
      featured={products.featured}
      newItems={products.newItems}
      bestsellers={products.bestsellers}
      allProducts={products.allProducts}
      currentUser={currentUser}
    />
  )
}
