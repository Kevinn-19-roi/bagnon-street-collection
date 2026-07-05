'use client'
import { logoutAdmin } from '@/lib/actions/auth'
import { Admin } from '@/types/database'

export default function TopBar({ admin }: { admin: Admin }) {
  return (
    <header style={{
      height: 60,
      background: '#0A0A0C',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4CAF50' }} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: '#94938E', letterSpacing: '.03em' }}>
          Système opérationnel
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#F2F1ED' }}>{admin.fullname}</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#7A1620', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700 }}>{admin.role}</p>
        </div>
        <form action={logoutAdmin}>
          <button type="submit" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            background: 'none',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 3,
            padding: '7px 14px',
            color: '#94938E',
            cursor: 'pointer',
            transition: 'all .2s',
          }}>
            Déconnexion
          </button>
        </form>
      </div>
    </header>
  )
}
