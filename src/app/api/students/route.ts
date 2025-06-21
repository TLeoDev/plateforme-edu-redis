//api/students/route.ts
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import redis from '@/lib/redis';

export async function POST(request: Request) {
    const { name, courses = [] } = await request.json();
    const studentId = uuidv4();

    // Création de l'étudiant
    await redis.hset(`student:${studentId}`, {
        name,
        courses: JSON.stringify(courses),
    });

    // Pour chaque cours, ajouter l'étudiant à la liste des étudiants du cours
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

export async function PUT(request: Request) {
    const COURSE_TTL_SECONDS = 86400; // 1 jour
    const { studentId, courseId } = await request.json();
    const course = await redis.hgetall(`course:${courseId}`);

    if (Object.keys(course).length === 0) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (parseInt(course.placesAvailable) <= 0) {
        return NextResponse.json({ error: 'No places available' }, { status: 400 });
    }

    // Met à jour les cours de l'étudiant
    const student = await redis.hgetall(`student:${studentId}`);
    const courses = JSON.parse(student.courses || '[]');
    if (!courses.includes(courseId)) {
        courses.push(courseId);
    }

    await redis.hset(`student:${studentId}`, {
        ...student,
        courses: JSON.stringify(courses),
    });

    // Met à jour la liste des étudiants inscrits dans le cours
    const studentsList = JSON.parse(course.students || '[]');
    if (!studentsList.includes(studentId)) {
        studentsList.push(studentId);
    }

    await redis.hset(`course:${courseId}`, {
        ...course,
        placesAvailable: (parseInt(course.placesAvailable) - 1).toString(),
        students: JSON.stringify(studentsList),
    });

    // Rafraîchit le TTL du cours
    await redis.expire(`course:${courseId}`, COURSE_TTL_SECONDS);

    return NextResponse.json({ message: 'Student enrolled in course' });
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
            // Ajout de l'id extrait de la clé
            const id = key.split(':')[1];
            students.push({ studentId: id, ...student });
        }

        return NextResponse.json(students);
    }
}

export async function PATCH(request: Request) {
    const { studentId, name, courses: newCourses } = await request.json();
    const studentKey = `student:${studentId}`;
    const student = await redis.hgetall(studentKey);

    if (Object.keys(student).length === 0) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const oldCourses = JSON.parse(student.courses || '[]');

    // Met à jour l'étudiant
    await redis.hset(studentKey, {
        name,
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