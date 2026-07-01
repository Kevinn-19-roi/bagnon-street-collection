# BAGNON STREET COLLECTION — Next.js E-Commerce

Site e-commerce premium pour Bagnon Street Collection, construit avec Next.js 14, PostgreSQL, Prisma, et Stripe.

## Stack technique

- **Frontend**: Next.js 14 (App Router), TypeScript, Framer Motion
- **Backend**: Next.js API Routes + Server Actions  
- **Base de données**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth.js (email/password + sessions JWT)
- **Paiement**: Stripe (Checkout Sessions)
- **Médias**: Cloudinary (images produits optimisées)
- **Email**: Nodemailer (confirmations de commande)
- **State**: Zustand (panier persisté localStorage)
- **Deploy**: Vercel (recommandé) ou Railway

## Structure du projet

```
src/
├── app/
│   ├── (shop)/          # Pages boutique (collection, produit, panier, commande)
│   ├── admin/           # Dashboard admin
│   ├── api/             # Routes API (REST)
│   └── auth/            # Pages auth (login, register)
├── components/
│   ├── layout/          # Navbar, Hero, Footer, Ticker, etc.
│   └── shop/            # ProductGrid, CartDrawer, ProductCard
├── lib/                 # Prisma, Auth, Stripe, Cloudinary, Email
├── hooks/               # useCart (Zustand)
├── types/               # Types TypeScript
└── styles/              # CSS global
prisma/
└── schema.prisma        # Schéma base de données complet
```

## Installation

### 1. Cloner et installer

```bash
npm install
```

### 2. Variables d'environnement

```bash
cp .env.example .env.local
# Remplir toutes les variables
```

Variables requises:
- `DATABASE_URL` — PostgreSQL (Supabase, Railway, Neon)
- `NEXTAUTH_SECRET` — Clé aléatoire: `openssl rand -base64 32`
- `STRIPE_PUBLIC_KEY` + `STRIPE_SECRET_KEY`
- `CLOUDINARY_*` — Compte Cloudinary gratuit
- `EMAIL_*` — SMTP Gmail ou Resend

### 3. Base de données

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Seed (données de test)

```bash
npx ts-node prisma/seed.ts
```

### 5. Lancer en développement

```bash
npm run dev
```

## Deploy sur Vercel

```bash
npm i -g vercel
vercel --prod
```

Configurer les variables d'env dans le dashboard Vercel.

## Pages et routes

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/collection` | Catalogue produits |
| `/produit/[slug]` | Fiche produit |
| `/panier` | Panier |
| `/commande` | Checkout |
| `/compte` | Espace client |
| `/admin/dashboard` | Dashboard admin |
| `/admin/produits` | Gestion produits |
| `/admin/commandes` | Gestion commandes |

## API Routes

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/products` | GET | Liste produits (filtres: category, featured, search) |
| `/api/products/[slug]` | GET | Produit par slug |
| `/api/checkout` | POST | Créer une commande |
| `/api/newsletter` | POST | Inscription newsletter |
| `/api/admin/products` | GET/POST | CRUD produits (admin) |
| `/api/auth/[...nextauth]` | ALL | Auth NextAuth |

## Admin

Créer un compte admin via la base de données:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'ton@email.com';
```

## Performance

- Images Cloudinary avec transformation automatique (WebP, lazy loading)
- ISR (Incremental Static Regeneration) sur les pages produits
- Cache API routes avec `revalidate`
- Fonts Google optimisées via next/font
- Lighthouse score cible: 95+

## Personnalisation

Le design system est défini dans `src/styles/globals.css`:

```css
:root {
  --black: #0A0A0A;       /* Fond principal */
  --white: #F5F4F0;       /* Texte et surfaces */
  --red: #8B1A1A;         /* Accent unique — couleur BSC */
  --gray-dark: #1A1A1A;   /* Sections secondaires */
  --gray-mid: #2A2A2A;    /* Cards et surfaces */
  --gray-light: #888888;  /* Texte secondaire */
}
```

---

Construit pour Bagnon Street Collection, Abidjan — 2025
