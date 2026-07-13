'use client'

import { ReactNode } from 'react'

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
      {children}
    </form>
  )
}
