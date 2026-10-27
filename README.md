# ASBL LAS — Les Amis de la Semence

Plateforme associative Next.js pour la publication des annonces et événements, l'espace membre et la gestion associative.

## Fonctionnalités implémentées dans cette branche
- Site public responsive et fil d'annonces/événements.
- Connexion par nom d'utilisateur et mot de passe, sessions HMAC signées et cookies HttpOnly/Secure.
- Contrôle des rôles ADMIN, TRESORIER, SECRETAIRE et MEMBRE.
- Annuaire des membres, enregistrement/consultation des cotisations.
- API de tontine, demandes d'entraide, médiathèque par URL HTTPS, gestion des comptes, statistiques et journal d'audit.
- Cloudflare Workers via OpenNext et base Cloudflare D1.
- Migrations SQL versionnées, données fictives séparées des migrations et contrôles CI.

## Développement local
Pré-requis : Node.js 22+, Bun et Wrangler.
1. Installer les dépendances : `bun install`
2. Copier `.dev.vars.example` vers `.dev.vars`, puis définir un secret aléatoire de 32 caractères minimum.
3. Appliquer le schéma local : `bun run db:local:migrate`
4. Charger les exemples fictifs : `bun run db:local:seed`
5. Démarrer : `bun run dev`
6. Vérifier `/api/health`.

Comptes de démonstration locaux uniquement : admin/admin123, secretaire/secretaire123, tresorier/tresorier123, membre/membre123. Ne jamais utiliser ces identifiants en production.

## Cloudflare
Lire impérativement [README_CLOUDFLARE.md](README_CLOUDFLARE.md). La configuration Wrangler contient des IDs D1 factices à remplacer par les IDs réels de bases staging et production séparées. Définir `SESSION_SECRET` dans les secrets Cloudflare, jamais dans le dépôt.

## Sécurité et données
- Aucun fichier `.env` ni base SQLite ne doit être versionné.
- Les scripts de seed sont locaux et n'acceptent pas `--remote` ou `--production`.
- Ne lancer aucune migration distante sans sauvegarde et validation explicite.
- L'historique Git peut conserver les anciens fichiers supprimés : si un secret réel a déjà été publié, le révoquer/renouveler reste nécessaire.

## État avant production
La branche permet de valider la base Cloudflare et les parcours de base. Avant d'introduire des données réelles, compléter les tests d'intégration, limiter les tentatives de connexion, valider la récupération de compte, la gestion fine des permissions, les sauvegardes/restaurations et le stockage des médias dans R2. Le guide détaille la checklist de mise en service.
