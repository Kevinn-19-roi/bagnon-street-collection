import type { Metadata } from 'next'
import LegalPlaceholderPage from '@/components/LegalPlaceholderPage'

export const metadata: Metadata = {
  title: 'Politique de confidentialite',
  robots: { index: false, follow: false },
}

export default function PrivacyPage() {
  return (
    <LegalPlaceholderPage
      title="Politique de confidentialite"
      description="Cette structure attend les informations legales exactes sur la collecte et l'utilisation des donnees client."
      neededContent={[
        'Donnees collectees lors du compte client, du panier et du checkout.',
        'Finalites de traitement, durees de conservation et droits des clients.',
        'Prestataires impliques : Supabase, Vercel, Wave et futurs services autorises.',
      ]}
    />
  )
}
