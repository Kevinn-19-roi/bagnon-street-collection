import { getFeatured, getNew, PRODUCTS } from '@/lib/products'
import HomeClient from '@/components/HomeClient'

export default function HomePage() {
  const featured = getFeatured()
  const newItems = getNew()
  const bestsellers = PRODUCTS.filter(p => !p.isNew).slice(0, 5)
  return <HomeClient featured={featured} newItems={newItems} bestsellers={bestsellers} allProducts={PRODUCTS} />
}
