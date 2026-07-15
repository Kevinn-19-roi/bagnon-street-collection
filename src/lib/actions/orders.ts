'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/actions/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { OrderStatus, PaymentStatus } from '@/types/database'

export async function updateOrderStatus(
  orderId: string,
  orderStatus: OrderStatus,
  paymentStatus?: PaymentStatus
): Promise<void> {
  await requireAdmin()

  const adminClient = createAdminClient()

  if (paymentStatus === 'paid') {
    throw new Error('Utilise la confirmation de paiement securisee pour marquer une commande comme payee.')
  }

  const updateData: Record<string, string> = { order_status: orderStatus }
  if (paymentStatus) updateData.payment_status = paymentStatus

  const { error } = await adminClient
    .from('orders')
    .update(updateData)
    .eq('id', orderId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/commandes')
  revalidatePath(`/admin/commandes/${orderId}`)
  redirect(`/admin/commandes/${orderId}?success=payment-confirmed`)
}

export async function confirmManualWavePayment(orderId: string, formData: FormData): Promise<void> {
  const admin = await requireAdmin()
  const adminClient = createAdminClient()
  const providerTransactionId = String(formData.get('provider_transaction_id') || '').trim() || null

  const { error } = await adminClient.rpc('confirm_manual_wave_payment', {
    p_order_id: orderId,
    p_admin_id: admin.id,
    p_provider_transaction_id: providerTransactionId,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/admin/commandes')
  revalidatePath(`/admin/commandes/${orderId}`)
}
