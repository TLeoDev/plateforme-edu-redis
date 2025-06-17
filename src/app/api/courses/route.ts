// src/app/api/courses/route.ts
import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import type { Course } from '@/app/models/course';

const COURSE_TTL_SECONDS = 86400; // 1 jour

export async function POST(request: Request) {
    const { courseId, title, teacher, level, summary = '', placesAvailable = 0, students = [] } = await request.json();

    await redis.hset(`course:${courseId}`, {
        title,
        teacher,
        level,
        summary,
        placesAvailable: placesAvailable.toString(),
        students: JSON.stringify(students),
    });

    await redis.expire(`course:${courseId}`, COURSE_TTL_SECONDS);

    // Publier la création du cours
    await redis.publish('course-updates', JSON.stringify({
        type: 'created',
        courseId,
        title,
        teacher,
        level,
        summary,
        placesAvailable,
        students,
        timestamp: new Date().toISOString(),
    }));

    return NextResponse.json({ message: 'Course added with expiration' });
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
        course.students = JSON.parse(course.students || '[]');
        return NextResponse.json({ courseId, ...course });
    } else {
        const keys = await redis.keys('course:*');
        let courses: Course[] = [];

        for (const key of keys) {
            const course = await redis.hgetall(key);
            const id = key.split(':')[1];
            courses.push({
                courseId: id,
                title: course.title,
                teacher: course.teacher,
                level: course.level,
                summary: course.summary,
                placesAvailable: course.placesAvailable ? parseInt(course.placesAvailable) : 0,
                students: course.students ? JSON.parse(course.students) : [],
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

    if (updates.students) {
        updates.students = JSON.stringify(updates.students);
    }
    if (updates.placesAvailable !== undefined) {
        updates.placesAvailable = updates.placesAvailable.toString();
    }

    await redis.hset(`course:${courseId}`, updates);

    // Publier la mise à jour du cours
    await redis.publish('course-updates', JSON.stringify({
        type: 'updated',
        courseId,
        updates,
        timestamp: new Date().toISOString(),
    }));

    return NextResponse.json({ message: 'Course updated' });
}

export async function DELETE(request: Request) {
    const url = new URL(request.url);
    const courseId = url.searchParams.get('courseId');
    if (!courseId) {
        return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });
    }
    const deleted = await redis.del(`course:${courseId}`);
    if (deleted === 0) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Course deleted' });
}