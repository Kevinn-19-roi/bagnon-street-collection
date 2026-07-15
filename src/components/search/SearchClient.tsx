'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import RelatedProductCard from '@/components/product/RelatedProductCard'
import type { Product } from '@/types/database'

type SearchClientProps = {
  initialQuery: string
  initialPage: number
  initialProducts: Product[]
  initialTotal: number
  initialTotalPages: number
}

type SearchState = {
  products: Product[]
  total: number
  page: number
  totalPages: number
}

export default function SearchClient({
  initialQuery,
  initialPage,
  initialProducts,
  initialTotal,
  initialTotalPages,
}: SearchClientProps) {
  const [query, setQuery] = useState(initialQuery)
  const [page, setPage] = useState(initialPage)
  const [state, setState] = useState<SearchState>({
    products: initialProducts,
    total: initialTotal,
    page: initialPage,
    totalPages: initialTotalPages,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [retryKey, setRetryKey] = useState(0)
  const abortRef = useRef<AbortController | null>(null)
  const firstRun = useRef(true)

  const debouncedQuery = useMemo(() => query.trim(), [query])

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }

    const timeout = window.setTimeout(async () => {
      const nextQuery = debouncedQuery
      const nextPage = page
      const nextUrl = nextQuery
        ? `/recherche?q=${encodeURIComponent(nextQuery)}${nextPage > 1 ? `&page=${nextPage}` : ''}`
        : '/recherche'

      window.history.replaceState(null, '', nextUrl)

      if (!nextQuery) {
        abortRef.current?.abort()
        setState({ products: [], total: 0, page: 1, totalPages: 1 })
        setError('')
        setLoading(false)
        return
      }

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`/api/recherche?q=${encodeURIComponent(nextQuery)}&page=${nextPage}`, {
          signal: controller.signal,
        })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Recherche impossible.')
        setState({
          products: payload.products || [],
          total: payload.total || 0,
          page: payload.page || 1,
          totalPages: payload.totalPages || 1,
        })
      } catch (searchError) {
        if (searchError instanceof DOMException && searchError.name === 'AbortError') return
        setError('Recherche impossible pour le moment.')
      } finally {
        setLoading(false)
      }
    }, 320)

    return () => window.clearTimeout(timeout)
  }, [debouncedQuery, page, retryKey])

  function updateQuery(value: string) {
    setQuery(value)
    setPage(1)
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <header style={{ padding: '18px var(--px)', borderBottom: '1px solid var(--border)', background: 'var(--nav-bg)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
          <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>
            Retour a la boutique
          </Link>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--red)' }}>
            Recherche
          </span>
        </div>
      </header>

      <style>{`
        @media(max-width:760px){
          .search-product-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;}
        }
        @media(max-width:390px){
          .search-product-grid{grid-template-columns:1fr!important;}
        }
      `}</style>

      <section style={{ padding: 'clamp(34px,7vw,76px) var(--px)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 10 }}>
            Recherche
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,7vw,62px)', lineHeight: 1, letterSpacing: '-.03em', marginBottom: 18 }}>
            Trouver une piece
          </h1>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 18 }}>
            <input
              autoFocus
              value={query}
              onChange={event => updateQuery(event.target.value)}
              type="search"
              placeholder="Rechercher un produit, une categorie..."
              aria-label="Recherche"
              style={{ flex: 1, minWidth: 0, background: 'var(--search)', border: '1px solid var(--border2)', borderRadius: 4, padding: '14px 15px', color: 'var(--text)', fontSize: 15, outline: 'none' }}
            />
            {query && (
              <button type="button" onClick={() => updateQuery('')} style={{ border: '1px solid var(--border2)', borderRadius: 4, padding: '14px 15px', color: 'var(--text2)', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                Effacer
              </button>
            )}
          </div>

          <div aria-live="polite" style={{ minHeight: 24, marginBottom: 20 }}>
            {loading && <p style={{ color: 'var(--text3)', fontSize: 13 }}>Recherche en cours...</p>}
            {error && (
              <p role="alert" style={{ color: 'var(--red)', fontSize: 13 }}>
                {error} <button type="button" onClick={() => setRetryKey(current => current + 1)} style={{ textDecoration: 'underline' }}>Reessayer</button>
              </p>
            )}
            {!loading && !error && query && <p style={{ color: 'var(--text2)', fontSize: 13 }}>{state.total} resultat{state.total > 1 ? 's' : ''}</p>}
          </div>

          {state.products.length > 0 ? (
            <>
              <div className="search-product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 12 }}>
                {state.products.map(product => <RelatedProductCard key={product.id} product={product} />)}
              </div>
              {state.totalPages > 1 && (
                <nav aria-label="Pagination recherche" style={{ display: 'flex', justifyContent: 'center', gap: 10, alignItems: 'center', marginTop: 28 }}>
                  <button type="button" disabled={state.page <= 1} onClick={() => setPage(current => Math.max(1, current - 1))} style={{ opacity: state.page <= 1 ? .45 : 1, border: '1px solid var(--border2)', borderRadius: 3, padding: '10px 14px', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>
                    Precedent
                  </button>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--text3)', letterSpacing: '.08em', textTransform: 'uppercase' }}>Page {state.page} / {state.totalPages}</span>
                  <button type="button" disabled={state.page >= state.totalPages} onClick={() => setPage(current => Math.min(state.totalPages, current + 1))} style={{ opacity: state.page >= state.totalPages ? .45 : 1, background: 'var(--btn)', color: 'var(--btn-t)', borderRadius: 3, padding: '10px 14px', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                    Suivant
                  </button>
                </nav>
              )}
            </>
          ) : (
            <div style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 24, background: 'var(--bg2)' }}>
              <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                {query ? 'Aucun produit trouve' : 'Tape un mot pour commencer la recherche.'}
              </p>
              <Link href="/#collection" style={{ display: 'inline-flex', background: 'var(--btn)', color: 'var(--btn-t)', borderRadius: 3, padding: '12px 16px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                Retour a la boutique
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
