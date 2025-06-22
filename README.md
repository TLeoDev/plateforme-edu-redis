# Plateforme Éducative – Projet Redis

## Installation et Lancement

### Prérequis (lien clicable vers installation)

- **[Node.js](https://nodejs.org/)** (v18 ou supérieur recommandé)
- **[npm](https://www.npmjs.com/get-npm)** (installé avec Node.js)
- **[Redis](https://redis.io/download/)** (v6 ou supérieur)

### Installation de Redis

#### macOS

```bash
brew install redis
brew services start redis
```

#### Linux (Debian/Ubuntu)

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
```

#### Windows
Télécharger Redis depuis : https://github.com/microsoftarchive/redis/releases Lancer redis-server.exe.<hr></hr>
Installation du projet
Cloner le dépôt :

```bash
git clone <url-du-repo>
cd plateforme-edu
```

Installer les dépendances :
```bash
npm install
```

Lancer l’application :
```bash
npm run dev
```

L’application sera accessible sur http://localhost:3000. 

---

## Architecture du projet

- `src/lib/redis.ts`  
  Initialise la connexion à Redis (via ioredis). Toute la logique de stockage, lecture, publication et souscription passe par ce module.

- `src/app/api/`  
  Contient toutes les routes API (backend) qui manipulent Redis :
    - `courses/route.ts` : gestion des cours (CRUD, TTL, news, recherche)
    - `professors/route.ts` : gestion des professeurs (CRUD, synchronisation avec les cours)
    - `students/route.ts` : gestion des étudiants (CRUD, inscription/désinscription aux cours, synchronisation)
    - `news/route.ts` : gestion des news (publish/subscribe Redis)

- `src/lib/websocket.ts`  
  Serveur WebSocket qui relaie en temps réel les news Redis aux clients connectés.

- `src/app/`  
  Contient le frontend (non détaillé ici, car l’évaluation porte sur Redis).

- `package.json`  
  Scripts npm, dépendances.

- `tsconfig.json`  
  Configuration TypeScript (notamment l’alias `@/lib/redis` utilisé côté Next.js).

---

