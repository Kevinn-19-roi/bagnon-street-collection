# Roadmap Bagnon Street Collection

Ce document sert de point de reprise entre les sprints. Il doit rester synchronise avec les livraisons publiees sur `main`.

## Vue d'ensemble

- ✅ Sprint 1 - Stabilisation
- ✅ Sprint 2 - Authentification
- ✅ Sprint 3 - UX
- 🔄 Sprint 4 - Page Produit
- ⏳ Sprint 5 - Panier
- ⏳ Sprint 6 - Checkout
- ⏳ Sprint 7 - Paiement Wave
- ⏳ Sprint 8 - Orange Money
- ⏳ Sprint 9 - WhatsApp
- ⏳ Sprint 10 - Optimisation SEO
- ⏳ Sprint 11 - Mise en production finale

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
- Etat : pret a demarrer.
- Date : a planifier.
- Fichiers principaux concernes : future route produit, `src/lib/database/products.ts`, composants `src/components/product/*`.
- Structure disponible : produits avec categorie, collection, images ordonnees, tailles, couleurs, stock global et stock par option.
- Composants prepares : galerie media, selecteur d'options taille/couleur, normalisation `ProductDetailViewModel`.
- Problemes rencontres : aucun pour le moment.
- Prochaines etapes : attendre validation avant implementation, puis brancher `getProductBySlug` sur la route produit.

## Sprints suivants

- Sprint 5 - Panier : panier persistant et ergonomique.
- Sprint 6 - Checkout : informations client, livraison, creation commande.
- Sprint 7 - Paiement Wave : integration paiement.
- Sprint 8 - Orange Money : integration paiement.
- Sprint 9 - WhatsApp : notifications commande.
- Sprint 10 - Optimisation SEO : metadata, performances, structure produit.
- Sprint 11 - Mise en production finale : verification complete, monitoring, recette finale.
