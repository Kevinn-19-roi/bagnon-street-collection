'use client'
import Link from 'next/link'
import { logoutAdmin } from '@/lib/actions/auth'
import { Admin } from '@/types/database'

export default function TopBar({ admin }: { admin: Admin }) {
  return (
    <header style={{
      height: 56,
      background: '#0A0A0C',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px 0 60px', // left padding for hamburger on mobile
      position: 'sticky',
      top: 0,
      zIndex: 200,
      flexShrink: 0,
    }}>
      <style>{`
        @media(min-width:769px){
          .topbar-inner{padding-left:20px!important;}
        }
      `}</style>

      <div className="topbar-status" style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4CAF50', flexShrink: 0 }} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: '#94938E', letterSpacing: '.03em' }}>
          Système opérationnel
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <Link href="/" style={{
          fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700,
          letterSpacing: '.08em', textTransform: 'uppercase',
          background: 'rgba(26,42,108,0.2)', border: '1px solid rgba(26,42,108,0.4)',
          borderRadius: 3, padding: '6px 10px', color: '#8EA2FF',
          textDecoration: 'none', whiteSpace: 'nowrap',
        }}>
          Voir le site
        </Link>
        <div style={{ textAlign: 'right', display: 'none' }} className="admin-name-desktop">
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, color: '#F2F1ED' }}>{admin.fullname}</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 9, color: '#7A1620', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700 }}>{admin.role}</p>
        </div>
        <form action={logoutAdmin}>
          <button type="submit" style={{
            fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700,
            letterSpacing: '.08em', textTransform: 'uppercase',
            background: 'none', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 3, padding: '6px 12px', color: '#94938E', cursor: 'pointer',
          }}>
            Déco.
          </button>
        </form>
      </div>

      <style>{`
        @media(max-width:420px){
          .topbar-status span{display:none!important;}
        }
        @media(min-width:769px){
          .admin-name-desktop{display:block!important;}
        }
      `}</style>
    </header>
  )
}
