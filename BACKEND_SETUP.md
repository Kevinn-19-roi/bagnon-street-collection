# BAGNON STREET COLLECTION — Backend Setup Guide

## Étape 1 : Configuration Supabase

### 1. Créer un projet Supabase
1. Va sur https://supabase.com
2. Crée un nouveau projet : `bagnon-street-collection`
3. Note tes credentials (URL, anon key, service role key)

### 2. Exécuter les migrations SQL
Dans le SQL Editor de Supabase, exécute dans l'ordre :
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_storage.sql`

### 3. Variables d'environnement
Copie `.env.example` en `.env.local` et remplis :
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Créer le premier admin
Appelle la fonction `createFirstAdmin()` une seule fois :
```ts
await createFirstAdmin('ton@email.com', 'motdepasse123', 'Ton Nom')
```
Ou utilise l'interface Supabase Auth > Users pour créer manuellement.

### 5. Variables Vercel
Dans Vercel Dashboard > Settings > Environment Variables, ajoute :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Architecture Backend Étape 1
```
src/
├── middleware.ts              # Protection routes admin
├── types/database.ts          # Types TypeScript stricts
├── lib/
│   ├── supabase/
│   │   ├── server.ts         # Client serveur (SSR)
│   │   ├── client.ts         # Client navigateur
│   │   ├── admin.ts          # Client service role
│   │   └── storage.ts        # Upload/delete images
│   ├── database/
│   │   ├── products.ts       # CRUD produits
│   │   ├── orders.ts         # CRUD commandes + stats
│   │   └── categories.ts     # CRUD catégories/collections
│   ├── actions/
│   │   └── auth.ts           # Login/Logout Server Actions
│   ├── validators/
│   │   └── product.ts        # Zod schemas validation
│   └── helpers/
│       └── slugify.ts        # Utilitaires
└── app/admin/
    ├── login/page.tsx         # Page connexion
    └── dashboard/page.tsx     # Dashboard (placeholder)
supabase/migrations/
├── 001_initial_schema.sql    # 11 tables + enums + indexes + triggers
├── 002_rls_policies.sql      # Sécurité Row Level Security
└── 003_storage.sql           # Buckets + policies storage
```
