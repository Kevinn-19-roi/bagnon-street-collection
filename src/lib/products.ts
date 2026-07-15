// This file kept for CATEGORIES only (used in mobile nav filter)
// All product data now comes from Supabase

export const CATEGORIES = [
  { id: 'all', label: 'Tout voir' },
  { id: 'tshirts', label: 'T-shirts' },
  { id: 'hoodies', label: 'Hoodies' },
  { id: 'bas', label: 'Bas' },
  { id: 'sacs', label: 'Sacs' },
]

// Legacy type kept for compatibility
export interface Product {
  id: string
  slug: string
  name: string
  description: string
  short_description?: string
  price: number
  compareAt?: number
  old_price?: number | null
  discount: number
  category: string
  category_id?: string
  stock?: number
  images: string[]
  featured: boolean
  inStock: boolean
  isNew: boolean
  new_arrival?: boolean
  on_sale?: boolean
  active?: boolean
  sizes?: Array<{ size: string; stock: number }>
  colors?: Array<{ color_name: string; color_hex?: string | null; stock: number }>
  tags: string[]
}
