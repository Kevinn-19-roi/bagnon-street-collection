interface Props {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export default function PageHeader({ eyebrow, title, subtitle, action }: Props) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
      <div style={{ minWidth: 0 }}>
        {eyebrow && <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 600, letterSpacing: '.35em', textTransform: 'uppercase', color: '#7A1620', marginBottom: 6 }}>{eyebrow}</p>}
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 6vw, 26px)', fontWeight: 700, letterSpacing: '-.02em', color: '#F2F1ED', overflowWrap: 'anywhere' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: '#94938E', marginTop: 4 }}>{subtitle}</p>}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}
