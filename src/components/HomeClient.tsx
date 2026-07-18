'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Product, CATEGORIES } from '@/lib/products'
import { useCart } from '@/hooks/useCart'
import { useFavorites } from '@/hooks/useFavorites'
import LogoutButton from '@/components/LogoutButton'
import FavoriteButton from '@/components/FavoriteButton'
import PublicMediaImage from '@/components/PublicMediaImage'
import { isDirectVideoUrl } from '@/lib/media/video'
import { productPath } from '@/lib/helpers/product-url'
import type { GalleryItem, SiteSettings, VideoItem } from '@/types/database'

const I = {
  search: <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4" strokeLinecap="round"/></svg>,
  arrow: <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16"/><path d="M13 5l7 7-7 7"/></svg>,
  user: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="3.6"/><path d="M5 20c0-4 3-6.5 7-6.5s7 2.5 7 6.5" strokeLinecap="round"/></svg>,
  heart: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 21s-7-4.6-9.7-9C.5 8.4 1.8 4.8 5 4.1c2-.4 3.7.6 5 2.4 1.3-1.8 3-2.8 5-2.4 3.2.7 4.5 4.3 2.7 7.9C19 16.4 12 21 12 21z"/></svg>,
  bag: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 8h12l-1 12H7L6 8z" strokeLinejoin="round"/><path d="M9 8V6a3 3 0 016 0v2"/></svg>,
  package: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>,
  menu: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>,
  x: <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  sun: <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7"/></svg>,
  moon: <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M20 14.5A8.5 8.5 0 119.5 4 7 7 0 0020 14.5z"/></svg>,
  home: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 12L12 3l9 9"/><path d="M9 21v-9h6v9"/></svg>,
  play: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>,
  minus: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/></svg>,
  plus: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>,
}

const px = 'var(--px)'

type CurrentUser = {
  id: string
  email?: string | null
  role: string
  fullname?: string | null
  isAdmin?: boolean
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
  | 'hero_video_url'
  | 'hero_media_type'
  | 'hero_media_position'
  | 'hero_overlay_opacity'
  | 'brand_quote'
  | 'brand_quote_author'
>

type MarqueeItem = { label: string; href: string }

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

function categoryHref(id: string) {
  if (id === 'all') return '/#collection'
  if (id === 'bas') return '/categorie/bas'
  return `/categorie/${id}`
}

function displayCategoryLabel(label: string) {
  if (label.toLowerCase() === 'hoodies') return 'Sweats'
  return label
}

function mediaPosition(value?: string | null) {
  if (value === 'top') return 'center top'
  if (value === 'bottom') return 'center bottom'
  if (value === 'left') return 'left center'
  if (value === 'right') return 'right center'
  return 'center center'
}

function ProductCard({ product }: { product: Product }) {
  const addItem = useCart(s => s.addItem)
  const [added, setAdded] = useState(false)
  const href = productPath(product)

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const result = addItem(product, 1, undefined, undefined, product.stock)
    if (!result.success) return
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }

  return (
    <article style={{ flex: '0 0 clamp(168px, 44vw, 230px)', scrollSnapAlign: 'start', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden', background: 'var(--bg3)' }}>
        <Link href={href} prefetch={false} aria-label={`Voir ${product.name}`} style={{ position: 'absolute', inset: 0 }}>
          <PublicMediaImage src={product.images[0]} alt={product.name} fill style={{ objectFit: 'cover' }} sizes="(max-width:640px) 44vw, 230px" />
        </Link>
        {product.isNew && <span style={{ position: 'absolute', top: 8, left: 8, background: 'var(--blue)', color: '#fff', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 3 }}>Nouveau</span>}
        {product.discount > 0 && !product.isNew && <span style={{ position: 'absolute', top: 8, left: 8, background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 3 }}>-{product.discount}%</span>}
        <FavoriteButton productId={product.id} size={18} style={{ position: 'absolute', top: 6, right: 6, zIndex: 2 }} />
      </div>
      <div style={{ padding: '12px' }}>
        <Link href={href} prefetch={false}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, lineHeight: 1.3, marginBottom: 5 }}>{product.name}</h3>
        </Link>
        <p style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.45, height: 32, overflow: 'hidden', marginBottom: 10 }}>{product.short_description || product.description}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 10 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800 }}>{product.price.toLocaleString()} F</span>
          {product.compareAt && <span style={{ fontSize: 10, color: 'var(--text3)', textDecoration: 'line-through' }}>{product.compareAt.toLocaleString()}</span>}
        </div>
        <button onClick={handleAdd} className={added ? 'cart-add-button-pop' : ''} style={{ width: '100%', background: added ? 'var(--red)' : 'var(--btn)', color: added ? '#fff' : 'var(--btn-t)', borderRadius: 4, padding: '9px 6px', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          {I.bag} {added ? 'Ajouté' : 'Ajouter'}
        </button>
      </div>
    </article>
  )
}

