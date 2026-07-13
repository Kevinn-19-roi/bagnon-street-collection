'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { signOutUser } from '@/lib/actions/auth'

type LogoutButtonProps = {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
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
