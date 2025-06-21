'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Course {
    courseId: string;
    title: string;
    placesAvailable: number;
}

export default function EditStudentPage() {
    const router = useRouter();
    const { studentId } = useParams();
    const [name, setName] = useState('');
    const [courses, setCourses] = useState<string[]>([]);
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchData() {
            const resStudent = await fetch(`/api/students?studentId=${studentId}`);
            if (!resStudent.ok) {
                router.push('/404');
                return;
            }
            const student = await resStudent.json();
            setName(student.name);
            setCourses(student.courses || []);

            const resCourses = await fetch('/api/courses');
            const all = await resCourses.json();
            setAllCourses(all);
            setLoading(false);
        }
        fetchData();
    }, [studentId, router]);

    const handleCourseChange = (courseId: string, checked: boolean) => {
        setCourses(prev =>
            checked
                ? [...prev, courseId]
                : prev.filter(id => id !== courseId)
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        // Mise à jour de l'étudiant
        await fetch('/api/students', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, name, courses }),
        });

        setSaving(false);
        router.push(`/student/${studentId}`);
    };

    if (loading) return <div>Chargement...</div>;

    return (
        <div className="p-8 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Éditer l’étudiant</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    name="name"
                    placeholder="Nom"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="border px-2 py-1 rounded"
                />
                <label className="font-semibold">Cours inscrits :</label>
                <div className="flex flex-col gap-2">
                    {allCourses.map(c => (
                        <label key={c.courseId} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={courses.includes(c.courseId)}
                                onChange={e => handleCourseChange(c.courseId, e.target.checked)}
                                disabled={
                                    !courses.includes(c.courseId) && c.placesAvailable <= 0
                                }
                            />
                            {c.title}
                            {!courses.includes(c.courseId) && c.placesAvailable <= 0 && (
                                <span className="text-xs text-red-500 ml-2">(complet)</span>
                            )}
                        </label>
                    ))}
                </div>
                <div className="flex gap-4 mt-4">
                    <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded" disabled={saving}>
                        {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    <button
                        type="button"
                        className="bg-gray-300 px-4 py-2 rounded"
                        onClick={() => router.push('/student')}
                    >
                        Retour
                    </button>
                </div>
            </form>
        </div>
    );
}