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
- Termine - Sprint 7 - Paiement Wave manuel et suivi simplifie
- Termine - Sprint 8 - Notifications WhatsApp admin/client
- Termine - Sprint 9 - SEO, performance finale et preparation production
- Termine - Sprint 9.5 - UX, performance et finalisation avant lancement
- Termine - Sprint 9.6 - Mes commandes, admin commandes, recherche et performance
- Termine - Correctif admin commandes - suppression totale et filtres rapides
- Reporte - Orange Money
- Termine - Sprint 10 - Accueil premium, galerie et videos administrables
- Termine - Sprint 10.1 - Correctifs hero, videos, galerie et produits
- Termine - Sprint 10.2 - Stabilisation videos et exception client
- Termine - Sprint 10.3 - Correctifs videos et frontend
- En attente migration - Correctif 10.4 - poster video nullable en production
- En validation - Correctif videos - generation automatique des miniatures
- En validation - Sprint performance & correctifs produits
- En validation - Sprint performance frontend/admin reel
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
## Sprint 7 - Paiement Wave manuel et suivi simplifie

- Objectif : ajouter un mode Wave transitoire avec lien Wave Business, confirmation admin securisee, decrement stock atomique, suivi logistique simple et alerte WhatsApp.
- Etat : termine et valide en production.
- Date : 2026-07-15.
- Fichiers principaux concernes : `supabase/migrations/006_payment_tracking_rpc.sql`, `src/lib/actions/orders.ts`, `src/app/commande/[reference]/page.tsx`, `src/app/admin/commandes/page.tsx`, `src/app/admin/commandes/[id]/page.tsx`, `src/lib/payments/wave.ts`, `src/lib/whatsapp.ts`.
- Architecture temporaire : le client ouvre le lien Wave Business existant ; aucun retour navigateur ne marque la commande payee.
- Confirmation paiement : l'admin confirme apres verification dans Wave Business via une action dediee qui appelle la RPC `confirm_manual_wave_payment`.
- Atomicite : la RPC valide la commande, le paiement, le stock, decremente les stocks, enregistre la transaction et met a jour les statuts dans une seule transaction PostgreSQL.
- Securite : la RPC est reservee au role serveur `service_role`; le statut `paid` est bloque dans le formulaire generique pour eviter un paiement sans decrement stock.
- Stock : decremente uniquement lors de la confirmation admin Wave, avec `stock_decremented_at` comme verrou d'idempotence.
- Correctif migration : si la RPC manque en production, l'admin voit un message clair demandant d'appliquer `006_payment_tracking_rpc.sql` au lieu d'une erreur serveur brute.
- Migration production : `006_payment_tracking_rpc.sql` appliquee avec succes le 2026-07-15.
- Suivi commande : l'interface principale affiche seulement `Commande recue`, `Expediee`, `Livree`; `payment_status` reste affiche separement.
- Filtre admin : `Commande recue` regroupe maintenant `pending` et `confirmed`, pour garder les commandes payees confirmees dans la premiere etape logistique.
- Transitions autorisees : `pending`/`confirmed` payee -> `shipped`, puis `shipped` -> `delivered`; une commande non payee n'est pas expediee par le parcours normal.
- WhatsApp : la page confirmation client genere un message pre-rempli vers le numero `site_settings.whatsapp`; l'admin dispose aussi d'un message WhatsApp vers le client.
- Validation production : confirmation Wave admin OK, `payment_status = paid`, `order_status = confirmed`, decrement stock une seule fois, deuxieme confirmation bloquee, suivi Expediee puis Livree OK, WhatsApp client/admin OK.
- Prochaines etapes : finaliser le Sprint 8 - Notifications WhatsApp admin/client sans API officielle ; remplacer plus tard le lien Wave statique par Wave Checkout API et webhooks officiels quand les acces seront disponibles.

## Sprint 8 - Notifications WhatsApp admin/client

