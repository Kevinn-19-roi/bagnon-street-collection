'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Product, CATEGORIES } from '@/lib/products'
import { useCart } from '@/hooks/useCart'

// ─── SVG ICONS ────────────────────────────────────
const Icons = {
  search: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.3" y2="16.3" strokeLinecap="round"/></svg>,
  arrow: <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><polyline points="13,5 20,12 13,19"/></svg>,
  user: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="3.6"/><path d="M5 20c0-4 3-6.5 7-6.5s7 2.5 7 6.5" strokeLinecap="round"/></svg>,
  heart: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 21s-7-4.6-9.7-9C.5 8.4 1.8 4.8 5 4.1c2-.4 3.7.6 5 2.4 1.3-1.8 3-2.8 5-2.4 3.2.7 4.5 4.3 2.7 7.9C19 16.4 12 21 12 21z"/></svg>,
  bag: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 8h12l-1 12H7L6 8z" strokeLinejoin="round"/><path d="M9 8V6a3 3 0 016 0v2"/></svg>,
  menu: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>,
  plus: <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  truck: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="11" height="9" rx="1"/><path d="M13 10h4l3 3v3h-7v-6z" strokeLinejoin="round"/><circle cx="6.5" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>,
  shield: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="M12 3l7 3v6c0 4.6-3 8-7 9-4-1-7-4.4-7-9V6l7-3z"/><path d="M9 12l2 2 4-4" strokeLinecap="round"/></svg>,
  check: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M8 12l2.5 2.5L16 9" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  returns: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 12a8 8 0 1 1 2.3 5.6"/><polyline points="4,16 4,12 8,12" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  sun: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="4.5"/><line x1="12" y1="2" x2="12" y2="4.5"/><line x1="12" y1="19.5" x2="12" y2="22"/><line x1="2" y1="12" x2="4.5" y2="12"/><line x1="19.5" y1="12" x2="22" y2="12"/><line x1="4.9" y1="4.9" x2="6.6" y2="6.6"/><line x1="17.4" y1="17.4" x2="19.1" y2="19.1"/><line x1="4.9" y1="19.1" x2="6.6" y2="17.4"/><line x1="17.4" y1="6.6" x2="19.1" y2="4.9"/></svg>,
  moon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M20 14.5A8.5 8.5 0 119.5 4 7 7 0 0020 14.5z"/></svg>,
  gem: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M5 9l3-5h8l3 5-7 11-7-11z"/><line x1="5" y1="9" x2="19" y2="9"/></svg>,
  globe: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><line x1="3" y1="12" x2="21" y2="12"/></svg>,
  thread: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="12" r="9"/><path d="M5 12c2-3 5-3 7 0s5 3 7 0" strokeLinecap="round"/></svg>,
  pen: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M4 20l1-4L16 5l3 3L8 19l-4 1z"/></svg>,
  x: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
}

// ─── PRODUCT CARD ─────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const addItem = useCart(s => s.addItem)
  const [added, setAdded] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  return (
    <article style={{
      flex: '0 0 220px', scrollSnapAlign: 'start',
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 4, overflow: 'hidden',
      transition: 'transform .3s, border-color .3s',
    }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
      <div style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden', background: 'var(--bg3)' }}>
        {product.images[0]
          ? <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: 'cover', transition: 'transform .55s' }} sizes="220px" />
          : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'rgba(128,128,128,.08)' }}>BSC</div>
        }
        <span style={{
          position: 'absolute', top: 10, left: 10,
          background: product.isNew ? 'var(--blue)' : 'rgba(0,0,0,.78)',
          color: '#fff', fontFamily: 'var(--font-display)',
          fontSize: 10.5, fontWeight: 700, padding: '4px 9px', borderRadius: 2,
          backdropFilter: 'blur(4px)',
        }}>
          {product.isNew ? 'Nouveau' : `-${product.discount}%`}
        </span>
        <button
          onClick={e => { e.preventDefault(); setWishlisted(w => !w) }}
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 30, height: 30, borderRadius: '50%',
            background: 'var(--card)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.2)',
            color: wishlisted ? 'var(--red)' : 'var(--text2)',
            transition: 'transform .2s',
          }}
          aria-label="Favoris"
        >
          {Icons.heart}
        </button>
        {product.inStock && (
          <span style={{
            position: 'absolute', bottom: 10, left: 10,
            background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(4px)',
            borderRadius: 2, padding: '4px 9px',
            fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 600,
            color: '#fff', display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4CAF50', flexShrink: 0 }} />
            En stock
          </span>
        )}
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ width: 9, height: 9, background: i < 4 ? '#C9A24B' : 'var(--border2)', clipPath: 'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)' }} />
          ))}
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 6, lineHeight: 1.3 }}>{product.name}</h3>
        <p style={{ fontSize: 11.5, color: 'var(--text2)', lineHeight: 1.55, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 12 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700 }}>{product.price.toLocaleString()} F</span>
          <span style={{ fontSize: 11, color: 'var(--text3)', textDecoration: 'line-through' }}>{product.compareAt.toLocaleString()} F</span>
        </div>
        <button
          onClick={handleAdd}
          style={{
            width: '100%', background: added ? 'var(--red)' : 'var(--btn)', color: added ? '#fff' : 'var(--btn-t)',
            borderRadius: 3, padding: 10, fontFamily: 'var(--font-display)',
            fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            transition: 'background .2s, color .2s',
          }}
        >
          {Icons.plus} {added ? 'Ajouté !' : 'Ajouter'}
        </button>
      </div>
    </article>
  )
}

