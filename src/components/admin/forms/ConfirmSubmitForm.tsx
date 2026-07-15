'use client'

import { ReactNode } from 'react'
import { useFormStatus } from 'react-dom'

interface Props {
  action: (formData: FormData) => void | Promise<void>
  message: string
  children: ReactNode
  style?: React.CSSProperties
}

export default function ConfirmSubmitForm({ action, message, children, style }: Props) {
  return (
    <form
      action={action}
      style={style}
      onSubmit={event => {
        if (!confirm(message)) event.preventDefault()
      }}
    >
      <PendingFieldset>{children}</PendingFieldset>
    </form>
  )
}

function PendingFieldset({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus()

  return (
    <fieldset disabled={pending} style={{ border: 0, padding: 0, margin: 0, opacity: pending ? .65 : 1, pointerEvents: pending ? 'none' : 'auto' }}>
      {children}
    </fieldset>
  )
}