- Objectif : auditer et finaliser les notifications WhatsApp par liens pre-remplis, sans API WhatsApp Cloud.
- Etat : termine.
- Date : 2026-07-15.
- Fichiers principaux concernes : `src/lib/whatsapp.ts`, `src/app/commande/[reference]/page.tsx`, `src/app/admin/commandes/page.tsx`, `src/app/admin/commandes/[id]/page.tsx`.
- Existant reutilise : bouton client sur `/commande/[reference]`, boutons admin liste/detail, helper `buildWhatsappUrl`, numero `site_settings.whatsapp`, nettoyage du numero et encodage `wa.me`.
- Correctif realise : messages client/admin enrichis avec paiement, suivi et phrases adaptees au statut, sans champs vides inutiles.
- Securite : aucun secret, aucun numero code en dur, aucun paiement confirme via WhatsApp, envoi uniquement par clic volontaire.
- Evolution future : remplacer les liens `wa.me` par WhatsApp Cloud API uniquement lorsque les acces officiels seront fournis.

## Sprints suivants

- Sprint 6 - Checkout : termine, transformation du panier local en commande Supabase.
- Sprint 7 - Paiement Wave : mode manuel termine et valide, API officielle a venir.
- Sprint 8 - Notifications WhatsApp : liens pre-remplis admin/client, sans API officielle.
- Sprint 9 - SEO, performance finale et preparation production : sitemap, robots, metadata, headers, pages legales structurelles et checklist production.
- Orange Money : reporte jusqu'a reception d'un lien marchand, numero marchand ou acces API officiels.
- Sprint 10 - Validation finale production : verification complete, monitoring, recette finale.

## Sprint 9 - SEO, performance finale et preparation production

- Objectif : auditer et renforcer SEO, performance, accessibilite, securite et robustesse production sans refonte.
- Etat : termine.
- Date : 2026-07-15.
- Fichiers principaux concernes : `next.config.js`, `src/app/layout.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/produit/[slug]/page.tsx`, `src/app/categorie/[slug]/page.tsx`, `src/app/collection/[slug]/page.tsx`, pages legales, `SEO_AUDIT.md`, `SECURITY.md`, `PRODUCTION_CHECKLIST.md`.
- Corrections realisees : metadata globales enrichies, sitemap/robots, donnees structurees produit, pages categorie/collection, pages legales structurelles, noindex des pages privees, optimisation Next Image et headers de securite.
- Problemes rencontres : contenu legal officiel manquant ; pages legales creees en structure uniquement et marquees `noindex`.
- Prochaines etapes : fournir les contenus legaux, valider les parcours avec vraies sessions client/admin, puis preparer la recette publique finale.

## Sprint 9.5 - UX, performance et finalisation avant lancement

- Objectif : finaliser l'experience utilisateur publique avant lancement, sans modifier Wave, Orange Money, commandes, checkout serveur ou SEO deja valides.
- Etat : termine.
- Date : 2026-07-15.
- Fichiers principaux concernes : `src/components/HomeClient.tsx`, `src/app/recherche/page.tsx`, `src/app/categorie/[slug]/page.tsx`, `src/app/collection/[slug]/page.tsx`, `src/components/product/PublicProductListing.tsx`, `src/hooks/useCart.ts`, `src/components/cart/CartPageClient.tsx`, `src/components/checkout/CheckoutClient.tsx`, `src/lib/database/products.ts`, `src/app/layout.tsx`.
- Corrections realisees : categories transformees en vraies pages paginees, recherche publique `/recherche?q=...`, navigation mobile basse Accueil/Panier/Commandes/Favoris/Compte, badges panier/favoris, Open Graph renforce, selection des variantes manquantes depuis panier/checkout, remontee automatique vers les erreurs checkout.
- Performance : les pages categorie, collection et recherche chargent 6 produits par page au lieu de charger une longue liste ; les requetes restent cote serveur et reutilisent les composants existants.
- Problemes rencontres : les anciens paniers locaux peuvent contenir des produits sans details de variantes si l'article a ete ajoute avant ce sprint ; les nouvelles additions depuis la fiche produit et l'accueil embarquent les options disponibles.
- Prochaines etapes : recette mobile reelle, validation du partage WhatsApp/Facebook via cache des plateformes, puis Sprint 10 - validation finale production.

## Sprint 9.6 - Mes commandes, admin commandes, recherche et performance

