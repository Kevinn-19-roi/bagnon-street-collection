'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { PaymentMethod, Product } from '@/types/database'

const checkoutItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
  size: z.string().trim().max(50).optional().nullable(),
  color: z.string().trim().max(80).optional().nullable(),
})

const checkoutSchema = z.object({
  firstName: z.string().trim().min(2, 'Le prenom est obligatoire.').max(80),
  lastName: z.string().trim().min(2, 'Le nom est obligatoire.').max(80),
  phone: z.string().trim().min(8, 'Le telephone est obligatoire.').max(30),
  email: z.string().trim().email('Email invalide.').optional().or(z.literal('')),
  city: z.string().trim().min(2, 'La commune ou ville est obligatoire.').max(120),
  address: z.string().trim().min(3, 'L adresse est obligatoire.').max(220),
  deliveryLandmark: z.string().trim().max(220).optional().or(z.literal('')),
  notes: z.string().trim().max(600).optional().or(z.literal('')),
  paymentMethod: z.enum(['wave', 'orange_money', 'cash', 'bank_transfer']).default('wave'),
  items: z.array(checkoutItemSchema).min(1, 'Le panier est vide.'),
})

type CheckoutInput = z.infer<typeof checkoutSchema>

type CreateOrderResult = {
  success: boolean
  message: string
  orderNumber?: string
}

type ValidatedLine = {
  product: Product
  quantity: number
  size: string | null
  color: string | null
  unitPrice: number
}

function normalizeOptional(value?: string | null) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function cartLineKey(item: { productId: string; size?: string | null; color?: string | null }) {
  return [item.productId, normalizeOptional(item.size) || 'default', normalizeOptional(item.color) || 'default'].join('::')
}

function aggregateItems(items: CheckoutInput['items']) {
  const map = new Map<string, CheckoutInput['items'][number]>()

  for (const item of items) {
    const key = cartLineKey(item)
    const existing = map.get(key)
    if (existing) {
      map.set(key, { ...existing, quantity: existing.quantity + item.quantity })
    } else {
      map.set(key, {
        productId: item.productId,
        quantity: item.quantity,
        size: normalizeOptional(item.size),
        color: normalizeOptional(item.color),
      })
    }
  }

  return [...map.values()]
}

function validateLines(items: CheckoutInput['items'], products: Product[]): { lines?: ValidatedLine[]; error?: string } {
  const byId = new Map(products.map(product => [product.id, product]))
  const lines: ValidatedLine[] = []

  for (const item of aggregateItems(items)) {
    const product = byId.get(item.productId)
    if (!product || !product.active) {
      return { error: 'Un produit du panier n est plus disponible.' }
    }

    if (product.stock < item.quantity) {
      return { error: `Stock insuffisant pour ${product.name}.` }
    }

    const sizes = product.sizes || []
    const colors = product.colors || []
    const selectedSize = normalizeOptional(item.size)
    const selectedColor = normalizeOptional(item.color)

    if (sizes.length > 0) {
      if (!selectedSize) return { error: `Choisis une taille pour ${product.name}.` }
      const size = sizes.find(option => option.size === selectedSize)
      if (!size) return { error: `La taille choisie pour ${product.name} est invalide.` }
      if (size.stock < item.quantity) return { error: `Stock insuffisant pour ${product.name} en taille ${selectedSize}.` }
    }

    if (colors.length > 1 && !selectedColor) {
      return { error: `Choisis une couleur pour ${product.name}.` }
    }

    if (selectedColor && colors.length > 0) {
      const color = colors.find(option => option.color_name === selectedColor)
      if (!color) return { error: `La couleur choisie pour ${product.name} est invalide.` }
      if (color.stock < item.quantity) return { error: `Stock insuffisant pour ${product.name} en couleur ${selectedColor}.` }
    }

    lines.push({
      product,
      quantity: item.quantity,
      size: selectedSize,
      color: selectedColor,
      unitPrice: Number(product.price),
    })
  }

  return { lines }
}

async function getCheckoutUserEmail() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user?.email || null
  } catch {
    return null
  }
}

export async function createCheckoutOrder(payload: unknown): Promise<CreateOrderResult> {
  const parsed = checkoutSchema.safeParse(payload)
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message || 'Informations de commande invalides.' }
  }

  const input = parsed.data
  const adminClient = createAdminClient()
  const productIds = [...new Set(input.items.map(item => item.productId))]
  let createdCustomerId: string | null = null
  let createdOrderId: string | null = null

  try {
    const { data: products, error: productsError } = await adminClient
      .from('products')
      .select('*, sizes:product_sizes(*), colors:product_colors(*)')
      .in('id', productIds)

    if (productsError) return { success: false, message: productsError.message }

    const validation = validateLines(input.items, (products || []) as Product[])
    if (validation.error || !validation.lines?.length) {
      return { success: false, message: validation.error || 'Le panier est vide.' }
    }

    const lines = validation.lines
    const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)

    const { data: settings } = await adminClient
      .from('site_settings')
      .select('shipping_cost, free_shipping_from')
      .limit(1)
      .maybeSingle()

    const shippingCost = settings && Number(settings.free_shipping_from) > 0 && subtotal >= Number(settings.free_shipping_from)
      ? 0
      : Number(settings?.shipping_cost || 0)
    const total = subtotal + shippingCost
    const connectedEmail = await getCheckoutUserEmail()
    const email = normalizeOptional(input.email) || connectedEmail
    const notes = [
      normalizeOptional(input.deliveryLandmark) ? `Repere de livraison: ${normalizeOptional(input.deliveryLandmark)}` : null,
      normalizeOptional(input.notes),
    ].filter(Boolean).join('\n\n') || null

    const { data: customer, error: customerError } = await adminClient
      .from('customers')
      .insert({
        fullname: `${input.firstName} ${input.lastName}`.trim(),
        phone: input.phone,
        email,
        city: input.city,
        address: input.address,
        country: "Cote d'Ivoire",
      })
      .select('id')
      .single()

    if (customerError || !customer) return { success: false, message: customerError?.message || 'Impossible de creer le client.' }
    createdCustomerId = customer.id

    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .insert({
        customer_id: customer.id,
        subtotal,
        shipping_cost: shippingCost,
        total,
        payment_method: input.paymentMethod as PaymentMethod,
        payment_status: 'unpaid',
        order_status: 'pending',
        notes,
      })
      .select('id, order_number')
      .single()

    if (orderError || !order) throw new Error(orderError?.message || 'Impossible de creer la commande.')
    createdOrderId = order.id

    const { error: itemsError } = await adminClient
      .from('order_items')
      .insert(lines.map(line => ({
        order_id: order.id,
        product_id: line.product.id,
        quantity: line.quantity,
        selected_size: line.size,
        selected_color: line.color,
        price: line.unitPrice,
      })))

    if (itemsError) throw new Error(itemsError.message)

    revalidatePath('/admin/commandes')
    revalidatePath(`/commande/${order.order_number}`)

    return {
      success: true,
      message: 'Commande creee avec succes.',
      orderNumber: order.order_number,
    }
  } catch (error) {
    if (createdOrderId) await adminClient.from('orders').delete().eq('id', createdOrderId)
    if (createdCustomerId) await adminClient.from('customers').delete().eq('id', createdCustomerId)

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Impossible de creer la commande.',
    }
  }
}
