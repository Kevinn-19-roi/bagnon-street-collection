'use client'

import { useFormStatus } from 'react-dom'
import Button from '@/components/admin/ui/Button'

type Props = {
  idle: string
  pending: string
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export default function PendingSubmitButton({ idle, pending, variant, size, fullWidth }: Props) {
  const { pending: isPending } = useFormStatus()

  return (
    <Button type="submit" variant={variant} size={size} fullWidth={fullWidth} disabled={isPending}>
      {isPending ? pending : idle}
    </Button>
  )
}

