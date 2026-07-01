import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: { default: 'Bagnon Street Collection', template: '%s | BSC' },
  description: 'Streetwear né à Abidjan. Identité. Mouvement.',
  openGraph: {
    title: 'Bagnon Street Collection',
    description: 'Streetwear né à Abidjan. Identité. Mouvement.',
    locale: 'fr_CI',
    type: 'website',
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
