import type { Metadata } from 'next'
import LegalPlaceholderPage from '@/components/LegalPlaceholderPage'

export const metadata: Metadata = {
  title: 'Mentions legales',
  robots: { index: false, follow: false },
}

export default function LegalNoticePage() {
  return (
    <LegalPlaceholderPage
      title="Mentions legales"
      description="La page existe pour preparer la production, mais les informations administratives officielles doivent etre renseignees."
      neededContent={[
        'Nom legal ou commercial complet.',
        'Adresse, contact officiel et responsable de publication.',
        "Informations d'hebergement et obligations locales applicables.",
      ]}
    />
  )
}
