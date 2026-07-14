# Roadmap Bagnon Street Collection

Ce document sert de point de reprise entre les sprints. Il doit rester synchronise avec les livraisons publiees sur `main`.

## Vue d'ensemble

- Termine - Sprint 1 - Stabilisation
- Termine - Sprint 2 - Authentification
- Termine - Sprint 3 - UX
- Termine - Sprint 4 - Page Produit
- Termine - Sprint 4.5 - Performance et gestion admin
- Termine - Sprint 4.6 - Variantes, duplication, UX mobile et favoris
- Termine - Sprint 4.7 - Duplication, suppression et page favoris
- Publie - Sprint 5 - Panier
- Termine - Sprint 6 - Checkout
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

## Sprint 4.5 - Performance et gestion admin

- Objectif : optimiser l'accueil, finaliser la recherche/categories mobile, corriger la creation/modification produit et rendre la banniere d'accueil administrable.
- Etat : termine pour les corrections applicatives ; migration banniere reportee volontairement.
- Date : 2026-07-14.
- Fichiers principaux concernes : `src/app/page.tsx`, `src/components/HomeClient.tsx`, `src/components/admin/forms/ProductForm.tsx`, `src/lib/actions/products.ts`, `src/lib/actions/settings.ts`, `src/app/admin/parametres/page.tsx`, `supabase/migrations/005_home_hero_settings.sql`.
- Problemes rencontres : les formulaires produit appelaient une Server Action qui redirigeait directement depuis un handler client ; les images etaient aussi presentes deux fois dans le `FormData`. La banniere necessite une migration Supabase non destructive avant edition en production.
- Prochaines etapes : migration `005_home_hero_settings.sql` appliquee et validee en production ; conserver les tests admin de banniere pendant les recettes.

## Sprint 4.6 - Variantes, duplication, UX mobile et favoris

- Objectif : rendre les tailles/couleurs administrables, ajouter la duplication produit, corriger le scroll categories mobile, ameliorer la recherche mobile et unifier les favoris.
- Etat : termine.
- Date : 2026-07-14.
- Fichiers principaux concernes : `src/components/admin/forms/ProductForm.tsx`, `src/lib/actions/products.ts`, `src/app/admin/produits/*`, `src/components/HomeClient.tsx`, `src/components/FavoriteButton.tsx`, `src/hooks/useFavorites.ts`, fiche produit et produits similaires.
- Problemes rencontres : variantes deja presentes en base mais absentes des formulaires admin ; favoris locaux non partages entre les cartes ; scroll categories limite par la structure du header mobile.
- Prochaines etapes : Sprint 4.7 correctif avant le panier complet.

## Sprint 4.7 - Duplication, suppression et page favoris

- Objectif : corriger la visibilite des duplicatas brouillons, securiser la redirection apres suppression produit et creer une vraie page favoris frontend.
- Etat : termine, valide en production.
- Date : 2026-07-14.
- Fichiers principaux concernes : `src/lib/database/products.ts`, `src/lib/actions/products.ts`, `src/app/admin/produits/page.tsx`, `src/app/favoris/page.tsx`, `src/components/favorites/FavoritesClient.tsx`, `src/components/HomeClient.tsx`, `src/hooks/useFavorites.ts`.
- Problemes rencontres : la liste admin utilisait le filtre actif par defaut meme quand elle devait afficher tous les statuts ; la suppression produit ne redirigeait pas explicitement vers la liste ; les liens Favoris pointaient vers une ancre au lieu d'une route dediee.
- Prochaines etapes : Sprint 5 - Panier complet.

## Sprint 5 - Panier

- Objectif : livrer un panier frontend complet, persistant et pret pour le futur checkout.
- Etat : publie sur `main`, verifie en production.
- Date : 2026-07-14.
- Fichiers principaux concernes : `src/hooks/useCart.ts`, `src/app/panier/page.tsx`, `src/components/cart/*`, `src/components/product/ProductPurchasePanel.tsx`, `src/components/HomeClient.tsx`, `src/app/produit/[slug]/page.tsx`.
- Problemes rencontres : aucune table panier n'existe dans le schema Supabase ; le panier reste donc local et persistant, tandis que la transformation en commande utilisera plus tard `orders` et `order_items`.
- Correctif avant Sprint 6 : ajout sans ouverture automatique du panier, confirmation legere sur fiche produit, lien volontaire vers `/panier`, animation courte du badge et du bouton. Publie sur `main` et routes production verifiees.
- Prochaines etapes : Sprint 6 - Checkout, avec transformation du panier local en commande.
## Sprint 6 - Checkout

- Objectif : transformer le panier local en commande Supabase et preparer le paiement futur.
- Etat : termine localement, a publier et verifier sur Vercel.
- Date : 2026-07-14.
- Fichiers principaux concernes : `src/app/checkout/page.tsx`, `src/components/checkout/CheckoutClient.tsx`, `src/lib/actions/checkout.ts`, `src/app/commande/[reference]/page.tsx`, `src/lib/database/orders.ts`, `src/app/admin/commandes/page.tsx`, `src/components/cart/CartPageClient.tsx`.
- Tables utilisees : `customers`, `orders`, `order_items`, `products`, `product_sizes`, `product_colors`, `site_settings`.
- Developpement realise : route `/checkout`, formulaire client, recapitulatif commande, validation serveur des prix/stock/variantes, creation commande `pending`, page de confirmation `/commande/[reference]`, affichage des articles dans l'admin commandes.
- Choix stock : aucun stock n'est decremente pendant ce sprint ; la decrement sera declenchee seulement apres paiement confirme au Sprint 7.
- Preparation paiement : la commande stocke `payment_method` et `payment_status = unpaid`, sans appel API Wave ni Orange Money.
- Problemes rencontres : le schema actuel ne contient pas de colonne `user_id` sur `customers` ou `orders`; les commandes connectees sont donc preparees via pre-remplissage email/profil et snapshot client, sans rattachement auth strict.
- Prochaines etapes : Sprint 7 - paiement Wave/Orange Money, confirmation paiement, decrement stock et notifications.
## Sprints suivants

- Sprint 6 - Checkout : termine, transformation du panier local en commande Supabase.
- Sprint 7 - Paiement Wave : integration paiement.
- Sprint 8 - Orange Money : integration paiement.
- Sprint 9 - WhatsApp : notifications commande.
- Sprint 10 - Optimisation SEO : metadata, performances, structure produit.
- Sprint 11 - Mise en production finale : verification complete, monitoring, recette finale.
