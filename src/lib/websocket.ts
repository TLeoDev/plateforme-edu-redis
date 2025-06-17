import { WebSocketServer } from 'ws';
import redis from './redis';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
    const subscriber = redis.duplicate();

    subscriber.subscribe('course-updates', (message) => {
        // @ts-ignore
        ws.send(message);
    });

    ws.on('close', () => {
        subscriber.unsubscribe();
        subscriber.quit();
    });
});

export default wss;