function ProductRail({ id, title, eyebrow, products, href }: { id?: string; title: string; eyebrow: string; products: Product[]; href: string }) {
  const ref = useRef<HTMLDivElement>(null)
  if (!products.length) return null

  return (
    <section id={id} style={{ padding: `34px ${px}`, borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto 18px', display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'end' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 6 }}>{eyebrow}</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,5vw,36px)', lineHeight: 1, letterSpacing: '-.02em' }}>{title}</h2>
        </div>
        <Link href={href} style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, color: 'var(--text2)', display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>Voir tout {I.arrow}</Link>
      </div>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div ref={ref} className="no-scrollbar" style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: 8, WebkitOverflowScrolling: 'touch' }}>
          {products.slice(0, 8).map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  )
}

function CartDrawer() {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, total, count, closeCart } = useCart()
  if (!isOpen) return null

  return (
    <>
      <div onClick={toggleCart} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 400, backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 'min(400px, 100vw)', background: 'var(--bg2)', zIndex: 401, display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border)' }}>
        <div style={{ padding: '20px var(--px)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase' }}>Panier ({count()})</h2>
          <button onClick={toggleCart} style={{ color: 'var(--text2)', padding: 4 }}>{I.x}</button>
        </div>
        <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: `16px var(--px)` }}>
          {items.length === 0 ? (
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--text3)', letterSpacing: '.16em', textTransform: 'uppercase', textAlign: 'center', marginTop: 80 }}>Panier vide</p>
          ) : items.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: 12, paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 64, height: 80, background: 'var(--bg3)', borderRadius: 4, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                <PublicMediaImage src={item.product.images[0]} alt={item.product.name} fill style={{ objectFit: 'cover' }} sizes="64px" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, letterSpacing: '.03em', textTransform: 'uppercase', marginBottom: 6 }}>{item.product.name}</p>
                {(item.size || item.color) && <p style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 8 }}>{[item.size ? `Taille ${item.size}` : null, item.color || null].filter(Boolean).join(' · ')}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: 26, height: 26, border: '1px solid var(--border2)', borderRadius: 3, display: 'grid', placeItems: 'center' }}>{I.minus}</button>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 13 }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: 26, height: 26, border: '1px solid var(--border2)', borderRadius: 3, display: 'grid', placeItems: 'center' }}>{I.plus}</button>
                  </div>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800 }}>{(item.product.price * item.quantity).toLocaleString()} F</span>
                </div>
                <button onClick={() => removeItem(item.id)} style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '.15em', textTransform: 'uppercase', fontFamily: 'var(--font-display)', marginTop: 7 }}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div style={{ padding: `16px var(--px)`, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--text2)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800 }}>{total().toLocaleString()} FCFA</span>
            </div>
            <Link href="/panier" onClick={closeCart} style={{ width: '100%', display: 'flex', justifyContent: 'center', background: 'var(--btn)', color: 'var(--btn-t)', borderRadius: 4, padding: '14px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>Voir le panier</Link>
          </div>
        )}
      </div>
    </>
  )
}

