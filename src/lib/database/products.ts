import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Product, ProductFilters, PaginatedResponse } from '@/types/database'

// ─── GET PRODUCTS (public) ───────────────────────────────────

export async function getProducts(
  filters: ProductFilters = {}
): Promise<PaginatedResponse<Product>> {
  const supabase = await createClient()

  const {
    category_id,
    collection_id,
    featured,
    active = true,
    search,
    page = 1,
    per_page = 20,
  } = filters

  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug),
      collection:collections(id, name, slug),
      images:product_images(id, image_url, display_order),
      sizes:product_sizes(id, size, stock),
      colors:product_colors(id, color_name, color_hex, stock)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * per_page, page * per_page - 1)

  if (active !== undefined) query = query.eq('active', active)
  if (category_id) query = query.eq('category_id', category_id)
  if (collection_id) query = query.eq('collection_id', collection_id)
  if (featured !== undefined) query = query.eq('featured', featured)
  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error, count } = await query

  if (error) throw new Error(error.message)

  return {
    data: data as Product[],
    total: count || 0,
    page,
    per_page,
    total_pages: Math.ceil((count || 0) / per_page),
  }
}

// ─── GET SINGLE PRODUCT ──────────────────────────────────────

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug),
      collection:collections(id, name, slug),
      images:product_images(id, image_url, display_order),
      sizes:product_sizes(id, size, stock),
      colors:product_colors(id, color_name, color_hex, stock)
    `)
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (error) return null
  return data as Product
}

// ─── GET FEATURED PRODUCTS ───────────────────────────────────

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug),
      images:product_images(id, image_url, display_order)
    `)
    .eq('active', true)
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data as Product[]) || []
}

// ─── ADMIN: CREATE PRODUCT ───────────────────────────────────

export async function createProduct(productData: Partial<Product>) {
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('products')
    .insert(productData)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

// ─── ADMIN: UPDATE PRODUCT ───────────────────────────────────

export async function updateProduct(id: string, productData: Partial<Product>) {
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('products')
    .update(productData)
    .eq('id', id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

// ─── ADMIN: DELETE PRODUCT ───────────────────────────────────

export async function deleteProduct(id: string) {
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('products')
    .delete()
    .eq('id', id)

  return { error: error?.message || null }
}
