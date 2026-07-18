import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateSlug } from '@/lib/helpers/slugify'

const SITE_URL = 'https://bagnon-street.com'

export const revalidate = 3600

type SitemapRecord = {
  slug: string
  name?: string | null
  updated_at?: string | null
  created_at?: string | null
}

function entry(url: string, lastModified?: string | null, priority = 0.7): MetadataRoute.Sitemap[number] {
  return {
    url,
    lastModified: lastModified ? new Date(lastModified) : new Date(),
    changeFrequency: 'weekly',
    priority,
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    entry(SITE_URL, null, 1),
  ]

  try {
    const adminClient = createAdminClient()
    const [products, categories, collections] = await Promise.all([
      adminClient
        .from('products')
        .select('slug, name, updated_at, created_at')
        .eq('active', true)
        .order('updated_at', { ascending: false }),
      adminClient
        .from('categories')
        .select('slug, created_at')
        .eq('active', true)
        .order('display_order', { ascending: true }),
      adminClient
        .from('collections')
        .select('slug, created_at')
        .eq('active', true)
        .order('created_at', { ascending: false }),
    ])

    for (const category of (categories.data || []) as SitemapRecord[]) {
      routes.push(entry(`${SITE_URL}/categorie/${category.slug}`, category.created_at, 0.7))
    }

    for (const collection of (collections.data || []) as SitemapRecord[]) {
      routes.push(entry(`${SITE_URL}/collection/${collection.slug}`, collection.created_at, 0.7))
    }

    for (const product of (products.data || []) as SitemapRecord[]) {
      const slug = generateSlug(product.slug || product.name || '')
      if (slug) routes.push(entry(`${SITE_URL}/produit/${slug}`, product.updated_at || product.created_at, 0.9))
    }
  } catch {
    return routes
  }

  return routes
}
