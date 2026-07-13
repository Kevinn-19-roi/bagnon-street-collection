import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  minWidth?: number
}

export default function ResponsiveTable({ children, minWidth = 760 }: Props) {
  return (
    <div style={{ background: '#17171B', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, overflow: 'hidden', maxWidth: '100%' }}>
      <div
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorX: 'contain',
          maxWidth: '100%',
        }}
      >
        <div style={{ minWidth }}>
          {children}
        </div>
      </div>
    </div>
  )
}
