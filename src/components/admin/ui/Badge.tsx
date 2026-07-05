type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default'

const variants: Record<BadgeVariant, { bg: string; color: string }> = {
  success: { bg: 'rgba(46,125,50,0.15)', color: '#4CAF50' },
  warning: { bg: 'rgba(245,196,75,0.15)', color: '#F5C84B' },
  error: { bg: 'rgba(122,22,32,0.15)', color: '#EF5350' },
  info: { bg: 'rgba(26,42,108,0.2)', color: '#5C7CFA' },
  default: { bg: 'rgba(255,255,255,0.06)', color: '#94938E' },
}

export default function Badge({ label, variant = 'default' }: { label: string; variant?: BadgeVariant }) {
  const { bg, color } = variants[variant]
  return (
    <span style={{ background: bg, color, fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 3, display: 'inline-block', whiteSpace: 'nowrap' }}>
      {label}
    </span>
  )
}
