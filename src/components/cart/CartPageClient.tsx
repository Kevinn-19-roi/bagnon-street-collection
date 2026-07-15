'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/hooks/useCart'

function formatPrice(value: number) {
  return `${value.toLocaleString('fr-FR')} FCFA`
}

function firstImage(images?: string[]) {
  return images?.[0] || null
}

export default function CartPageClient() {
  const { items, removeItem, updateQuantity, updateOptions, clearCart, total, count } = useCart()
  const [message, setMessage] = useState('')
  const subtotal = total()
  const itemCount = count()

  function changeQuantity(itemId: string, quantity: number) {
    const result = updateQuantity(itemId, quantity)
    setMessage(result.message)
  }

  if (items.length === 0) {
    return (
      <section style={{ minHeight: '58vh', display: 'grid', placeItems: 'center', padding: '64px var(--px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 430 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 12 }}>
            Panier
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px,7vw,50px)', lineHeight: 1, marginBottom: 14 }}>
            Ton panier est vide
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
            Ajoute une piece depuis la boutique, elle restera ici meme apres fermeture du navigateur.
          </p>
          <Link href="/#collection" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--btn)', color: 'var(--btn-t)', borderRadius: 3, padding: '13px 22px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
            Decouvrir la boutique
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section style={{ padding: 'clamp(28px,6vw,64px) var(--px) clamp(80px,10vw,110px)' }}>
      <div className="cart-page-grid" style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(300px,360px)', gap: 'clamp(22px,4vw,42px)', alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'end', marginBottom: 18 }}>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 8 }}>
                Panier
              </p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px,6vw,56px)', lineHeight: 1, letterSpacing: '-.03em' }}>
                {itemCount} article{itemCount > 1 ? 's' : ''}
              </h1>
            </div>
            <button
              type="button"
              onClick={() => {
                clearCart()
                setMessage('Panier vide.')
              }}
              style={{ color: 'var(--text3)', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', padding: '8px 0' }}
            >
              Vider
            </button>
          </div>

          {message && (
            <p role="status" style={{ marginBottom: 14, color: message.includes('limite') || message.includes('maximum') ? 'var(--red)' : '#4CAF50', fontFamily: 'var(--font-display)', fontSize: 12 }}>
              {message}
            </p>
          )}

          <div style={{ display: 'grid', gap: 12 }}>
            {items.map(item => {
              const image = firstImage(item.product.images)
              const maxStock = item.maxStock ?? item.product.stock
              const sizeOptions = item.product.sizes || []
              const colorOptions = item.product.colors || []
              const needsSize = sizeOptions.length > 0 && !item.size
              const needsColor = colorOptions.length > 1 && !item.color

              return (
                <article key={item.id} style={{ display: 'grid', gridTemplateColumns: '88px minmax(0,1fr)', gap: 14, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 6, padding: 12 }}>
                  <Link href={`/produit/${item.product.slug}`} prefetch={false} style={{ position: 'relative', width: 88, height: 110, borderRadius: 4, overflow: 'hidden', background: 'var(--bg3)' }}>
                    {image ? (
                      <Image src={image} alt={item.product.name} fill sizes="88px" style={{ objectFit: 'cover' }} />
                    ) : (
                      <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontSize: 16, color: 'rgba(128,128,128,.2)' }}>BSC</span>
                    )}
                  </Link>

                  <div style={{ minWidth: 0, display: 'grid', gap: 9 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ minWidth: 0 }}>
                        <Link href={`/produit/${item.product.slug}`} prefetch={false}>
                          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, lineHeight: 1.3, marginBottom: 4 }}>{item.product.name}</h2>
                        </Link>
                        {(item.size || item.color) && !needsSize && !needsColor && (
                          <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
                            {[item.size ? `Taille ${item.size}` : null, item.color || null].filter(Boolean).join(' · ')}
                          </p>
                        )}
                        {(needsSize || needsColor) && (
                          <div style={{ display: 'grid', gap: 7, marginTop: 4 }}>
                            <p style={{ fontSize: 12, color: 'var(--red)', lineHeight: 1.5 }}>
                              {[needsSize ? 'Taille a selectionner' : null, needsColor ? 'Couleur a selectionner' : null].filter(Boolean).join(' · ')}
                            </p>
                            {needsSize && (
                              <label style={{ display: 'grid', gap: 5, fontSize: 11, color: 'var(--red)' }}>
                                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Taille</span>
                                <select
                                  value=""
                                  onChange={event => {
                                    const result = updateOptions(item.id, { size: event.target.value })
                                    setMessage(result.message)
                                  }}
                                  style={{ width: 'min(100%, 220px)', background: 'var(--bg2)', border: '1px solid rgba(122,22,32,.35)', borderRadius: 4, padding: '9px 10px', color: 'var(--text)' }}
                                >
                                  <option value="">Choisir une taille</option>
                                  {sizeOptions.map(size => <option key={size.size} value={size.size}>{size.size}</option>)}
                                </select>
                              </label>
                            )}
                            {needsColor && (
                              <label style={{ display: 'grid', gap: 5, fontSize: 11, color: 'var(--red)' }}>
                                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Couleur</span>
                                <select
                                  value=""
                                  onChange={event => {
                                    const result = updateOptions(item.id, { color: event.target.value })
                                    setMessage(result.message)
                                  }}
                                  style={{ width: 'min(100%, 220px)', background: 'var(--bg2)', border: '1px solid rgba(122,22,32,.35)', borderRadius: 4, padding: '9px 10px', color: 'var(--text)' }}
                                >
                                  <option value="">Choisir une couleur</option>
                                  {colorOptions.map(color => <option key={color.color_name} value={color.color_name}>{color.color_name}</option>)}
                                </select>
                              </label>
                            )}
                          </div>
                        )}
                        {typeof maxStock === 'number' && (
                          <p style={{ fontSize: 11, color: maxStock <= 3 ? 'var(--red)' : 'var(--text3)', marginTop: 3 }}>
                            Stock disponible : {maxStock}
                          </p>
                        )}
                      </div>
                      <strong style={{ fontFamily: 'var(--font-display)', fontSize: 14, whiteSpace: 'nowrap' }}>{formatPrice(item.product.price * item.quantity)}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border2)', borderRadius: 4, overflow: 'hidden' }}>
                        <button type="button" onClick={() => changeQuantity(item.id, item.quantity - 1)} aria-label="Diminuer la quantite" style={{ width: 34, height: 34, display: 'grid', placeItems: 'center', color: 'var(--text2)' }}>-</button>
                        <input
                          aria-label={`Quantite de ${item.product.name}`}
                          type="number"
                          min={1}
                          max={maxStock}
                          value={item.quantity}
                          onChange={event => changeQuantity(item.id, Number(event.target.value))}
                          style={{ width: 48, height: 34, textAlign: 'center', background: 'transparent', color: 'var(--text)', border: '0', borderInline: '1px solid var(--border)', fontFamily: 'var(--font-display)', fontSize: 13, outline: 'none' }}
                        />
                        <button type="button" onClick={() => changeQuantity(item.id, item.quantity + 1)} aria-label="Augmenter la quantite" style={{ width: 34, height: 34, display: 'grid', placeItems: 'center', color: 'var(--text2)' }}>+</button>
                      </div>

                      <button type="button" onClick={() => removeItem(item.id)} style={{ color: 'var(--text3)', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase' }}>
                        Supprimer
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <aside style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: 18, position: 'sticky', top: 82 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 16 }}>
            Resume
          </p>
          <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: 'var(--text2)', fontSize: 13 }}>
              <span>Sous-total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: 'var(--text2)', fontSize: 13 }}>
              <span>Livraison</span>
              <span>Au checkout</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Total provisoire</span>
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: 17 }}>{formatPrice(subtotal)}</strong>
            </div>
          </div>
          <Link href="/checkout" style={{ width: '100%', display: 'inline-flex', justifyContent: 'center', background: 'var(--btn)', color: 'var(--btn-t)', borderRadius: 3, padding: '14px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            Continuer vers le checkout
          </Link>
          <Link href="/#collection" style={{ width: '100%', display: 'inline-flex', justifyContent: 'center', border: '1px solid var(--border2)', borderRadius: 3, padding: '12px', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>
            Continuer mes achats
          </Link>
          <p style={{ marginTop: 12, color: 'var(--text3)', fontSize: 11, lineHeight: 1.6 }}>
            Les informations de livraison et de paiement seront confirmees au checkout.
          </p>
        </aside>
      </div>
    </section>
  )
}

