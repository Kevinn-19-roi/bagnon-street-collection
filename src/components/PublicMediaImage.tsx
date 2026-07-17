'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import Image from 'next/image'

type Props = {
  src?: string | null
  alt: string
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  priority?: boolean
  style?: CSSProperties
  className?: string
}

function isProbablyImageUrl(src?: string | null) {
  if (!src) return false
  if (src.startsWith('/')) return true
  try {
    const url = new URL(src)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export default function PublicMediaImage({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  priority,
  style,
  className,
}: Props) {
  const [failed, setFailed] = useState(false)
  const valid = isProbablyImageUrl(src)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (!valid || failed) {
    return (
      <div
        className={className}
        style={{
          position: fill ? 'absolute' : 'relative',
          inset: fill ? 0 : undefined,
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
          display: 'grid',
          placeItems: 'center',
          background: 'var(--bg3)',
          color: 'var(--text3)',
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          letterSpacing: '.08em',
          ...style,
        }}
        aria-label={alt}
      >
        BSC
      </div>
    )
  }

  return (
    <Image
      src={src as string}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      priority={priority}
      style={style}
      className={className}
      onError={() => setFailed(true)}
      unoptimized={src?.includes('/storage/v1/object/sign/')}
    />
  )
}
