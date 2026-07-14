'use client'

import { useState, type CSSProperties, type InputHTMLAttributes } from 'react'

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  inputStyle?: CSSProperties
}

export default function PasswordInput({
  inputStyle,
  id,
  name = 'password',
  autoComplete,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const inputId = id || `${name}-input`

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        {...props}
        id={inputId}
        name={name}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        style={{
          ...inputStyle,
          width: '100%',
          paddingRight: 46,
        }}
      />
      <button
        type="button"
        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        aria-controls={inputId}
        aria-pressed={visible}
        onClick={() => setVisible(value => !value)}
        style={{
          position: 'absolute',
          right: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 32,
          height: 32,
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 4,
          background: 'rgba(255,255,255,0.03)',
          color: 'inherit',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          lineHeight: 1,
        }}
      >
        {visible ? '●' : '👁'}
      </button>
    </div>
  )
}
