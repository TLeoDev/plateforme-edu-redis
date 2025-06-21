'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Professor {
    professorId: string;
    name: string;
    courses: string[];
}

interface Course {
    courseId: string;
    title: string;
}

export default function ProfessorProfilePage() {
    const { professorId } = useParams();
    const [professor, setProfessor] = useState<Professor | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            const res = await fetch(`/api/professors?professorId=${professorId}`);
            if (!res.ok) {
                router.push('/404');
                return;
            }
            const data = await res.json();
            setProfessor(data);

            if (data.courses.length > 0) {
                const resCourses = await fetch('/api/courses');
                const all = await resCourses.json();
                setCourses(all.filter((c: Course) => data.courses.includes(c.courseId)));
            }
            setLoading(false);
        }
        fetchData();
    }, [professorId, router]);

    const handleDelete = async () => {
        if (!window.confirm('Supprimer ce professeur ?')) return;
        await fetch(`/api/professors?professorId=${professorId}`, { method: 'DELETE' });
        router.push('/professor');
    };

    if (loading) return <div>Chargement...</div>;
    if (!professor) return <div>Professeur non trouvé.</div>;

    return (
        <div className="p-8 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-2">{professor.name}</h1>
            <p><b>ID :</b> {professor.professorId}</p>
            <div className="my-4">
                <b>Cours enseignés :</b>
                <ul className="list-disc ml-6">
                    {courses.length > 0
                        ? courses.map(c => <li key={c.courseId}>{c.title} ({c.courseId})</li>)
                        : <li>Aucun cours</li>}
                </ul>
            </div>
            <div className="flex gap-4 mt-6">
                <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded"
                >
                    Supprimer
                </button>
                <button
                    onClick={() => router.push(`/professor/${professorId}/edit`)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded"
                >
                    Éditer
                </button>
                <button
                    onClick={() => router.push('/professor')}
                    className="bg-gray-300 px-4 py-2 rounded"
                >
                    Retour
                </button>
            </div>
        </div>
    );
}