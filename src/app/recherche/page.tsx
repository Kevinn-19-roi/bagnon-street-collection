import type { Metadata } from 'next'
import { getProducts } from '@/lib/database/products'
import PublicProductListing from '@/components/product/PublicProductListing'

const SITE_URL = 'https://bagnon-street-collection-ci.vercel.app'

type SearchPageProps = {
  searchParams?: Promise<{ q?: string; page?: string }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = searchParams ? await searchParams : {}
  const query = params.q?.trim() || ''
  const title = query ? `Recherche : ${query}` : 'Recherche'
  const description = query
    ? `Resultats de recherche pour ${query} sur Bagnon Street Collection.`
    : 'Rechercher un produit Bagnon Street Collection.'

  return {
    title,
    description,
    alternates: { canonical: query ? `${SITE_URL}/recherche?q=${encodeURIComponent(query)}` : `${SITE_URL}/recherche` },
    openGraph: {
      title: `${title} - Bagnon Street Collection`,
      description,
      url: query ? `${SITE_URL}/recherche?q=${encodeURIComponent(query)}` : `${SITE_URL}/recherche`,
      type: 'website',
      images: [{ url: '/brand/hero-model.jpg', width: 1200, height: 630, alt: 'Bagnon Street Collection' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/brand/hero-model.jpg'],
    },
    robots: query ? { index: false, follow: true } : { index: false, follow: true },
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = searchParams ? await searchParams : {}
  const query = params.q?.trim() || ''
  const page = Math.max(1, Number(params.page || 1) || 1)
  const products = query
    ? await getProducts({ search: query, page, per_page: 6 })
    : { data: [], page: 1, total_pages: 1, total: 0, per_page: 6 }

  return (
    <PublicProductListing
      eyebrow="Recherche"
      title={query ? `Resultats pour "${query}"` : 'Recherche'}
      description={query ? `${products.total} produit${products.total > 1 ? 's' : ''} trouve${products.total > 1 ? 's' : ''}.` : 'Tape un mot-cle depuis la barre de recherche pour trouver une piece.'}
      products={products.data}
      currentPage={products.page}
      totalPages={products.total_pages}
      basePath={`/recherche?q=${encodeURIComponent(query)}`}
      emptyTitle={query ? 'Aucun produit trouve' : 'Aucune recherche lancee'}
      emptyCtaLabel="Retour a la boutique"
    />
  )
}
