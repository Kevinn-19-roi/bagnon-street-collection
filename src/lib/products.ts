export interface Product {
  id: string
  slug: string
  name: string
  description: string
  price: number
  compareAt: number
  discount: number
  category: string
  images: string[]
  featured: boolean
  inStock: boolean
  isNew: boolean
  tags: string[]
}

export const PRODUCTS: Product[] = [
  {
    id: '1', slug: 'hoodie-bsc-kaki',
    name: 'Hoodie BSC — Kaki',
    description: 'Hoodie oversize coton lourd 380g. Patch brodé logo globe BSC orange sur la poitrine. Cordon de serrage crème, poche kangourou.',
    price: 22000, compareAt: 27000, discount: 18,
    category: 'hoodies',
    images: ['/products/hoodie-kaki.jpg'],
    featured: true, inStock: true, isNew: false,
    tags: ['hoodie', 'kaki', 'oversize', 'patch'],
  },
  {
    id: '2', slug: 'tee-globe-noir',
    name: 'Tee BSC Globe — Noir',
    description: 'T-shirt oversize coton 220g. Logo globe BSC brodé poitrine + imprimé XL au dos. Col rond, coupe boxy.',
    price: 9500, compareAt: 12000, discount: 21,
    category: 'tshirts',
    images: ['/products/tee-globe-black.jpg'],
    featured: true, inStock: true, isNew: false,
    tags: ['tshirt', 'noir', 'globe', 'oversize'],
  },
  {
    id: '3', slug: 'jogger-camo-noir',
    name: 'Jogger BSC — Camo Noir',
    description: 'Jogger cargo tie-dye camouflage. Inscription Bagnon Street Collection en arc. Poches cargo latérales, taille élastique.',
    price: 19000, compareAt: 24000, discount: 21,
    category: 'bas',
    images: ['/products/jogger-camo.jpg'],
    featured: true, inStock: true, isNew: false,
    tags: ['jogger', 'camo', 'cargo', 'oversize'],
  },
  {
    id: '4', slug: 'sac-camo-vert',
    name: 'Sac à dos BSC — Camo Vert',
    description: 'Sac à dos camouflage vert. Patch brodé circulaire BSC Collection. Poche avant, dos rembourrée, bretelles larges.',
    price: 14500, compareAt: 18000, discount: 19,
    category: 'sacs',
    images: ['/products/bag-camo-green.jpg'],
    featured: true, inStock: true, isNew: false,
    tags: ['sac', 'camo', 'patch', 'quotidien'],
  },
  {
    id: '5', slug: 'tee-globe-blanc',
    name: 'Tee BSC Globe — Blanc',
    description: 'T-shirt blanc, logo globe imprimé dos format XL, version poitrine au recto. Edition classique.',
    price: 9500, compareAt: 12000, discount: 21,
    category: 'tshirts',
    images: ['/products/tee-globe-white.jpg'],
    featured: false, inStock: false, isNew: false,
    tags: ['tshirt', 'blanc', 'globe', 'classique'],
  },
  {
    id: '6', slug: 'tee-orange-edition',
    name: 'Tee BSC — Orange Edition',
    description: 'T-shirt orange vif, texte Bagnon Street en impression blanche. Patch brodé drapeau Côte d\'Ivoire. Édition été.',
    price: 9000, compareAt: 11500, discount: 22,
    category: 'tshirts',
    images: ['/products/tee-orange.jpg'],
    featured: false, inStock: true, isNew: false,
    tags: ['tshirt', 'orange', 'ete', 'cote-divoire'],
  },
  {
    id: '7', slug: 'sac-camo-bleu',
    name: 'Sac à dos BSC — Camo Bleu',
    description: 'Sac à dos camouflage bleu roi. Patch rond brodé BSC Collection. Capacité 25L, renfort aux fixations.',
    price: 14500, compareAt: 18000, discount: 19,
    category: 'sacs',
    images: ['/products/bag-camo-blue.jpg'],
    featured: false, inStock: true, isNew: false,
    tags: ['sac', 'camo', 'bleu', 'quotidien'],
  },
  {
    id: '8', slug: 'tee-seek-progress',
    name: 'Tee BSC — Seek Progress',
    description: 'T-shirt noir avec print jaune fluo au dos : Seek Progress / Bagnon Street. Typographie old english. Statement piece.',
    price: 9800, compareAt: 12500, discount: 22,
    category: 'tshirts',
    images: ['/products/tee-seek-progress.jpg'],
    featured: false, inStock: true, isNew: false,
    tags: ['tshirt', 'noir', 'yellow', 'statement'],
  },
  {
    id: '9', slug: 'tee-skull-curve',
    name: 'Tee BSC — Skull Curve Blanc',
    description: 'T-shirt blanc, print incurvé signature BSC avec skull logo. Coton 220g, coupe boxy.',
    price: 9500, compareAt: 12000, discount: 21,
    category: 'tshirts',
    images: ['/products/tee-skull-curve.jpg'],
    featured: false, inStock: false, isNew: false,
    tags: ['tshirt', 'blanc', 'skull', 'curve'],
  },
  {
    id: '10', slug: 'tee-globe-blanc-v2',
    name: 'Tee BSC Globe — Blanc v2',
    description: 'Version 2 du tee globe blanc. Logo front/back, coupe légèrement plus courte.',
    price: 9200, compareAt: 11500, discount: 20,
    category: 'tshirts',
    images: ['/products/tee-globe-white2.jpg'],
    featured: false, inStock: true, isNew: true,
    tags: ['tshirt', 'blanc', 'globe', 'nouveau'],
  },
  {
    id: '11', slug: 'tee-bagnon-lettering',
    name: 'Tee BSC — Lettering Repeat',
    description: 'Print BAGNON répété recto/verso, style éditorial — une ligne normale, une ligne miroir. Coton lourd.',
    price: 8800, compareAt: 11000, discount: 20,
    category: 'tshirts',
    images: ['/products/tee-bagnon-back.jpg'],
    featured: false, inStock: true, isNew: true,
    tags: ['tshirt', 'blanc', 'lettering', 'editorial'],
  },
]

export const CATEGORIES = [
  { id: 'all', label: 'Tout voir' },
  { id: 'tshirts', label: 'T-shirts' },
  { id: 'hoodies', label: 'Hoodies' },
  { id: 'bas', label: 'Bas' },
  { id: 'sacs', label: 'Sacs' },
]

export function getFeatured() { return PRODUCTS.filter(p => p.featured) }
export function getNew() { return PRODUCTS.filter(p => p.isNew) }
export function getByCategory(cat: string) { return cat === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === cat) }
export function getBySlug(slug: string) { return PRODUCTS.find(p => p.slug === slug) }
