# Emails transactionnels Bagnon Street

## Statut

L'architecture email centralisée est active dans `src/lib/email`.

Les déclencheurs Resend sont branchés uniquement après réussite des opérations métier : inscription, création de commande, confirmation Wave, expédition, livraison et annulation.

Activation requise avant envoi réel en production :

1. Ajouter `RESEND_API_KEY` dans Vercel Production.
2. Configurer Supabase Auth SMTP avec Resend si les emails Supabase Auth doivent partir via le domaine Bagnon Street.
3. Tester un compte client test et une commande test.

## Expéditeur prévu

`Bagnon Street <no-reply@bagnon-street.com>`

Le `replyTo` utilise l'email configuré dans `site_settings.email` lorsqu'il existe.

## Templates préparés

- bienvenue client ;
- confirmation de commande ;
- notification admin nouvelle commande ;
- paiement confirmé ;
- commande expédiée ;
- commande livrée ;
- commande annulée ;
- template HTML Supabase Auth pour mot de passe oublié.

## Données minimisées

Email client commande :

- nom client ;
- référence ;
- produits ;
- taille/couleur lorsqu'elles existent ;
- quantités ;
- total ;
- statut ;
- lien de suivi.

Email admin nouvelle commande :

- référence ;
- nom client ;
- téléphone ;
- montant ;
- moyen de paiement ;
- lien admin.

## Mot de passe oublié

Le parcours applicatif utilise le flux Supabase Auth officiel :

1. `/mot-de-passe-oublie`
2. email Supabase Auth avec lien sécurisé
3. `/auth/callback?next=/reinitialiser-mot-de-passe`
4. `/reinitialiser-mot-de-passe`
5. retour vers `/connexion`

Pour personnaliser l'email Supabase avec Resend, configurer Supabase Auth SMTP avec Resend dans le Dashboard Supabase, puis appliquer le template HTML fourni par `resetPasswordSupabaseTemplate()` dans `src/lib/email/templates.ts`.

## Règle de fiabilité

Un échec email ne doit jamais annuler :

- une inscription ;
- une commande ;
- une confirmation Wave ;
- une expédition ;
- une livraison ;
- une annulation.

Les emails sont une conséquence secondaire de l'opération métier.
