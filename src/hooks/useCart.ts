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
  maxStock?: number
}

export type CartActionResult = {
  success: boolean
  message: string
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product, quantity?: number, size?: string, color?: string, maxStock?: number) => CartActionResult
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => CartActionResult
  updateOptions: (id: string, options: { size?: string; color?: string }) => CartActionResult
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  total: () => number
  count: () => number
}

function cartItemKey(productId: string, size?: string, color?: string) {
  return `${productId}::${size || 'default'}::${color || 'default'}`
}

function stockLimit(product: Product, maxStock?: number) {
  const stock = maxStock ?? product.stock
  return typeof stock === 'number' && Number.isFinite(stock) ? Math.max(0, stock) : undefined
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (product, quantity = 1, size, color, maxStock) => {
        if (product.inStock === false) {
          return { success: false, message: 'Ce produit est en rupture de stock.' }
        }

        const requestedQuantity = Math.max(1, Math.floor(quantity))
        const limit = stockLimit(product, maxStock)
        if (limit !== undefined && limit <= 0) {
          return { success: false, message: 'Ce produit est en rupture de stock.' }
        }

        const items = get().items
        const key = cartItemKey(product.id, size, color)
        const existing = items.find(i => i.id === key)
        const nextQuantity = (existing?.quantity || 0) + requestedQuantity

        if (limit !== undefined && nextQuantity > limit) {
          return {
            success: false,
            message: limit === existing?.quantity
              ? 'Stock maximum deja dans le panier.'
              : `Stock limite a ${limit} article${limit > 1 ? 's' : ''}.`,
          }
        }

        if (existing) {
          set({ items: items.map(i => i.id === key ? { ...i, quantity: nextQuantity, maxStock: limit ?? i.maxStock } : i) })
        } else {
          set({ items: [...items, { id: key, product, quantity: requestedQuantity, size, color, maxStock: limit }] })
        }
        return { success: true, message: 'Produit ajoute au panier.' }
      },
      removeItem: (id) => set({ items: get().items.filter(i => i.id !== id) }),
      updateQuantity: (id, qty) => {
        const quantity = Math.floor(qty)
        if (quantity < 1) {
          get().removeItem(id)
          return { success: true, message: 'Produit retire du panier.' }
        }

        const item = get().items.find(i => i.id === id)
        if (!item) return { success: false, message: 'Article introuvable dans le panier.' }

        const limit = stockLimit(item.product, item.maxStock)
        if (limit !== undefined && quantity > limit) {
          return { success: false, message: `Stock limite a ${limit} article${limit > 1 ? 's' : ''}.` }
        }

        set({ items: get().items.map(i => i.id === id ? { ...i, quantity } : i) })
        return { success: true, message: 'Quantite mise a jour.' }
      },
      updateOptions: (id, options) => {
        const items = get().items
        const item = items.find(i => i.id === id)
        if (!item) return { success: false, message: 'Article introuvable dans le panier.' }

        const nextSize = options.size ?? item.size
        const nextColor = options.color ?? item.color
        const nextId = cartItemKey(item.product.id, nextSize, nextColor)
        const duplicate = items.find(i => i.id === nextId && i.id !== id)
        const sizeStock = item.product.sizes?.find(size => size.size === nextSize)?.stock
        const colorStock = item.product.colors?.find(color => color.color_name === nextColor)?.stock
        const stockCandidates = [
          item.product.stock,
          item.maxStock,
          ...(sizeStock !== undefined ? [sizeStock] : []),
          ...(colorStock !== undefined ? [colorStock] : []),
        ].filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
        const limit = stockCandidates.length ? Math.max(0, Math.min(...stockCandidates)) : undefined

        if (limit !== undefined && item.quantity > limit) {
          return { success: false, message: `Stock limite a ${limit} article${limit > 1 ? 's' : ''} pour cette option.` }
        }

        if (duplicate) {
          const nextQuantity = duplicate.quantity + item.quantity
          if (limit !== undefined && nextQuantity > limit) {
            return { success: false, message: `Stock limite a ${limit} article${limit > 1 ? 's' : ''} pour cette option.` }
          }

          set({
            items: items
              .filter(i => i.id !== id)
              .map(i => i.id === nextId ? { ...i, quantity: nextQuantity, maxStock: limit ?? i.maxStock } : i),
          })
        } else {
          set({
            items: items.map(i => i.id === id ? { ...i, id: nextId, size: nextSize, color: nextColor, maxStock: limit ?? i.maxStock } : i),
          })
        }

        return { success: true, message: 'Option mise a jour.' }
      },
      clearCart: () => set({ items: [] }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      total: () => get().items.reduce((s, i) => s + i.product.price * i.quantity, 0),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: 'bsc-cart', version: 2 }
  )
)
