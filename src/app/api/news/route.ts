// API pour gérer les news (messages liés aux cours, pub/sub Redis)
import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function POST(request: Request) {
    // Création d'une news (message lié à un cours)
    const { courseId, message } = await request.json();

    const news = { courseId, message, timestamp: new Date().toISOString() };

    // Stocke la news dans la liste Redis
    await redis.lpush('news', JSON.stringify(news));

    // Publie la news sur le canal du cours (Pub/Sub Redis)
    await redis.publish(`course:news:${courseId}`, JSON.stringify(news));
    await redis.publish('news:all', JSON.stringify(news));

    return NextResponse.json({ message: 'News published' });
}

export async function GET(request: Request) {
    // Récupère toutes les news ou filtre par étudiant
    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');
    const newsList = await redis.lrange('news', 0, -1);
    let news = newsList.map((item) => JSON.parse(item));

    if (studentId) {
        // Si un studentId est donné, filtre les news selon ses cours
        const student = await redis.hgetall(`student:${studentId}`);
        const courses = student && student.courses ? JSON.parse(student.courses) : [];
        news = news.filter(n => courses.includes(n.courseId));
    }

    return NextResponse.json(news);
}