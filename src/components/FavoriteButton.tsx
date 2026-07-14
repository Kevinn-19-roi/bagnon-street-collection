'use client'

import { useState } from 'react'
import { useFavorites } from '@/hooks/useFavorites'

type FavoriteButtonProps = {
  productId: string
  label?: string
  size?: number
  style?: React.CSSProperties
}

export default function FavoriteButton({ productId, label = 'Ajouter aux favoris', size = 20, style }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorite = isFavorite(productId)
  const [burst, setBurst] = useState(false)

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    toggleFavorite(productId)
    setBurst(true)
    window.setTimeout(() => setBurst(false), 260)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={favorite}
      aria-label={favorite ? 'Retirer des favoris' : label}
      className={burst ? 'favorite-button favorite-button-pop' : 'favorite-button'}
      style={{
        width: size + 12,
        height: size + 12,
        borderRadius: '50%',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,.2)',
        color: favorite ? 'var(--red)' : 'var(--text2)',
        cursor: 'pointer',
        transition: 'color .18s ease, transform .18s ease, border-color .18s ease',
        ...style,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill={favorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 21s-7-4.6-9.7-9C.5 8.4 1.8 4.8 5 4.1c2-.4 3.7.6 5 2.4 1.3-1.8 3-2.8 5-2.4 3.2.7 4.5 4.3 2.7 7.9C19 16.4 12 21 12 21z" />
      </svg>
    </button>
  )
}
