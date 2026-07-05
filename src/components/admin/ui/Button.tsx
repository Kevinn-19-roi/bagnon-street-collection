'use client'
interface Props {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
}

const variants = {
  primary: { bg: '#7A1620', color: '#fff', border: 'transparent' },
  secondary: { bg: '#1A2A6C', color: '#fff', border: 'transparent' },
  danger: { bg: 'rgba(122,22,32,0.15)', color: '#EF5350', border: 'rgba(239,83,80,0.3)' },
  ghost: { bg: 'transparent', color: '#94938E', border: 'rgba(255,255,255,0.12)' },
}

const sizes = {
  sm: { padding: '6px 12px', fontSize: 11 },
  md: { padding: '9px 18px', fontSize: 12 },
  lg: { padding: '12px 24px', fontSize: 13 },
}

export default function Button({ children, onClick, variant = 'primary', size = 'md', disabled, type = 'button', fullWidth }: Props) {
  const v = variants[variant]
  const s = sizes[size]
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: v.bg, color: v.color,
        border: `1px solid ${v.border}`,
        borderRadius: 3, padding: s.padding,
        fontFamily: 'var(--font-display)', fontSize: s.fontSize,
        fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? .5 : 1,
        transition: 'all .2s',
        width: fullWidth ? '100%' : 'auto',
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}
    >
      {children}
    </button>
  )
}
