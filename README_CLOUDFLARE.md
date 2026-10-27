# ASBL LAS — déploiement Cloudflare Workers + D1

Cette branche prépare le projet Next.js pour Cloudflare Workers via OpenNext et D1. Aucun secret, fichier .env, fichier SQLite local ou donnée personnelle réelle ne doit être versionné.

## Architecture
- Next.js App Router / React pour le site public et l'espace membre.
- Cloudflare Workers via @opennextjs/cloudflare pour exécuter les routes serveur.
- Cloudflare D1 via le binding DB ; schéma versionné dans migrations/.
- Cookies de session signés, HttpOnly, Secure et SameSite=Lax.
- Les migrations distantes sont manuelles et séparées du déploiement du code.

## Pré-requis
Node.js 22+, Bun, un compte Cloudflare et Wrangler authentifié. Ne lancez aucune migration distante avant validation explicite du propriétaire des données.

## Démarrage local
1. Installer : bun install
2. Copier .dev.vars.example vers .dev.vars et définir SESSION_SECRET avec au moins 32 caractères aléatoires.
3. Créer le schéma local : bun run db:local:migrate
4. Ajouter les exemples : bun run db:local:seed
5. Lancer : bun run dev
6. Vérifier /api/health.

Comptes locaux de démonstration : admin/admin123, secretaire/secretaire123, tresorier/tresorier123, membre/membre123. Ils ne doivent jamais être activés en production.

## Préparation Cloudflare
1. Créer deux bases D1 distinctes : staging et production.
2. Remplacer les IDs factices REPLACE_WITH_STAGING_DATABASE_ID et REPLACE_WITH_PRODUCTION_DATABASE_ID dans une configuration locale. Ne pas committer des IDs de production si cela contrevient à votre politique.
3. Définir SESSION_SECRET dans les secrets Worker (minimum 32 caractères aléatoires), jamais dans wrangler.toml.
4. Appliquer le schéma à staging seulement après vérification : bunx wrangler d1 migrations apply asbl-las-staging --remote.
5. Tester /api/health, connexion, rôles, annuaire, cotisations et annonces sur staging.
6. Déployer le code : bun run deploy:cf.
7. Migrer la production uniquement après sauvegarde et validation écrite.

## Commandes
- bun run dev : développement Next.js.
- bun run lint : ESLint.
- bun run typecheck : TypeScript.
- bun run build:cf : build OpenNext.
- bun run preview:cf : aperçu Cloudflare local.
- bun run deploy:cf : déploiement Workers.

## Limites à lever avant les données réelles
Le squelette contient les APIs de santé, connexion, session, membres, annonces et cotisations, ainsi qu'un schéma couvrant tontine, entraide, médias, utilisateurs et audit. Les APIs CRUD complètes pour tontine, entraide, médias, gestion des comptes, récupération de mot de passe et stockage R2 restent à finaliser. Ajouter une limitation des tentatives de connexion, une procédure sécurisée de création du premier compte administrateur et une politique de sauvegarde/restauration avant l'ouverture en production. Le dépôt est préparé pour des tests de déploiement, mais ne doit pas encore recevoir de données réelles.
