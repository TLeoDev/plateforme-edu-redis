//api/professors/route.ts
import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function POST(request: Request) {
    const { professorId, name, courses = [] } = await request.json();

    await redis.hset(`professor:${professorId}`, {
        name,
        courses: JSON.stringify(courses),
    });

    return NextResponse.json({ message: 'Professor profile created' });
}

export async function GET(request: Request) {
    const url = new URL(request.url);
    const professorId = url.searchParams.get('professorId');

    if (professorId) {
        const professor = await redis.hgetall(`professor:${professorId}`);

        if (Object.keys(professor).length === 0) {
            return NextResponse.json({ error: 'Professor not found' }, { status: 404 });
        }

        professor.courses = JSON.parse(professor.courses || '[]');
        return NextResponse.json(professor);
    } else {
        const keys = await redis.keys('professor:*');
        const professors = [];

        for (const key of keys) {
            const professor = await redis.hgetall(key);
            professor.courses = JSON.parse(professor.courses || '[]');
            professors.push(professor);
        }

        return NextResponse.json(professors);
    }
}

export async function DELETE(request: Request) {
    const url = new URL(request.url);
    const professorId = url.searchParams.get('professorId');
    if (!professorId) {
        return NextResponse.json({ error: 'Missing professorId' }, { status: 400 });
    }
    const deleted = await redis.del(`professor:${professorId}`);
    if (deleted === 0) {
        return NextResponse.json({ error: 'Professor not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Professor deleted' });
}