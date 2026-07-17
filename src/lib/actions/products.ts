'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/actions/auth'
import { generateSlug, generateSKU } from '@/lib/helpers/slugify'
import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'

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

function parseVariants(formData: FormData, stock: number) {
  const sizes = formData
    .getAll('sizes')
    .map(value => String(value).trim())
    .filter(Boolean)

  const colors = formData
    .getAll('colors')
    .map(value => {
      const [name, hex] = String(value).split('|')
      return {
        color_name: name?.trim(),
        color_hex: hex?.trim() || '#111111',
      }
    })
    .filter(color => color.color_name)

  return {
    sizes: [...new Set(sizes)].map(size => ({ size, stock })),
    colors: colors.filter((color, index, list) => list.findIndex(item => item.color_name === color.color_name) === index)
      .map(color => ({ ...color, stock })),
  }
}

async function syncProductVariants(productId: string, formData: FormData, stock: number) {
  const adminClient = createAdminClient()
  const { sizes, colors } = parseVariants(formData, stock)

  const [existingSizesRes, existingColorsRes] = await Promise.all([
    adminClient.from('product_sizes').select('size, stock').eq('product_id', productId),
    adminClient.from('product_colors').select('color_name, color_hex, stock').eq('product_id', productId),
  ])

  const sizeStock = new Map((existingSizesRes.data || []).map(size => [size.size, size.stock]))
  const colorStock = new Map((existingColorsRes.data || []).map(color => [color.color_name, color.stock]))

  await Promise.all([
    adminClient.from('product_sizes').delete().eq('product_id', productId),
    adminClient.from('product_colors').delete().eq('product_id', productId),
  ])

  if (sizes.length) {
    const { error } = await adminClient.from('product_sizes').insert(
      sizes.map(size => ({
        product_id: productId,
        size: size.size,
        stock: sizeStock.get(size.size) ?? stock,
      }))
    )
    if (error) throw new Error(error.message)
  }

  if (colors.length) {
    const { error } = await adminClient.from('product_colors').insert(
      colors.map(color => ({
        product_id: productId,
        color_name: color.color_name,
        color_hex: color.color_hex,
        stock: colorStock.get(color.color_name) ?? stock,
      }))
    )
    if (error) throw new Error(error.message)
  }
}

async function uniqueSlug(baseSlug: string, excludeId?: string) {
  const adminClient = createAdminClient()
  const cleanBase = generateSlug(baseSlug || 'produit') || 'produit'
  let candidate = cleanBase
  let index = 2

  while (true) {
    let query = adminClient.from('products').select('id').eq('slug', candidate).limit(1)
    if (excludeId) query = query.neq('id', excludeId)
    const { data, error } = await query
    if (error) throw new Error(error.message)
    if (!data || data.length === 0) return candidate
    candidate = `${cleanBase}-${index}`
    index += 1
  }
}

async function uniqueSku(baseSku: string) {
  return uniqueProductSku(`${baseSku || 'BSC-PROD'}-COPY`)
}

async function uniqueProductSku(baseSku: string, excludeId?: string) {
  const adminClient = createAdminClient()
  const cleanBase = (baseSku || 'BSC-PROD').trim() || 'BSC-PROD'
  let candidate = cleanBase
  let index = 2

  while (true) {
    let query = adminClient.from('products').select('id').eq('sku', candidate).limit(1)
    if (excludeId) query = query.neq('id', excludeId)
    const { data, error } = await query
    if (error) throw new Error(error.message)
    if (!data || data.length === 0) return candidate
    candidate = `${cleanBase}-${index}`
    index += 1
  }
}

function cleanText(value: FormDataEntryValue | null) {
  return String(value || '').trim()
}

function parseRequiredNumber(value: FormDataEntryValue | null) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : NaN
}

function validateProductInput(formData: FormData) {
  const name = cleanText(formData.get('name'))
  const category_id = cleanText(formData.get('category_id'))
  const price = parseRequiredNumber(formData.get('price'))
  const stock = parseInt(String(formData.get('stock') || ''), 10)
  const oldPriceValue = cleanText(formData.get('old_price'))
  const old_price = oldPriceValue ? Number(oldPriceValue) : null
  const weightValue = cleanText(formData.get('weight'))
  const weight = weightValue ? Number(weightValue) : null

  if (!name) return { error: 'Le nom du produit est obligatoire.' }
  if (!category_id) return { error: 'La categorie du produit est obligatoire.' }
  if (!Number.isFinite(price) || price < 0) return { error: 'Le prix doit etre un nombre valide.' }
  if (!Number.isInteger(stock) || stock < 0) return { error: 'Le stock doit etre un nombre entier positif.' }
  if (old_price !== null && (!Number.isFinite(old_price) || old_price < 0)) return { error: 'L ancien prix doit etre un nombre valide.' }
  if (weight !== null && (!Number.isFinite(weight) || weight < 0)) return { error: 'Le poids doit etre un nombre valide.' }

  return {
    value: {
      name,
      skuBase: cleanText(formData.get('sku')) || generateSKU(name, 'BSC'),
      slugBase: cleanText(formData.get('slug')) || generateSlug(name),
      description: cleanText(formData.get('description')),
      short_description: cleanText(formData.get('short_description')),
      category_id,
      collection_id: cleanText(formData.get('collection_id')) || null,
      price,
      old_price,
      stock,
      featured: formData.get('featured') === 'true',
      new_arrival: formData.get('new_arrival') === 'true',
      on_sale: formData.get('on_sale') === 'true',
      active: formData.get('active') === 'true',
      material: cleanText(formData.get('material')),
      care_instructions: cleanText(formData.get('care_instructions')),
      weight,
    },
  }
}

