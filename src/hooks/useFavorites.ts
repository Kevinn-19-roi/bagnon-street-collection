'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'

const FAVORITES_KEY = 'bsc-favorites'
const FAVORITES_EVENT = 'bsc-favorites-change'

function readFavorites() {
  if (typeof window === 'undefined') return new Set<string>()

  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY)
    const values = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(values) ? values.filter(value => typeof value === 'string') : [])
  } catch {
    return new Set<string>()
  }
}

function writeFavorites(favorites: Set<string>) {
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]))
  window.dispatchEvent(new Event(FAVORITES_EVENT))
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {}

  window.addEventListener(FAVORITES_EVENT, callback)
  window.addEventListener('storage', callback)

  return () => {
    window.removeEventListener(FAVORITES_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}

function getSnapshot() {
  return [...readFavorites()].sort().join('|')
}

export function useFavorites() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => '')
  const favorites = new Set(snapshot ? snapshot.split('|') : [])

  useEffect(() => {
    window.dispatchEvent(new Event(FAVORITES_EVENT))
  }, [])

  const isFavorite = useCallback((productId: string) => favorites.has(productId), [snapshot])

  const toggleFavorite = useCallback((productId: string) => {
    const next = readFavorites()
    if (next.has(productId)) next.delete(productId)
    else next.add(productId)
    writeFavorites(next)
  }, [])

  return {
    favorites,
    isFavorite,
    toggleFavorite,
  }
}
