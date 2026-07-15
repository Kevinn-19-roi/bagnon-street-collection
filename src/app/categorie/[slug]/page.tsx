import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProducts } from '@/lib/database/products'
import PublicProductListing from '@/components/product/PublicProductListing'
import type { Category } from '@/types/database'

const SITE_URL = 'https://bagnon-street-collection-ci.vercel.app'

type CategoryPageProps = {
  params: Promise<{ slug: string }>
}

async function getCategory(slug: string): Promise<Category | null> {
  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('categories')
    .select('*')
    .eq('slug', slug)
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
      images: category.image ? [{ url: category.image, alt: category.name }] : undefined,
    },
    twitter: {
      card: category.image ? 'summary_large_image' : 'summary',
      title: `${category.name} - Bagnon Street Collection`,
      description,
      images: category.image ? [category.image] : undefined,
    },
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) notFound()

  const products = await getProducts({ category_id: category.id, per_page: 48 })

  return (
    <PublicProductListing
      eyebrow="Categorie"
      title={category.name}
      description={category.description}
      products={products.data}
    />
  )
}