// ─── CAROUSEL SECTION ─────────────────────────────
function Section({ id, eyebrow, eyebrowColor, title, sub, products }: {
  id?: string, eyebrow: string, eyebrowColor: 'red' | 'blue', title: string, sub: string, products: Product[]
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  function scroll(dir: 'left' | 'right') {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir === 'right' ? 480 : -480, behavior: 'smooth' })
  }
  return (
    <section id={id} style={{ padding: '64px 24px', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10.5, fontWeight: 600, letterSpacing: '.35em', textTransform: 'uppercase', color: `var(--${eyebrowColor})`, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 18, height: 1, background: `var(--${eyebrowColor})`, display: 'inline-block' }} />
            {eyebrow}
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,36px)', fontWeight: 700, letterSpacing: '-.02em', marginBottom: 6 }}>{title}</h2>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>{sub}</p>
        </div>
        <a href="#" style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, letterSpacing: '.05em', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 6 }}>
          Voir tout {Icons.arrow}
        </a>
      </div>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div ref={scrollRef} style={{ display: 'flex', gap: 14, overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', paddingBottom: 8 }}>
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
          <button onClick={() => scroll('left')} style={{ fontFamily: 'var(--font-display)', fontSize: 11.5, fontWeight: 600, letterSpacing: '.03em', padding: '9px 18px', borderRadius: 3, border: '1px solid var(--border2)', color: 'var(--text2)', transition: 'all .2s' }}>Précédent</button>
          <button onClick={() => scroll('right')} style={{ fontFamily: 'var(--font-display)', fontSize: 11.5, fontWeight: 600, letterSpacing: '.03em', padding: '9px 18px', borderRadius: 3, background: 'var(--btn)', color: 'var(--btn-t)', display: 'flex', alignItems: 'center', gap: 6 }}>Suivant {Icons.arrow}</button>
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
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 400, background: 'var(--bg2)', zIndex: 401, display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border)' }}>
        <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>Panier ({items.length})</h2>
          <button onClick={toggleCart} style={{ color: 'var(--text2)', padding: 4 }}>{Icons.x}</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {items.length === 0
            ? <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--text3)', letterSpacing: '.2em', textTransform: 'uppercase', textAlign: 'center', marginTop: 80 }}>Ton panier est vide</p>
            : items.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: 14, paddingBottom: 20, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 72, height: 90, background: 'var(--bg3)', borderRadius: 3, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                  {item.product.images[0] && <Image src={item.product.images[0]} alt={item.product.name} fill style={{ objectFit: 'cover' }} sizes="72px" />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.03em', textTransform: 'uppercase', marginBottom: 6 }}>{item.product.name}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: 26, height: 26, border: '1px solid var(--border2)', borderRadius: 2, fontFamily: 'var(--font-display)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 13 }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: 26, height: 26, border: '1px solid var(--border2)', borderRadius: 2, fontFamily: 'var(--font-display)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700 }}>{(item.product.price * item.quantity).toLocaleString()} F</span>
                  </div>
                  <button onClick={() => removeItem(item.id)} style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '.15em', textTransform: 'uppercase', fontFamily: 'var(--font-display)', marginTop: 8 }}>Supprimer</button>
                </div>
              </div>
            ))}
        </div>
        {items.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--text2)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>{total().toLocaleString()} FCFA</span>
            </div>
            <button style={{ width: '100%', background: 'var(--btn)', color: 'var(--btn-t)', borderRadius: 3, padding: '15px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>
              Commander
            </button>
            <p style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-display)' }}>Livraison gratuite dès 25 000 FCFA</p>
          </div>
        )}
      </div>
    </>
  )
}

