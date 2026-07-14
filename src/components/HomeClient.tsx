'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Product, CATEGORIES } from '@/lib/products'
import { useCart } from '@/hooks/useCart'
import LogoutButton from '@/components/LogoutButton'
import type { SiteSettings } from '@/types/database'
import FavoriteButton from '@/components/FavoriteButton'

// ─── SVG ICONS ────────────────────────────────────
const I = {
  search: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.3" y2="16.3" strokeLinecap="round"/></svg>,
  arrow: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><polyline points="13,5 20,12 13,19"/></svg>,
  user: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="3.6"/><path d="M5 20c0-4 3-6.5 7-6.5s7 2.5 7 6.5" strokeLinecap="round"/></svg>,
  heart: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 21s-7-4.6-9.7-9C.5 8.4 1.8 4.8 5 4.1c2-.4 3.7.6 5 2.4 1.3-1.8 3-2.8 5-2.4 3.2.7 4.5 4.3 2.7 7.9C19 16.4 12 21 12 21z"/></svg>,
  bag: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 8h12l-1 12H7L6 8z" strokeLinejoin="round"/><path d="M9 8V6a3 3 0 016 0v2"/></svg>,
  menu: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>,
  plus: <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  x: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  truck: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="11" height="9" rx="1"/><path d="M13 10h4l3 3v3h-7v-6z" strokeLinejoin="round"/><circle cx="6.5" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>,
  shield: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="M12 3l7 3v6c0 4.6-3 8-7 9-4-1-7-4.4-7-9V6l7-3z"/><path d="M9 12l2 2 4-4" strokeLinecap="round"/></svg>,
  check: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M8 12l2.5 2.5L16 9" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  sun: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="4.5"/><line x1="12" y1="2" x2="12" y2="4.5"/><line x1="12" y1="19.5" x2="12" y2="22"/><line x1="2" y1="12" x2="4.5" y2="12"/><line x1="19.5" y1="12" x2="22" y2="12"/><line x1="4.9" y1="4.9" x2="6.6" y2="6.6"/><line x1="17.4" y1="17.4" x2="19.1" y2="19.1"/><line x1="4.9" y1="19.1" x2="6.6" y2="17.4"/><line x1="17.4" y1="6.6" x2="19.1" y2="4.9"/></svg>,
  moon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M20 14.5A8.5 8.5 0 119.5 4 7 7 0 0020 14.5z"/></svg>,
  home: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9" strokeLinejoin="round"/></svg>,
  grid: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  returns: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 12a8 8 0 1 1 2.3 5.6"/><polyline points="4,16 4,12 8,12" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  gem: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M5 9l3-5h8l3 5-7 11-7-11z"/><line x1="5" y1="9" x2="19" y2="9"/></svg>,
  globe: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><line x1="3" y1="12" x2="21" y2="12"/></svg>,
  thread: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="12" r="9"/><path d="M5 12c2-3 5-3 7 0s5 3 7 0" strokeLinecap="round"/></svg>,
  pen: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M4 20l1-4L16 5l3 3L8 19l-4 1z"/></svg>,
}

// ─── STYLES helpers ───────────────────────────────
const px = 'var(--px)'

type CurrentUser = {
  id: string
  email?: string | null
  role: string
  fullname?: string | null
  isAdmin?: boolean
  profile?: {
    id: string
    fullname: string
    phone: string | null
    email: string | null
    address: string | null
    city: string | null
    country: string | null
  } | null
}

type PublicSiteSettings = Pick<
  SiteSettings,
  | 'whatsapp'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'address'
  | 'email'
  | 'phone'
  | 'hero_image_url'
  | 'hero_eyebrow'
  | 'hero_title'
  | 'hero_title_accent'
  | 'hero_description'
  | 'hero_button_text'
  | 'hero_button_link'
>

type FooterLink = {
  label: string
  href: string
  external?: boolean
}

