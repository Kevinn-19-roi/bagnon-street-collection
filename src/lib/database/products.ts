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
    active,
    search,
    page = 1,
    per_page = 20,
  } = filters

  let matchingCategoryIds: string[] = []
  let matchingCollectionIds: string[] = []
  const searchTerm = search?.trim()

  if (searchTerm) {
    const [categories, collections] = await Promise.all([
      supabase.from('categories').select('id').eq('active', true).ilike('name', `%${searchTerm}%`),
      supabase.from('collections').select('id').eq('active', true).ilike('name', `%${searchTerm}%`),
    ])

    matchingCategoryIds = (categories.data || []).map(item => item.id)
    matchingCollectionIds = (collections.data || []).map(item => item.id)
  }

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

  if (active !== null) query = query.eq('active', active ?? true)
  if (category_id) query = query.eq('category_id', category_id)
  if (collection_id) query = query.eq('collection_id', collection_id)
  if (featured !== undefined) query = query.eq('featured', featured)
  if (searchTerm) {
    const safeTerm = searchTerm.replace(/[%,()]/g, ' ')
    const clauses = [
      `name.ilike.%${safeTerm}%`,
      `description.ilike.%${safeTerm}%`,
      `short_description.ilike.%${safeTerm}%`,
      ...(matchingCategoryIds.length ? [`category_id.in.(${matchingCategoryIds.join(',')})`] : []),
      ...(matchingCollectionIds.length ? [`collection_id.in.(${matchingCollectionIds.join(',')})`] : []),
    ]
    query = query.or(clauses.join(','))
  }

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

export async function getProductsAdminList(
  filters: ProductFilters = {}
): Promise<PaginatedResponse<Product>> {
  const supabase = await createClient()

  const {
    active,
    search,
    page = 1,
    per_page = 20,
  } = filters

  const searchTerm = search?.trim()
  let query = supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      sku,
      price,
      old_price,
      stock,
      active,
      featured,
      new_arrival,
      on_sale,
      created_at,
      category:categories(id, name, slug),
      images:product_images(id, image_url, display_order)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * per_page, page * per_page - 1)

  if (active !== null) query = query.eq('active', active ?? true)
  if (searchTerm) {
    const safeTerm = searchTerm.replace(/[%,()]/g, ' ')
    query = query.or(`name.ilike.%${safeTerm}%,sku.ilike.%${safeTerm}%,description.ilike.%${safeTerm}%`)
  }

  const { data, error, count } = await query
  if (error) throw new Error(error.message)

  const normalized = ((data || []) as Array<any>).map(item => ({
    ...item,
    description: null,
    short_description: null,
    category_id: item.category?.id || '',
    collection_id: null,
    weight: null,
    material: null,
    care_instructions: null,
    updated_at: item.created_at,
    category: Array.isArray(item.category) ? item.category[0] : item.category,
    images: (item.images || []).map((image: any) => ({
      id: image.id,
      product_id: item.id,
      image_url: image.image_url,
      display_order: image.display_order,
      created_at: item.created_at,
    })),
    sizes: [],
    colors: [],
  })) as Product[]

  return {
    data: normalized,
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
