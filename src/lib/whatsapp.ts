import type { Order } from '@/types/database'

export function cleanWhatsappNumber(value?: string | null) {
  return value?.replace(/[\s+\-()]/g, '') || ''
}

export function buildWhatsappUrl(phone: string | null | undefined, message: string) {
  const cleaned = cleanWhatsappNumber(phone)
  if (!cleaned) return null
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`
}

export function orderTrackingLabel(status: string) {
  if (status === 'shipped') return 'Expediee'
  if (status === 'delivered') return 'Livree'
  return 'Commande recue'
}

export function paymentLabel(status: string) {
  if (status === 'paid') return 'Paye'
  if (status === 'failed') return 'Echoue'
  if (status === 'refunded') return 'Rembourse'
  return 'En attente'
}

export function buildClientOrderWhatsappMessage(order: Order) {
  const lines = [
    'Bonjour Bagnon Street Collection,',
    '',
    'Je viens de passer une commande.',
    '',
    `Reference : ${order.order_number}`,
    order.customer?.fullname ? `Nom : ${order.customer.fullname}` : null,
    order.customer?.phone ? `Telephone : ${order.customer.phone}` : null,
    order.customer?.address ? `Adresse : ${order.customer.address}` : null,
    order.customer?.city ? `Commune / Ville : ${order.customer.city}` : null,
    '',
    'Produits :',
    ...(order.items || []).flatMap(item => [
      `- ${item.product?.name || 'Produit'}`,
      item.selected_size ? `  Taille : ${item.selected_size}` : null,
      item.selected_color ? `  Couleur : ${item.selected_color}` : null,
      `  Quantite : ${item.quantity}`,
      `  Prix : ${Number(item.price).toLocaleString('fr-FR')} FCFA`,
    ].filter(Boolean) as string[]),
    '',
    `Total : ${Number(order.total).toLocaleString('fr-FR')} FCFA`,
    `Paiement : ${order.payment_method === 'wave' ? 'Wave' : order.payment_method.replace('_', ' ')}`,
    `Statut : ${order.payment_status === 'paid' ? 'Paiement verifie' : 'En attente de verification'}`,
    '',
    'Merci.',
  ]

  return lines.filter(line => line !== null).join('\n')
}

export function buildAdminCustomerWhatsappMessage(order: Order) {
  const status = orderTrackingLabel(order.order_status)
  const payment = paymentLabel(order.payment_status)

  return [
    `Bonjour ${order.customer?.fullname || ''},`.trim(),
    '',
    `Nous vous contactons concernant votre commande ${order.order_number} chez Bagnon Street Collection.`,
    '',
    `Statut actuel : ${status}`,
    `Paiement : ${payment}`,
    `Montant : ${Number(order.total).toLocaleString('fr-FR')} FCFA.`,
  ].join('\n')
}