- Objectif : ajouter une vraie page client Mes commandes, securiser les actions admin Annuler/Supprimer, refaire la recherche mobile via page dediee et optimiser les listes paginees.
- Etat : termine cote code, migration 007 a appliquer manuellement pour activer l'annulation atomique avec restauration stock.
- Date : 2026-07-15.
- Fichiers principaux concernes : `src/app/commandes/*`, `src/app/api/recherche/route.ts`, `src/components/search/SearchClient.tsx`, `src/lib/database/orders.ts`, `src/lib/actions/orders.ts`, `src/app/admin/commandes/*`, `src/components/HomeClient.tsx`, `supabase/migrations/007_order_cancel_restore.sql`.
- Mes commandes : route `/commandes` et detail `/commandes/[reference]`, filtres, pagination par 6 commandes, timeline client, protection par session.
- Limite schema actuel : les commandes existantes sont retrouvees via l'email du client connecte, car `orders` ne contient pas encore de `user_id`; la migration 007 prepare `customers.auth_user_id` pour un rattachement plus strict.
- Admin commandes : actions Annuler/Supprimer ajoutees, suppression reservee aux commandes annulees ou non payees non expediees/livrees.
- Stock : annulation fiable preparee via RPC `cancel_order_with_stock_restore`, avec `stock_restored_at` comme verrou d'idempotence.
- Recherche : le header mobile ouvre `/recherche`; la page effectue une recherche instantanee debouncee via `/api/recherche`, 6 produits par page et URL partageable.
- Prochaines etapes : appliquer `007_order_cancel_restore.sql` dans Supabase Production, puis tester annulation/restauration stock sur une commande test.

## Correctif admin commandes - suppression totale et filtres rapides

- Objectif : permettre la suppression definitive de n'importe quelle commande depuis l'administration, avec restauration de stock idempotente si necessaire, et rendre les filtres admin quasi instantanes.
- Etat : termine, migration 008 appliquee en production.
- Date : 2026-07-16.
- Fichiers principaux concernes : `src/app/admin/commandes/page.tsx`, `src/app/admin/commandes/[id]/page.tsx`, `src/components/admin/orders/AdminOrdersClient.tsx`, `src/lib/actions/orders.ts`, `supabase/migrations/008_delete_order_with_stock_restore.sql`.
- Suppression : nouvelle RPC `delete_order_with_stock_restore` pour restaurer le stock une seule fois si `stock_decremented_at` existe et `stock_restored_at` est vide, supprimer les `order_items`, puis supprimer la commande dans une transaction PostgreSQL.
- Filtres : la page admin charge les commandes une seule fois et filtre cote client avec React, sans navigation serveur a chaque clic.
- Probleme rencontre : la RPC 007 d'annulation refuse les commandes livrees ; une RPC dediee de suppression etait donc necessaire pour couvrir aussi les commandes livrees/payees.
- Validation production : `008_delete_order_with_stock_restore.sql` appliquee avec succes ; Vercel `READY` ; aucune erreur runtime detectee.
- Prochaines etapes : valider les cas metier avec une vraie session admin si un probleme est observe sur une commande precise.

## Sprint 10 - Accueil premium, galerie et videos administrables

- Objectif : simplifier l'accueil, rendre le site plus visuel et plus rapide percu, ajouter une galerie et une section videos administrables.
- Etat : termine, publie sur `main`, Vercel `READY`.
- Date : 2026-07-17.
- Fichiers principaux concernes : `src/app/page.tsx`, `src/components/HomeClient.tsx`, `src/components/PublicMediaImage.tsx`, `src/app/admin/galerie/page.tsx`, `src/app/admin/videos/page.tsx`, `src/lib/database/media.ts`, `src/lib/actions/media.ts`, `src/components/admin/forms/ProductForm.tsx`, `src/lib/actions/products.ts`, `supabase/migrations/009_gallery_video_items.sql`.
- Accueil : mode clair par defaut sans ecraser le choix utilisateur, hero simplifie, suppression du gros bloc d'avantages en haut, bandeau defilant categories/collections, carrousels produits, sections videos et galerie.
- Videos : maximum 6 videos actives affichees sur l'accueil, lecture uniquement au clic, poster obligatoire, pas de chargement complet avant interaction.
- Galerie : images actives ordonnees et lazy-load sur l'accueil, administration ajout/modification/suppression.
- Produit admin : validation plus claire, limite d'upload adaptee, generation locale de description sans API externe.
- Migration : `009_gallery_video_items.sql` est non destructive et doit etre appliquee manuellement dans Supabase Production avant d'utiliser les pages `/admin/galerie` et `/admin/videos`.
- Prochaines etapes : appliquer la migration 009 en production, puis tester l'ajout de medias avec une session admin.

