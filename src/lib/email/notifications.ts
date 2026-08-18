import { createAdminClient } from '@/lib/supabase/admin'
import {
  adminNewOrderEmail,
  orderConfirmationEmail,
  orderStatusEmail,
  paymentConfirmedEmail,
  welcomeEmail,
} from '@/lib/email/templates'
import { sendTransactionalEmail } from '@/lib/email/resend'
import type { Order, SiteSettings } from '@/types/database'

async function getEmailSettings(): Promise<Partial<SiteSettings> | null> {
  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('site_settings')
    .select('email, instagram, facebook, tiktok, whatsapp')
    .limit(1)
    .maybeSingle()

  return data || null
}

async function getOrderForEmail(orderIdOrNumber: string): Promise<Order | null> {
  const adminClient = createAdminClient()
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orderIdOrNumber)

  let query = adminClient
    .from('orders')
    .select(`
      *,
      customer:customers(*),
      items:order_items(
        *,
        product:products(id, name, slug, images:product_images(image_url))
      )
    `)

  query = isUuid ? query.eq('id', orderIdOrNumber) : query.eq('order_number', orderIdOrNumber)

  const { data, error } = await query.single()
  if (error || !data) return null
  return data as Order
}

function adminRecipient(settings: Partial<SiteSettings> | null) {
  return process.env.ADMIN_NOTIFICATION_EMAIL || settings?.email || null
}

export async function sendWelcomeEmailSafe(userId: string, to: string | null | undefined, name?: string | null) {
  const settings = await getEmailSettings()
  await sendTransactionalEmail({
    to,
    subject: 'Bienvenue chez Bagnon Street',
    html: welcomeEmail(name, settings),
    replyTo: settings?.email || null,
    idempotencyKey: `welcome-${userId}`,
  })
}

export async function sendOrderCreatedEmailsSafe(orderIdOrNumber: string) {
  const [order, settings] = await Promise.all([
    getOrderForEmail(orderIdOrNumber),
    getEmailSettings(),
  ])
  if (!order) return

  await Promise.all([
    sendTransactionalEmail({
      to: order.customer?.email,
      subject: `Commande reçue - #${order.order_number}`,
      html: orderConfirmationEmail(order, settings),
      replyTo: settings?.email || null,
      idempotencyKey: `order-created-client-${order.id}`,
    }),
    sendTransactionalEmail({
      to: adminRecipient(settings),
      subject: `Nouvelle commande - #${order.order_number} - ${Number(order.total).toLocaleString('fr-FR')} FCFA`,
      html: adminNewOrderEmail(order, settings),
      replyTo: order.customer?.email || settings?.email || null,
      idempotencyKey: `order-created-admin-${order.id}`,
    }),
  ])
}

export async function sendPaymentConfirmedEmailSafe(orderId: string) {
  const [order, settings] = await Promise.all([
    getOrderForEmail(orderId),
    getEmailSettings(),
  ])
  if (!order) return

  await sendTransactionalEmail({
    to: order.customer?.email,
    subject: `Paiement confirmé - #${order.order_number}`,
    html: paymentConfirmedEmail(order, settings),
    replyTo: settings?.email || null,
    idempotencyKey: `payment-confirmed-${order.id}`,
  })
}

export async function sendOrderStatusEmailSafe(orderId: string, status: 'shipped' | 'delivered' | 'cancelled') {
  const [order, settings] = await Promise.all([
    getOrderForEmail(orderId),
    getEmailSettings(),
  ])
  if (!order) return

  await sendTransactionalEmail({
    to: order.customer?.email,
    subject: status === 'shipped'
      ? `Votre commande est en route - #${order.order_number}`
      : status === 'delivered'
        ? `Votre commande a été livrée - #${order.order_number}`
        : `Commande annulée - #${order.order_number}`,
    html: orderStatusEmail(order, status, settings),
    replyTo: settings?.email || null,
    idempotencyKey: `order-status-${status}-${order.id}`,
  })
}
