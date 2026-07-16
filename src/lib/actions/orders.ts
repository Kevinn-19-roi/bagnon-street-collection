'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/actions/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { OrderStatus, PaymentStatus } from '@/types/database'

function isMissingWaveRpcError(message?: string) {
  return Boolean(message && (
    message.includes('confirm_manual_wave_payment') ||
    message.includes('schema cache') ||
    message.includes('function') && message.includes('not find')
  ))
}

function isMissingCancelRpcError(message?: string) {
  return Boolean(message && (
    message.includes('cancel_order_with_stock_restore') ||
    message.includes('schema cache') ||
    message.includes('function') && message.includes('not find')
  ))
}

function isMissingDeleteRpcError(message?: string) {
  return Boolean(message && (
    message.includes('delete_order_with_stock_restore') ||
    message.includes('schema cache') ||
    message.includes('function') && message.includes('not find')
  ))
}

function revalidateOrderPaths(orderId: string) {
  revalidatePath('/admin/commandes')
  revalidatePath(`/admin/commandes/${orderId}`)
}

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

  revalidateOrderPaths(orderId)
  redirect(`/admin/commandes/${orderId}?success=status-updated`)
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

  if (error) {
    if (isMissingWaveRpcError(error.message)) {
      redirect(`/admin/commandes/${orderId}?error=wave-rpc-missing`)
    }

    redirect(`/admin/commandes/${orderId}?error=wave-confirm-failed`)
  }

  revalidateOrderPaths(orderId)
  redirect(`/admin/commandes/${orderId}?success=payment-confirmed`)
}

export async function markOrderAsShipped(orderId: string): Promise<void> {
  await requireAdmin()

  const adminClient = createAdminClient()
  const { data: order, error: readError } = await adminClient
    .from('orders')
    .select('id, order_status, payment_status')
    .eq('id', orderId)
    .single()

  if (readError || !order) redirect(`/admin/commandes/${orderId}?error=order-not-found`)

  if (order.payment_status !== 'paid') {
    redirect(`/admin/commandes/${orderId}?error=payment-required`)
  }

  if (!['pending', 'confirmed'].includes(order.order_status)) {
    redirect(`/admin/commandes/${orderId}?error=invalid-transition`)
  }

  const { error } = await adminClient
    .from('orders')
    .update({ order_status: 'shipped' })
    .eq('id', orderId)

  if (error) redirect(`/admin/commandes/${orderId}?error=status-update-failed`)

  revalidateOrderPaths(orderId)
  redirect(`/admin/commandes/${orderId}?success=shipped`)
}

export async function markOrderAsDelivered(orderId: string): Promise<void> {
  await requireAdmin()

  const adminClient = createAdminClient()
  const { data: order, error: readError } = await adminClient
    .from('orders')
    .select('id, order_status')
    .eq('id', orderId)
    .single()

  if (readError || !order) redirect(`/admin/commandes/${orderId}?error=order-not-found`)

  if (order.order_status !== 'shipped') {
    redirect(`/admin/commandes/${orderId}?error=invalid-transition`)
  }

  const { error } = await adminClient
    .from('orders')
    .update({ order_status: 'delivered' })
    .eq('id', orderId)

  if (error) redirect(`/admin/commandes/${orderId}?error=status-update-failed`)

  revalidateOrderPaths(orderId)
  redirect(`/admin/commandes/${orderId}?success=delivered`)
}

export async function cancelOrder(orderId: string): Promise<void> {
  const admin = await requireAdmin()
  const adminClient = createAdminClient()

  const { error } = await adminClient.rpc('cancel_order_with_stock_restore', {
    p_order_id: orderId,
    p_admin_id: admin.id,
  })

  if (error) {
    if (isMissingCancelRpcError(error.message)) {
      redirect(`/admin/commandes/${orderId}?error=cancel-rpc-missing`)
    }

    if (error.message.includes('delivered_order_cannot_be_cancelled')) {
      redirect(`/admin/commandes/${orderId}?error=delivered-cancel-refused`)
    }

    redirect(`/admin/commandes/${orderId}?error=cancel-failed`)
  }

  revalidateOrderPaths(orderId)
  redirect(`/admin/commandes/${orderId}?success=cancelled`)
}

export async function deleteOrder(orderId: string): Promise<void> {
  const admin = await requireAdmin()
  const adminClient = createAdminClient()

  const { data: order, error: readError } = await adminClient
    .from('orders')
    .select('id')
    .eq('id', orderId)
    .single()

  if (readError || !order) redirect('/admin/commandes?error=order-not-found')

  const { error } = await adminClient.rpc('delete_order_with_stock_restore', {
    p_order_id: orderId,
    p_admin_id: admin.id,
  })

  if (error) {
    if (isMissingDeleteRpcError(error.message)) {
      redirect(`/admin/commandes/${orderId}?error=delete-rpc-missing`)
    }

    redirect(`/admin/commandes/${orderId}?error=delete-failed`)
  }

  revalidatePath('/admin/commandes')
  redirect('/admin/commandes?success=deleted')
}
