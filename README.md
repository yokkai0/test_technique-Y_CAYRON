# Baby-Foot Tournament Manager (Nuxt + Node (avec Prisma))

Application web pour créer et gérer des tournois de baby-foot :
- création de tournois
- ajout d'équipes
- génération automatique des matchs (round-robin, tout le monde se rencontre 1 fois)
- saisie des scores
- classement automatique

## Stack
- Front: Nuxt4 (Vue)
- Backend: Node.js + Express
- DB: SQLite
- ORM: Prisma

## Prérequis
- Node.js 20+

## Installation
```bash
# à la racine
npm run install:all


#Lancer en développement
npm run dev


Front: http://localhost:3000

API: http://localhost:3001/api/health

Base de données (SQLite)

La base est un fichier local api/dev.db.

Reset DB (dev) :

npm --prefix api run prisma:migrate-reset

API (principales routes)

GET /api/tournaments
POST /api/tournaments
GET /api/tournaments/:id
POST /api/tournaments/:id/teams
POST /api/tournaments/:id/matches/generate
PATCH /api/matches/:matchId/score
GET /api/tournaments/:id/standings


#Notes

Authentification non implémentée.

En cas de scores incomplets, le classement ignore les matchs non joués.
