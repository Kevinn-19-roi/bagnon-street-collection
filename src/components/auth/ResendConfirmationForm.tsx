'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useFormStatus } from 'react-dom'
import { resendSignupConfirmation } from '@/lib/actions/auth'

type Props = {
  email: string
  startCooldown?: boolean
  style?: CSSProperties
}

function ResendButton({ cooldown, style }: { cooldown: number; style?: CSSProperties }) {
  const { pending } = useFormStatus()
  const disabled = pending || cooldown > 0
  const label = pending
    ? 'Renvoi...'
    : cooldown > 0
      ? `Renvoyer dans ${cooldown}s`
      : 'Renvoyer l’email de confirmation'

  return (
    <button
      type="submit"
      disabled={disabled}
      aria-disabled={disabled}
      style={{
        ...style,
        opacity: disabled ? 0.68 : 1,
        cursor: disabled ? 'wait' : 'pointer',
      }}
    >
      {label}
    </button>
  )
}

export default function ResendConfirmationForm({ email, startCooldown = false, style }: Props) {
  const [cooldown, setCooldown] = useState(startCooldown ? 60 : 0)

  useEffect(() => {
    if (cooldown <= 0) return

    const timer = window.setInterval(() => {
      setCooldown(value => Math.max(0, value - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [cooldown])

  return (
    <form action={resendSignupConfirmation}>
      <input type="hidden" name="email" value={email} />
      <ResendButton cooldown={cooldown} style={style} />
    </form>
  )
}
