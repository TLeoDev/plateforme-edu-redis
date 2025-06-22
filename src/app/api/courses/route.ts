// src/app/api/courses/route.ts
import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { v4 as uuidv4 } from 'uuid';

const COURSE_TTL_SECONDS = 86400; // 1 jour

export async function POST(request: Request) {
    const { title, teacher, level, summary = '', placesTotal = 0, students = [] } = await request.json();
    const courseId = uuidv4();

    await redis.hset(`course:${courseId}`, {
        title,
        teacher,
        level,
        summary,
        placesTotal: placesTotal.toString(),
        students: JSON.stringify(students),
    });

    await redis.expire(`course:${courseId}`, COURSE_TTL_SECONDS);

    // --- Ajout du cours à la liste du professeur ---
    if (teacher) {
        const profKey = `professor:${teacher}`;
        const professor = await redis.hgetall(profKey);
        let courses = [];
        if (professor && professor.courses) {
            courses = JSON.parse(professor.courses);
        }
        if (!courses.includes(courseId)) {
            courses.push(courseId);
            await redis.hset(profKey, { ...professor, courses: JSON.stringify(courses) });
        }
    }
    // ------------------------------------------------

    // --- Publie une news sur la création du cours ---
    const news = {
        courseId,
        message: `Nouveau cours créé : ${title}`,
        timestamp: new Date().toISOString(),
    };
    await redis.lpush('news', JSON.stringify(news));
    await redis.publish(`course:news:${courseId}`, JSON.stringify(news));
    await redis.publish('news:all', JSON.stringify(news));
    // ------------------------------------------------

    return NextResponse.json({ message: 'Course added with expiration', courseId });
}

export async function GET(request: Request) {
    const url = new URL(request.url);
    const courseId = url.searchParams.get('courseId');
    const title = url.searchParams.get('title');
    const teacher = url.searchParams.get('teacher');
    const level = url.searchParams.get('level');

    if (courseId) {
        const course = await redis.hgetall(`course:${courseId}`);
        if (Object.keys(course).length === 0) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }
        const students = JSON.parse(course.students || '[]');
        const placesTotal = parseInt(course.placesTotal ?? '0');
        const placesAvailable = placesTotal - students.length;
        return NextResponse.json({
            courseId,
            ...course,
            placesTotal,
            students,
            placesAvailable,
        });
    } else {
        const keys = await redis.keys('course:*');
        let courses = [];

        for (const key of keys) {
            const course = await redis.hgetall(key);
            const id = key.split(':')[1];
            const students = course.students ? JSON.parse(course.students) : [];
            const placesTotal = course.placesTotal ? parseInt(course.placesTotal) : 0;
            const placesAvailable = placesTotal - students.length;
            courses.push({
                courseId: id,
                title: course.title,
                teacher: course.teacher,
                level: course.level,
                summary: course.summary,
                placesTotal,
                students,
                placesAvailable,
            });
        }

        // Filtrage selon les paramètres
        if (title) {
            courses = courses.filter(c => c.title?.toLowerCase().includes(title.toLowerCase()));
        }
        if (teacher) {
            courses = courses.filter(c => c.teacher?.toLowerCase().includes(teacher.toLowerCase()));
        }
        if (level) {
            courses = courses.filter(c => c.level?.toLowerCase() === level.toLowerCase());
        }

        return NextResponse.json(courses);
    }
}

export async function PUT(request: Request) {
    const { courseId, ...updates } = await request.json();
    const course = await redis.hgetall(`course:${courseId}`);

    if (Object.keys(course).length === 0) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Synchronisation professeurs
    const oldTeacher = course.teacher;
    const newTeacher = updates.teacher;

    // Retirer le cours de l'ancien professeur si différent
    if (oldTeacher && oldTeacher !== newTeacher) {
        const oldProfKey = `professor:${oldTeacher}`;
        const oldProf = await redis.hgetall(oldProfKey);
        if (oldProf && oldProf.courses) {
            let courses = JSON.parse(oldProf.courses);
            courses = courses.filter((id: string) => id !== courseId);
            await redis.hset(oldProfKey, { ...oldProf, courses: JSON.stringify(courses) });
        }
    }

    // Ajouter le cours au nouveau professeur si différent
    if (newTeacher && oldTeacher !== newTeacher) {
        const newProfKey = `professor:${newTeacher}`;
        const newProf = await redis.hgetall(newProfKey);
        let courses = [];
        if (newProf && newProf.courses) {
            courses = JSON.parse(newProf.courses);
        }
        if (!courses.includes(courseId)) {
            courses.push(courseId);
            await redis.hset(newProfKey, { ...newProf, courses: JSON.stringify(courses) });
        }
    }

    // Mise à jour des étudiants
    const students = course.students ? JSON.parse(course.students) : [];
    const newPlacesTotal = updates.placesTotal !== undefined ? Number(updates.placesTotal) : parseInt(course.placesTotal ?? '0');

    if (newPlacesTotal < students.length) {
        return NextResponse.json({
            error: `Impossible de définir un nombre de places total (${newPlacesTotal}) inférieur au nombre d'étudiants inscrits (${students.length})`
        }, { status: 400 });
    }

    if (updates.students) {
        updates.students = JSON.stringify(updates.students);
    }

    // Met à jour le cours
    await redis.hset(`course:${courseId}`, {
        ...course,
        ...updates,
        placesTotal: newPlacesTotal.toString(),
    });

    // --- Publie une news sur la modification du cours ---
    const news = {
        courseId,
        message: `Le cours "${updates.title || course.title}" a été mis à jour.`,
        timestamp: new Date().toISOString(),
    };
    await redis.lpush('news', JSON.stringify(news));
    await redis.publish(`course:news:${courseId}`, JSON.stringify(news));
    await redis.publish('news:all', JSON.stringify(news));
    // ---------------------------------------------------

    return NextResponse.json({ message: 'Course updated' });
}

export async function DELETE(request: Request) {
    const url = new URL(request.url);
    const courseId = url.searchParams.get('courseId');
    if (!courseId) {
        return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });
    }

    // Récupère le cours pour trouver le professeur associé
    const course = await redis.hgetall(`course:${courseId}`);
    if (Object.keys(course).length === 0) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Met à jour la liste des cours du professeur
    if (course.teacher) {
        const profKey = `professor:${course.teacher}`;
        const professor = await redis.hgetall(profKey);
        if (professor && professor.courses) {
            let courses = JSON.parse(professor.courses);
            courses = courses.filter((id: string) => id !== courseId);
            await redis.hset(profKey, { ...professor, courses: JSON.stringify(courses) });
        }
    }

    // Supprime le cours
    const deleted = await redis.del(`course:${courseId}`);
    if (deleted === 0) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Course deleted' });
}