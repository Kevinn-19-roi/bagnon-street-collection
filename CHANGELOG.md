# Changelog Bagnon Street Collection

## 2026-07-14 - Sprint 4.6 Variantes, duplication, UX mobile et favoris

- Developpements :
  - Ajout des sections Tailles et Couleurs dans creation et modification produit.
  - Enregistrement des variantes dans les tables existantes `product_sizes` et `product_colors`.
  - Ajout de l'action Dupliquer depuis la liste produits et la page modification.
  - Generation automatique d'un slug et d'un SKU uniques pour les duplicatas.
  - Ajout d'un hook favoris partage via `localStorage`.
  - Ajout d'un bouton coeur reutilisable avec etat rouge rempli et animation legere.
  - Synchronisation favoris entre catalogue, carrousels, fiche produit et produits similaires.
  - Renforcement du scroll horizontal tactile des categories mobile.
  - Recherche header mobile avec comportement agrandi type Dynamic Island, compatible `prefers-reduced-motion`.
- Bugs corriges :
  - Tailles/couleurs existantes invisibles dans les formulaires admin.
  - Favoris non persistants et non synchronises entre les cartes.
  - Categories mobiles difficiles a faire defiler au doigt.
- Fichiers modifies :
  - `src/components/admin/forms/ProductForm.tsx`
  - `src/lib/actions/products.ts`
  - `src/app/admin/produits/page.tsx`
  - `src/app/admin/produits/[id]/modifier/page.tsx`
  - `src/components/HomeClient.tsx`
  - `src/app/produit/[slug]/page.tsx`
  - `src/components/product/RelatedProductCard.tsx`
  - `src/components/FavoriteButton.tsx`
  - `src/hooks/useFavorites.ts`
  - `src/styles/globals.css`
  - `ROADMAP.md`
  - `CHANGELOG.md`
- Commits importants :
  - `2d07305` - Add product variants duplication and favorites UX.
- Validations effectuees :
  - TypeScript local : OK.
  - ESLint local : OK.
  - Build production local : OK.
  - Deploiement Vercel production : READY.
  - Routes production testees en HTTP : `/`, `/produit/hoodie-bsc-kaki`, `/admin/produits`, `/admin/produits/nouveau`.
  - Logs runtime Vercel recents : aucune erreur.
- Points restant a traiter :
  - Tests admin reels de creation/modification/duplication avec session admin sur production.
  - La migration `005_home_hero_settings.sql` reste reportee volontairement et ne bloque pas ce sprint.

## 2026-07-14 - Sprint 4.5 Performance et gestion admin

- Developpements :
  - Optimisation de l'accueil : une seule requete produits cachee remplace les requetes separees par section.
  - Mise en cache courte des produits et des parametres publics avec invalidation apres modification admin.
  - Recherche frontend agrandie au focus.
  - Navigation categories mobile avec defilement horizontal tactile.
  - Preparation de la banniere principale editable depuis `admin/parametres`.
  - Ajout d'une migration non destructive pour les champs de banniere dans `site_settings`.
- Bugs corriges :
  - Creation produit et modification produit pouvaient rester bloquees car le formulaire client appelait une Server Action avec `redirect()` interne.
  - Les images selectionnees etaient envoyees deux fois dans le `FormData`.
  - Absence de message de confirmation visible apres creation/modification produit.
  - Upload produit superieur a 1 MB rejete par la limite par defaut des Server Actions Next.js.
- Fichiers modifies :
  - `src/app/page.tsx`
  - `src/components/HomeClient.tsx`
  - `src/components/admin/forms/ProductForm.tsx`
  - `src/lib/actions/products.ts`
  - `src/lib/actions/settings.ts`
  - `src/app/admin/produits/page.tsx`
  - `src/app/admin/parametres/page.tsx`
  - `src/types/database.ts`
  - `next.config.js`
  - `supabase/migrations/005_home_hero_settings.sql`
  - `ROADMAP.md`
  - `CHANGELOG.md`
- Commits importants :
  - `c20d49b` - Improve performance and admin product management.
- Validations effectuees :
  - Mesure avant optimisation sur production : accueil environ 4,9 s a 6,1 s depuis cette machine.
  - TypeScript local : OK.
  - ESLint local : OK.
  - Build production local : OK.
  - Deploiement Vercel production : READY.
  - Routes production testees en HTTP : `/`, `/connexion`, `/inscription`, `/produit/hoodie-bsc-kaki`, `/admin/produits`.
