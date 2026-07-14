'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/lib/products'

export interface CartItem {
  id: string
  product: Product
  quantity: number
  size?: string
  color?: string
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product, quantity?: number, size?: string, color?: string) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  total: () => number
  count: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (product, quantity = 1, size, color) => {
        const items = get().items
        const key = `${product.id}-${size || 'default'}-${color || 'default'}`
        const existing = items.find(i => i.id === key)
        if (existing) {
          set({ items: items.map(i => i.id === key ? { ...i, quantity: i.quantity + quantity } : i) })
        } else {
          set({ items: [...items, { id: key, product, quantity, size, color }] })
        }
        set({ isOpen: true })
      },
      removeItem: (id) => set({ items: get().items.filter(i => i.id !== id) }),
      updateQuantity: (id, qty) => {
        if (qty < 1) { get().removeItem(id); return }
        set({ items: get().items.map(i => i.id === id ? { ...i, quantity: qty } : i) })
      },
      clearCart: () => set({ items: [] }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      total: () => get().items.reduce((s, i) => s + i.product.price * i.quantity, 0),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: 'bsc-cart' }
  )
)
