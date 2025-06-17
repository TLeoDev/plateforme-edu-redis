import redis from '@/lib/redis';
import Link from 'next/link';

interface Course {
    courseId: string;
    title: string;
    teacher: string;
    level: string;
}

export default async function CoursesPage() {
    const keys = await redis.keys('course:*');
    const courses: Course[] = [];

    for (const key of keys) {
        const courseData = await redis.hgetall(key);
        const id = key.split(':')[1];
        courses.push({ courseId: id, ...courseData });
    }

    if (courses.length === 0) {
        return <div>Aucun cours disponible.</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Liste des Cours</h1>
            <ul>
                {courses.map((course) => (
                    <li key={course.courseId} className="mb-2">
                        <Link href={`/course/${course.courseId}`} className="text-blue-500 hover:underline">
                            {course.title}
                        </Link>
                        <p>Enseignant : {course.teacher}</p>
                        <p>Niveau : {course.level}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}