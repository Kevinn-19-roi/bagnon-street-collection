export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim()
}

export function generateSKU(name: string, category: string): string {
  const prefix = category.slice(0, 3).toUpperCase()
  const base = name.replace(/\s+/g, '').slice(0, 4).toUpperCase()
  const random = Math.floor(Math.random() * 9000 + 1000)
  return `${prefix}-${base}-${random}`
}

export function formatPrice(amount: number, currency = 'FCFA'): string {
  return `${amount.toLocaleString('fr-FR')} ${currency}`
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
