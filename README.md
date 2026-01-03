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
Sans Docker
- Node.js 20+
- npm

Avec Docker (recommandé)
- Docker
- Docker Compose

## Installation
```bash
# À la racine du projet
npm run install:all

# Lancer en développement
npm run dev

# Accès

    Front : http://localhost:3000

    API : http://localhost:3001/api/health

# Base de données

    SQLite locale : ./api/dev.db

Réinitialiser la base (dev)

npm --prefix api run prisma:migrate-reset

Lancer le projet avec Docker (DEV)

Le projet est entièrement dockerisé pour fonctionner sur toutes les configurations.
Caractéristiques du mode Docker DEV

    Hot reload (front & back)

    Base de données persistante via volume Docker

    Prisma exécuté avec migrate deploy

    Aucune dépendance locale Node requise

# Lancer le projet

À la racine du projet :

docker compose -f docker-compose.dev.yml up --build

Accès

    Front : http://localhost:3000

    API : http://localhost:3001/api/health

Persistance de la base de données

La base SQLite est stockée dans un volume Docker :

    Les données sont conservées même après arrêt / redémarrage des containers.

Arrêter les containers

docker compose -f docker-compose.dev.yml down

Réinitialiser complètement la base Docker

docker volume rm test_technique-Y_CAYRON_api_db

# Authentification

    Authentification administrateur uniquement

    Identifiants temporaires (en dur) :

        username : admin

        password : admin

    Auth via JWT stocké en cookie HTTP-only

# Rôles

    Visiteur :

        Consultation des tournois (lecture seule)

    Administrateur :

        Création de tournois

        Gestion des équipes

        Génération des matchs

        Saisie des scores

# API – Routes principales
Publiques

GET    /api/tournaments
GET    /api/tournaments/:id
GET    /api/tournaments/:id/standings

Administrateur (protégées)

POST   /api/tournaments
POST   /api/tournaments/:id/teams
POST   /api/tournaments/:id/matches/generate
PATCH  /api/matches/:matchId/score

Auth

POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

# Tests
Outils utilisés

    Vitest

    Supertest

Base de données de test

    SQLite dédiée : ./api/test.db

    Réinitialisée automatiquement avant chaque suite de tests

Lancer les tests API

Depuis le dossier ./api :

npm test

Tests couverts

    Création d’un tournoi

    Ajout d’équipes à un tournoi

    Génération des matchs round-robin

    Vérification du nombre de matchs générés

# Notes techniques

    Authentification volontairement simple (contexte test technique)

    Les matchs ne peuvent être générés qu’une seule fois par tournoi

    En cas de scores incomplets, le classement ignore les matchs non joués

    Les tests utilisent une base isolée pour garantir la reproductibilité