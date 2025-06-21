//api/professors/route.ts
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import redis from '@/lib/redis';

export async function POST(request: Request) {
    const { name, courses = [] } = await request.json();
    const professorId = uuidv4();

    await redis.hset(`professor:${professorId}`, {
        name,
        courses: JSON.stringify(courses),
    });

    return NextResponse.json({ message: 'Professor profile created', professorId });
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
        return NextResponse.json({ professorId, ...professor });
    } else {
        const keys = await redis.keys('professor:*');
        const professors = [];

        for (const key of keys) {
            const professor = await redis.hgetall(key);
            professor.courses = JSON.parse(professor.courses || '[]');
            const id = key.split(':')[1];
            professors.push({ professorId: id, ...professor });
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

    // Récupère les cours du professeur
    const professor = await redis.hgetall(`professor:${professorId}`);
    if (professor && professor.courses) {
        const courses = JSON.parse(professor.courses);
        for (const courseId of courses) {
            const courseKey = `course:${courseId}`;
            const course = await redis.hgetall(courseKey);
            if (Object.keys(course).length > 0) {
                await redis.hset(courseKey, { ...course, teacher: "" });
            }
        }
    }

    const deleted = await redis.del(`professor:${professorId}`);
    if (deleted === 0) {
        return NextResponse.json({ error: 'Professor not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Professor deleted' });
}

export async function PATCH(request: Request) {
    const { professorId, ...updates } = await request.json();
    const professor = await redis.hgetall(`professor:${professorId}`);

    if (Object.keys(professor).length === 0) {
        return NextResponse.json({ error: 'Professor not found' }, { status: 404 });
    }

    if (updates.courses) {
        updates.courses = JSON.stringify(updates.courses);
    }

    await redis.hset(`professor:${professorId}`, updates);

    return NextResponse.json({ message: 'Professor updated' });
}