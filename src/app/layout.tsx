import type { Metadata } from 'next'
import '@/styles/globals.css'

const siteUrl = 'https://bagnon-street-collection-ci.vercel.app'
const defaultDescription = 'Streetwear ne a Abidjan. Identite, mouvement et pieces Bagnon Street Collection disponibles en Cote d Ivoire.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: 'Bagnon Street Collection',
  title: { default: 'Bagnon Street Collection', template: '%s | BSC' },
  description: defaultDescription,
  alternates: { canonical: '/' },
  icons: {
    icon: '/brand/logo-round.jpg',
    apple: '/brand/logo-round.jpg',
  },
  openGraph: {
    title: 'Bagnon Street Collection',
    description: defaultDescription,
    url: siteUrl,
    siteName: 'Bagnon Street Collection',
    locale: 'fr_CI',
    type: 'website',
    images: [{ url: '/brand/hero-model.jpg', alt: 'Bagnon Street Collection' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bagnon Street Collection',
    description: defaultDescription,
    images: ['/brand/hero-model.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){var t=localStorage.getItem('bsc-theme')||'dark';document.documentElement.setAttribute('data-theme',t);})();`
        }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
