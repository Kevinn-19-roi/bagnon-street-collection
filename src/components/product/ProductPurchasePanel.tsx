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
  const [justAdded, setJustAdded] = useState(false)

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

  function showError(nextMessage: string) {
    setMessage(nextMessage)
    setJustAdded(false)
  }

  function addToCart() {
    if (!product.inStock) {
      showError('Ce produit est en rupture de stock.')
      return
    }

    if (mustSelectSize && !selectedSize) {
      showError('Choisis une taille avant d’ajouter ce produit.')
      return
    }

    if (mustSelectColor && !selectedColor) {
      showError('Choisis une couleur avant d’ajouter ce produit.')
      return
    }

    if (!isAvailable) {
      showError('Cette option est indisponible.')
      return
    }

    const result = addItem(toCartProduct(product), 1, selectedSize || undefined, selectedColor || undefined, effectiveStock)
    setMessage(result.message)
    if (result.success) {
      setJustAdded(false)
      window.requestAnimationFrame(() => setJustAdded(true))
    } else {
      setJustAdded(false)
    }
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
        className={justAdded ? 'cart-add-button-pop' : undefined}
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

      {message && justAdded && (
        <div className="cart-confirmation" role="status" style={{ display: 'grid', gap: 12, background: 'var(--bg2)', border: '1px solid rgba(76,175,80,.35)', borderRadius: 6, padding: 14 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: '#4CAF50', letterSpacing: '.04em', textTransform: 'uppercase', lineHeight: 1.5 }}>
            ✓ Produit ajouté au panier
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                setMessage('')
                setJustAdded(false)
              }}
              style={{ border: '1px solid var(--border2)', borderRadius: 3, padding: '9px 12px', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text2)' }}
            >
              Continuer mes achats
            </button>
            <Link href="/panier" style={{ background: 'var(--btn)', color: 'var(--btn-t)', borderRadius: 3, padding: '9px 12px', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
              Voir le panier
            </Link>
          </div>
        </div>
      )}

      {message && !justAdded && (
        <p role="status" style={{ fontSize: 12, color: 'var(--red)', lineHeight: 1.6 }}>
          {message}
        </p>
      )}
    </div>
  )
}
