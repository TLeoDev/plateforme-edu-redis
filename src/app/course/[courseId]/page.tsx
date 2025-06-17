'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Importez useParams

interface Course {
    title: string;
    teacher: string;
    level: string;
}

export default function CoursePage() {
    const params = useParams(); // Utilisez useParams pour obtenir les paramètres
    const { courseId } = params;
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchCourse() {
            try {
                const res = await fetch(`/api/courses?courseId=${courseId}`);
                if (!res.ok) {
                    throw new Error('Course not found');
                }
                const data = await res.json();
                setCourse(data);
            } catch (error) {
                console.error(error);
                router.push('/404'); // Redirige vers une page 404 si le cours n'est pas trouvé
            } finally {
                setLoading(false);
            }
        }

        fetchCourse();
    }, [courseId, router]);

    if (loading) {
        return <div>Chargement...</div>;
    }

    if (!course) {
        return <div>Cours non trouvé.</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="mt-4">Enseignant : {course.teacher}</p>
            <p>Niveau : {course.level}</p>
        </div>
    );
}