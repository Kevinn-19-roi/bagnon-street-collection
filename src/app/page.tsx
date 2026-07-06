import HomeClient from '@/components/HomeClient'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

async function getHomeProducts() {
  const adminClient = createAdminClient()

  const { data: featured } = await adminClient
    .from('products')
    .select('*, images:product_images(image_url, display_order), category:categories(name, slug)')
    .eq('active', true)
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(6)

  const { data: newArrivals } = await adminClient
    .from('products')
    .select('*, images:product_images(image_url, display_order), category:categories(name, slug)')
    .eq('active', true)
    .eq('new_arrival', true)
    .order('created_at', { ascending: false })
    .limit(6)

  const { data: bestsellers } = await adminClient
    .from('products')
    .select('*, images:product_images(image_url, display_order), category:categories(name, slug)')
    .eq('active', true)
    .eq('on_sale', false)
    .eq('new_arrival', false)
    .order('created_at', { ascending: false })
    .limit(6)

  const { data: allProducts } = await adminClient
    .from('products')
    .select('*, images:product_images(image_url, display_order), category:categories(name, slug)')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(20)

  // Normalize images
  function normalize(products: any[]) {
    return (products || []).map(p => ({
      ...p,
      images: (p.images || [])
        .sort((a: any, b: any) => a.display_order - b.display_order)
        .map((img: any) => img.image_url),
      inStock: p.stock > 0,
      isNew: p.new_arrival,
      compareAt: p.old_price,
      discount: p.old_price ? Math.round((1 - p.price / p.old_price) * 100) : 0,
      tags: [],
    }))
  }

  return {
    featured: normalize(featured || []),
    newItems: normalize(newArrivals || []),
    bestsellers: normalize(bestsellers || []),
    allProducts: normalize(allProducts || []),
  }
}

export default async function HomePage() {
  const { featured, newItems, bestsellers, allProducts } = await getHomeProducts()

  return (
    <HomeClient
      featured={featured}
      newItems={newItems}
      bestsellers={bestsellers}
      allProducts={allProducts}
    />
  )
}
