'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Course {
    courseId: string;
    title: string;
    placesAvailable: number;
}

export default function NewStudentPage() {
    const [name, setName] = useState('');
    const [courses, setCourses] = useState<string[]>([]);
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/courses')
            .then(res => res.json())
            .then(data => setAllCourses(data));
    }, []);

    const handleCourseChange = (courseId: string, checked: boolean) => {
        setCourses(prev =>
            checked
                ? [...prev, courseId]
                : prev.filter(id => id !== courseId)
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, courses }),
        });
        setLoading(false);
        if (res.ok) {
            router.push('/student');
        } else {
            alert('Erreur lors de la création');
        }
    };

    return (
        <div className="p-8 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Nouvel étudiant</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    name="name"
                    placeholder="Nom"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="border px-2 py-1 rounded"
                />
                <label className="font-semibold">Cours à l’inscription :</label>
                <div className="flex flex-col gap-2">
                    {allCourses.map(c => (
                        <label key={c.courseId} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={courses.includes(c.courseId)}
                                onChange={e => handleCourseChange(c.courseId, e.target.checked)}
                                disabled={c.placesAvailable <= 0}
                            />
                            {c.title}
                            {c.placesAvailable <= 0 && (
                                <span className="text-xs text-red-500 ml-2">(complet)</span>
                            )}
                        </label>
                    ))}
                </div>
                <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded"
                    disabled={loading}
                >
                    {loading ? 'Création...' : 'Créer'}
                </button>
            </form>
        </div>
    );
}
