export const OUTSIDE_ABIDJAN_DELIVERY_VALUE = 'outside-abidjan'

export type DeliveryZone = {
  id: string
  name: string
  slug: string
  price: number
  active: boolean
  display_order: number
}

export type DeliverySelection = {
  type: 'local' | 'outside'
  zoneId: string | null
  label: string
  destination: string
  price: number
}

export function normalizeDeliverySlug(value?: string | null) {
  return (value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function findDeliveryZone(zones: DeliveryZone[], value?: string | null) {
  const normalized = normalizeDeliverySlug(value)
  if (!normalized) return null

  return zones.find(zone => (
    zone.id === value ||
    zone.slug === normalized ||
    normalizeDeliverySlug(zone.name) === normalized
  )) || null
}

export function resolveDeliverySelection(input: {
  zones: DeliveryZone[]
  deliveryArea?: string | null
  outsideCity?: string | null
  outsideShippingCost: number
}) {
  const localZone = findDeliveryZone(input.zones, input.deliveryArea)
  if (localZone) {
    return {
      type: 'local',
      zoneId: localZone.id,
      label: localZone.name,
      destination: localZone.name,
      price: Number(localZone.price),
    } satisfies DeliverySelection
  }

  return {
    type: 'outside',
    zoneId: null,
    label: 'Hors Abidjan et alentours / Expédition',
    destination: input.outsideCity?.trim() || '',
    price: Number(input.outsideShippingCost || 0),
  } satisfies DeliverySelection
}

export function resolveShippingCost(input: {
  subtotal: number
  freeShippingFrom?: number
  zones: DeliveryZone[]
  deliveryArea?: string | null
  outsideCity?: string | null
  outsideShippingCost: number
}) {
  if (input.freeShippingFrom && input.freeShippingFrom > 0 && input.subtotal >= input.freeShippingFrom) {
    return 0
  }

  return resolveDeliverySelection(input).price
}
