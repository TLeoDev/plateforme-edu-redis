//api/students/route.ts
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import redis from '@/lib/redis';

export async function POST(request: Request) {
    const { name, courses = [] } = await request.json();
    const studentId = uuidv4();

    await redis.hset(`student:${studentId}`, {
        name,
        courses: JSON.stringify(courses),
    });

    return NextResponse.json({ message: 'Student profile created', studentId });
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
    const { studentId, ...updates } = await request.json();
    const student = await redis.hgetall(`student:${studentId}`);

    if (Object.keys(student).length === 0) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (updates.courses) {
        updates.courses = JSON.stringify(updates.courses);
    }

    await redis.hset(`student:${studentId}`, updates);

    return NextResponse.json({ message: 'Student updated' });
}

export async function DELETE(request: Request) {
    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');
    if (!studentId) {
        return NextResponse.json({ error: 'Missing studentId' }, { status: 400 });
    }
    const deleted = await redis.del(`student:${studentId}`);
    if (deleted === 0) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Student deleted' });
}