- Points restant a traiter :
  - Appliquer la migration Supabase sur la base de production.
  - Tester les formulaires admin et la banniere sur l'URL de production avec une session admin.

## 2026-07-14 - Sprint 4 Page Produit

- Developpements :
  - Creation de la route frontend `/produit/[slug]`.
  - Ajout d'une fiche produit avec galerie, prix, ancien prix, badge promotion, description, categorie, collection, stock et disponibilite.
  - Ajout d'un panneau d'achat preparatoire avec validation taille/couleur facultative.
  - Ajout des produits similaires par collection puis categorie.
  - Ajout du partage client WhatsApp.
  - Ajout de metadata SEO par fiche produit.
  - Liaison des cartes produit du catalogue vers la fiche individuelle.
- Bugs corriges :
  - Les cartes produit frontend ne permettaient pas d'ouvrir une fiche produit dediee.
  - La galerie preparee au Sprint 3 n'etait pas encore interactive.
- Fichiers modifies :
  - `src/app/produit/[slug]/page.tsx`
  - `src/components/HomeClient.tsx`
  - `src/components/product/ProductMediaGallery.tsx`
  - `src/components/product/ProductOptionSelector.tsx`
  - `src/components/product/ProductPurchasePanel.tsx`
  - `src/components/product/RelatedProductCard.tsx`
  - `src/components/product/product-view-model.ts`
  - `src/hooks/useCart.ts`
  - `src/styles/globals.css`
  - `ROADMAP.md`
  - `CHANGELOG.md`
- Commits importants :
  - `Add product detail page`
- Validations effectuees :
  - TypeScript local : OK.
  - ESLint local : OK.
  - Build production local : OK.
- Points restant a traiter :
  - Sprint 5 : panier complet, persistance ergonomique et preparation checkout.
  - Stock combine taille/couleur a envisager plus tard uniquement si le catalogue l'exige.

## 2026-07-14 - Sprint 3 UX

- Developpements :
  - Ajout d'un champ mot de passe reutilisable avec affichage/masquage accessible.
  - Preparation de composants produit reutilisables pour le sprint Page Produit.
  - Creation de `ROADMAP.md` pour suivre l'avancement du projet.
- Bugs corriges :
  - Absence de bouton de visualisation du mot de passe sur les formulaires auth.
  - Risque de perte de contexte entre sprints faute de documentation racine.
- Fichiers modifies :
  - `src/components/auth/PasswordInput.tsx`
  - `src/app/connexion/page.tsx`
  - `src/app/inscription/page.tsx`
  - `src/app/admin/login/page.tsx`
  - `src/app/admin/admins/page.tsx`
  - `src/components/product/ProductMediaGallery.tsx`
  - `src/components/product/ProductOptionSelector.tsx`
  - `src/components/product/product-view-model.ts`
  - `ROADMAP.md`
  - `CHANGELOG.md`
- Commits importants :
  - `Fix final UX before product sprint`
- Validations effectuees :
  - TypeScript local : OK.
  - ESLint local : OK.
  - Build production local : OK.
  - Rendu HTML local `/connexion` et `/inscription` : bouton mot de passe et retour boutique presents.
  - Deploiement Vercel : a verifier apres publication du commit.
- Points restant a traiter :
  - Tests visuels authentifies du dashboard avec une session admin reelle.
  - Demarrage du Sprint 4 uniquement apres feu vert.

## 2026-07-13 - Sprint 2 Authentification

- Developpements :
  - Separation client/admin.
  - Profil client.
  - Correction de la navigation frontend connectee.
- Bugs corriges :
  - Deconnexion frontend incoherente.
  - Bouton compte dirigeant vers l'administration.
  - Footer relie aux parametres admin.
- Validations effectuees :
  - TypeScript, ESLint, build et deploiement Vercel.

## 2026-07-13 - Sprint 1 Stabilisation

- Developpements :
  - Stabilisation des routes admin.
  - Correction des composants serveur utilisant des handlers client.
  - Correction des actions de confirmation.
- Bugs corriges :
  - Erreurs serveur sur collections.
  - Actions modifier/supprimer incompletes.
- Validations effectuees :
  - TypeScript, ESLint, build et deploiement Vercel.
