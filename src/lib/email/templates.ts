import type { Order, OrderItem, SiteSettings } from '@/types/database'
import { formatPrice, formatDate } from '@/lib/helpers/slugify'
import { orderTrackingLabel, paymentLabel } from '@/lib/whatsapp'

const SITE_URL = 'https://bagnon-street.com'

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function button(label: string, href: string) {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:#7A1620;color:#ffffff;text-decoration:none;padding:13px 18px;border-radius:4px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;font-size:12px">${escapeHtml(label)}</a>`
}

function layout({ preview, title, children, settings }: { preview: string; title: string; children: string; settings?: Partial<SiteSettings> | null }) {
  const contact = settings?.email ? `<a href="mailto:${escapeHtml(settings.email)}" style="color:#7A1620;text-decoration:none">${escapeHtml(settings.email)}</a>` : 'bagnon-street.com'
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;background:#f4f1ec;color:#111217;font-family:Arial,Helvetica,sans-serif">
    <div style="display:none;max-height:0;overflow:hidden">${escapeHtml(preview)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f1ec;padding:24px 12px">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e7ded7;border-radius:10px;overflow:hidden">
            <tr>
              <td style="background:#111217;color:#ffffff;padding:22px 24px">
                <p style="margin:0;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#d6c4b2">Bagnon Street Collection</p>
                <h1 style="margin:8px 0 0;font-size:24px;line-height:1.15">${escapeHtml(title)}</h1>
              </td>
            </tr>
            <tr><td style="padding:24px">${children}</td></tr>
            <tr>
              <td style="border-top:1px solid #eee6df;padding:18px 24px;color:#6f6a66;font-size:12px;line-height:1.6">
                <p style="margin:0 0 6px">Bagnon Street Collection, Abidjan</p>
                <p style="margin:0">Contact : ${contact}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function orderItems(items?: OrderItem[]) {
  if (!items?.length) return '<p style="margin:0;color:#6f6a66">Aucun article renseigné.</p>'

  return items.map(item => {
    const productName = item.product?.name || 'Produit'
    const variants = [
      item.selected_size ? `Taille : ${escapeHtml(item.selected_size)}` : null,
      item.selected_color ? `Couleur : ${escapeHtml(item.selected_color)}` : null,
    ].filter(Boolean).join(' · ')

    return `<tr>
      <td style="padding:12px 0;border-bottom:1px solid #eee6df">
        <strong>${escapeHtml(productName)}</strong>
        ${variants ? `<br><span style="color:#6f6a66;font-size:12px">${variants}</span>` : ''}
        <br><span style="color:#6f6a66;font-size:12px">Quantité : ${item.quantity}</span>
      </td>
      <td align="right" style="padding:12px 0;border-bottom:1px solid #eee6df;white-space:nowrap">${formatPrice(Number(item.price) * item.quantity)}</td>
    </tr>`
  }).join('')
}

function orderSummary(order: Order) {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:16px 0">
    ${orderItems(order.items)}
    <tr><td style="padding:12px 0;color:#6f6a66">Livraison</td><td align="right" style="padding:12px 0">${Number(order.shipping_cost) === 0 ? 'Offerte' : formatPrice(order.shipping_cost)}</td></tr>
    <tr><td style="padding:14px 0;border-top:2px solid #111217"><strong>Total</strong></td><td align="right" style="padding:14px 0;border-top:2px solid #111217"><strong>${formatPrice(order.total)}</strong></td></tr>
  </table>`
}

export function welcomeEmail(name?: string | null, settings?: Partial<SiteSettings> | null) {
  const displayName = name?.trim() || 'Bienvenue'
  return layout({
    title: 'Bienvenue chez Bagnon Street',
    preview: 'Ton compte Bagnon Street est prêt.',
    settings,
    children: `
      <p style="font-size:15px;line-height:1.7;margin:0 0 16px">Bonjour ${escapeHtml(displayName)},</p>
      <p style="font-size:15px;line-height:1.7;margin:0 0 20px">Ton compte Bagnon Street Collection est prêt. Tu peux maintenant suivre tes commandes plus facilement.</p>
      ${button('Découvrir la boutique', SITE_URL)}
    `,
  })
}

export function orderConfirmationEmail(order: Order, settings?: Partial<SiteSettings> | null) {
  return layout({
    title: `Commande reçue - #${order.order_number}`,
    preview: `Commande ${order.order_number} reçue.`,
    settings,
    children: `
      <p style="font-size:15px;line-height:1.7;margin:0 0 10px">Bonjour ${escapeHtml(order.customer?.fullname || '')},</p>
      <p style="font-size:15px;line-height:1.7;margin:0 0 16px">Nous avons bien reçu ta commande du ${escapeHtml(formatDate(order.created_at))}.</p>
      ${orderSummary(order)}
      <p style="font-size:13px;color:#6f6a66;line-height:1.7">Téléphone : ${escapeHtml(order.customer?.phone || '-')}<br>Adresse : ${escapeHtml([order.customer?.address, order.customer?.city].filter(Boolean).join(', ') || '-')}<br>Paiement : ${escapeHtml(paymentLabel(order.payment_status))}</p>
      ${button('Voir ma commande', `${SITE_URL}/commande/${order.order_number}`)}
    `,
  })
}

