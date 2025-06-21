'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Course {
    title: string;
    teacher: string;
    level: string;
    summary?: string;
    placesTotal: number;
    students?: string[];
}

interface Professor {
    professorId: string;
    name: string;
}

export default function EditCoursePage() {
    const { courseId } = useParams();
    const [form, setForm] = useState<Course>({
        title: '',
        teacher: '',
        level: '',
        summary: '',
        placesTotal: 0,
        students: [],
    });
    const [professors, setProfessors] = useState<Professor[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            // Récupère le cours
            const res = await fetch(`/api/courses?courseId=${courseId}`);
            if (!res.ok) {
                router.push('/404');
                return;
            }
            const data = await res.json();
            setForm({
                title: data.title,
                teacher: data.teacher,
                level: data.level,
                summary: data.summary,
                placesTotal: Number(data.placesTotal ?? 0),
                students: data.students ?? [],
            });

            // Récupère les professeurs
            const resProfs = await fetch('/api/professors');
            const profs = await resProfs.json();
            setProfessors(profs);

            setLoading(false);
        }
        fetchData();
    }, [courseId, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/courses', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                courseId,
                ...form,
                placesTotal: Number(form.placesTotal),
            }),
        });
        router.push(`/course/${courseId}`);
    };

    if (loading) return <div>Chargement...</div>;

    const placesAvailable = form.placesTotal - (form.students?.length ?? 0);

    return (
        <div className="p-8 flex justify-center">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl">
                <h1 className="text-2xl font-bold mb-6">Éditer le cours</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-[1fr_2fr] gap-4 items-center">
                        <label htmlFor="title" className="font-semibold text-gray-700">Titre</label>
                        <input id="title" name="title" placeholder="Titre" required value={form.title} onChange={handleChange} className="border px-2 py-2 rounded" />

                        <label htmlFor="teacher" className="font-semibold text-gray-700">Enseignant</label>
                        <select
                            id="teacher"
                            name="teacher"
                            required
                            value={form.teacher}
                            onChange={handleChange}
                            className="border px-2 py-2 rounded"
                        >
                            <option value="">Sélectionner un enseignant</option>
                            {professors.map(prof => (
                                <option key={prof.professorId} value={prof.professorId}>
                                    {prof.name} ({prof.professorId})
                                </option>
                            ))}
                        </select>

                        <label htmlFor="level" className="font-semibold text-gray-700">Niveau</label>
                        <select id="level" name="level" required value={form.level} onChange={handleChange} className="border px-2 py-2 rounded">
                            <option value="">Niveau</option>
                            <option value="débutant">Débutant</option>
                            <option value="intermédiaire">Intermédiaire</option>
                            <option value="avancé">Avancé</option>
                        </select>

                        <label htmlFor="summary" className="font-semibold text-gray-700">Résumé</label>
                        <textarea id="summary" name="summary" placeholder="Résumé" value={form.summary} onChange={handleChange} className="border px-2 py-2 rounded" />

                        <label htmlFor="placesTotal" className="font-semibold text-gray-700">Nombre total de places</label>
                        <input id="placesTotal" name="placesTotal" type="number" min={0} placeholder="Nombre total de places" required value={form.placesTotal} onChange={handleChange} className="border px-2 py-2 rounded" />

                        <div className="col-span-2 text-sm text-gray-600">
                            Places restantes : <b>{placesAvailable}</b> / {form.placesTotal}
                        </div>
                    </div>
                    <div className="flex gap-4 mt-6">
                        <button
                            type="submit"
                            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition flex items-center gap-2"
                        >
                            {/* Pencil icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2h6" />
                            </svg>
                            Enregistrer
                        </button>
                        <button
                            type="button"
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition flex items-center gap-2 ml-auto"
                            onClick={() => router.push('/course')}
                        >
                            {/* Arrow left icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Retour
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}