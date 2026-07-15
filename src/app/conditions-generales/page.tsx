import type { Metadata } from 'next'
import LegalPlaceholderPage from '@/components/LegalPlaceholderPage'

export const metadata: Metadata = {
  title: 'Conditions generales de vente',
  robots: { index: false, follow: false },
}

export default function TermsPage() {
  return (
    <LegalPlaceholderPage
      title="Conditions generales de vente"
      description="Cette page est prete techniquement, mais le contenu commercial final doit etre fourni par Bagnon Street Collection avant indexation."
      neededContent={[
        'Identite du vendeur et informations de contact officielles.',
        'Conditions de commande, prix, disponibilite et validation.',
        'Conditions de paiement, livraison, annulation et litiges.',
      ]}
    />
  )
}
