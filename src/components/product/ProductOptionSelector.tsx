'use client'

import { useState } from 'react'

type ProductOption = {
  label: string
  value: string
  stock?: number
  colorHex?: string
}

type ProductOptionSelectorProps = {
  label: string
  name: string
  options: ProductOption[]
  required?: boolean
}

export default function ProductOptionSelector({
  label,
  name,
  options,
  required = false,
}: ProductOptionSelectorProps) {
  const firstAvailable = options.find(option => (option.stock ?? 1) > 0)?.value || ''
  const [selected, setSelected] = useState(firstAvailable)

  if (options.length === 0) return null

  return (
    <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: 10 }}>
      <legend style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text2)' }}>
        {label}
      </legend>
      <input type="hidden" name={name} value={selected} required={required} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map(option => {
          const disabled = (option.stock ?? 1) <= 0
          const active = selected === option.value

          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() => setSelected(option.value)}
              style={{
                minWidth: option.colorHex ? 42 : 48,
                height: 42,
                padding: option.colorHex ? 0 : '0 14px',
                borderRadius: 4,
                border: active ? '1px solid var(--text)' : '1px solid var(--border2)',
                background: disabled ? 'rgba(255,255,255,0.03)' : 'var(--bg2)',
                color: disabled ? 'var(--text3)' : 'var(--text)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-display)',
                fontSize: 12,
                fontWeight: 700,
                opacity: disabled ? 0.45 : 1,
              }}
            >
              {option.colorHex ? (
                <span style={{ display: 'inline-block', width: 20, height: 20, borderRadius: '50%', background: option.colorHex, border: '1px solid rgba(255,255,255,0.35)' }} />
              ) : (
                option.label
              )}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