## Sprint 10.1 - Correctifs hero, videos, galerie et produits

- Objectif : corriger les observations production du Sprint 10 sans refonte globale.
- Etat : termine, publie sur `main`, Vercel `READY`.
- Date : 2026-07-17.
- Fichiers principaux concernes : `src/components/HomeClient.tsx`, `src/app/admin/galerie/page.tsx`, `src/app/admin/videos/page.tsx`, `src/app/admin/parametres/page.tsx`, `src/lib/actions/media.ts`, `src/lib/actions/settings.ts`, `src/lib/actions/products.ts`, `src/components/admin/media/GalleryCreateForm.tsx`, `supabase/migrations/010_hero_media_and_optional_video_posters.sql`.
- Corrections realisees : hero image/video integre au bloc principal, hauteur raccourcie, poster video facultatif, validation des liens video directs, import galerie multiple jusqu'a 10 images, suppression galerie hors formulaire imbrique, boutons avec etat de chargement, fallback image produit remis a zero quand l'URL change.
- Produit admin : invalidation renforcee de l'accueil, recherche, categories, collections et fiche produit apres creation/modification/duplication ; message admin explicite si un produit actif/vedette/nouveau ne s'affiche pas pour cause de stock, image ou limite d'affichage.
- Migration : `010_hero_media_and_optional_video_posters.sql` est non destructive ; elle ajoute les reglages hero video/cadrage/citation et rend `video_items.poster_url` nullable.
- Validation : TypeScript, ESLint, build production et audit npm OK ; Vercel `READY`, routes critiques verifiees, aucun log runtime critique.
- Prochaines etapes : appliquer la migration 010 dans Supabase Production, puis tester les uploads reels video/galerie avec une session admin.

## Sprint 10.2 - Stabilisation videos et exception client

- Objectif : empecher une video invalide ou un upload echoue de casser l'accueil, fiabiliser l'import video admin et ajouter une erreur client propre.
- Etat : termine.
- Date : 2026-07-17.
- Fichiers principaux concernes : `src/components/HomeClient.tsx`, `src/app/admin/videos/page.tsx`, `src/components/admin/media/VideoCreateForm.tsx`, `src/lib/actions/media.ts`, `src/lib/database/media.ts`, `src/lib/media/video.ts`, `src/app/error.tsx`, `supabase/migrations/011_banners_video_storage.sql`.
- Corrections realisees : validation partagee des URLs video, exclusion automatique des videos invalides de l'accueil, hero video avec fallback image, formulaire admin d'import multiple jusqu'a 6 videos, upload direct navigateur vers Supabase Storage, suppression fichier Storage via client admin, page d'erreur client en francais.
- Probleme rencontre : le bucket `banners` historique acceptait seulement des images et 10 Mo ; les uploads video peuvent etre refuses tant que la migration 011 n'est pas appliquee.
- Prochaines etapes : appliquer `011_banners_video_storage.sql` dans Supabase Production, puis tester un MP4 H.264 reel depuis mobile et desktop.

## Sprint 10.3 - Correctifs videos et frontend

- Objectif : corriger le faux message de migration video, fiabiliser la creation/suppression des videos, ajuster le texte hero et ajouter le logo au-dessus de la citation.
- Etat : termine cote code.
- Date : 2026-07-17.
- Fichiers principaux concernes : `src/lib/actions/media.ts`, `src/components/admin/media/VideoCreateForm.tsx`, `src/app/admin/videos/page.tsx`, `src/components/HomeClient.tsx`, `ROADMAP.md`, `CHANGELOG.md`.
- Corrections realisees : message de migration remplace par diagnostic Supabase reel, creation `video_items` attendue avant succes UI, compteur 0/6 base sur les videos actives valides, hero `Trouvez votre outfit`, logo centre au-dessus de la citation.
- Problemes rencontres : l'ancien message etait declenche par toute erreur contenant `video_items`, meme si les migrations etaient appliquees.
- Prochaines etapes : tester upload/suppression avec une vraie session admin en production.

