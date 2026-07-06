import { createAdminClient } from '@/lib/supabase/admin'
import type { Order, OrderFilters, PaginatedResponse } from '@/types/database'

export async function getOrders(
  filters: OrderFilters = {}
): Promise<PaginatedResponse<Order>> {
  const adminClient = createAdminClient()
  const { status, payment_status, search, page = 1, per_page = 20 } = filters

  let query = adminClient
    .from('orders')
    .select(`
      *,
      customer:customers(id, fullname, phone, email),
      items:order_items(
        id, quantity, selected_size, selected_color, price,
        product:products(id, name, slug)
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * per_page, page * per_page - 1)

  if (status) query = query.eq('order_status', status)
  if (payment_status) query = query.eq('payment_status', payment_status)
  if (search) query = query.ilike('order_number', `%${search}%`)

  const { data, error, count } = await query
  if (error) throw new Error(error.message)

  return {
    data: (data as Order[]) || [],
    total: count || 0,
    page,
    per_page,
    total_pages: Math.ceil((count || 0) / per_page),
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('orders')
    .select(`
      *,
      customer:customers(*),
      items:order_items(
        *,
        product:products(id, name, slug, images:product_images(image_url))
      )
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data as Order
}

export async function updateOrderStatus(
  id: string,
  order_status: string,
  payment_status?: string
) {
  const adminClient = createAdminClient()

  const updateData: Record<string, string> = { order_status }
  if (payment_status) updateData.payment_status = payment_status

  const { data, error } = await adminClient
    .from('orders')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  return { data, error: error?.message || null }
}

export async function getDashboardStats() {
  const adminClient = createAdminClient()

  try {
    const [ordersRes, revenueRes, customersRes, productsRes] = await Promise.all([
      adminClient.from('orders').select('id', { count: 'exact', head: true }),
      adminClient.from('orders').select('total').eq('payment_status', 'paid'),
      adminClient.from('customers').select('id', { count: 'exact', head: true }),
      adminClient.from('products').select('id', { count: 'exact', head: true }).eq('active', true),
    ])

    const revenue = (revenueRes.data || []).reduce((s: number, o: any) => s + (o.total || 0), 0)

    return {
      total_orders: ordersRes.count || 0,
      total_revenue: revenue,
      total_customers: customersRes.count || 0,
      active_products: productsRes.count || 0,
    }
  } catch {
    return { total_orders: 0, total_revenue: 0, total_customers: 0, active_products: 0 }
  }
}
