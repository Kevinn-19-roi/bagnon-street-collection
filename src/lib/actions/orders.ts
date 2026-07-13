'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/actions/auth'
import { revalidatePath } from 'next/cache'
import { OrderStatus, PaymentStatus } from '@/types/database'

export async function updateOrderStatus(
  orderId: string,
  orderStatus: OrderStatus,
  paymentStatus?: PaymentStatus
): Promise<void> {
  await requireAdmin()

  const adminClient = createAdminClient()

  const updateData: Record<string, string> = { order_status: orderStatus }
  if (paymentStatus) updateData.payment_status = paymentStatus

  const { error } = await adminClient
    .from('orders')
    .update(updateData)
    .eq('id', orderId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/commandes')
  revalidatePath(`/admin/commandes/${orderId}`)
}