function normalizeExternalUrl(value?: string | null) {
  const trimmed = value?.trim()
  if (!trimmed) return null
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

function cleanPhone(value?: string | null) {
  return value?.replace(/[\s+\-()]/g, '') || ''
}

function whatsappUrl(value?: string | null) {
  const cleaned = cleanPhone(value)
  return cleaned ? `https://wa.me/${cleaned}` : null
}

// ─── PRODUCT CARD ─────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const addItem = useCart(s => s.addItem)
  const [added, setAdded] = useState(false)
  function handleAdd(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    addItem(product); setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }
  return (
    <article style={{ flex: '0 0 clamp(160px, 44vw, 220px)', scrollSnapAlign: 'start', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden', transition: 'transform .3s, border-color .3s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--border2)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)' }}>
      <div style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden', background: 'var(--bg3)' }}>
        <Link href={`/produit/${product.slug}`} prefetch={false} aria-label={`Voir ${product.name}`} style={{ display: 'block', position: 'absolute', inset: 0 }}>
          {product.images[0]
            ? <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: 'cover', transition: 'transform .6s' }} sizes="(max-width:640px) 44vw, (max-width:1024px) 30vw, 220px" />
            : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'rgba(128,128,128,.08)' }}>BSC</div>}
          <span style={{ position: 'absolute', top: 8, left: 8, background: product.isNew ? 'var(--blue)' : 'rgba(0,0,0,.78)', color: '#fff', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 2 }}>
            {product.isNew ? 'Nouveau' : `-${product.discount}%`}
          </span>
        </Link>
        <FavoriteButton productId={product.id} size={18} style={{ position: 'absolute', top: 6, right: 6, zIndex: 2 }} />
        {product.inStock && (
          <span style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(4px)', borderRadius: 2, padding: '3px 7px', fontSize: 10, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4CAF50', flexShrink: 0 }} />En stock
          </span>)}
      </div>
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
          {[...Array(5)].map((_, i) => <div key={i} style={{ width: 8, height: 8, background: i < 4 ? '#C9A24B' : 'var(--border2)', clipPath: 'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)' }} />)}
        </div>
        <Link href={`/produit/${product.slug}`} prefetch={false} style={{ display: 'block' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(12px,3vw,14px)', fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>{product.name}</h3>
          <p style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>
        </Link>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(13px,3.5vw,15px)', fontWeight: 700 }}>{product.price.toLocaleString()} F</span>
          {product.compareAt && <span style={{ fontSize: 10, color: 'var(--text3)', textDecoration: 'line-through' }}>{product.compareAt.toLocaleString()}</span>}
        </div>
        <button onClick={handleAdd} style={{ width: '100%', background: added ? 'var(--red)' : 'var(--btn)', color: added ? '#fff' : 'var(--btn-t)', borderRadius: 3, padding: '9px 6px', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'background .2s, color .2s' }}>
          {I.plus} {added ? 'Ajouté !' : 'Ajouter'}
        </button>
      </div>
    </article>
  )
}

// ─── CAROUSEL SECTION ─────────────────────────────
function Section({ id, eyebrow, eyebrowColor, title, sub, products }: {
  id?: string, eyebrow: string, eyebrowColor: 'red' | 'blue', title: string, sub: string, products: Product[]
}) {
  const ref = useRef<HTMLDivElement>(null)
  const scroll = (d: 'l' | 'r') => ref.current?.scrollBy({ left: d === 'r' ? 480 : -480, behavior: 'smooth' })
  return (
    <section id={id} style={{ padding: `48px ${px}`, borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 600, letterSpacing: '.35em', textTransform: 'uppercase', color: `var(--${eyebrowColor})`, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 16, height: 1, background: `var(--${eyebrowColor})`, display: 'inline-block' }} />{eyebrow}
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px,4vw,36px)', fontWeight: 700, letterSpacing: '-.02em', marginBottom: 4 }}>{title}</h2>
          <p style={{ fontSize: 12, color: 'var(--text2)' }}>{sub}</p>
        </div>
        <a href="#" style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>Voir tout {I.arrow}</a>
      </div>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div ref={ref} className="no-scrollbar" style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: 8 }}>
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <p style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-display)' }}>← Glissez pour naviguer</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => scroll('l')} style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, padding: '8px 14px', borderRadius: 3, border: '1px solid var(--border2)', color: 'var(--text2)' }}>Préc.</button>
            <button onClick={() => scroll('r')} style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, padding: '8px 14px', borderRadius: 3, background: 'var(--btn)', color: 'var(--btn-t)', display: 'flex', alignItems: 'center', gap: 5 }}>Suiv. {I.arrow}</button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── CART DRAWER ──────────────────────────────────
