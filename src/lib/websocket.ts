// src/lib/websocket.ts

import { WebSocketServer } from 'ws';
import redis from './redis';

//  create un serveur WebSocket sur le port 8080
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', async (ws) => {
    // duplication de la connexion Redis pour écouter les messages (Pub/Sub)
    const subscriber = redis.duplicate();

    // abonement au canal global des news
    await subscriber.subscribe('news:all');

    // SI un message arrive sur le canal, on l'envoie au client WebSocket
    subscriber.on('message', (channel, message) => {
        ws.send(message);
    });

    // nettoyage quand le client se déconnecte
    ws.on('close', () => {
        subscriber.unsubscribe();
        subscriber.quit();
    });
});

export default wss;