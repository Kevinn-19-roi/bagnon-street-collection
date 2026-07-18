import { generateSlug } from '@/lib/helpers/slugify'

type ProductLinkSource = {
  slug?: string | null
  name?: string | null
  id?: string | null
}

export function canonicalProductSlug(product: ProductLinkSource) {
  return generateSlug(product.slug || product.name || product.id || '')
}

export function productPath(product: ProductLinkSource) {
  const slug = canonicalProductSlug(product)
  return slug ? `/produit/${slug}` : '/#collection'
}
