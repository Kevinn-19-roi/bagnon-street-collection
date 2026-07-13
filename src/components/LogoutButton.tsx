'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { signOutUser } from '@/lib/actions/auth'

type LogoutButtonProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties
  onBeforeLogout?: () => void
}

export default function LogoutButton({ children, className, style, onBeforeLogout }: LogoutButtonProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleClick() {
    onBeforeLogout?.()

    startTransition(async () => {
      await signOutUser()
      router.replace('/')
      router.refresh()
    })
  }

  return (
    <button type="button" className={className} style={style} onClick={handleClick} disabled={pending}>
      {children}
    </button>
  )
}
