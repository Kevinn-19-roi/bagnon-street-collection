interface Props {
  label: string
  value: string | number
  color?: 'red' | 'blue' | 'green' | 'default'
  icon?: React.ReactNode
}

const colors = {
  red: '#7A1620',
  blue: '#1A2A6C',
  green: '#2E7D32',
  default: '#94938E',
}

export default function StatCard({ label, value, color = 'default', icon }: Props) {
  return (
    <div style={{ background: '#17171B', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
      {icon && <div style={{ color: colors[color], flexShrink: 0 }}>{icon}</div>}
      <div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: '#4D4D52', marginBottom: 6 }}>{label}</p>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, letterSpacing: '-.02em', color: '#F2F1ED' }}>{value}</p>
      </div>
    </div>
  )
}
