import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProducts } from '@/lib/database/products'
import PublicProductListing from '@/components/product/PublicProductListing'
import type { Category } from '@/types/database'

const SITE_URL = 'https://bagnon-street-collection-ci.vercel.app'

type CategoryPageProps = {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ page?: string }>
}

async function getCategory(slug: string): Promise<Category | null> {
  const normalizedSlug = slug === 'bas' ? 'pantalons' : slug
  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('categories')
    .select('*')
    .eq('slug', normalizedSlug)
    .eq('active', true)
    .maybeSingle()

  return (data as Category) || null
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    return {
      title: 'Categorie introuvable',
      robots: { index: false, follow: false },
    }
  }

  const description = category.description || `Decouvrez les produits ${category.name} de Bagnon Street Collection.`

  return {
    title: `${category.name} - Bagnon Street Collection`,
    description,
    alternates: { canonical: `${SITE_URL}/categorie/${category.slug}` },
    openGraph: {
      title: `${category.name} - Bagnon Street Collection`,
      description,
      url: `${SITE_URL}/categorie/${category.slug}`,
      type: 'website',
      images: category.image
        ? [{ url: category.image, width: 1200, height: 630, alt: category.name }]
        : [{ url: '/brand/hero-model.jpg', width: 1200, height: 630, alt: category.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} - Bagnon Street Collection`,
      description,
      images: category.image ? [category.image] : ['/brand/hero-model.jpg'],
    },
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const query = searchParams ? await searchParams : {}
  const page = Math.max(1, Number(query.page || 1) || 1)
  const category = await getCategory(slug)

  if (!category) notFound()

  const products = await getProducts({ category_id: category.id, page, per_page: 6 })

  return (
    <PublicProductListing
      eyebrow="Categorie"
      title={category.name}
      description={category.description}
      products={products.data}
      currentPage={products.page}
      totalPages={products.total_pages}
      basePath={`/categorie/${category.slug}`}
    />
  )
}
