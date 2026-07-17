'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const NAV = [
  {
    group: 'Principal',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
      { href: '/admin/produits', label: 'Produits', icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20 7H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg> },
      { href: '/admin/commandes', label: 'Commandes', icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg> },
      { href: '/admin/clients', label: 'Clients', icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg> },
      { href: '/admin/galerie', label: 'Galerie', icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="10" r="1.5"/><path d="M21 15l-5-5L5 19" strokeLinecap="round" strokeLinejoin="round"/></svg> },
      { href: '/admin/videos', label: 'Vidéos', icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="14" height="14" rx="2"/><path d="M17 10l4-2v8l-4-2z" strokeLinejoin="round"/></svg> },
    ]
  },
  {
    group: 'Catalogue',
    items: [
      { href: '/admin/categories', label: 'Catégories', icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 7h18M3 12h18M3 17h18" strokeLinecap="round"/></svg> },
      { href: '/admin/collections', label: 'Collections', icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
    ]
  },
  {
    group: 'Configuration',
    items: [
      { href: '/admin/admins', label: 'Admins', icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round"/><path d="M16 3.5a4 4 0 010 7" strokeLinecap="round"/></svg> },
      { href: '/admin/parametres', label: 'Paramètres', icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> },
    ]
  }
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Close sidebar on route change
  useEffect(() => { setOpen(false) }, [pathname])

  const SidebarContent = () => (
    <aside style={{
      width: 240, height: '100%',
      background: '#0A0A0C',
      borderRight: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto', overflowX: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, position: 'relative', border: '1px solid rgba(255,255,255,0.15)' }}>
            <Image src="/brand/logo-round.jpg" alt="BSC" fill style={{ objectFit: 'cover' }} sizes="32px" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: '.05em', color: '#F2F1ED' }}>BSC Admin</span>
        </div>
        {/* Close button on mobile */}
        <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#4D4D52', cursor: 'pointer', padding: 4, display: 'flex' }} className="sidebar-close">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {NAV.map(group => (
          <div key={group.group} style={{ marginBottom: 8 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, letterSpacing: '.25em', textTransform: 'uppercase', color: '#4D4D52', padding: '8px 20px 4px' }}>
              {group.group}
            </p>
            {group.items.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link key={item.href} href={item.href} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 20px',
                  color: active ? '#F2F1ED' : '#94938E',
                  background: active ? 'rgba(122,22,32,0.15)' : 'transparent',
                  borderLeft: active ? '2px solid #7A1620' : '2px solid transparent',
                  transition: 'all .2s', textDecoration: 'none',
                  fontSize: 13, fontFamily: 'var(--font-display)',
                  fontWeight: active ? 600 : 400,
                }}>
                  <span style={{ flexShrink: 0, color: active ? '#7A1620' : 'currentColor' }}>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
    </aside>
  )

  return (
    <>
      <style>{`
        @media(max-width:768px){
          .sidebar-desktop{display:none!important;}
          .sidebar-mobile-trigger{display:flex!important;}
          .sidebar-close{display:flex!important;}
        }
        @media(min-width:769px){
          .sidebar-mobile-trigger{display:none!important;}
          .sidebar-mobile-overlay{display:none!important;}
          .sidebar-close{display:none!important;}
        }
      `}</style>

      {/* Desktop sidebar */}
      <div className="sidebar-desktop" style={{ display: 'flex', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
        <SidebarContent />
      </div>

      {/* Mobile hamburger button */}
      <button
        className="sidebar-mobile-trigger"
        onClick={() => setOpen(true)}
        style={{
          display: 'none', position: 'fixed', top: 14, left: 16,
          zIndex: 250, background: '#17171B',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 6, padding: '7px 10px',
          color: '#F2F1ED', cursor: 'pointer', alignItems: 'center',
        }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <line x1="4" y1="7" x2="20" y2="7"/>
          <line x1="4" y1="12" x2="20" y2="12"/>
          <line x1="4" y1="17" x2="20" y2="17"/>
        </svg>
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="sidebar-mobile-overlay" style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex' }}>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', zIndex: 301, height: '100vh', flexShrink: 0 }}>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  )
}
