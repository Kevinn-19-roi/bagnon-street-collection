import type { Product } from '@/types/database'

export type ProductDetailViewModel = {
  id: string
  slug: string
  name: string
  description: string
  shortDescription: string
  price: number
  oldPrice: number | null
  stock: number
  inStock: boolean
  images: string[]
  category: string | null
  collection: string | null
  sizes: Array<{ label: string; value: string; stock: number }>
  colors: Array<{ label: string; value: string; stock: number; colorHex: string }>
  discount: number
}

export function toProductDetailViewModel(product: Product): ProductDetailViewModel {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description || '',
    shortDescription: product.short_description || '',
    price: product.price,
    oldPrice: product.old_price,
    stock: product.stock,
    inStock: product.stock > 0,
    images: [...(product.images || [])]
      .sort((a, b) => a.display_order - b.display_order)
      .map(image => image.image_url),
    category: product.category?.name || null,
    collection: product.collection?.name || null,
    sizes: (product.sizes || []).map(size => ({
      label: size.size,
      value: size.size,
      stock: size.stock,
    })),
    colors: (product.colors || []).map(color => ({
      label: color.color_name,
      value: color.color_name,
      stock: color.stock,
      colorHex: color.color_hex,
    })),
    discount: product.old_price ? Math.max(0, Math.round((1 - product.price / product.old_price) * 100)) : 0,
  }
}
