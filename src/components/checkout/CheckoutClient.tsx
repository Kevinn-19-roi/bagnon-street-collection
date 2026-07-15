'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createCheckoutOrder } from '@/lib/actions/checkout'
import { useCart } from '@/hooks/useCart'
import type { PaymentMethod } from '@/types/database'

type CheckoutPrefill = {
  firstName: string
  lastName: string
  phone: string
  email: string
  city: string
  address: string
}

type CheckoutClientProps = {
  prefill: CheckoutPrefill
  shippingCost: number
  freeShippingFrom: number
}

function formatPrice(value: number) {
  return `${value.toLocaleString('fr-FR')} FCFA`
}

function splitVariant(size?: string, color?: string) {
  return [size ? `Taille ${size}` : null, color || null].filter(Boolean).join(' · ')
}

export default function CheckoutClient({ prefill, shippingCost, freeShippingFrom }: CheckoutClientProps) {
  const router = useRouter()
  const { items, total, clearCart, updateOptions } = useCart()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave')
  const formRef = useRef<HTMLFormElement>(null)
  const errorRef = useRef<HTMLParagraphElement>(null)
  const subtotal = total()
  const effectiveShipping = freeShippingFrom > 0 && subtotal >= freeShippingFrom ? 0 : shippingCost
  const grandTotal = subtotal + effectiveShipping

  const checkoutItems = useMemo(() => items.map(item => ({
    productId: item.product.id,
    quantity: item.quantity,
    size: item.size || null,
    color: item.color || null,
  })), [items])

  const missingVariantItem = items.find(item => {
    const needsSize = (item.product.sizes || []).length > 0 && !item.size
    const needsColor = (item.product.colors || []).length > 1 && !item.color
    return needsSize || needsColor
  })

  useEffect(() => {
    if (!error) return

    window.requestAnimationFrame(() => {
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      const target = formRef.current?.querySelector<HTMLElement>('[data-checkout-error="true"], input:invalid, select:invalid, textarea:invalid')
      target?.focus()
    })
  }, [error])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    if (items.length === 0) {
      router.push('/panier')
      return
    }

    if (missingVariantItem) {
      const needsSize = (missingVariantItem.product.sizes || []).length > 0 && !missingVariantItem.size
      const needsColor = (missingVariantItem.product.colors || []).length > 1 && !missingVariantItem.color
      setError(`${missingVariantItem.product.name} : ${[needsSize ? 'choisis une taille' : null, needsColor ? 'choisis une couleur' : null].filter(Boolean).join(' et ')}.`)
      return
    }

    setSubmitting(true)
    setError('')

    const formData = new FormData(event.currentTarget)
    const result = await createCheckoutOrder({
      firstName: String(formData.get('firstName') || ''),
      lastName: String(formData.get('lastName') || ''),
      phone: String(formData.get('phone') || ''),
      email: String(formData.get('email') || ''),
      city: String(formData.get('city') || ''),
      address: String(formData.get('address') || ''),
      deliveryLandmark: String(formData.get('deliveryLandmark') || ''),
      notes: String(formData.get('notes') || ''),
      paymentMethod,
      items: checkoutItems,
    })

    if (!result.success || !result.orderNumber) {
      setError(result.message)
      setSubmitting(false)
      return
    }

    clearCart()
    router.push(`/commande/${result.orderNumber}`)
  }

  if (items.length === 0) {
    return (
      <section style={{ minHeight: '58vh', display: 'grid', placeItems: 'center', padding: '64px var(--px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 430 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 12 }}>Checkout</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px,7vw,50px)', lineHeight: 1, marginBottom: 14 }}>Ton panier est vide</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>Ajoute une piece avant de passer commande.</p>
          <Link href="/panier" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--btn)', color: 'var(--btn-t)', borderRadius: 3, padding: '13px 22px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Retour au panier</Link>
        </div>
      </section>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{ padding: 'clamp(28px,6vw,64px) var(--px) clamp(80px,10vw,110px)' }}>
      <div className="checkout-grid" style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(300px,390px)', gap: 'clamp(22px,4vw,42px)', alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 18 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 8 }}>Checkout</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px,6vw,56px)', lineHeight: 1, letterSpacing: '-.03em' }}>Informations de livraison</h1>
          </div>

          {error && (
            <p ref={errorRef} role="alert" className="checkout-error-pulse" style={{ background: 'rgba(122,22,32,.12)', border: '1px solid rgba(122,22,32,.28)', color: 'var(--red)', borderRadius: 6, padding: 12, fontSize: 13, lineHeight: 1.6 }}>{error}</p>
          )}

          <div className="checkout-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              ['firstName', 'Prenom', prefill.firstName, 'text', true],
              ['lastName', 'Nom', prefill.lastName, 'text', true],
              ['phone', 'Telephone', prefill.phone, 'tel', true],
              ['email', 'Email', prefill.email, 'email', false],
              ['city', 'Commune / Ville', prefill.city, 'text', true],
              ['address', 'Adresse', prefill.address, 'text', true],
            ].map(([name, label, value, type, required]) => (
              <label key={String(name)} style={{ display: 'grid', gap: 7, fontSize: 12, color: 'var(--text2)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase' }}>{label}</span>
                <input name={String(name)} type={String(type)} defaultValue={String(value)} required={Boolean(required)} style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '12px 13px', color: 'var(--text)', outline: 'none', fontSize: 14 }} />
              </label>
            ))}
          </div>

          <label style={{ display: 'grid', gap: 7, fontSize: 12, color: 'var(--text2)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase' }}>Repere de livraison</span>
            <input name="deliveryLandmark" type="text" placeholder="Ex : pres de la pharmacie, immeuble bleu..." style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '12px 13px', color: 'var(--text)', outline: 'none', fontSize: 14 }} />
          </label>

          <label style={{ display: 'grid', gap: 7, fontSize: 12, color: 'var(--text2)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase' }}>Notes de commande</span>
            <textarea name="notes" rows={4} placeholder="Precision utile pour la livraison ou la commande" style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '12px 13px', color: 'var(--text)', outline: 'none', fontSize: 14, resize: 'vertical' }} />
          </label>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: 16 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 12 }}>Paiement souhaite</p>
            <div style={{ display: 'grid', gap: 8 }}>
              {[
                ['wave', 'Wave'],
                ['orange_money', 'Orange Money'],
                ['cash', 'Paiement a la livraison'],
              ].map(([value, label]) => (
                <label key={value} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text2)', fontSize: 13 }}>
                  <input type="radio" name="paymentMethod" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value as PaymentMethod)} />
                  {label}
                </label>
              ))}
            </div>
            <p style={{ color: 'var(--text3)', fontSize: 11, lineHeight: 1.6, marginTop: 10 }}>Wave ouvre un lien Business apres creation de commande. Orange Money reste en preparation et ne confirme aucun paiement automatiquement.</p>
          </div>

          <Link href="/panier" style={{ width: 'fit-content', color: 'var(--text2)', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Retour au panier</Link>
        </div>

        <aside style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: 18, position: 'sticky', top: 82 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 16 }}>Resume commande</p>
          <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
            {items.map(item => {
              const sizeOptions = item.product.sizes || []
              const colorOptions = item.product.colors || []
              const needsSize = sizeOptions.length > 0 && !item.size
              const needsColor = colorOptions.length > 1 && !item.color

              return (
              <div key={item.id} data-checkout-error={needsSize || needsColor ? 'true' : undefined} tabIndex={needsSize || needsColor ? -1 : undefined} style={{ display: 'grid', gridTemplateColumns: '58px 1fr', gap: 10, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <div style={{ position: 'relative', width: 58, height: 72, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
                  {item.product.images[0] && <Image src={item.product.images[0]} alt={item.product.name} fill sizes="58px" style={{ objectFit: 'cover' }} />}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, lineHeight: 1.35 }}>{item.product.name}</p>
                  {splitVariant(item.size, item.color) && <p style={{ color: 'var(--text3)', fontSize: 11, marginTop: 3 }}>{splitVariant(item.size, item.color)}</p>}
                  {(needsSize || needsColor) && (
                    <div style={{ display: 'grid', gap: 7, marginTop: 8 }}>
                      {needsSize && (
                        <label style={{ display: 'grid', gap: 5, color: 'var(--red)', fontSize: 11 }}>
                          <span>Ce produit necessite une taille.</span>
                          <select
                            value=""
                            onChange={event => {
                              updateOptions(item.id, { size: event.target.value })
                              setError('')
                            }}
                            style={{ width: '100%', background: 'var(--bg)', border: '1px solid rgba(122,22,32,.35)', borderRadius: 4, padding: '8px 9px', color: 'var(--text)' }}
                          >
                            <option value="">Choisir</option>
                            {sizeOptions.map(size => <option key={size.size} value={size.size}>{size.size}</option>)}
                          </select>
                        </label>
                      )}
                      {needsColor && (
                        <label style={{ display: 'grid', gap: 5, color: 'var(--red)', fontSize: 11 }}>
                          <span>Ce produit necessite une couleur.</span>
                          <select
                            value=""
                            onChange={event => {
                              updateOptions(item.id, { color: event.target.value })
                              setError('')
                            }}
                            style={{ width: '100%', background: 'var(--bg)', border: '1px solid rgba(122,22,32,.35)', borderRadius: 4, padding: '8px 9px', color: 'var(--text)' }}
                          >
                            <option value="">Choisir</option>
                            {colorOptions.map(color => <option key={color.color_name} value={color.color_name}>{color.color_name}</option>)}
                          </select>
                        </label>
                      )}
                    </div>
                  )}
                  <p style={{ color: 'var(--text2)', fontSize: 12, marginTop: 5 }}>{item.quantity} x {formatPrice(item.product.price)}</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, marginTop: 4 }}>{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              </div>
            )})}
          </div>

          <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: 'var(--text2)', fontSize: 13 }}><span>Sous-total</span><span>{formatPrice(subtotal)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: 'var(--text2)', fontSize: 13 }}><span>Livraison</span><span>{effectiveShipping === 0 ? 'Offerte' : formatPrice(effectiveShipping)}</span></div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Total</span>
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: 17 }}>{formatPrice(grandTotal)}</strong>
            </div>
          </div>

          <button disabled={submitting} type="submit" style={{ width: '100%', background: submitting ? 'var(--bg3)' : 'var(--btn)', color: submitting ? 'var(--text3)' : 'var(--btn-t)', borderRadius: 3, padding: '14px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', cursor: submitting ? 'wait' : 'pointer' }}>
            {submitting ? 'Creation en cours...' : 'Confirmer la commande'}
          </button>
        </aside>
      </div>
    </form>
  )
}
