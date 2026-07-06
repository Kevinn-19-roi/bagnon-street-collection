'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { generateSlug, generateSKU } from '@/lib/helpers/slugify'
import { revalidatePath } from 'next/cache'

// ─── CREATE PRODUCT ──────────────────────────────────────────

export async function createProduct(formData: FormData): Promise<void> {
  const adminClient = createAdminClient()
  const supabase = await createClient()

  const name = formData.get('name') as string
  const slug = formData.get('slug') as string || generateSlug(name)
  const skuRaw = formData.get('sku') as string
  const sku = skuRaw?.trim() || generateSKU(name, 'BSC')
  const description = formData.get('description') as string
  const short_description = formData.get('short_description') as string
  const category_id = formData.get('category_id') as string
  const collection_id = formData.get('collection_id') as string || null
  const price = parseFloat(formData.get('price') as string)
  const old_price = formData.get('old_price') ? parseFloat(formData.get('old_price') as string) : null
  const stock = parseInt(formData.get('stock') as string)
  const featured = formData.get('featured') === 'true'
  const new_arrival = formData.get('new_arrival') === 'true'
  const on_sale = formData.get('on_sale') === 'true'
  const active = formData.get('active') === 'true'
  const material = formData.get('material') as string
  const care_instructions = formData.get('care_instructions') as string
  const weight = formData.get('weight') ? parseFloat(formData.get('weight') as string) : null

  // Insert product
  const { data: product, error } = await adminClient
    .from('products')
    .insert({
      name, slug, sku, description, short_description,
      category_id, collection_id, price, old_price,
      stock, featured, new_arrival, on_sale, active,
      material, care_instructions, weight,
    })
    .select()
    .single()

  if (error || !product) {
    throw new Error(error?.message || 'Erreur création produit')
  }

  // Upload images
  const images = formData.getAll('images') as File[]
  const validImages = images.filter(f => f && f.size > 0)

  for (let i = 0; i < validImages.length; i++) {
    const file = validImages[i]
    const ext = file.name.split('.').pop()
    const path = `${product.id}/${Date.now()}-${i}.${ext}`

    const { data: upload, error: uploadError } = await supabase.storage
      .from('products')
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (!uploadError && upload) {
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(upload.path)

      await adminClient.from('product_images').insert({
        product_id: product.id,
        image_url: publicUrl,
        display_order: i,
      })
    }
  }

  revalidatePath('/admin/produits')
  redirect('/admin/produits')
}

// ─── UPDATE PRODUCT ──────────────────────────────────────────

export async function updateProduct(id: string, formData: FormData): Promise<void> {
  const adminClient = createAdminClient()
  const supabase = await createClient()

  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const sku = formData.get('sku') as string
  const description = formData.get('description') as string
  const short_description = formData.get('short_description') as string
  const category_id = formData.get('category_id') as string
  const collection_id = formData.get('collection_id') as string || null
  const price = parseFloat(formData.get('price') as string)
  const old_price = formData.get('old_price') ? parseFloat(formData.get('old_price') as string) : null
  const stock = parseInt(formData.get('stock') as string)
  const featured = formData.get('featured') === 'true'
  const new_arrival = formData.get('new_arrival') === 'true'
  const on_sale = formData.get('on_sale') === 'true'
  const active = formData.get('active') === 'true'
  const material = formData.get('material') as string
  const care_instructions = formData.get('care_instructions') as string
  const weight = formData.get('weight') ? parseFloat(formData.get('weight') as string) : null

  const { error } = await adminClient
    .from('products')
    .update({
      name, slug, sku, description, short_description,
      category_id, collection_id, price, old_price,
      stock, featured, new_arrival, on_sale, active,
      material, care_instructions, weight,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  // Upload new images if any
  const images = formData.getAll('images') as File[]
  const validImages = images.filter(f => f && f.size > 0)

  for (let i = 0; i < validImages.length; i++) {
    const file = validImages[i]
    const ext = file.name.split('.').pop()
    const path = `${id}/${Date.now()}-${i}.${ext}`

    const { data: upload, error: uploadError } = await supabase.storage
      .from('products')
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (!uploadError && upload) {
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(upload.path)

      // Get current max order
      const { data: existing } = await adminClient
        .from('product_images')
        .select('display_order')
        .eq('product_id', id)
        .order('display_order', { ascending: false })
        .limit(1)

      const nextOrder = existing && existing[0] ? existing[0].display_order + 1 : 0

      await adminClient.from('product_images').insert({
        product_id: id,
        image_url: publicUrl,
        display_order: nextOrder + i,
      })
    }
  }

  revalidatePath('/admin/produits')
  revalidatePath(`/admin/produits/${id}/modifier`)
  redirect('/admin/produits')
}

// ─── DELETE PRODUCT ──────────────────────────────────────────

export async function deleteProduct(id: string): Promise<void> {
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/produits')
  redirect('/admin/produits')
}

// ─── DELETE PRODUCT IMAGE ────────────────────────────────────

export async function deleteProductImage(imageId: string, productId: string): Promise<void> {
  const adminClient = createAdminClient()

  await adminClient
    .from('product_images')
    .delete()
    .eq('id', imageId)

  revalidatePath(`/admin/produits/${productId}/modifier`)
}
