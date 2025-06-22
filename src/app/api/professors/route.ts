// API REST pour gérer les professeurs (CRUD, synchro avec les cours dans Redis)
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import redis from '@/lib/redis';

export async function POST(request: Request) {
    // Création d'un prof
    const { name, forename, mail, courses = [] } = await request.json();
    const professorId = uuidv4();

    // stock le prof dans Redis
    await redis.hset(`professor:${professorId}`, {
        name,
        forename,
        mail: mail || '',
        courses: JSON.stringify(courses),
    });

    return NextResponse.json({ message: 'Professor profile created', professorId });
}

export async function GET(request: Request) {
    // récup un prof précis ou la liste de tous
    const url = new URL(request.url);
    const professorId = url.searchParams.get('professorId');

    if (professorId) {
        // cherche un prof avec son ID (si renseigné)
        const professor = await redis.hgetall(`professor:${professorId}`);

        if (Object.keys(professor).length === 0) {
            return NextResponse.json({ error: 'Professor not found' }, { status: 404 });
        }

        // parse les cours pour les retourner en tableau
        professor.courses = JSON.parse(professor.courses || '[]');
        return NextResponse.json({ professorId, ...professor });
    } else {
        // récupère tous les profs
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
    // supprime un prof et met à jour les cours associés
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
                // retire le prof du cours
                await redis.hset(courseKey, { ...course, teacher: "" });
            }
        }
    }

    // supprime le prof de Redis
    const deleted = await redis.del(`professor:${professorId}`);
    if (deleted === 0) {
        return NextResponse.json({ error: 'Professor not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Professor deleted' });
}

export async function PATCH(request: Request) {
    // met à jour les infos d'un prof
    const { professorId, name, forename, mail, courses } = await request.json();
    const professor = await redis.hgetall(`professor:${professorId}`);

    if (Object.keys(professor).length === 0) {
        return NextResponse.json({ error: 'Professor not found' }, { status: 404 });
    }

    // prépare les champs à mettre à jours
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (forename !== undefined) updates.forename = forename;
    if (mail !== undefined) updates.mail = mail;
    if (courses !== undefined) updates.courses = JSON.stringify(courses);

    // met à jour dans redis
    await redis.hset(`professor:${professorId}`, updates);

    return NextResponse.json({ message: 'Professor updated' });
}