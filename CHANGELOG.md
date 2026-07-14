# Changelog Bagnon Street Collection

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