## Correctif 10.4 - poster video nullable en production

- Objectif : corriger l'erreur PostgreSQL `23502 null value in column poster_url` pendant l'ajout d'une video sans miniature.
- Etat : code pret, migration a appliquer en production.
- Date : 2026-07-17.
- Fichiers principaux concernes : `supabase/migrations/010_hero_media_and_optional_video_posters.sql`, `supabase/migrations/012_fix_video_poster_nullable.sql`, `src/types/database.ts`, `src/lib/actions/media.ts`, `src/components/admin/media/VideoCreateForm.tsx`.
- Diagnostic : la migration 010 contient bien `ALTER COLUMN poster_url DROP NOT NULL`, mais la base production conserve encore `poster_url NOT NULL`.
- Correction : creation de `012_fix_video_poster_nullable.sql`, idempotente et non destructive.
- Prochaines etapes : appliquer 012 dans Supabase Production, puis tester upload video sans miniature, avec miniature, multiple, activation/desactivation et suppression.

## Correctif videos - generation automatique des miniatures

- Objectif : generer automatiquement une miniature lors de l'import d'une video admin, sans rendre la miniature obligatoire.
- Etat : en validation.
- Date : 2026-07-17.
- Fichiers principaux concernes : `src/components/admin/media/VideoCreateForm.tsx`.
- Correction : capture navigateur d'une frame vers 1 seconde, export JPEG compresse, upload dans `banners/videos/posters/`, puis enregistrement en `poster_url`.
- Probleme gere : si Safari, le codec ou le navigateur bloque la capture, la video reste importable et l'admin voit un avertissement.
- Prochaines etapes : tester en production avec MP4 H.264, import multiple, suppression video et verification du poster sur l'accueil.

## Sprint performance & correctifs produits

- Objectif : corriger les fiches produit en 404, nettoyer les slugs publics, accelerer l'ouverture des fiches produit et simplifier l'acces panier.
- Etat : en validation.
- Date : 2026-07-18.
- Fichiers principaux concernes : `src/app/produit/[slug]/page.tsx`, `src/middleware.ts`, `src/lib/helpers/product-url.ts`, `src/lib/helpers/slugify.ts`, cartes produit, panier, favoris, sitemap.
- Corrections realisees : URLs produit centralisees et normalisees, anciens slugs toleres avec redirection vers l'URL propre, anciens chemins encodes nettoyes dans le middleware, sitemap sur `bagnon-street.com`, lien panier remplace par icone accessible.
- Optimisations : fiche produit servie avec cache court de 5 minutes via requetes serveur admin sans dependance aux cookies, produits similaires et parametres livraison caches.
- Prochaines etapes : auditer les URLs produit de production apres deploiement et verifier Vercel READY.

## Sprint performance frontend/admin reel

- Objectif : reduire les donnees chargees et serialisees par l'accueil, alleger les requetes admin et separer le code lourd de generation video.
- Etat : termine, publie sur `main`, Vercel `READY`.
- Date : 2026-07-18.
- Fichiers principaux concernes : `src/app/page.tsx`, `src/lib/database/products.ts`, `src/lib/database/media.ts`, `src/app/admin/produits/page.tsx`, `src/components/admin/media/VideoCreateForm.tsx`, `src/lib/media/client-video-poster.ts`.
- Optimisations realisees : accueil sans tailles/couleurs inutiles, rails produits prepares cote serveur, galerie limitee aux 8 images rendues, liste admin produits avec requete minimale, capture canvas video chargee uniquement au moment de l'import.
- Mesures : HTML accueil production de 158 743 a 140 522 caracteres ; `/admin/videos` passe de 69.5 kB a 69.0 kB route size ; `/` passe de 10.7 kB a 10.6 kB route size. Timings HTTP production : accueil 1417 ms -> 1402 ms, fiche produit 922 ms -> 653 ms, recherche 771 ms -> 1034 ms, favoris 637 ms -> 886 ms, panier 304 ms -> 317 ms, admin videos 712 ms -> 1074 ms, admin produits 670 ms -> 767 ms.
- Prochaines etapes : completer par un Lighthouse depuis Chrome authentifie pour mesurer l'interaction reelle admin et mobile.
