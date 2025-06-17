'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Course {
    courseId: string;
    title: string;
    teacher: string;
    level: string;
    summary?: string;
    placesAvailable?: number;
    students?: string[];
}

export default function CoursePage() {
    const { courseId } = useParams();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchCourse() {
            const res = await fetch(`/api/courses?courseId=${courseId}`);
            if (!res.ok) {
                router.push('/404');
                return;
            }
            const data = await res.json();
            setCourse(data);
            setLoading(false);
        }
        fetchCourse();
    }, [courseId, router]);

    const handleDelete = async () => {
        if (!window.confirm('Supprimer ce cours ?')) return;
        await fetch(`/api/courses?courseId=${courseId}`, { method: 'DELETE' });
        router.push('/course');
    };

    if (loading) return <div>Chargement...</div>;
    if (!course) return <div>Cours non trouvé.</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
            <p><b>Enseignant :</b> {course.teacher}</p>
            <p><b>Niveau :</b> {course.level}</p>
            <p><b>Résumé :</b> {course.summary}</p>
            <p><b>Places restantes :</b> {course.placesAvailable ?? 0}</p>
            <div className="my-4">
                <b>Étudiants inscrits :</b>
                <ul className="list-disc ml-6">
                    {course.students && course.students.length > 0
                        ? course.students.map(s => <li key={s}>{s}</li>)
                        : <li>Aucun étudiant inscrit</li>}
                </ul>
            </div>
            <div className="flex gap-4 mt-6">
                <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">Supprimer</button>
                <button onClick={() => router.push(`/course/${courseId}/edit`)} className="bg-yellow-500 text-white px-4 py-2 rounded">Éditer</button>
                <button onClick={() => router.push('/course')} className="bg-gray-300 px-4 py-2 rounded">Retour</button>
            </div>
        </div>
    );
}