//api/news/route.ts
import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function POST(request: Request) {
    const { courseId, message } = await request.json();

    const news = { courseId, message, timestamp: new Date().toISOString() };

    // Publier les news dans une liste Redis
    await redis.lpush('news', JSON.stringify(news));

    return NextResponse.json({ message: 'News published' });
}

export async function GET() {
    const newsList = await redis.lrange('news', 0, -1);
    const news = newsList.map((item) => JSON.parse(item));

    return NextResponse.json(news);
}