function MobileMenu({ open, onClose, currentUser }: { open: boolean; onClose: () => void; currentUser?: CurrentUser | null }) {
  if (!open) return null
  const links = [
    { label: 'Accueil', href: '/' },
    { label: 'Boutique', href: '#collection' },
    ...(currentUser ? [{ label: 'Mon compte', href: '/profil' }, ...(currentUser.isAdmin ? [{ label: 'BSC Admin', href: '/admin/dashboard' }] : [])] : [{ label: 'Connexion', href: '/connexion' }]),
  ]

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 400, backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 'min(300px, 85vw)', background: 'var(--bg)', zIndex: 401, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)' }}>
        <div style={{ padding: '20px var(--px)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800 }}>Menu</span>
          <button onClick={onClose}>{I.x}</button>
        </div>
        <nav style={{ flex: 1, padding: `24px var(--px)`, display: 'flex', flexDirection: 'column' }}>
          {links.map(link => (
            <a key={link.label} href={link.href} onClick={onClose} style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, padding: '16px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{link.label} {I.arrow}</a>
          ))}
          {currentUser && (
            <div style={{ borderBottom: '1px solid var(--border)' }}>
              <LogoutButton onBeforeLogout={onClose} style={{ width: '100%', fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, padding: '16px 0', color: 'var(--red)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>Déconnexion {I.arrow}</LogoutButton>
            </div>
          )}
        </nav>
      </div>
    </>
  )
}

function Navbar({ onMenuOpen, currentUser }: { onMenuOpen: () => void; currentUser?: CurrentUser | null }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('light')
  const [scrolled, setScrolled] = useState(false)
  const count = useCart(s => s.count)
  const toggleCart = useCart(s => s.toggleCart)

  useEffect(() => {
    const saved = localStorage.getItem('bsc-theme') as 'dark' | 'light' | null
    const initial = saved || 'light'
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
    const handler = () => setScrolled(window.scrollY > 32)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('bsc-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const navLinkStyle = { fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' as const, color: 'var(--text2)', padding: '9px 10px', whiteSpace: 'nowrap' as const }

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 300, background: scrolled ? 'var(--nav-bg)' : 'var(--bg)', backdropFilter: scrolled ? 'blur(18px)' : 'none', borderBottom: '1px solid var(--border)', transition: 'background .25s' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, padding: `12px var(--px)` }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border2)', position: 'relative' }}>
            <Image src="/brand/logo-round.jpg" alt="BSC" fill style={{ objectFit: 'cover' }} sizes="32px" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(12px,3vw,15px)', fontWeight: 800, letterSpacing: '.02em', whiteSpace: 'nowrap' }}>Bagnon Street</span>
        </Link>

        <form action="/recherche" className="desktop-search" style={{ flex: '1 1 360px', maxWidth: 460, margin: '0 auto', position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }}>{I.search}</span>
          <input name="q" type="search" placeholder="Rechercher..." aria-label="Rechercher un produit" style={{ width: '100%', background: 'var(--search)', border: '1px solid var(--border2)', borderRadius: 999, padding: '10px 42px 10px 36px', fontSize: 13, color: 'var(--text)', outline: 'none' }} />
          <button type="submit" aria-label="Lancer la recherche" style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', background: 'var(--btn)', color: 'var(--btn-t)', borderRadius: '50%', width: 32, height: 32, display: 'grid', placeItems: 'center' }}>{I.arrow}</button>
        </form>

        <div className="desktop-only" style={{ display: 'none', alignItems: 'center', gap: 2 }}>
          <Link href="/" style={navLinkStyle}>Accueil</Link>
          <Link href="/categorie/tshirts" style={navLinkStyle}>Boutique</Link>
          {currentUser ? (
            <>
              <Link href="/profil" style={{ ...navLinkStyle, color: 'var(--btn-t)', background: 'var(--btn)', borderRadius: 4 }}>Mon compte</Link>
              {currentUser.isAdmin && <Link href="/admin/dashboard" style={{ ...navLinkStyle, color: '#fff', background: 'var(--blue)', borderRadius: 4 }}>BSC Admin</Link>}
              <LogoutButton style={{ ...navLinkStyle, color: 'var(--red)' }}>Déconnexion</LogoutButton>
            </>
          ) : <Link href="/connexion" style={{ ...navLinkStyle, color: 'var(--btn-t)', background: 'var(--btn)', borderRadius: 4 }}>Connexion</Link>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 'auto' }}>
          <Link href="/recherche" aria-label="Rechercher" className="mobile-only" style={{ width: 38, height: 38, borderRadius: '50%', display: 'grid', placeItems: 'center' }}>{I.search}</Link>
          <button onClick={toggleTheme} aria-label="Changer de theme" style={{ width: 38, height: 38, borderRadius: '50%', display: 'grid', placeItems: 'center' }}>{theme === 'dark' ? I.moon : I.sun}</button>
          <Link href="/favoris" aria-label="Favoris" className="desktop-only" style={{ width: 38, height: 38, borderRadius: '50%', display: 'none', alignItems: 'center', justifyContent: 'center' }}>{I.heart}</Link>
          <Link href={currentUser ? '/profil' : '/connexion'} aria-label="Compte" className="desktop-only" style={{ width: 38, height: 38, borderRadius: '50%', display: 'none', alignItems: 'center', justifyContent: 'center' }}>{I.user}</Link>
          <button onClick={toggleCart} aria-label="Ouvrir le panier" style={{ position: 'relative', width: 38, height: 38, borderRadius: '50%', display: 'grid', placeItems: 'center' }}>
            {I.bag}
            {count() > 0 && <span className="cart-badge-pop" style={{ position: 'absolute', top: 0, right: 0, background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 800, width: 16, height: 16, borderRadius: '50%', display: 'grid', placeItems: 'center', border: '2px solid var(--bg)' }}>{count()}</span>}
          </button>
          <button onClick={onMenuOpen} aria-label="Ouvrir le menu" style={{ width: 38, height: 38, borderRadius: '50%', display: 'grid', placeItems: 'center' }}>{I.menu}</button>
        </div>
      </div>
    </nav>
  )
}