function CartDrawer() {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, total } = useCart()
  if (!isOpen) return null
  return (
    <>
      <div onClick={toggleCart} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 400, backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 'min(400px, 100vw)', background: 'var(--bg2)', zIndex: 401, display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border)' }}>
        <div style={{ padding: '20px var(--px)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>Panier ({items.length})</h2>
          <button onClick={toggleCart} style={{ color: 'var(--text2)', padding: 4 }}>{I.x}</button>
        </div>
        <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: `16px var(--px)` }}>
          {items.length === 0
            ? <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--text3)', letterSpacing: '.2em', textTransform: 'uppercase', textAlign: 'center', marginTop: 80 }}>Ton panier est vide</p>
            : items.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: 12, paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 64, height: 80, background: 'var(--bg3)', borderRadius: 3, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                  {item.product.images[0] && <Image src={item.product.images[0]} alt={item.product.name} fill style={{ objectFit: 'cover' }} sizes="64px" />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.03em', textTransform: 'uppercase', marginBottom: 6 }}>{item.product.name}</p>
                  {(item.size || item.color) && (
                    <p style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 8 }}>
                      {[item.size ? `Taille ${item.size}` : null, item.color || null].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: 26, height: 26, border: '1px solid var(--border2)', borderRadius: 2, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 13 }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: 26, height: 26, border: '1px solid var(--border2)', borderRadius: 2, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700 }}>{(item.product.price * item.quantity).toLocaleString()} F</span>
                  </div>
                  <button onClick={() => removeItem(item.id)} style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '.15em', textTransform: 'uppercase', fontFamily: 'var(--font-display)', marginTop: 6 }}>Supprimer</button>
                </div>
              </div>
            ))}
        </div>
        {items.length > 0 && (
          <div style={{ padding: `16px var(--px)`, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--text2)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>{total().toLocaleString()} FCFA</span>
            </div>
            <button style={{ width: '100%', background: 'var(--btn)', color: 'var(--btn-t)', borderRadius: 3, padding: '14px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
              Commander
            </button>
            <p style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-display)' }}>Livraison gratuite dès 25 000 FCFA</p>
          </div>
        )}
      </div>
    </>
  )
}

