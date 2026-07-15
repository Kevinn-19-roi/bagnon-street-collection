import type { MetadataRoute } from 'next'

const SITE_URL = 'https://bagnon-street-collection-ci.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/connexion',
        '/inscription',
        '/profil',
        '/checkout',
        '/commande/',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
