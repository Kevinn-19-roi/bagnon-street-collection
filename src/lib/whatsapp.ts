import type { Order } from '@/types/database'

export const ORDER_TRACKING_STEPS = [
  'Commande re\u00e7ue',
  'Exp\u00e9di\u00e9e',
  'Livr\u00e9e',
] as const

export const TRACKING_DONE_MARK = '\u2713'

export function cleanWhatsappNumber(value?: string | null) {
  return value?.replace(/[\s+\-()]/g, '') || ''
}

export function buildWhatsappUrl(phone: string | null | undefined, message: string) {
  const cleaned = cleanWhatsappNumber(phone)
  if (!cleaned) return null
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`
}

export function orderTrackingLabel(status: string) {
  if (status === 'shipped') return ORDER_TRACKING_STEPS[1]
  if (status === 'delivered') return ORDER_TRACKING_STEPS[2]
  return ORDER_TRACKING_STEPS[0]
}

export function paymentLabel(status: string) {
  if (status === 'paid') return 'Pay\u00e9'
  if (status === 'failed') return '\u00c9chou\u00e9'
  if (status === 'refunded') return 'Rembours\u00e9'
  return 'En attente'
}

function paymentMethodLabel(method: string) {
  if (method === 'wave') return 'Wave'
  if (method === 'orange_money') return 'Orange Money'
  if (method === 'cash') return 'Paiement \u00e0 la livraison'
  if (method === 'bank_transfer') return 'Virement bancaire'
  return method.replace('_', ' ')
}

function adminStatusMessage(order: Order) {
  if (order.payment_status !== 'paid') {
    return 'Votre paiement est en attente de v\u00e9rification. Nous vous confirmerons la commande apr\u00e8s contr\u00f4le.'
  }

  if (order.order_status === 'shipped') {
    return 'Votre commande a \u00e9t\u00e9 exp\u00e9di\u00e9e. Nous restons disponibles si vous avez besoin de pr\u00e9cisions.'
  }

  if (order.order_status === 'delivered') {
    return 'Votre commande est indiqu\u00e9e comme livr\u00e9e. Merci pour votre confiance.'
  }

  return 'Votre paiement est confirm\u00e9. Votre commande est bien re\u00e7ue et sera pr\u00e9par\u00e9e.'
}

export function buildClientOrderWhatsappMessage(order: Order) {
  const lines = [
    'Bonjour Bagnon Street Collection,',
    '',
    'Je viens de passer une commande.',
    '',
    `R\u00e9f\u00e9rence : ${order.order_number}`,
    order.customer?.fullname ? `Nom : ${order.customer.fullname}` : null,
    order.customer?.phone ? `T\u00e9l\u00e9phone : ${order.customer.phone}` : null,
    order.customer?.address ? `Adresse : ${order.customer.address}` : null,
    order.customer?.city ? `Commune / Ville : ${order.customer.city}` : null,
    '',
    'Produits :',
    ...(order.items || []).flatMap(item => [
      `- ${item.product?.name || 'Produit'}`,
      item.selected_size ? `  Taille : ${item.selected_size}` : null,
      item.selected_color ? `  Couleur : ${item.selected_color}` : null,
      `  Quantit\u00e9 : ${item.quantity}`,
      `  Prix : ${Number(item.price).toLocaleString('fr-FR')} FCFA`,
    ].filter(Boolean) as string[]),
    '',
    `Total : ${Number(order.total).toLocaleString('fr-FR')} FCFA`,
    `Moyen de paiement : ${paymentMethodLabel(order.payment_method)}`,
    `Paiement : ${paymentLabel(order.payment_status)}`,
    `Suivi : ${orderTrackingLabel(order.order_status)}`,
    '',
    'Merci.',
  ]

  return lines.filter(line => line !== null).join('\n')
}

export function buildAdminCustomerWhatsappMessage(order: Order) {
  const status = orderTrackingLabel(order.order_status)
  const payment = paymentLabel(order.payment_status)
  const greeting = order.customer?.fullname
    ? `Bonjour ${order.customer.fullname},`
    : 'Bonjour,'

  return [
    greeting,
    '',
    `Nous vous contactons concernant votre commande ${order.order_number} chez Bagnon Street Collection.`,
    '',
    `Statut actuel : ${status}`,
    `Paiement : ${payment}`,
    `Montant : ${Number(order.total).toLocaleString('fr-FR')} FCFA.`,
    '',
    adminStatusMessage(order),
  ].join('\n')
}
