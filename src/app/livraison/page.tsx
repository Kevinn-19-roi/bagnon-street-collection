import type { Metadata } from 'next'
import LegalPlaceholderPage from '@/components/LegalPlaceholderPage'

export const metadata: Metadata = {
  title: 'Livraison',
  robots: { index: false, follow: false },
}

export default function DeliveryPage() {
  return (
    <LegalPlaceholderPage
      title="Livraison"
      description="Cette page attend les conditions exactes de livraison. Les tarifs utilises par le checkout restent ceux des parametres du dashboard."
      neededContent={[
        'Zones couvertes en Cote d Ivoire.',
        'Delais moyens de preparation et de livraison.',
        'Frais, livraison offerte et cas particuliers.',
      ]}
    />
  )
}
