'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import type { Product } from '@/lib/products'
import type { ProductDetailViewModel } from '@/components/product/product-view-model'
import ProductOptionSelector from '@/components/product/ProductOptionSelector'

type ProductPurchasePanelProps = {
  product: ProductDetailViewModel
}

function toCartProduct(product: ProductDetailViewModel): Product {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.shortDescription || product.description,
    short_description: product.shortDescription,
    price: product.price,
    compareAt: product.oldPrice || undefined,
    old_price: product.oldPrice,
    discount: product.discount,
    category: product.category || '',
    stock: product.stock,
    images: product.images,
    featured: false,
    inStock: product.inStock,
    isNew: false,
    tags: [],
  }
}

export default function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const addItem = useCart(state => state.addItem)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [message, setMessage] = useState('')

  const sizeOptions = product.sizes.filter(size => size.value.trim())
  const colorOptions = product.colors.filter(color => color.value.trim())
  const mustSelectSize = sizeOptions.length > 0
  const mustSelectColor = colorOptions.length > 1

  const selectedSizeStock = sizeOptions.find(size => size.value === selectedSize)?.stock
  const selectedColorStock = colorOptions.find(color => color.value === selectedColor)?.stock

  const effectiveStock = useMemo(() => {
    const stocks = [
      product.stock,
      ...(selectedSizeStock !== undefined ? [selectedSizeStock] : []),
      ...(selectedColorStock !== undefined ? [selectedColorStock] : []),
    ]

    return Math.min(...stocks)
  }, [product.stock, selectedColorStock, selectedSizeStock])

  const isAvailable = product.inStock && effectiveStock > 0

  function addToCart() {
    if (!product.inStock) {
      setMessage('Ce produit est en rupture de stock.')
      return
    }

    if (mustSelectSize && !selectedSize) {
      setMessage('Choisis une taille avant d’ajouter ce produit.')
      return
    }

    if (mustSelectColor && !selectedColor) {
      setMessage('Choisis une couleur avant d’ajouter ce produit.')
      return
    }

    if (!isAvailable) {
      setMessage('Cette option est indisponible.')
      return
    }

    const result = addItem(toCartProduct(product), 1, selectedSize || undefined, selectedColor || undefined, effectiveStock)
    setMessage(result.message)
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {mustSelectSize && (
        <ProductOptionSelector
          label="Taille"
          name="size"
          options={sizeOptions}
          required
          value={selectedSize}
          onChange={setSelectedSize}
        />
      )}

      {mustSelectColor && (
        <ProductOptionSelector
          label="Couleur"
          name="color"
          options={colorOptions}
          required
          value={selectedColor}
          onChange={setSelectedColor}
        />
      )}

      <button
        type="button"
        onClick={addToCart}
        disabled={!product.inStock}
        style={{
          width: '100%',
          minHeight: 52,
          background: product.inStock ? 'var(--btn)' : 'var(--bg3)',
          color: product.inStock ? 'var(--btn-t)' : 'var(--text3)',
          borderRadius: 4,
          padding: '14px 18px',
          fontFamily: 'var(--font-display)',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          cursor: product.inStock ? 'pointer' : 'not-allowed',
        }}
      >
        {product.inStock ? 'Ajouter au panier' : 'Rupture de stock'}
      </button>

      {message && (
        <div role="status" style={{ display: 'grid', gap: 8 }}>
          <p style={{ fontSize: 12, color: message.includes('ajoute') || message.includes('ajouté') ? '#4CAF50' : 'var(--red)', lineHeight: 1.6 }}>
            {message}
          </p>
          {(message.includes('ajoute') || message.includes('ajouté')) && (
            <Link href="/panier" style={{ width: 'fit-content', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text2)', borderBottom: '1px solid var(--border2)', paddingBottom: 2 }}>
              Voir le panier
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
