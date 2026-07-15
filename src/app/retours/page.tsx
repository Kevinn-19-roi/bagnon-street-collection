import type { Metadata } from 'next'
import LegalPlaceholderPage from '@/components/LegalPlaceholderPage'

export const metadata: Metadata = {
  title: 'Politique de retour',
  robots: { index: false, follow: false },
}

export default function ReturnsPage() {
  return (
    <LegalPlaceholderPage
      title="Politique de retour"
      description="Aucune regle de retour definitive n'a ete inventee. Le contenu doit etre confirme par l'equipe avant lancement public."
      neededContent={[
        'Delai de retour accepte.',
        'Etat attendu des articles retournes.',
        'Procedure de demande de retour et frais eventuels.',
      ]}
    />
  )
}