// ─── MOBILE MENU ──────────────────────────────────
function MobileMenu({ open, onClose, currentUser }: { open: boolean; onClose: () => void; currentUser?: CurrentUser | null }) {
  if (!open) return null
  const links = [
    { label: 'Accueil', href: '/' },
    { label: 'Boutique', href: '#collection' },
    ...(currentUser
      ? [
        { label: 'Mon compte', href: '/profil' },
        ...(currentUser.isAdmin ? [{ label: 'BSC Admin', href: '/admin/dashboard' }] : []),
      ]
      : [{ label: 'Connexion', href: '/connexion' }]),
  ]
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 400, backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 'min(300px, 85vw)', background: 'var(--bg)', zIndex: 401, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)' }}>
        <div style={{ padding: '20px var(--px)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>Menu</span>
          <button onClick={onClose}>{I.x}</button>
        </div>
        <nav style={{ flex: 1, padding: `24px var(--px)`, display: 'flex', flexDirection: 'column', gap: 0 }}>
          {links.map(l => (
            <a key={l.label} href={l.href} onClick={onClose} style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, letterSpacing: '.03em', padding: '16px 0', borderBottom: '1px solid var(--border)', color: 'var(--text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {l.label} {I.arrow}
            </a>
          ))}
          {currentUser && (
            <div style={{ borderBottom: '1px solid var(--border)' }}>
              <LogoutButton onBeforeLogout={onClose} style={{ width: '100%', fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, letterSpacing: '.03em', padding: '16px 0', color: 'var(--red)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
                Déconnexion {I.arrow}
              </LogoutButton>
            </div>
          )}
        </nav>
        <div style={{ padding: `20px var(--px)`, borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>Bagnon Street Collection<br />Abidjan, Côte d&apos;Ivoire</p>
        </div>
      </div>
    </>
  )
}

// ─── NAVBAR ───────────────────────────────────────
function Navbar({ onMenuOpen, currentUser }: { onMenuOpen: () => void; currentUser?: CurrentUser | null }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [scrolled, setScrolled] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const count = useCart(s => s.count)
  const toggleCart = useCart(s => s.toggleCart)

  useEffect(() => {
    const t = (localStorage.getItem('bsc-theme') || 'dark') as 'dark' | 'light'
    setTheme(t)
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('bsc-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const navLinkStyle = {
    fontFamily: 'var(--font-display)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '.08em',
    textTransform: 'uppercase' as const,
    color: 'var(--text2)',
    padding: '9px 10px',
    whiteSpace: 'nowrap' as const,
  }

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 300, background: scrolled ? 'var(--nav-bg)' : 'var(--bg)', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: '1px solid var(--border)', transition: 'background .4s' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, padding: `12px var(--px)` }}>
        {/* Logo */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border2)', position: 'relative', flexShrink: 0 }}>
            <Image src="/brand/logo-round.jpg" alt="BSC" fill style={{ objectFit: 'cover' }} sizes="32px" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(12px,3vw,15px)', fontWeight: 700, letterSpacing: '.03em', whiteSpace: 'nowrap' }}>Bagnon Street</span>
        </a>

        {/* Search bar */}
        <div className={searchFocused ? 'nav-search nav-search-open' : 'nav-search'} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} style={{ flex: searchFocused ? '1 1 620px' : '1 1 280px', maxWidth: searchFocused ? 620 : 460, margin: '0 auto', position: 'relative', transition: 'max-width .22s ease, flex-basis .22s ease, transform .22s ease' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }}>{I.search}</span>
          <input type="text" placeholder="Rechercher…" style={{ width: '100%', background: 'var(--search)', border: '1px solid var(--border2)', borderRadius: 3, padding: '10px 42px 10px 36px', fontSize: 13, color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-body)' }} />
          <button style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', background: 'var(--btn)', color: 'var(--btn-t)', borderRadius: 3, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{I.arrow}</button>
        </div>

        <div className="desktop-only" style={{ display: 'none', alignItems: 'center', gap: 2 }}>
          <a href="/" style={navLinkStyle}>Accueil</a>
          <a href="#collection" style={navLinkStyle}>Boutique</a>
          {currentUser ? (
            <>
              <a href="/profil" style={{ ...navLinkStyle, color: '#fff', background: 'var(--btn)', borderRadius: 3 }}>
                Mon compte
              </a>
              {currentUser.isAdmin && (
                <a href="/admin/dashboard" style={{ ...navLinkStyle, color: '#fff', background: 'var(--blue)', borderRadius: 3 }}>
                  BSC Admin
                </a>
              )}
              <LogoutButton style={{ ...navLinkStyle, color: 'var(--red)' }}>
                Déconnexion
              </LogoutButton>
            </>
          ) : (
            <a href="/connexion" style={{ ...navLinkStyle, color: '#fff', background: 'var(--btn)', borderRadius: 3 }}>
              Connexion
            </a>
          )}
        </div>

        {/* Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 'auto' }}>
          <button onClick={toggleTheme} style={{ width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>
            {theme === 'dark' ? I.moon : I.sun}
          </button>
          {/* Hide user+heart on small screens */}
          <a href="/favoris" aria-label="Favoris" style={{ width: 38, height: 38, borderRadius: '50%', display: 'none', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }} className="desktop-only">
            {I.heart}
          </a>
          <a href={currentUser ? '/profil' : '/connexion'} style={{ width: 38, height: 38, borderRadius: '50%', display: 'none', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }} className="desktop-only">
            {I.user}
          </a>
          <button onClick={toggleCart} style={{ position: 'relative', width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>
            {I.bag}
            {count() > 0 && <span style={{ position: 'absolute', top: 0, right: 0, background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg)' }}>{count()}</span>}
          </button>
          <button onClick={onMenuOpen} style={{ width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>{I.menu}</button>
        </div>
      </div>


    </nav>
  )
}

// ─── HOME CLIENT ──────────────────────────────────
interface Props {
  featured: Product[]
  newItems: Product[]
  bestsellers: Product[]
  allProducts: Product[]
  currentUser?: CurrentUser | null
  siteSettings?: PublicSiteSettings | null
}

export default function HomeClient({ featured, newItems, bestsellers, allProducts, currentUser, siteSettings }: Props) {
  const [activeCat, setActiveCat] = useState('all')
  const [countdown, setCountdown] = useState('07:23:59')
  const [nlSuccess, setNlSuccess] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const heroImage = siteSettings?.hero_image_url?.trim() || '/brand/hero-model.jpg'
  const heroEyebrow = siteSettings?.hero_eyebrow?.trim() || 'Collection 2025 — Abidjan'
  const heroTitle = siteSettings?.hero_title?.trim() || 'Wear Your'
  const heroTitleAccent = siteSettings?.hero_title_accent?.trim() || 'Identity.'
  const heroDescription = siteSettings?.hero_description?.trim() || 'Bagnon Street naît de la rue. Chaque pièce porte une intention. Chaque détail raconte une histoire.'
  const heroButtonText = siteSettings?.hero_button_text?.trim() || 'Explorer la collection'
  const heroButtonLink = siteSettings?.hero_button_link?.trim() || '#collection'

  const socialLinks: FooterLink[] = [
    { label: 'Instagram', href: normalizeExternalUrl(siteSettings?.instagram) || '', external: true },
    { label: 'TikTok', href: normalizeExternalUrl(siteSettings?.tiktok) || '', external: true },
    { label: 'Facebook', href: normalizeExternalUrl(siteSettings?.facebook) || '', external: true },
    { label: 'WhatsApp', href: whatsappUrl(siteSettings?.whatsapp) || '', external: true },
  ].filter(link => link.href)

  const contactLinks: FooterLink[] = [
    ...(siteSettings?.phone?.trim()
      ? [{ label: siteSettings.phone.trim(), href: `tel:${cleanPhone(siteSettings.phone)}` }]
      : []),
    ...(siteSettings?.email?.trim()
      ? [{ label: siteSettings.email.trim(), href: `mailto:${siteSettings.email.trim()}` }]
      : []),
  ]

  const footerColumns = [
    {
      title: 'Collection',
      links: [
        { label: 'Tous les produits', href: '#collection' },
        { label: 'Hoodies', href: '#collection' },
        { label: 'T-shirts', href: '#collection' },
        { label: 'Sacs', href: '#collection' },
        { label: 'Joggers', href: '#collection' },
      ],
    },
    { title: 'Service Client', links: contactLinks },
    { title: 'Entreprise', links: socialLinks },
    {
      title: 'Légal',
      links: [
        { label: 'Conditions', href: '#' },
        { label: 'Confidentialité', href: '#' },
        { label: 'Cookies', href: '#' },
      ],
    },
  ].filter(col => col.links.length)

  useEffect(() => {
    let end = parseInt(localStorage.getItem('bsc-end') || '0')
    if (!end || end < Date.now()) { end = Date.now() + (7 * 3600 + 23 * 60 + 47) * 1000; localStorage.setItem('bsc-end', String(end)) }
    const iv = setInterval(() => {
      const d = Math.max(0, end - Date.now())
      const h = Math.floor(d / 3600000), m = Math.floor((d % 3600000) / 60000), s = Math.floor((d % 60000) / 1000)
      setCountdown(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }, 1000)
    return () => clearInterval(iv)
  }, [])

  return (
    <>
      <style>{`
        @media(min-width:768px){
          .mobile-only{display:none!important;}
          .desktop-only{display:flex!important;}
          .nav-search-desktop{display:block!important;}
          .hero-grid{grid-template-columns:55% 45%!important; min-height:88vh!important;}
          .hero-img{display:block!important;}
          .trust-strip{flex-wrap:nowrap!important;}
          .why-grid{grid-template-columns:repeat(4,1fr)!important;}
          .editorial-grid{grid-template-columns:repeat(4,1fr)!important;}
          .footer-grid{grid-template-columns:1.6fr 1fr 1fr 1fr!important;}
          .mobile-search{display:none!important;}
        }
        @media(max-width:767px){
          .nav-search{flex:0 1 132px!important; max-width:132px!important; min-width:96px!important; margin-left:auto!important;}
          .nav-search input{border-radius:999px!important;}
          .nav-search-open{position:absolute!important; left:var(--px)!important; right:var(--px)!important; top:8px!important; z-index:5!important; flex:1 1 auto!important; max-width:none!important; min-width:0!important; transform:translateY(0)!important;}
          .nav-search-open input{box-shadow:0 10px 28px rgba(0,0,0,.28); border-color:rgba(122,22,32,.45)!important; padding-top:13px!important; padding-bottom:13px!important;}
          .category-scroll-row{overscroll-behavior-inline:contain;}
        }
        @media(prefers-reduced-motion:reduce){
          .nav-search,
          .nav-search input{transition:none!important; animation:none!important;}
        }
        @media(min-width:1024px){
          .editorial-img{aspect-ratio:3/4!important;}
        }
      `}</style>

      {/* TOPBAR */}
      <div style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: `7px var(--px)`, fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text2)', textAlign: 'center' }}>
        Livraison gratuite dès 25 000 FCFA · Côte d&apos;Ivoire
      </div>

      <Navbar onMenuOpen={() => setMenuOpen(true)} currentUser={currentUser} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} currentUser={currentUser} />

      {/* CATEGORY PILLS */}
      <div style={{ position: 'relative', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div className="no-scrollbar category-scroll-row" style={{ display: 'flex', gap: 8, padding: `10px var(--px)`, overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch', scrollSnapType: 'x proximity', touchAction: 'pan-x pan-y', whiteSpace: 'nowrap' }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setActiveCat(c.id)} style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: activeCat === c.id ? 'var(--btn-t)' : 'var(--text2)', background: activeCat === c.id ? 'var(--btn)' : 'var(--pill)', border: '1px solid', borderColor: activeCat === c.id ? 'transparent' : 'var(--border)', borderRadius: 3, padding: '7px 14px', whiteSpace: 'nowrap', transition: 'all .2s', flexShrink: 0, scrollSnapAlign: 'start' }}>
            {c.label}
          </button>
        ))}
        </div>
        <div aria-hidden="true" style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 42, pointerEvents: 'none', background: 'linear-gradient(to left, var(--bg), transparent)' }} />
      </div>

      {/* PROMO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `9px var(--px)`, background: 'var(--red)', color: '#fff', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(10px,3vw,12px)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          Collection 2025 <span style={{ color: '#F5C84B' }}>-15%</span>
          <span style={{ fontFamily: 'Courier New, monospace', fontSize: 13, fontWeight: 700, background: 'rgba(0,0,0,.25)', padding: '2px 8px', borderRadius: 3 }}>{countdown}</span>
        </div>
        <button style={{ background: '#fff', color: 'var(--red)', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', padding: '6px 14px', borderRadius: 3, flexShrink: 0 }}>Voir</button>
      </div>

      {/* HERO */}
      <section className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', background: 'var(--bg2)', position: 'relative', overflow: 'hidden' }}>
        {/* Image — top on mobile, right on desktop */}
        <div className="hero-img" style={{ display: 'none', position: 'relative', overflow: 'hidden', minHeight: 500 }}>
          <Image src={heroImage} alt="BSC" fill style={{ objectFit: 'cover', filter: 'grayscale(10%) contrast(1.05)' }} priority sizes="(max-width:768px) 100vw, 50vw" />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, var(--bg2) 0%, transparent 15%)' }} />
        </div>

        {/* Mobile hero image */}
        <div className="mobile-only" style={{ position: 'relative', height: '45vw', minHeight: 200, maxHeight: 340, overflow: 'hidden' }}>
          <Image src={heroImage} alt="BSC" fill style={{ objectFit: 'cover', objectPosition: 'top center' }} priority sizes="100vw" />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, var(--bg2) 100%)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: `clamp(32px,6vw,80px) var(--px)` }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 600, letterSpacing: '.35em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 20, height: 1, background: 'var(--red)', display: 'inline-block' }} />{heroEyebrow}
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(36px,8vw,84px)', letterSpacing: '-.03em', lineHeight: .92, marginBottom: 20 }}>
            {heroTitle}<br /><em style={{ color: 'var(--blue)', fontStyle: 'italic', fontWeight: 400 }}>{heroTitleAccent}</em>
          </h1>
          <p style={{ fontSize: 'clamp(13px,2vw,14px)', lineHeight: 1.8, color: 'var(--text2)', maxWidth: 400, marginBottom: 28, fontWeight: 300 }}>
            {heroDescription}
          </p>
          <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
            {[{ icon: I.shield, label: 'Paiement sécurisé' }, { icon: I.truck, label: 'Livraison rapide' }, { icon: I.check, label: 'Qualité garantie' }].map(t => (
              <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: 'var(--text2)' }}>
                <span style={{ color: 'var(--red)' }}>{t.icon}</span>{t.label}
              </div>
            ))}
          </div>
          <a href={heroButtonLink} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--btn)', color: 'var(--btn-t)', borderRadius: 3, padding: 'clamp(12px,3vw,17px) clamp(20px,4vw,36px)', fontFamily: 'var(--font-display)', fontSize: 'clamp(11px,2.5vw,13px)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', width: 'fit-content', transition: 'transform .3s' }}>
            {I.bag} {heroButtonText}
          </a>
        </div>
      </section>

      {/* TRUST */}
      <div className="trust-strip no-scrollbar" style={{ display: 'flex', overflow: 'hidden', borderBottom: '1px solid var(--border)', background: 'var(--bg)', overflowX: 'auto', flexWrap: 'wrap' }}>
        {[{ icon: I.truck, title: 'Livraison rapide', desc: "Abidjan & CI" }, { icon: I.shield, title: 'Paiement sécurisé', desc: 'Wave · Orange Money' }, { icon: I.check, title: 'Qualité garantie', desc: 'Chaque pièce validée' }, { icon: I.returns, title: 'Retours faciles', desc: '14 jours' }].map((t, i) => (
          <div key={i} style={{ flex: '1 0 140px', display: 'flex', alignItems: 'center', gap: 10, padding: '16px var(--px)', borderRight: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--blue)', flexShrink: 0 }}>{t.icon}</span>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase' }}>{t.title}</div>
              <div style={{ fontSize: 10.5, color: 'var(--text2)', marginTop: 1 }}>{t.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* FEATURED */}
      <Section id="collection" eyebrow="Sélection" eyebrowColor="red" title="Produits en vedette" sub="Notre sélection de pièces exceptionnelles" products={featured} />

      {/* BRAND BANNER */}
      <div style={{ padding: `0 var(--px) 48px` }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', background: 'var(--blue)', borderRadius: 6, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 85% 30%, rgba(255,255,255,.08), transparent 60%)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'clamp(28px,5vw,44px) var(--px)', textAlign: 'center', position: 'relative', zIndex: 2, color: '#fff', gap: 12 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,.3)', position: 'relative', flexShrink: 0 }}>
              <Image src="/brand/logo-round.jpg" alt="BSC" fill style={{ objectFit: 'cover' }} sizes="80px" />
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 600, letterSpacing: '.3em', textTransform: 'uppercase', opacity: .65, marginBottom: 6 }}>Marque officielle · Abidjan</p>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px,4vw,26px)', fontWeight: 700, letterSpacing: '-.01em', marginBottom: 8 }}>Bagnon Street Collection</h3>
              <p style={{ fontSize: 'clamp(12px,2vw,13px)', opacity: .78, lineHeight: 1.6, maxWidth: 480, marginBottom: 16 }}>Streetwear né de la rue ivoirienne. Chaque pièce porte une identité.</p>
              <a href="#collection" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.28)', color: '#fff', borderRadius: 3, padding: '10px 20px', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                Voir la collection {I.arrow}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* BESTSELLERS */}
      <Section eyebrow="Populaire" eyebrowColor="blue" title="Meilleures ventes" sub="Les pièces les plus portées" products={bestsellers} />

      {/* MANIFESTO */}
      <section style={{ padding: `clamp(60px,10vw,96px) var(--px)`, textAlign: 'center', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: 'var(--font-display)', fontSize: '28vw', fontWeight: 700, color: 'var(--bg3)', whiteSpace: 'nowrap', pointerEvents: 'none', letterSpacing: '-.05em', opacity: .4 }}>BSC</div>
        <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 20px', border: '1px solid var(--border2)', position: 'relative', zIndex: 2 }}>
          <Image src="/brand/logo-globe.jpg" alt="BSC" fill style={{ objectFit: 'cover' }} sizes="56px" />
        </div>
        <blockquote style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(16px,4vw,36px)', fontWeight: 300, lineHeight: 1.5, maxWidth: 680, margin: '0 auto 18px', position: 'relative', zIndex: 2 }}>
          &ldquo;On ne suit pas les tendances.<br />
          <em style={{ color: 'var(--blue)', fontStyle: 'italic' }}>On construit notre propre langage.</em><br />
          Bagnon Street est une déclaration, pas un vêtement.&rdquo;
        </blockquote>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 600, letterSpacing: '.35em', textTransform: 'uppercase', color: 'var(--red)', position: 'relative', zIndex: 2 }}>— Bagnon Street Collection, Abidjan</p>
      </section>

      {/* NEW ARRIVALS */}
      <Section eyebrow="Fraîchement arrivé" eyebrowColor="red" title="Récemment ajoutés" sub="Nos toutes dernières pièces" products={newItems.length ? newItems : allProducts.slice(8)} />

      {/* EDITORIAL */}
      <section style={{ padding: `48px var(--px)`, borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 600, letterSpacing: '.35em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 16, height: 1, background: 'var(--blue)', display: 'inline-block' }} />Editorial
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px,4vw,36px)', fontWeight: 700, letterSpacing: '-.02em' }}>La rue comme podium</h2>
          </div>
        </div>
        <div className="editorial-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, maxWidth: 1440, margin: '0 auto', borderRadius: 4, overflow: 'hidden' }}>
          {[
            { src: '/brand/editorial-balaclava.jpg', title: 'Studio — Backstage', sub: 'Abidjan 2025' },
            { src: '/brand/editorial-wings.jpg', title: 'Dans la rue', sub: 'Abidjan 2025' },
            { src: '/brand/hero-model.jpg', title: 'Studio Session', sub: 'Collection 2025' },
            { src: '/brand/editorial-group.jpg', title: 'BSC Squad', sub: 'Abidjan 2025' },
          ].map((e, i) => (
            <div key={i} style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
              <div className="editorial-img" style={{ aspectRatio: '4/3', overflow: 'hidden', position: 'relative' }}>
                <Image src={e.src} alt={e.title} fill style={{ objectFit: 'cover', transition: 'transform .7s' }} sizes="(max-width:768px) 50vw, 25vw" />
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top,rgba(0,0,0,.85) 0%,transparent 70%)', padding: '20px 12px 12px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: '#fff', display: 'block' }}>{e.title}</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,.65)' }}>{e.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY BSC */}
      <section style={{ padding: `48px var(--px)`, borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto 24px' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 600, letterSpacing: '.35em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 16, height: 1, background: 'var(--red)', display: 'inline-block' }} />Pourquoi BSC
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px,4vw,36px)', fontWeight: 700, letterSpacing: '-.02em' }}>Construit différemment</h2>
        </div>
        <div className="why-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, maxWidth: 1440, margin: '0 auto', borderRadius: 4, overflow: 'hidden', background: 'var(--border)' }}>
          {[
            { icon: I.thread, label: 'Matières pensées', desc: 'Chaque tissu sélectionné pour sa durabilité et son ressenti.', color: 'red', bg: 'var(--bg)' },
            { icon: I.pen, label: 'Design intentionnel', desc: 'Rien n\'est là par hasard. Chaque détail porte un sens.', color: 'blue', bg: 'var(--bg2)' },
            { icon: I.gem, label: 'Éditions limitées', desc: 'Quantités maîtrisées pour que chaque pièce reste rare.', color: 'red', bg: 'var(--bg2)' },
            { icon: I.globe, label: 'Ancré à Abidjan', desc: 'Né de la rue ivoirienne. Fait pour l\'Afrique, vu par le monde.', color: 'blue', bg: 'var(--bg)' },
          ].map(w => (
            <div key={w.label} style={{ background: w.bg, padding: 'clamp(20px,4vw,32px) clamp(16px,3vw,26px)' }}>
              <div style={{ color: `var(--${w.color})`, marginBottom: 12 }}>{w.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 6 }}>{w.label}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text2)', lineHeight: 1.65 }}>{w.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={{ padding: `clamp(48px,8vw,80px) var(--px)`, textAlign: 'center', background: 'var(--red)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,.08), transparent 50%)' }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 520, margin: '0 auto' }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px', border: '2px solid rgba(255,255,255,.3)', position: 'relative' }}>
            <Image src="/brand/logo-round.jpg" alt="BSC" fill style={{ objectFit: 'cover' }} sizes="50px" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px,4vw,24px)', fontWeight: 700, color: '#fff', marginBottom: 10 }}>Avant tout le monde.</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.78)', marginBottom: 24, lineHeight: 1.7 }}>Drops exclusifs, nouvelles collections, offres réservées.</p>
          {nlSuccess
            ? <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '.1em', textTransform: 'uppercase' }}>Tu es dans la liste ✓</p>
            : <form onSubmit={e => { e.preventDefault(); setNlSuccess(true) }} style={{ display: 'flex', maxWidth: 400, margin: '0 auto', borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(255,255,255,.3)' }}>
              <input type="email" placeholder="ton@email.com" required style={{ flex: 1, background: 'rgba(255,255,255,.1)', border: 'none', padding: '13px 14px', fontSize: 13, color: '#fff', fontFamily: 'var(--font-body)', outline: 'none', minWidth: 0 }} />
              <button type="submit" style={{ background: '#fff', color: 'var(--red)', padding: '13px 18px', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', flexShrink: 0 }}>S&apos;inscrire</button>
            </form>}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)', padding: `clamp(40px,6vw,64px) var(--px) clamp(80px,10vw,100px)` }}>
        <div className="footer-grid" style={{ maxWidth: 1440, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(24px,4vw,48px)' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', position: 'relative' }}>
                <Image src="/brand/logo-round.jpg" alt="BSC" fill style={{ objectFit: 'cover' }} sizes="28px" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700 }}>Bagnon Street</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8, maxWidth: 260, marginBottom: 20 }}>Une marque née à Abidjan. Portée partout où l&apos;identité compte.</p>
          </div>
          {footerColumns.map(col => (
            <div key={col.title}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 14, color: 'var(--text2)' }}>{col.title}</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(l => (
                  <li key={l.label}>
                    <a href={l.href} target={l.external ? '_blank' : undefined} rel={l.external ? 'noopener noreferrer' : undefined} style={{ fontSize: 13, color: 'var(--text2)', transition: 'color .2s' }}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 1440, margin: '40px auto 0', borderTop: '1px solid var(--border)', paddingTop: 20, textAlign: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>© 2025 Bagnon Street Collection. Tous droits réservés.</span>
        </div>
      </footer>

      {/* BOTTOM NAV — mobile only */}
      <div className="mobile-only" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--nav-bg)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--border)', zIndex: 200, display: 'flex', justifyContent: 'space-around', padding: '8px 0 max(8px, env(safe-area-inset-bottom))' }}>
        {[{ icon: I.home, label: 'Accueil', href: '#' }, { icon: I.search, label: 'Recherche', href: '#' }, { icon: I.grid, label: 'Catalogue', href: '#collection' }, { icon: I.heart, label: 'Favoris', href: '/favoris' }, { icon: I.user, label: currentUser ? 'Mon compte' : 'Compte', href: currentUser ? '/profil' : '/connexion' }].map(n => (
          <a key={n.label} href={n.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 600, color: 'var(--text2)', letterSpacing: '.03em', padding: '2px 10px', textTransform: 'uppercase' }}>
            {n.icon}{n.label}
          </a>
        ))}
      </div>

      <CartDrawer />
    </>
  )
}
