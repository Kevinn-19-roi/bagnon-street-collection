// ============================================================
// BAGNON STREET COLLECTION — Database Types (TypeScript strict)
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// ─── ENUMS ──────────────────────────────────────────────────

export type AdminRole = 'super_admin' | 'admin' | 'editor'

export type OrderStatus =
  | 'pending'      // En attente
  | 'confirmed'    // Confirmée
  | 'preparing'    // Préparation
  | 'shipped'      // Expédiée
  | 'delivered'    // Livrée
  | 'cancelled'    // Annulée

export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded'

export type PaymentMethod = 'wave' | 'orange_money' | 'cash' | 'bank_transfer'

// ─── TABLE TYPES ────────────────────────────────────────────

export interface Admin {
  id: string
  fullname: string
  email: string
  role: AdminRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  image: string | null
  description: string | null
  active: boolean
  display_order: number
  created_at: string
}

export interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  active: boolean
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  sku: string
  description: string | null
  short_description: string | null
  category_id: string
  collection_id: string | null
  price: number
  old_price: number | null
  stock: number
  featured: boolean
  new_arrival: boolean
  on_sale: boolean
  active: boolean
  weight: number | null
  material: string | null
  care_instructions: string | null
  created_at: string
  updated_at: string
  // Relations (joined)
  category?: Category
  collection?: Collection
  images?: ProductImage[]
  sizes?: ProductSize[]
  colors?: ProductColor[]
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  display_order: number
  created_at: string
}

export interface ProductSize {
  id: string
  product_id: string
  size: string
  stock: number
}

export interface ProductColor {
  id: string
  product_id: string
  color_name: string
  color_hex: string
  stock: number
}

export interface Customer {
  id: string
  fullname: string
  phone: string
  email: string | null
  address: string | null
  city: string | null
  country: string
  created_at: string
}

export interface Order {
  id: string
  customer_id: string
  order_number: string
  subtotal: number
  shipping_cost: number
  total: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  order_status: OrderStatus
  notes: string | null
  created_at: string
  updated_at: string
  // Relations
  customer?: Customer
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  selected_size: string | null
  selected_color: string | null
  price: number
  // Relations
  product?: Product
}

export interface SiteSettings {
  id: string
  whatsapp: string | null
  facebook: string | null
  instagram: string | null
  tiktok: string | null
  address: string | null
  email: string | null
  phone: string | null
  shipping_cost: number
  free_shipping_from: number
  logo_url: string | null
  favicon_url: string | null
  hero_image_url: string | null
  hero_eyebrow: string | null
  hero_title: string | null
  hero_title_accent: string | null
  hero_description: string | null
  hero_button_text: string | null
  hero_button_link: string | null
  updated_at: string
}

// ─── API RESPONSE TYPES ─────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

// ─── FORM TYPES ─────────────────────────────────────────────

export interface ProductFormData {
  name: string
  slug: string
  sku: string
  description: string
  short_description: string
  category_id: string
  collection_id: string
  price: number
  old_price: number | null
  stock: number
  featured: boolean
  new_arrival: boolean
  on_sale: boolean
  active: boolean
  weight: number | null
  material: string
  care_instructions: string
}

export interface OrderFilters {
  status?: OrderStatus
  payment_status?: PaymentStatus
  from_date?: string
  to_date?: string
  search?: string
  page?: number
  per_page?: number
}

export interface ProductFilters {
  category_id?: string
  collection_id?: string
  featured?: boolean
  active?: boolean
  search?: string
  page?: number
  per_page?: number
}
