// src/lib/websocket.ts
import { WebSocketServer } from 'ws';
import redis from './redis';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', async (ws) => {
    const subscriber = redis.duplicate();

    // S'abonne au canal global des news
    await subscriber.subscribe('news:all');

    subscriber.on('message', (channel, message) => {
        ws.send(message);
    });

    ws.on('close', () => {
        subscriber.unsubscribe();
        subscriber.quit();
    });
});

export default wss;