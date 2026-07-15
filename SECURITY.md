# Security Notes

Date : 2026-07-15

## Etat actuel

- L'administration est protegee cote serveur.
- Les actions sensibles de commande et paiement exigent les controles serveur existants.
- La cle Supabase service role est utilisee uniquement cote serveur.
- Le paiement Wave manuel ne marque jamais automatiquement une commande comme payee.
- La confirmation Wave passe par une RPC atomique afin d'eviter les confirmations doubles et les decrements de stock multiples.

## Headers appliques

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`
- `Permissions-Policy`
- `Content-Security-Policy` compatible avec Next.js, Supabase Storage et les styles/scripts inline existants.

## Points de vigilance

- Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` au navigateur.
- Ne jamais confirmer un paiement depuis un simple retour navigateur ou un lien WhatsApp.
- Garder Orange Money hors scope tant que les acces officiels ne sont pas fournis.
- Maintenir Next.js, React et React DOM a jour avec les correctifs de securite compatibles.
