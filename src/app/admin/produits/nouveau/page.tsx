export const dynamic = 'force-dynamic'
import AdminShell from '@/components/admin/layout/AdminShell'
import PageHeader from '@/components/admin/ui/PageHeader'
import ProductForm from '@/components/admin/forms/ProductForm'
import { getAllCategoriesAdmin, getCollections } from '@/lib/database/categories'
import { createProduct } from '@/lib/actions/products'

export const metadata = { title: 'Nouveau produit — Admin BSC' }

export default async function NouveauProduitPage() {
  const [categories, collections] = await Promise.all([
    getAllCategoriesAdmin(),
    getCollections(),
  ])

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Catalogue"
        title="Nouveau produit"
        subtitle="Ajouter un nouveau produit au catalogue"
      />
      <ProductForm
        categories={categories}
        collections={collections}
        onSubmit={createProduct}
      />
    </AdminShell>
  )
}
