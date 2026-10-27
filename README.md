# ASBL LAS — Les Amis de la Semence

Application web Next.js 16 pour la gestion associative de l'ASBL LAS :
- Répertoire des membres (avec photos de profil)
- Cotisations mensuelles (CDF / USD)
- Tontine (mutuelle de solidarité)
- Demandes d'entraide
- Blog / annonces
- Médiathèque (photos, PDF, vidéos)
- 4 rôles : Admin · Trésorier · Secrétaire · Membre
- Journal d'audit complet

## 1. Démarrage rapide (local)

```bash
# 1. Installer les dépendances (Node.js 20+ requis, Bun recommandé)
bun install            # ou : npm install

# 2. Générer le client Prisma
bunx prisma generate

# 3. Initialiser la base SQLite + données de démo
bun run db:seed         # crée db/custom.db + 8 membres, 33 cotisations, etc.

# 4. Lancer le serveur de dev
bun dev                # ou : npm run dev
# → http://localhost:3000
```

## 2. Comptes de démonstration

| Rôle | Identifiant | Mot de passe | Accès |
|---|---|---|---|
| Admin | `admin` | `admin123` | Tout : dashboard, membres, finance, tontine, entraide, contenu, utilisateurs, audit |
| Trésorier | `tresorier` | `tresorier123` | Finance, tontine, audit |
| Secrétaire | `secretaire` | `secretaire123` | Membres, contenu, audit |
| Membre | `membre` | `membre123` | Espace membre (fiche, cotisations, tontine, entraide, annonces) |

## 3. Structure du projet

```
asbl-las-projet/
├── src/
│   ├── app/                      # Routes Next.js 16 (App Router)
│   │   ├── page.tsx              # Site public (accueil)
│   │   ├── layout.tsx            # Layout racine (fontes, providers)
│   │   └── api/                  # 17 routes API
│   │       ├── auth/             # login, logout, session
│   │       ├── members/          # CRUD membres
│   │       ├── me/profile        # Profil du membre connecté
│   │       ├── contributions/    # Cotisations mensuelles
│   │       ├── payments/         # Suivi mensuel payé/à payer
│   │       ├── tontine/          # Tontine (périodes + entrées)
│   │       ├── aid-requests/     # Demandes d'entraide
│   │       ├── posts/            # Blog / annonces
│   │       ├── media/            # Médiathèque
│   │       ├── users/            # Comptes utilisateurs (admin)
│   │       ├── stats/            # KPIs dashboard
│   │       └── audit/            # Journal d'audit
│   ├── components/
│   │   ├── ui/                   # Composants shadcn/ui (Card, Button, Dialog…)
│   │   └── las/                  # 11 composants métier
│   │       ├── public-site.tsx       # Site public (hero, activités, annonces)
│   │       ├── login-view.tsx        # Page de connexion
│   │       ├── member-directory.tsx  # Annuaire des membres
│   │       ├── member-file.tsx       # Fiche membre (photo + édition)
│   │       ├── member-portal.tsx    # Espace membre (5 onglets)
│   │       ├── admin-dashboard.tsx  # Dashboard (KPIs + graphiques Recharts)
│   │       ├── admin-finance.tsx    # Gestion des cotisations
│   │       ├── admin-tontine.tsx    # Gestion de la tontine
│   │       ├── admin-aid.tsx        # Gestion des demandes d'entraide
│   │       ├── admin-content.tsx    # Blog & annonces
│   │       ├── admin-users.tsx      # Gestion des comptes utilisateurs
│   │       └── admin-audit.tsx      # Journal d'audit
│   └── lib/
│       ├── prisma.ts             # Client Prisma singleton
│       ├── auth.ts               # HMAC-SHA256 cookies + bcrypt
│       ├── las-types.ts          # Types métier partagés
│       ├── las-photo.ts         # Upload + redimensionnement photos
│       ├── las-format.ts         # Helpers de formatage (devise, dates)
│       └── server-utils.ts      # Utilitaires serveur
├── prisma/
│   └── schema.prisma             # 11 modèles Prisma (SQLite)
├── db/
│   └── custom.db                 # Base SQLite (générée par le seed)
├── scripts/
│   ├── seed.ts                   # Données de démonstration
│   └── migration-d1-pdf.py       # Génération du guide PDF Cloudflare D1
├── download/
│   └── guide-migration-cloudflare-d1.pdf  # Guide de migration (12 pages)
├── package.json                  # Scripts npm : dev, db:seed, db:reset
├── tailwind.config.ts            # Thème émeraude/or + glassmorphism
└── tsconfig.json
```

## 4. Scripts npm utiles

```bash
bun run dev          # Serveur dev sur :3000
bun run build        # Build production
bun run start        # Serveur prod (après build)
bun run db:seed      # Initialise la base + données démo
bun run db:reset     # Réinitialise la base (efface tout)
bunx prisma studio   # Interface visuelle pour explorer la base
bunx prisma generate # Régénère le client Prisma après modification du schema
```

## 5. Technologies

- **Next.js 16** (App Router, Server Components, API routes)
- **React 19** + **TypeScript 5**
- **Tailwind CSS 4** + **shadcn/ui** (composants)
- **Prisma 5** + **SQLite** (base locale)
- **Recharts** (graphiques du dashboard)
- **bcrypt** (hash des mots de passe)
- **HMAC-SHA256** (signature des cookies de session, 7 jours)

## 6. Migration vers Cloudflare D1

Voir le guide complet dans `download/guide-migration-cloudflare-d1.pdf` (12 pages, ≈ 2 h 40 de travail). Couvre :
- Création de la base D1
- Génération du schéma SQL
- Migration des données
- Adaptation du code Prisma (@prisma/adapter-d1)
- Déploiement sur Cloudflare Pages
- Tests post-migration
- Pièges connus et bonnes pratiques

## 7. Données de démonstration

8 membres, 4 comptes, 33 cotisations mensuelles, 2 périodes de tontine, 3 demandes d'entraide, 3 annonces, 2 médias. Pour repartir de zéro : `bun run db:reset && bun run db:seed`.

## 8. Sécurité

- Mots de passe hashés avec bcrypt (10 rounds)
- Cookies de session signés HMAC-SHA256 (clé `SESSION_SECRET` dans `.env`)
- Pas de JWT stocké côté client (cookies HttpOnly)
- Quatre rôles avec permissions distinctes sur chaque route API
- Journal d'audit complet (CREATE / UPDATE / DELETE / LOGIN)

## 9. Licence

Projet livré pour l'usage exclusif de l'ASBL LAS — Les Amis de la Semence.
