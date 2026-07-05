interface Props {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export default function PageHeader({ eyebrow, title, subtitle, action }: Props) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
      <div>
        {eyebrow && <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 600, letterSpacing: '.35em', textTransform: 'uppercase', color: '#7A1620', marginBottom: 6 }}>{eyebrow}</p>}
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-.02em', color: '#F2F1ED' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: '#94938E', marginTop: 4 }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