export async function createProduct(formData: FormData): Promise<ProductActionResult> {
  await requireAdmin()

  const adminClient = createAdminClient()
  const supabase = await createClient()

  const parsed = validateProductInput(formData)
  if ('error' in parsed) return { success: false, message: parsed.error || 'Les informations du produit sont invalides.' }
  const values = parsed.value

  let slug: string
  let sku: string
  try {
    slug = await uniqueSlug(values.slugBase)
    sku = await uniqueProductSku(values.skuBase)
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Impossible de verifier le slug ou le SKU.',
    }
  }

  const { data: product, error } = await adminClient
    .from('products')
    .insert({
      name: values.name,
      slug,
      sku,
      description: values.description,
      short_description: values.short_description,
      category_id: values.category_id,
      collection_id: values.collection_id,
      price: values.price,
      old_price: values.old_price,
      stock: values.stock,
      featured: values.featured,
      new_arrival: values.new_arrival,
      on_sale: values.on_sale,
      active: values.active,
      material: values.material,
      care_instructions: values.care_instructions,
      weight: values.weight,
    })
    .select()
    .single()

  if (error || !product) {
    return {
      success: false,
      message: error?.message || 'Erreur lors de la creation du produit.',
    }
  }

  try {
    await syncProductVariants(product.id, formData, values.stock)
  } catch (variantError) {
    return {
      success: false,
      message: variantError instanceof Error ? variantError.message : 'Produit cree, mais les variantes n ont pas pu etre enregistrees.',
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

  const parsed = validateProductInput(formData)
  if ('error' in parsed) return { success: false, message: parsed.error || 'Les informations du produit sont invalides.' }
  const values = parsed.value

  let slug: string
  let sku: string
  try {
    slug = await uniqueSlug(values.slugBase, id)
    sku = await uniqueProductSku(values.skuBase, id)
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Impossible de verifier le slug ou le SKU.',
    }
  }

  const { error } = await adminClient
    .from('products')
    .update({
      name: values.name,
      slug,
      sku,
      description: values.description,
      short_description: values.short_description,
      category_id: values.category_id,
      collection_id: values.collection_id,
      price: values.price,
      old_price: values.old_price,
      stock: values.stock,
      featured: values.featured,
      new_arrival: values.new_arrival,
      on_sale: values.on_sale,
      active: values.active,
      material: values.material,
      care_instructions: values.care_instructions,
      weight: values.weight,
    })
    .eq('id', id)

  if (error) {
    return {
      success: false,
      message: error.message,
    }
  }

  try {
    await syncProductVariants(id, formData, values.stock)
  } catch (variantError) {
    return {
      success: false,
      message: variantError instanceof Error ? variantError.message : 'Produit modifie, mais les variantes n ont pas pu etre enregistrees.',
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

  if (error) {
    redirect('/admin/produits?error=delete')
  }

  refreshProductCaches()
  redirect('/admin/produits?success=deleted')
}

export async function duplicateProduct(id: string): Promise<void> {
  await requireAdmin()

  const adminClient = createAdminClient()

  const { data: original, error } = await adminClient
    .from('products')
    .select('*, images:product_images(*), sizes:product_sizes(*), colors:product_colors(*)')
    .eq('id', id)
    .single()

  if (error || !original) {
    redirect('/admin/produits?error=duplicate')
  }

  const slug = await uniqueSlug(`${original.slug}-copie`)
  const sku = await uniqueSku(original.sku)

  const { data: copy, error: insertError } = await adminClient
    .from('products')
    .insert({
      name: `${original.name} - copie`,
      slug,
      sku,
      description: original.description,
      short_description: original.short_description,
      category_id: original.category_id,
      collection_id: original.collection_id,
      price: original.price,
      old_price: original.old_price,
      stock: original.stock,
      featured: false,
      new_arrival: original.new_arrival,
      on_sale: original.on_sale,
      active: false,
      material: original.material,
      care_instructions: original.care_instructions,
      weight: original.weight,
    })
    .select()
    .single()

  if (insertError || !copy) {
    redirect('/admin/produits?error=duplicate')
  }

  const imageRows = (original.images || []).map((image: any) => ({
    product_id: copy.id,
    image_url: image.image_url,
    display_order: image.display_order,
  }))
  const sizeRows = (original.sizes || []).map((size: any) => ({
    product_id: copy.id,
    size: size.size,
    stock: size.stock,
  }))
  const colorRows = (original.colors || []).map((color: any) => ({
    product_id: copy.id,
    color_name: color.color_name,
    color_hex: color.color_hex,
    stock: color.stock,
  }))

  const copyResults = await Promise.all([
    imageRows.length ? adminClient.from('product_images').insert(imageRows) : Promise.resolve({ error: null }),
    sizeRows.length ? adminClient.from('product_sizes').insert(sizeRows) : Promise.resolve({ error: null }),
    colorRows.length ? adminClient.from('product_colors').insert(colorRows) : Promise.resolve({ error: null }),
  ])

  const copyError = copyResults.find(result => result.error)?.error
  if (copyError) {
    redirect('/admin/produits?error=duplicate')
  }

  refreshProductCaches(`/admin/produits/${copy.id}/modifier`)
  revalidatePath(`/produit/${copy.slug}`)
  redirect(`/admin/produits/${copy.id}/modifier?success=duplicated`)
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