export function adminNewOrderEmail(order: Order, settings?: Partial<SiteSettings> | null) {
  return layout({
    title: `Nouvelle commande - #${order.order_number}`,
    preview: `${formatPrice(order.total)} - ${order.customer?.fullname || 'Client'}`,
    settings,
    children: `
      <p style="font-size:15px;line-height:1.7;margin:0 0 16px">Une nouvelle commande valide vient d'être créée. Cet email ne confirme pas le paiement.</p>
      <p style="font-size:13px;color:#6f6a66;line-height:1.7">Client : ${escapeHtml(order.customer?.fullname || '-')}<br>Téléphone : ${escapeHtml(order.customer?.phone || '-')}<br>Email : ${escapeHtml(order.customer?.email || '-')}<br>Adresse : ${escapeHtml([order.customer?.address, order.customer?.city].filter(Boolean).join(', ') || '-')}<br>Statut : ${escapeHtml(orderTrackingLabel(order.order_status))} / ${escapeHtml(paymentLabel(order.payment_status))}</p>
      ${orderSummary(order)}
      ${button("Ouvrir dans l'admin", `${SITE_URL}/admin/commandes/${order.id}`)}
    `,
  })
}

export function paymentConfirmedEmail(order: Order, settings?: Partial<SiteSettings> | null) {
  return layout({
    title: `Paiement confirmé - #${order.order_number}`,
    preview: `Paiement confirmé pour ${order.order_number}.`,
    settings,
    children: `
      <p style="font-size:15px;line-height:1.7;margin:0 0 16px">Ton paiement de ${escapeHtml(formatPrice(order.total))} a été confirmé. Ta commande est maintenant prise en charge.</p>
      <p style="font-size:13px;color:#6f6a66;line-height:1.7">Statut : Commande reçue</p>
      ${button('Suivre ma commande', `${SITE_URL}/commande/${order.order_number}`)}
    `,
  })
}

export function orderStatusEmail(order: Order, status: 'shipped' | 'delivered' | 'cancelled', settings?: Partial<SiteSettings> | null) {
  const title = status === 'shipped'
    ? `Votre commande est en route - #${order.order_number}`
    : status === 'delivered'
      ? `Votre commande a été livrée - #${order.order_number}`
      : `Commande annulée - #${order.order_number}`

  const message = status === 'shipped'
    ? 'Ta commande est en route.'
    : status === 'delivered'
      ? 'Ta commande est indiquée comme livrée. Merci pour ta confiance.'
      : order.payment_status === 'paid'
        ? "Ta commande a été annulée. Aucun remboursement externe n'est confirmé automatiquement par cet email."
        : 'Ta commande a été annulée.'

  return layout({
    title,
    preview: message,
    settings,
    children: `
      <p style="font-size:15px;line-height:1.7;margin:0 0 16px">${escapeHtml(message)}</p>
      ${orderSummary(order)}
      ${button('Voir le suivi', `${SITE_URL}/commande/${order.order_number}`)}
    `,
  })
}

export function resetPasswordSupabaseTemplate() {
  return `<!doctype html>
<html lang="fr">
  <body style="margin:0;background:#f4f1ec;font-family:Arial,Helvetica,sans-serif;color:#111217">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border-radius:10px;overflow:hidden">
          <tr><td style="background:#111217;color:#fff;padding:22px 24px"><p style="margin:0;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#d6c4b2">Bagnon Street Collection</p><h1 style="margin:8px 0 0;font-size:24px">Réinitialisation du mot de passe</h1></td></tr>
          <tr><td style="padding:24px"><p>Tu as demandé à réinitialiser ton mot de passe.</p><p><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#7A1620;color:#fff;text-decoration:none;padding:13px 18px;border-radius:4px;font-weight:700">Créer un nouveau mot de passe</a></p><p style="color:#6f6a66;font-size:13px">Si tu n'es pas à l'origine de cette demande, ignore cet email.</p></td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`
}