function Marquee({ items }: { items: MarqueeItem[] }) {
  if (!items.length) return null
  const loop = [...items, ...items]
  return (
    <div className="marquee" style={{ overflow: 'hidden', borderBottom: '1px solid var(--border)', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
      <div className="marquee-track">
        {loop.map((item, index) => (
          <Link key={`${item.href}-${index}`} href={item.href} className="marquee-item">{item.label}</Link>
        ))}
      </div>
    </div>
  )
}

function VideoSection({ videos }: { videos: VideoItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  if (!videos.length) return null

  return (
    <section style={{ padding: `38px ${px}`, borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto 18px' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 800, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 6 }}>Vidéos</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,5vw,36px)', lineHeight: 1 }}>Bagnon Street en mouvement</h2>
      </div>
      <div className="no-scrollbar" style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', gap: 14, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: 8 }}>
        {videos.slice(0, 6).map((video, index) => {
          const playing = activeId === video.id
          return (
            <article key={video.id} style={{ flex: '0 0 clamp(220px, 72vw, 320px)', scrollSnapAlign: 'center', borderRadius: 12, overflow: 'hidden', background: 'var(--card)', border: '1px solid var(--border)', transform: index === 1 ? 'scale(1.02)' : undefined }}>
              <div style={{ position: 'relative', aspectRatio: '9/13', background: 'var(--bg3)' }}>
                {playing ? (
                  <video src={video.video_url} controls autoPlay muted playsInline preload="metadata" poster={video.poster_url || undefined} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onPlay={() => setActiveId(video.id)} />
                ) : (
                  <button onClick={() => setActiveId(video.id)} aria-label={`Lire ${video.title || 'la vidéo'}`} style={{ position: 'absolute', inset: 0 }}>
                    <PublicMediaImage src={video.poster_url} alt={video.title || 'Bagnon Street en mouvement'} fill style={{ objectFit: 'cover' }} sizes="320px" />
                    <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'linear-gradient(to top, rgba(0,0,0,.45), transparent)' }}>
                      <span style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(255,255,255,.9)', color: '#0A0A0C', display: 'grid', placeItems: 'center' }}>{I.play}</span>
                    </span>
                  </button>
                )}
              </div>
              {(video.title || video.caption) && (
                <div style={{ padding: 12 }}>
                  {video.title && <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800 }}>{video.title}</h3>}
                  {video.caption && <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>{video.caption}</p>}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}

function VideoSectionSafe({ videos }: { videos: VideoItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [failedIds, setFailedIds] = useState(() => new Set<string>())
  const safeVideos = videos.filter(video => isDirectVideoUrl(video.video_url)).slice(0, 6)
  if (!safeVideos.length) return null

  return (
    <section style={{ padding: `38px ${px}`, borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto 18px' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 800, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 6 }}>Videos</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,5vw,36px)', lineHeight: 1 }}>Bagnon Street en mouvement</h2>
      </div>
      <div className="no-scrollbar" style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', gap: 14, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: 8 }}>
        {safeVideos.map((video, index) => {
          const playing = activeId === video.id
          return (
            <article key={video.id} style={{ flex: '0 0 clamp(220px, 72vw, 320px)', scrollSnapAlign: 'center', borderRadius: 12, overflow: 'hidden', background: 'var(--card)', border: '1px solid var(--border)', transform: index === 1 ? 'scale(1.02)' : undefined }}>
              <div style={{ position: 'relative', aspectRatio: '9/13', background: 'var(--bg3)' }}>
                {playing ? (
                  failedIds.has(video.id) ? (
                    <div role="alert" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', padding: 18, textAlign: 'center', color: 'var(--text2)', fontFamily: 'var(--font-display)', fontSize: 12 }}>
                      Video indisponible. Verifie le lien dans l'administration.
                    </div>
                  ) : (
                    <video
                      src={video.video_url}
                      controls
                      autoPlay
                      muted
                      playsInline
                      preload="metadata"
                      poster={video.poster_url || undefined}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onPlay={() => setActiveId(video.id)}
                      onError={() => setFailedIds(current => new Set(current).add(video.id))}
                    />
                  )
                ) : (
                  <button onClick={() => setActiveId(video.id)} aria-label={`Lire ${video.title || 'la video'}`} style={{ position: 'absolute', inset: 0 }}>
                    {video.poster_url ? (
                      <PublicMediaImage src={video.poster_url} alt={video.title || 'Bagnon Street en mouvement'} fill style={{ objectFit: 'cover' }} sizes="320px" />
                    ) : (
                      <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(145deg, var(--bg3), var(--card))' }} />
                    )}
                    <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'linear-gradient(to top, rgba(0,0,0,.45), transparent)' }}>
                      <span style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(255,255,255,.9)', color: '#0A0A0C', display: 'grid', placeItems: 'center' }}>{I.play}</span>
                    </span>
                  </button>
                )}
              </div>
              {(video.title || video.caption) && (
                <div style={{ padding: 12 }}>
                  {video.title && <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800 }}>{video.title}</h3>}
                  {video.caption && <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>{video.caption}</p>}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}

function GallerySection({ items }: { items: GalleryItem[] }) {
  if (!items.length) return null
  return (
    <section style={{ padding: `38px ${px}`, borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto 18px' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 800, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 6 }}>Galerie</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,5vw,36px)', lineHeight: 1 }}>L’univers Bagnon Street</h2>
      </div>
      <div className="home-gallery-grid" style={{ maxWidth: 1440, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 10 }}>
        {items.slice(0, 8).map((item, index) => (
          <figure key={item.id} style={{ position: 'relative', aspectRatio: index % 5 === 0 ? '4/5' : '1/1', borderRadius: 12, overflow: 'hidden', background: 'var(--bg3)', border: '1px solid var(--border)' }}>
            <PublicMediaImage src={item.image_url} alt={item.caption || 'Galerie Bagnon Street'} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 50vw, 25vw" />
            {item.caption && <figcaption style={{ position: 'absolute', left: 10, right: 10, bottom: 10, color: '#fff', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, textShadow: '0 1px 12px rgba(0,0,0,.7)' }}>{item.caption}</figcaption>}
          </figure>
        ))}
      </div>
    </section>
  )
}

interface Props {
  featured: Product[]
  newItems: Product[]
  bestsellers: Product[]
  allProducts: Product[]
  currentUser?: CurrentUser | null
  siteSettings?: PublicSiteSettings | null
  galleryItems?: GalleryItem[]
  videoItems?: VideoItem[]
  marqueeItems?: MarqueeItem[]
}

export default function HomeClient({ featured, newItems, bestsellers, allProducts, currentUser, siteSettings, galleryItems = [], videoItems = [], marqueeItems = [] }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const cartCount = useCart(s => s.count)
  const { favorites } = useFavorites()
  const heroImage = siteSettings?.hero_image_url?.trim() || '/brand/hero-model.jpg'
  const heroTitleSetting = siteSettings?.hero_title?.trim()
  const heroTitle = !heroTitleSetting || heroTitleSetting === 'Affirmez votre style' ? 'Trouvez votre outfit' : heroTitleSetting
  const heroTitleAccent = siteSettings?.hero_title_accent?.trim() || ''
  const heroDescription = siteSettings?.hero_description?.trim() || 'La nouvelle collection Bagnon Street est disponible.'
  const heroButtonText = siteSettings?.hero_button_text?.trim() || 'Découvrir'
  const heroButtonLink = siteSettings?.hero_button_link?.trim() || '#collection'
  const heroVideoCandidate = siteSettings?.hero_media_type === 'video' ? siteSettings?.hero_video_url?.trim() : ''
  const heroVideo = isDirectVideoUrl(heroVideoCandidate) ? heroVideoCandidate : ''
  const heroObjectPosition = mediaPosition(siteSettings?.hero_media_position)
  const heroOverlay = Math.min(.75, Math.max(.15, Number(siteSettings?.hero_overlay_opacity || .42)))
  const brandQuote = siteSettings?.brand_quote?.trim() || 'On ne suit pas les tendances.\nOn construit notre propre langage.\n\nBagnon Street est une declaration,\npas un vetement.'
  const brandQuoteAuthor = siteSettings?.brand_quote_author?.trim() || 'BAGNON STREET COLLECTION, ABIDJAN'
  const railNew = newItems.length ? newItems : allProducts.slice(0, 6)
  const railFeatured = featured.length ? featured : bestsellers.length ? bestsellers : allProducts.slice(6, 12)

  const finalMarquee = useMemo(() => {
    const fallback = [
      { label: 'Tee-shirts', href: '/categorie/tshirts' },
      { label: 'Sweats', href: '/categorie/hoodies' },
      { label: 'Pantalons', href: '/categorie/bas' },
      { label: 'Sacs', href: '/categorie/sacs' },
      { label: 'Nouveautés', href: '#nouveautes' },
      { label: 'Éditions limitées', href: '#collection' },
    ]
    return (marqueeItems.length ? marqueeItems : fallback).slice(0, 12)
  }, [marqueeItems])

  const socialLinks = [
    { label: 'Instagram', href: normalizeExternalUrl(siteSettings?.instagram), external: true },
    { label: 'TikTok', href: normalizeExternalUrl(siteSettings?.tiktok), external: true },
    { label: 'Facebook', href: normalizeExternalUrl(siteSettings?.facebook), external: true },
    { label: 'WhatsApp', href: whatsappUrl(siteSettings?.whatsapp), external: true },
  ].filter(link => link.href)

  const contactLinks = [
    ...(siteSettings?.phone?.trim() ? [{ label: siteSettings.phone.trim(), href: `tel:${cleanPhone(siteSettings.phone)}` }] : []),
    ...(siteSettings?.email?.trim() ? [{ label: siteSettings.email.trim(), href: `mailto:${siteSettings.email.trim()}` }] : []),
  ]

  return (
    <>
      <style>{`
        @media(min-width:768px){
          .mobile-only{display:none!important;}
          .desktop-search{display:block!important;}
          .desktop-only{display:flex!important;}
          .hero-grid{grid-template-columns:minmax(0, .95fr) minmax(0, 1.05fr)!important;}
        }
        @media(max-width:767px){
          .desktop-search{display:none!important;}
          .hero-grid{grid-template-columns:1fr!important;}
          .home-gallery-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;}
        }
        @media(max-width:520px){
          .home-gallery-grid{gap:7px!important;}
        }
        .marquee-track{display:flex;gap:10px;width:max-content;animation:bsc-marquee 28s linear infinite;padding:10px var(--px);}
        .marquee:hover .marquee-track{animation-play-state:paused;}
        .marquee-item{font-family:var(--font-display);font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;background:var(--pill);border:1px solid var(--border);border-radius:999px;padding:8px 14px;white-space:nowrap;color:var(--text2);}
        @keyframes bsc-marquee{from{transform:translateX(0);}to{transform:translateX(-50%);}}
        @media(prefers-reduced-motion:reduce){.marquee-track{animation:none!important;flex-wrap:wrap;width:auto;}}
      `}</style>

      <div style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: `7px var(--px)`, fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text2)', textAlign: 'center' }}>
        Nouvelle collection disponible
      </div>

      <Navbar onMenuOpen={() => setMenuOpen(true)} currentUser={currentUser} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} currentUser={currentUser} />

      <div style={{ position: 'relative', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div className="no-scrollbar" style={{ display: 'flex', gap: 8, padding: `10px var(--px)`, overflowX: 'auto', WebkitOverflowScrolling: 'touch', whiteSpace: 'nowrap' }}>
          {CATEGORIES.map(category => (
            <Link key={category.id} href={categoryHref(category.id)} style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: category.id === 'all' ? 'var(--btn-t)' : 'var(--text2)', background: category.id === 'all' ? 'var(--btn)' : 'var(--pill)', border: '1px solid', borderColor: category.id === 'all' ? 'transparent' : 'var(--border)', borderRadius: 999, padding: '8px 14px', flexShrink: 0 }}>
              {displayCategoryLabel(category.label)}
            </Link>
          ))}
        </div>
        <div aria-hidden="true" style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 42, pointerEvents: 'none', background: 'linear-gradient(to left, var(--bg), transparent)' }} />
      </div>

      <Marquee items={finalMarquee} />

      <section style={{ position: 'relative', minHeight: 'clamp(390px,62vh,660px)', display: 'flex', alignItems: 'center', overflow: 'hidden', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
        {heroVideo ? (
          <video src={heroVideo} autoPlay muted loop playsInline preload="metadata" poster={heroImage} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: heroObjectPosition }} />
        ) : (
          <PublicMediaImage src={heroImage} alt="Bagnon Street Collection" fill priority style={{ objectFit: 'cover', objectPosition: heroObjectPosition }} sizes="100vw" />
        )}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, rgba(0,0,0,${heroOverlay + .18}) 0%, rgba(0,0,0,${heroOverlay}) 48%, rgba(0,0,0,${Math.max(.12, heroOverlay - .18)}) 100%)` }} />
        <div style={{ position: 'relative', zIndex: 1, padding: `clamp(42px,7vw,78px) ${px}`, width: '100%', maxWidth: 1440, margin: '0 auto', color: '#fff' }}>
          {siteSettings?.hero_eyebrow?.trim() && <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 800, letterSpacing: '.28em', textTransform: 'uppercase', color: '#fff', opacity: .78, marginBottom: 12 }}>{siteSettings.hero_eyebrow}</p>}
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(38px,8vw,84px)', letterSpacing: '-.04em', lineHeight: .95, maxWidth: 680, textShadow: '0 10px 34px rgba(0,0,0,.32)' }}>
            {heroTitle}{heroTitleAccent && <><br /><em style={{ color: '#F2F1ED', fontStyle: 'italic', fontWeight: 500 }}>{heroTitleAccent}</em></>}
          </h1>
          <p style={{ fontSize: 'clamp(13px,2vw,15px)', lineHeight: 1.7, color: 'rgba(255,255,255,.86)', maxWidth: 390, margin: '16px 0 22px' }}>{heroDescription}</p>
          <Link href={heroButtonLink} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#fff', color: '#0A0A0C', borderRadius: 4, padding: '13px 22px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', width: 'fit-content' }}>{heroButtonText} {I.arrow}</Link>
        </div>
      </section>

      <ProductRail id="nouveautes" eyebrow="Nouveautés" title="Nouveautés" products={railNew} href="/recherche?tag=nouveautes" />
      <ProductRail id="collection" eyebrow="Sélection" title="Produits tendance" products={railFeatured} href="/categorie/tshirts" />
      <VideoSectionSafe videos={videoItems} />
      <GallerySection items={galleryItems} />

      <section style={{ padding: `clamp(38px,6vw,70px) ${px}`, borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
        <figure style={{ maxWidth: 920, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: 74, height: 74, margin: '0 auto 22px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border2)', position: 'relative' }}>
            <Image src="/brand/logo-round.jpg" alt="Bagnon Street Collection" fill style={{ objectFit: 'cover' }} sizes="74px" />
          </div>
          <blockquote style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,5vw,44px)', lineHeight: 1.15, fontWeight: 700, letterSpacing: '-.02em', whiteSpace: 'pre-line' }}>
            “{brandQuote}”
          </blockquote>
          <figcaption style={{ marginTop: 20, fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--text2)' }}>
            <span aria-hidden="true" style={{ display: 'block', marginBottom: 8 }}>—</span>
            {brandQuoteAuthor}
          </figcaption>
        </figure>
      </section>

      <section style={{ padding: `34px ${px}`, borderTop: '1px solid var(--border)' }}>
        <div className="home-gallery-grid" style={{ maxWidth: 1440, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 10 }}>
          {[
            { title: 'Livraison CI', text: 'Simple et suivie.' },
            { title: 'Paiement Wave', text: 'Confirmation manuelle sécurisée.' },
            { title: 'Éditions limitées', text: 'Des pièces en quantités maîtrisées.' },
            { title: 'Ancré à Abidjan', text: 'Une identité locale, pensée pour durer.' },
          ].map(item => (
            <div key={item.title} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 18 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>{item.title}</h3>
              <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)', padding: `clamp(40px,6vw,64px) var(--px) clamp(80px,10vw,100px)` }}>
        <div className="home-gallery-grid" style={{ maxWidth: 1440, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 'clamp(24px,4vw,48px)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', position: 'relative' }}><Image src="/brand/logo-round.jpg" alt="BSC" fill style={{ objectFit: 'cover' }} sizes="30px" /></div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800 }}>Bagnon Street</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8, maxWidth: 280 }}>Streetwear né à Abidjan. Une identité qui vous ressemble.</p>
          </div>
          {[
            { title: 'Boutique', links: [{ label: 'Tous les produits', href: '#collection' }, { label: 'Sweats', href: '/categorie/hoodies' }, { label: 'Tee-shirts', href: '/categorie/tshirts' }, { label: 'Sacs', href: '/categorie/sacs' }] },
            { title: 'Contact', links: contactLinks },
            { title: 'Réseaux', links: socialLinks },
          ].filter(col => col.links.length).map(col => (
            <div key={col.title}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 14, color: 'var(--text2)' }}>{col.title}</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(link => (
                  <li key={link.label}><a href={link.href || '#'} target={'external' in link && link.external ? '_blank' : undefined} rel={'external' in link && link.external ? 'noopener noreferrer' : undefined} style={{ fontSize: 13, color: 'var(--text2)' }}>{link.label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 1440, margin: '36px auto 0', borderTop: '1px solid var(--border)', paddingTop: 18, textAlign: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>© 2026 Bagnon Street Collection. Tous droits réservés.</span>
        </div>
      </footer>

      <div className="mobile-only" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--nav-bg)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--border)', zIndex: 200, display: 'flex', justifyContent: 'space-around', padding: '8px 0 max(8px, env(safe-area-inset-bottom))' }}>
        {[
          { icon: I.home, label: 'Accueil', href: '/' },
          { icon: I.bag, label: 'Panier', href: '/panier', badge: cartCount() },
          { icon: I.package, label: 'Commandes', href: currentUser ? '/commandes' : '/connexion?redirect=/commandes' },
          { icon: I.heart, label: 'Favoris', href: '/favoris', badge: favorites.size },
          { icon: I.user, label: 'Compte', href: currentUser ? '/profil' : '/connexion' },
        ].map(item => (
          <Link key={item.label} href={item.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, color: 'var(--text2)', letterSpacing: '.03em', padding: '2px 7px', textTransform: 'uppercase', minWidth: 54 }}>
            <span style={{ position: 'relative', display: 'inline-flex' }}>{item.icon}{Boolean(item.badge) && <span style={{ position: 'absolute', top: -6, right: -8, background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 800, minWidth: 16, height: 16, borderRadius: 999, display: 'grid', placeItems: 'center', border: '2px solid var(--bg)' }}>{item.badge}</span>}</span>
            {item.label}
          </Link>
        ))}
      </div>

      <CartDrawer />
    </>
  )
}
