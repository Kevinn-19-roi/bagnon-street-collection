# Roadmap Bagnon Street Collection

Ce document sert de point de reprise entre les sprints. Il doit rester synchronise avec les livraisons publiees sur `main`.

## Vue d'ensemble

- Termine - Sprint 1 - Stabilisation
- Termine - Sprint 2 - Authentification
- Termine - Sprint 3 - UX
- Termine - Sprint 4 - Page Produit
- En attente - Sprint 5 - Panier
- En attente - Sprint 6 - Checkout
- En attente - Sprint 7 - Paiement Wave
- En attente - Sprint 8 - Orange Money
- En attente - Sprint 9 - WhatsApp
- En attente - Sprint 10 - Optimisation SEO
- En attente - Sprint 11 - Mise en production finale

## Sprint 1 - Stabilisation

- Objectif : stabiliser le dashboard, les routes admin et les erreurs serveur critiques.
- Etat : termine.
- Date : 2026-07-13.
- Fichiers principaux concernes : routes `src/app/admin/*`, actions admin, composants Server/Client.
- Problemes rencontres : handlers client dans des Server Components, formulaires de confirmation incomplets, routes admin instables.
- Prochaines etapes : conserver cette base stable pendant les sprints fonctionnels.

## Sprint 2 - Authentification

- Objectif : separer session client et role administrateur, corriger la deconnexion frontend, proteger `/admin/*`.
- Etat : termine.
- Date : 2026-07-13.
- Fichiers principaux concernes : `src/lib/actions/auth.ts`, `src/middleware.ts`, `src/components/HomeClient.tsx`, pages auth/profil.
- Problemes rencontres : la presence d'une session Supabase etait trop souvent assimilee a un role admin.
- Prochaines etapes : reutiliser le profil client pour le panier et le checkout.

## Sprint 3 - UX

- Objectif : finaliser l'experience utilisateur avant la page produit.
- Etat : termine.
- Date : 2026-07-14.
- Fichiers principaux concernes : pages connexion/inscription/profil, TopBar admin, tableaux admin, composants auth et product.
- Problemes rencontres : champs mot de passe sans affichage temporaire, tableaux admin trop larges sur mobile, documentation de sprint absente.
- Prochaines etapes : commencer la page produit individuelle a partir des composants prepares.

## Sprint 4 - Page Produit

- Objectif : creer la page produit individuelle sans casser le catalogue existant.
- Etat : termine, publie sur `main` apres validations.
- Date : 2026-07-14.
- Fichiers principaux concernes : `src/app/produit/[slug]/page.tsx`, `src/components/product/*`, `src/components/HomeClient.tsx`, `src/hooks/useCart.ts`, `src/styles/globals.css`.
- Structure disponible : produits avec categorie, collection, images ordonnees, tailles, couleurs, stock global et stock par option.
- Developpement realise : route `/produit/[slug]`, galerie interactive, variantes facultatives, stock, ajout panier preparatoire, partage WhatsApp, produits similaires et metadata SEO.
- Problemes rencontres : pas de stock combine taille/couleur dans le schema actuel ; la page utilise donc le stock global et le stock par option separee sans migration destructive.
- Prochaines etapes : attendre feu vert avant le Sprint 5 - Panier complet.

## Sprints suivants

- Sprint 5 - Panier : panier persistant et ergonomique, en attente de validation du Sprint 4.
- Sprint 6 - Checkout : informations client, livraison, creation commande.
- Sprint 7 - Paiement Wave : integration paiement.
- Sprint 8 - Orange Money : integration paiement.
- Sprint 9 - WhatsApp : notifications commande.
- Sprint 10 - Optimisation SEO : metadata, performances, structure produit.
- Sprint 11 - Mise en production finale : verification complete, monitoring, recette finale.
