'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/actions/auth'
import { generateSlug, generateSKU } from '@/lib/helpers/slugify'
import { revalidatePath, revalidateTag } from 'next/cache'

export type ProductActionResult = {
  success: boolean
  message: string
  redirectTo?: string
}

function refreshProductCaches(path?: string) {
  revalidatePath('/admin/produits')
  revalidatePath('/')
  revalidateTag('home-products')
  revalidateTag('site-products')
  if (path) revalidatePath(path)
}

export async function createProduct(formData: FormData): Promise<ProductActionResult> {
  await requireAdmin()

  const adminClient = createAdminClient()
  const supabase = await createClient()

  const name = formData.get('name') as string
  const slug = (formData.get('slug') as string) || generateSlug(name)
  const skuRaw = formData.get('sku') as string
  const sku = skuRaw?.trim() || generateSKU(name, 'BSC')
  const description = formData.get('description') as string
  const short_description = formData.get('short_description') as string
  const category_id = formData.get('category_id') as string
  const collection_id = (formData.get('collection_id') as string) || null
  const price = parseFloat(formData.get('price') as string)
  const old_price = formData.get('old_price') ? parseFloat(formData.get('old_price') as string) : null
  const stock = parseInt(formData.get('stock') as string, 10)
  const featured = formData.get('featured') === 'true'
  const new_arrival = formData.get('new_arrival') === 'true'
  const on_sale = formData.get('on_sale') === 'true'
  const active = formData.get('active') === 'true'
  const material = formData.get('material') as string
  const care_instructions = formData.get('care_instructions') as string
  const weight = formData.get('weight') ? parseFloat(formData.get('weight') as string) : null

  const { data: product, error } = await adminClient
    .from('products')
    .insert({
      name,
      slug,
      sku,
      description,
      short_description,
      category_id,
      collection_id,
      price,
      old_price,
      stock,
      featured,
      new_arrival,
      on_sale,
      active,
      material,
      care_instructions,
      weight,
    })
    .select()
    .single()

  if (error || !product) {
    return {
      success: false,
      message: error?.message || 'Erreur lors de la creation du produit.',
    }
  }

  const images = formData.getAll('images') as File[]
  const validImages = images.filter(file => file && file.size > 0)

  for (let i = 0; i < validImages.length; i++) {
    const file = validImages[i]
    const ext = file.name.split('.').pop()
    const path = `${product.id}/${Date.now()}-${i}.${ext}`

    const { data: upload, error: uploadError } = await supabase.storage
      .from('products')
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (uploadError) {
      return {
        success: false,
        message: `Produit cree, mais une image n'a pas pu etre envoyee : ${uploadError.message}`,
      }
    }

    if (upload) {
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

  refreshProductCaches()

  return {
    success: true,
    message: 'Produit cree avec succes.',
    redirectTo: '/admin/produits?success=created',
  }
}

export async function updateProduct(id: string, formData: FormData): Promise<ProductActionResult> {
  await requireAdmin()

  const adminClient = createAdminClient()
  const supabase = await createClient()

  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const sku = formData.get('sku') as string
  const description = formData.get('description') as string
  const short_description = formData.get('short_description') as string
  const category_id = formData.get('category_id') as string
  const collection_id = (formData.get('collection_id') as string) || null
  const price = parseFloat(formData.get('price') as string)
  const old_price = formData.get('old_price') ? parseFloat(formData.get('old_price') as string) : null
  const stock = parseInt(formData.get('stock') as string, 10)
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
      name,
      slug,
      sku,
      description,
      short_description,
      category_id,
      collection_id,
      price,
      old_price,
      stock,
      featured,
      new_arrival,
      on_sale,
      active,
      material,
      care_instructions,
      weight,
    })
    .eq('id', id)

  if (error) {
    return {
      success: false,
      message: error.message,
    }
  }

  const images = formData.getAll('images') as File[]
  const validImages = images.filter(file => file && file.size > 0)

  for (let i = 0; i < validImages.length; i++) {
    const file = validImages[i]
    const ext = file.name.split('.').pop()
    const path = `${id}/${Date.now()}-${i}.${ext}`

    const { data: upload, error: uploadError } = await supabase.storage
      .from('products')
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (uploadError) {
      return {
        success: false,
        message: `Produit modifie, mais une image n'a pas pu etre envoyee : ${uploadError.message}`,
      }
    }

    if (upload) {
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(upload.path)

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

  refreshProductCaches(`/admin/produits/${id}/modifier`)

  return {
    success: true,
    message: 'Produit modifie avec succes.',
    redirectTo: '/admin/produits?success=updated',
  }
}

export async function deleteProduct(id: string): Promise<void> {
  await requireAdmin()

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  refreshProductCaches()
}

export async function deleteProductImage(imageId: string, productId: string): Promise<void> {
  await requireAdmin()

  const adminClient = createAdminClient()

  await adminClient
    .from('product_images')
    .delete()
    .eq('id', imageId)

  revalidatePath(`/admin/produits/${productId}/modifier`)
  revalidatePath('/')
  revalidateTag('home-products')
  revalidateTag('site-products')
}
