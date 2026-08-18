# Emails transactionnels Bagnon Street

## Statut

L'architecture email centralisée est préparée dans `src/lib/email`.

Les déclencheurs Resend contenant des données client détaillées ne sont pas activés automatiquement dans ce sprint, car ils transmettent à un prestataire tiers des informations de commande comme nom, téléphone, adresse, articles et montant.

Activation requise avant envoi réel :

1. Vérifier que `RESEND_API_KEY` est configurée dans Vercel en production.
2. Confirmer que l'envoi à Resend des données nécessaires aux emails transactionnels est validé côté métier/confidentialité.
3. Brancher les helpers de `src/lib/email/notifications.ts` après réussite des opérations métier.

## Expéditeur prévu

`Bagnon Street <no-reply@bagnon-street.com>`

Le `replyTo` doit utiliser l'email configuré dans `site_settings.email` lorsqu'il existe.

## Templates préparés

- bienvenue client ;
- confirmation de commande ;
- notification admin nouvelle commande ;
- paiement confirmé ;
- commande expédiée ;
- commande livrée ;
- commande annulée ;
- template HTML Supabase Auth pour mot de passe oublié.

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
