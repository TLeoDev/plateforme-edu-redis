// src/app/api/students/route.ts
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import redis from '@/lib/redis';

export async function POST(request: Request) {
    const { name, forename, mail, courses = [] } = await request.json();
    const studentId = uuidv4();

    await redis.hset(`student:${studentId}`, {
        name,
        forename,
        mail: mail || '',
        courses: JSON.stringify(courses),
    });

    // Ajoute l'étudiant aux cours sélectionnés
    for (const courseId of courses) {
        const courseKey = `course:${courseId}`;
        const course = await redis.hgetall(courseKey);
        if (Object.keys(course).length > 0) {
            let students = [];
            if (course.students) {
                students = JSON.parse(course.students);
            }
            if (!students.includes(studentId)) {
                students.push(studentId);
                await redis.hset(courseKey, { ...course, students: JSON.stringify(students) });
            }
        }
    }

    return NextResponse.json({ message: 'Student created', studentId });
}

export async function GET(request: Request) {
    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');

    if (studentId) {
        const student = await redis.hgetall(`student:${studentId}`);

        if (Object.keys(student).length === 0) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        student.courses = JSON.parse(student.courses || '[]');
        return NextResponse.json({ studentId, ...student });
    } else {
        const keys = await redis.keys('student:*');
        const students = [];

        for (const key of keys) {
            const student = await redis.hgetall(key);
            student.courses = JSON.parse(student.courses || '[]');
            const id = key.split(':')[1];
            students.push({ studentId: id, ...student });
        }

        return NextResponse.json(students);
    }
}

export async function PATCH(request: Request) {
    const { studentId, name, forename, mail, courses: newCourses } = await request.json();
    const studentKey = `student:${studentId}`;
    const student = await redis.hgetall(studentKey);

    if (Object.keys(student).length === 0) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const oldCourses = JSON.parse(student.courses || '[]');

    // Met à jour l'étudiant
    await redis.hset(studentKey, {
        name,
        forename,
        mail: mail || '',
        courses: JSON.stringify(newCourses),
    });

    // Synchronise les cours
    const added = newCourses.filter((c: string) => !oldCourses.includes(c));
    const removed = oldCourses.filter((c: string) => !newCourses.includes(c));

    for (const courseId of added) {
        const courseKey = `course:${courseId}`;
        const course = await redis.hgetall(courseKey);
        const students = JSON.parse(course.students || '[]');
        if (!students.includes(studentId)) {
            students.push(studentId);
            await redis.hset(courseKey, {
                students: JSON.stringify(students),
                placesAvailable: Math.max(
                    0,
                    (Number(course.placesAvailable) || Number(course.placesTotal) || 0) - 1
                ),
            });
            // Rafraîchit le TTL du cours à chaque inscription
            await redis.expire(courseKey, 86400);
        }
    }
    for (const courseId of removed) {
        const courseKey = `course:${courseId}`;
        const course = await redis.hgetall(courseKey);
        const students = (JSON.parse(course.students || '[]') as string[]).filter(id => id !== studentId);
        await redis.hset(courseKey, {
            students: JSON.stringify(students),
            placesAvailable: Math.max(
                0,
                (Number(course.placesAvailable) || Number(course.placesTotal) || 0) - 1
            ),
        });
    }

    return NextResponse.json({ message: 'Student updated' });
}

export async function DELETE(request: Request) {
    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');
    if (!studentId) {
        return NextResponse.json({ error: 'Missing studentId' }, { status: 400 });
    }

    // Récupère les cours de l'étudiant
    const student = await redis.hgetall(`student:${studentId}`);
    if (student && student.courses) {
        const courses = JSON.parse(student.courses);
        for (const courseId of courses) {
            const courseKey = `course:${courseId}`;
            const course = await redis.hgetall(courseKey);
            if (Object.keys(course).length > 0) {
                // Retire l'étudiant de la liste
                const students = (JSON.parse(course.students || '[]') as string[]).filter(id => id !== studentId);
                // Incrémente les places disponibles
                const placesAvailable = Math.min(
                    (Number(course.placesAvailable) || 0) + 1,
                    Number(course.placesTotal) || 0
                );
                await redis.hset(courseKey, {
                    students: JSON.stringify(students),
                    placesAvailable: placesAvailable.toString(),
                });
            }
        }
    }

    const deleted = await redis.del(`student:${studentId}`);
    if (deleted === 0) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Student deleted' });
}