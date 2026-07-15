# Production Checklist

Date : 2026-07-15

## Technique

- TypeScript : a verifier a chaque sprint.
- ESLint : a verifier a chaque sprint.
- Build production : a verifier a chaque sprint.
- Vercel production : verifier `READY` apres chaque push sur `main`.
- Logs runtime Vercel : verifier l'absence d'erreurs critiques apres deploiement.
- Supabase : ne jamais appliquer de migration destructive.

## SEO

- `/robots.txt` present.
- `/sitemap.xml` present.
- Pages produit avec metadata dynamique.
- Pages produit avec donnees structurees Product.
- Pages privees et transactionnelles en `noindex`.
- Pages legales en `noindex` tant que les textes officiels ne sont pas fournis.

## Securite

- Routes admin protegees cote serveur.
- Actions admin protegees par `requireAdmin()`.
- Service role Supabase reservee au serveur.
- Confirmation Wave manuelle protegee par RPC atomique.
- Headers de securite actives via Next config.

## Validation manuelle avant lancement public

- Tester inscription, connexion et deconnexion avec un compte client.
- Tester connexion admin et toutes les pages admin.
- Tester creation commande visiteur et client connecte.
- Tester paiement Wave manuel et confirmation admin.
- Verifier decrement stock une seule fois.
- Verifier messages WhatsApp client/admin avec une vraie commande.
- Relire et publier les pages legales avec contenu officiel.
- Configurer le domaine public final si necessaire.