// ─── NAVBAR ───────────────────────────────────────
function Navbar() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [scrolled, setScrolled] = useState(false)
  const count = useCart(s => s.count)
  const toggleCart = useCart(s => s.toggleCart)

  useEffect(() => {
    const t = (localStorage.getItem('bsc-theme') || 'dark') as 'dark' | 'light'
    setTheme(t)
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('bsc-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 300,
      background: scrolled ? 'var(--nav-bg)' : 'var(--bg)',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: '1px solid var(--border)',
      transition: 'background .4s',
    }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 20, padding: '14px 24px' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border2)', position: 'relative', flexShrink: 0 }}>
            <Image src="/brand/logo-round.jpg" alt="BSC" fill style={{ objectFit: 'cover' }} sizes="32px" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, letterSpacing: '.04em', whiteSpace: 'nowrap' }}>Bagnon Street</span>
        </a>

        <div style={{ flex: 1, maxWidth: 480, margin: '0 auto', position: 'relative' }}>
          <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }}>{Icons.search}</span>
          <input type="text" placeholder="Rechercher un produit…" style={{ width: '100%', background: 'var(--search)', border: '1px solid var(--border2)', borderRadius: 3, padding: '11px 46px 11px 38px', fontSize: 13, color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-body)' }} />
          <button style={{ position: 'absolute', right: 5, top: '50%', transform: 'translateY(-50%)', background: 'var(--btn)', color: 'var(--btn-t)', borderRadius: 3, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.arrow}</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          <button onClick={toggleTheme} style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', transition: 'background .2s' }}>
            {theme === 'dark' ? Icons.moon : Icons.sun}
          </button>
          <button style={{ position: 'relative', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>
            {Icons.user}
          </button>
          <button style={{ position: 'relative', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>
            {Icons.heart}
            <span style={{ position: 'absolute', top: 0, right: 0, background: 'var(--blue)', color: '#fff', fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg)' }}>2</span>
          </button>
          <button onClick={toggleCart} style={{ position: 'relative', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>
            {Icons.bag}
            <span style={{ position: 'absolute', top: 0, right: 0, background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg)' }}>{count()}</span>
          </button>
          <button style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>{Icons.menu}</button>
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
}

export default function HomeClient({ featured, newItems, bestsellers, allProducts }: Props) {
  const [activeCat, setActiveCat] = useState('all')
  const [countdown, setCountdown] = useState('07:23:59')

  useEffect(() => {
    let end = parseInt(localStorage.getItem('bsc-end') || '0')
    if (!end || end < Date.now()) {
      end = Date.now() + (7 * 3600 + 23 * 60 + 47) * 1000
      localStorage.setItem('bsc-end', String(end))
    }
    const iv = setInterval(() => {
      const diff = Math.max(0, end - Date.now())
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setCountdown(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }, 1000)
    return () => clearInterval(iv)
  }, [])

  const [nlSuccess, setNlSuccess] = useState(false)

  const filteredProducts = activeCat === 'all' ? allProducts : allProducts.filter(p => p.category === activeCat)

  return (
    <>
      {/* TOPBAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 24px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-display)', fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text2)', position: 'relative' }}>
        <span>Côte d'Ivoire · FCFA</span>
        <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>Livraison gratuite dès 25 000 FCFA</span>
        <div style={{ display: 'flex', gap: 20 }}>
          <a href="#" style={{ color: 'var(--text2)' }}>Aide</a>
          <a href="#" style={{ color: 'var(--text2)' }}>Suivi</a>
        </div>
      </div>

      <Navbar />

      {/* CAT BAR */}
      <div style={{ display: 'flex', gap: 8, padding: '11px 24px', overflowX: 'auto', borderBottom: '1px solid var(--border)', scrollbarWidth: 'none' }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setActiveCat(c.id)} style={{
            fontFamily: 'var(--font-display)', fontSize: 11.5, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase',
            color: activeCat === c.id ? 'var(--btn-t)' : 'var(--text2)',
            background: activeCat === c.id ? 'var(--btn)' : 'var(--pill)',
            border: '1px solid', borderColor: activeCat === c.id ? 'transparent' : 'var(--border)',
            borderRadius: 3, padding: '8px 16px', whiteSpace: 'nowrap', transition: 'all .2s',
          }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* PROMO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 24px', background: 'var(--red)', color: '#fff' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 12 }}>
          Collection 2025
          <span style={{ color: '#F5C84B' }}>-15%</span>
          <span style={{ fontFamily: 'Courier New, monospace', fontSize: 13, fontWeight: 700, background: 'rgba(0,0,0,.25)', padding: '3px 10px', borderRadius: 3 }}>{countdown}</span>
        </div>
        <button style={{ background: '#fff', color: 'var(--red)', fontFamily: 'var(--font-display)', fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', padding: '7px 16px', borderRadius: 3 }}>Voir</button>
      </div>

      {/* HERO */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '88vh', background: 'var(--bg2)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 56px', position: 'relative', zIndex: 2 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, letterSpacing: '.35em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 24, height: 1, background: 'var(--red)', display: 'inline-block' }} />
            Collection 2025 — Abidjan
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(46px,5.5vw,84px)', letterSpacing: '-.03em', lineHeight: .92, marginBottom: 28 }}>
            Wear Your<br />
            <em style={{ color: 'var(--blue)', fontStyle: 'italic', fontWeight: 400 }}>Identity.</em>
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text2)', maxWidth: 380, marginBottom: 36, fontWeight: 300 }}>
            Bagnon Street naît de la rue. Chaque pièce porte une intention. Chaque détail raconte une histoire.
          </p>
          <div style={{ display: 'flex', gap: 24, marginBottom: 40, flexWrap: 'wrap' }}>
            {[{icon: Icons.shield, label: 'Paiement sécurisé'}, {icon: Icons.truck, label: 'Livraison rapide'}, {icon: Icons.check, label: 'Qualité garantie'}].map(t => (
              <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontSize: 11.5, fontWeight: 600, letterSpacing: '.03em', color: 'var(--text2)' }}>
                <span style={{ color: 'var(--red)' }}>{t.icon}</span> {t.label}
              </div>
            ))}
          </div>
          <a href="#collection" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--btn)', color: 'var(--btn-t)', borderRadius: 3, padding: '17px 36px', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', width: 'fit-content', transition: 'transform .3s' }}>
            {Icons.bag} Explorer la collection
          </a>
        </div>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <Image src="/brand/hero-model.jpg" alt="BSC Collection" fill style={{ objectFit: 'cover', filter: 'grayscale(10%) contrast(1.05)' }} priority sizes="50vw" />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, var(--bg2) 0%, transparent 15%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, transparent 50%, rgba(26,42,108,.16) 100%)' }} />
        </div>
      </section>

      {/* TRUST */}
      <div style={{ display: 'flex', overflow: 'hidden', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        {[
          { icon: Icons.truck, title: 'Livraison rapide', desc: "Abidjan & Côte d'Ivoire" },
          { icon: Icons.shield, title: 'Paiement sécurisé', desc: 'Wave · Orange Money · CB' },
          { icon: Icons.check, title: 'Qualité garantie', desc: 'Chaque pièce validée BSC' },
          { icon: Icons.returns, title: 'Retours faciles', desc: '14 jours satisfait' },
        ].map((t, i) => (
          <div key={i} style={{ flex: 1, minWidth: 160, display: 'flex', alignItems: 'center', gap: 12, padding: '20px', borderRight: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--blue)', flexShrink: 0 }}>{t.icon}</span>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 11.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase' }}>{t.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 1 }}>{t.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* FEATURED */}
      <Section id="collection" eyebrow="Sélection" eyebrowColor="red" title="Produits en vedette" sub="Notre sélection de pièces exceptionnelles" products={featured} />

      {/* BRAND BANNER */}
      <div style={{ maxWidth: 1392, margin: '8px auto 64px', padding: '0 24px' }}>
        <div style={{ background: 'var(--blue)', borderRadius: 4, display: 'flex', alignItems: 'stretch', minHeight: 200, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 85% 30%, rgba(255,255,255,.08), transparent 60%)' }} />
          <div style={{ flex: '0 0 190px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,.12)' }}>
            <div style={{ width: 108, height: 108, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,.3)', position: 'relative' }}>
              <Image src="/brand/logo-round.jpg" alt="BSC" fill style={{ objectFit: 'cover' }} sizes="108px" />
            </div>
          </div>
          <div style={{ flex: 1, padding: '36px 44px', position: 'relative', zIndex: 2, color: '#fff' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 10.5, fontWeight: 600, letterSpacing: '.3em', textTransform: 'uppercase', opacity: .65, marginBottom: 10 }}>Marque officielle · Abidjan</p>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-.01em', marginBottom: 8 }}>Bagnon Street Collection</h3>
            <p style={{ fontSize: 13, opacity: .78, lineHeight: 1.6, maxWidth: 480, marginBottom: 18 }}>Streetwear né de la rue ivoirienne. Chaque pièce porte une identité. Conçu pour ceux qui savent qui ils sont.</p>
            <a href="#collection" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.28)', color: '#fff', borderRadius: 3, padding: '11px 22px', fontFamily: 'var(--font-display)', fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>
              Voir toute la collection {Icons.arrow}
            </a>
          </div>
        </div>
      </div>

      {/* BESTSELLERS */}
      <Section eyebrow="Populaire" eyebrowColor="blue" title="Meilleures ventes" sub="Les pièces les plus portées" products={bestsellers} />

      {/* MANIFESTO */}
      <section style={{ padding: '96px 24px', textAlign: 'center', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: 'var(--font-display)', fontSize: '24vw', fontWeight: 700, color: 'var(--bg3)', whiteSpace: 'nowrap', pointerEvents: 'none', letterSpacing: '-.05em', opacity: .5 }}>BSC</div>
        <div style={{ width: 60, height: 60, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 28px', border: '1px solid var(--border2)', position: 'relative', zIndex: 2 }}>
          <Image src="/brand/logo-globe.jpg" alt="BSC" fill style={{ objectFit: 'cover' }} sizes="60px" />
        </div>
        <blockquote style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px,3.2vw,36px)', fontWeight: 300, lineHeight: 1.5, maxWidth: 680, margin: '0 auto 22px', position: 'relative', zIndex: 2 }}>
          "On ne suit pas les tendances.<br />
          <em style={{ color: 'var(--blue)', fontStyle: 'italic' }}>On construit notre propre langage.</em><br />
          Bagnon Street est une déclaration, pas un vêtement."
        </blockquote>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 10.5, fontWeight: 600, letterSpacing: '.35em', textTransform: 'uppercase', color: 'var(--red)', position: 'relative', zIndex: 2 }}>— Bagnon Street Collection, Abidjan</p>
      </section>

      {/* NEW ARRIVALS */}
      <Section eyebrow="Fraîchement arrivé" eyebrowColor="red" title="Récemment ajoutés" sub="Découvrez nos toutes dernières pièces" products={newItems.length ? newItems : allProducts.slice(8)} />

      {/* EDITORIAL */}
      <section style={{ padding: '64px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 10.5, fontWeight: 600, letterSpacing: '.35em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 18, height: 1, background: 'var(--blue)', display: 'inline-block' }} />Editorial
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,36px)', fontWeight: 700, letterSpacing: '-.02em' }}>La rue comme podium</h2>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6 }}>Bagnon Street en mouvement</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3, maxWidth: 1440, margin: '0 auto', borderRadius: 4, overflow: 'hidden' }}>
          {[
            { src: '/brand/editorial-balaclava.jpg', title: 'Studio — Backstage', sub: 'Abidjan, 2025' },
            { src: '/brand/editorial-wings.jpg', title: 'Dans la rue', sub: 'Abidjan, 2025' },
            { src: '/brand/hero-model.jpg', title: 'Studio Session', sub: 'Collection 2025' },
            { src: '/brand/editorial-group.jpg', title: 'BSC Squad', sub: 'Abidjan, 2025' },
          ].map((e, i) => (
            <div key={i} style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
              <div style={{ aspectRatio: '3/4', overflow: 'hidden' }}>
                <Image src={e.src} alt={e.title} fill style={{ objectFit: 'cover', transition: 'transform .7s' }} sizes="25vw" />
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top,rgba(0,0,0,.85) 0%,transparent 70%)', padding: '28px 14px 14px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '.02em' }}>{e.title}</span>
                <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,.65)' }}>{e.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section style={{ padding: '64px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto 32px' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10.5, fontWeight: 600, letterSpacing: '.35em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 18, height: 1, background: 'var(--red)', display: 'inline-block' }} />Notre approche
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,36px)', fontWeight: 700, letterSpacing: '-.02em' }}>Pourquoi BSC</h2>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6 }}>Construit différemment</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--border)', maxWidth: 1440, margin: '0 auto', borderRadius: 4, overflow: 'hidden' }}>
          {[
            { icon: Icons.thread, label: 'Matières pensées', desc: 'Chaque tissu sélectionné pour sa durabilité et son ressenti quotidien.', color: 'red', bg: 'var(--bg)' },
            { icon: Icons.pen, label: 'Design intentionnel', desc: 'Rien n\'est là par hasard. Chaque détail porte un sens précis.', color: 'blue', bg: 'var(--bg2)' },
            { icon: Icons.gem, label: 'Éditions limitées', desc: 'Des quantités maîtrisées pour que chaque pièce reste rare.', color: 'red', bg: 'var(--bg)' },
            { icon: Icons.globe, label: 'Ancré à Abidjan', desc: 'Né de la rue ivoirienne. Fait pour l\'Afrique, vu par le monde.', color: 'blue', bg: 'var(--bg2)' },
          ].map(w => (
            <div key={w.label} style={{ background: w.bg, padding: '32px 26px', transition: 'background .25s' }}>
              <div style={{ color: `var(--${w.color})`, marginBottom: 16 }}>{w.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 12.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 8 }}>{w.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.65 }}>{w.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={{ padding: '80px 24px', textAlign: 'center', background: 'var(--red)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,.08), transparent 50%)' }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 540, margin: '0 auto' }}>
          <div style={{ width: 54, height: 54, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 18px', border: '2px solid rgba(255,255,255,.3)', position: 'relative' }}>
            <Image src="/brand/logo-round.jpg" alt="BSC" fill style={{ objectFit: 'cover' }} sizes="54px" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Avant tout le monde.</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.78)', marginBottom: 28, lineHeight: 1.7 }}>Drops exclusifs, nouvelles collections, offres réservées. Rejoins la famille BSC.</p>
          {nlSuccess
            ? <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '.1em', textTransform: 'uppercase' }}>Tu es dans la liste ✓</p>
            : <form onSubmit={e => { e.preventDefault(); setNlSuccess(true) }} style={{ display: 'flex', maxWidth: 420, margin: '0 auto', borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(255,255,255,.3)' }}>
              <input type="email" placeholder="ton@email.com" required style={{ flex: 1, background: 'rgba(255,255,255,.1)', border: 'none', padding: '14px 18px', fontSize: 13, color: '#fff', fontFamily: 'var(--font-body)', outline: 'none' }} />
              <button type="submit" style={{ background: '#fff', color: 'var(--red)', padding: '14px 24px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', flexShrink: 0 }}>S'inscrire</button>
            </form>}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)', padding: '64px 24px 80px' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', gap: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', position: 'relative' }}>
                <Image src="/brand/logo-round.jpg" alt="BSC" fill style={{ objectFit: 'cover' }} sizes="30px" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700 }}>Bagnon Street</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8, maxWidth: 260, marginBottom: 24 }}>Une marque née à Abidjan. Portée partout où l'identité compte.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              {['Instagram', 'TikTok', 'WhatsApp'].map(s => (
                <a key={s} href="#" style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)', fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '.03em' }}>{s[0]}</a>
              ))}
            </div>
          </div>
          {[
            { title: 'Collection', links: ['Tous les produits', 'Hoodies', 'T-shirts', 'Joggers', 'Sacs'] },
            { title: 'Service Client', links: ["Centre d'aide", 'Suivi de commande', 'Retours & Échanges', 'Livraison', 'Nous contacter'] },
            { title: 'Entreprise', links: ['À propos', 'Devenir vendeur', 'Durabilité', 'Investisseurs'] },
          ].map(col => (
            <div key={col.title}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 18, color: 'var(--text2)' }}>{col.title}</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {col.links.map(l => <li key={l}><a href="#" style={{ fontSize: 13.5, color: 'var(--text2)', transition: 'color .2s' }}>{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 1440, margin: '56px auto 0', borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 11.5, color: 'var(--text3)' }}>© 2025 Bagnon Street Collection. Tous droits réservés.</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Conditions', 'Confidentialité', 'Cookies'].map(l => (
              <a key={l} href="#" style={{ fontSize: 11.5, color: 'var(--text2)', border: '1px solid var(--border)', borderRadius: 3, padding: '5px 12px' }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>

      <CartDrawer />
    </>
  )
}
