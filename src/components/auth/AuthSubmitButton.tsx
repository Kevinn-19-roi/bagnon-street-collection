'use client'

import { useFormStatus } from 'react-dom'
import type { CSSProperties } from 'react'

type Props = {
  idleLabel: string
  pendingLabel: string
  style?: CSSProperties
}

export default function AuthSubmitButton({ idleLabel, pendingLabel, style }: Props) {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending} aria-disabled={pending} style={{ ...style, opacity: pending ? 0.68 : 1, cursor: pending ? 'wait' : 'pointer' }}>
      {pending ? pendingLabel : idleLabel}
    </button>
  )
}
