import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProducts } from '@/lib/database/products'
import PublicProductListing from '@/components/product/PublicProductListing'
import type { Collection } from '@/types/database'

const SITE_URL = 'https://bagnon-street-collection-ci.vercel.app'

type CollectionPageProps = {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ page?: string }>
}

async function getCollection(slug: string): Promise<Collection | null> {
  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle()

  return (data as Collection) || null
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params
  const collection = await getCollection(slug)

  if (!collection) {
    return {
      title: 'Collection introuvable',
      robots: { index: false, follow: false },
    }
  }

  const description = collection.description || `Decouvrez la collection ${collection.name} de Bagnon Street Collection.`

  return {
    title: `${collection.name} - Bagnon Street Collection`,
    description,
    alternates: { canonical: `${SITE_URL}/collection/${collection.slug}` },
    openGraph: {
      title: `${collection.name} - Bagnon Street Collection`,
      description,
      url: `${SITE_URL}/collection/${collection.slug}`,
      type: 'website',
      images: collection.image
        ? [{ url: collection.image, width: 1200, height: 630, alt: collection.name }]
        : [{ url: '/brand/hero-model.jpg', width: 1200, height: 630, alt: collection.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${collection.name} - Bagnon Street Collection`,
      description,
      images: collection.image ? [collection.image] : ['/brand/hero-model.jpg'],
    },
  }
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const { slug } = await params
  const query = searchParams ? await searchParams : {}
  const page = Math.max(1, Number(query.page || 1) || 1)
  const collection = await getCollection(slug)

  if (!collection) notFound()

  const products = await getProducts({ collection_id: collection.id, page, per_page: 6 })

  return (
    <PublicProductListing
      eyebrow="Collection"
      title={collection.name}
      description={collection.description}
      products={products.data}
      currentPage={products.page}
      totalPages={products.total_pages}
      basePath={`/collection/${collection.slug}`}
    />
  )
}
