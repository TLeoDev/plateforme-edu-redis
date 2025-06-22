// src/lib/redis.ts

import Redis from 'ioredis';

// Création d'une connexion à Redis - changer le port si besoin pour y mettre votre port redis
const redis = new Redis({
    host: '127.0.0.1',
    port: 6379,
});

// exportation de l'instance de connection à redis pour l'utiliser partout dans l'application nextjs
export default redis;