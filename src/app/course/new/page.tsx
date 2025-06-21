'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastContext';

interface Professor {
    professorId: string;
    name: string;
}

export default function NewCoursePage() {
    const [form, setForm] = useState({
        title: '',
        teacher: '',
        level: '',
        summary: '',
        placesTotal: 0,
    });
    const [professors, setProfessors] = useState<Professor[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        fetch('/api/professors')
            .then(res => res.json())
            .then(data => setProfessors(data));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await fetch('/api/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...form,
                placesTotal: Number(form.placesTotal),
                students: [],
            }),
        });
        setLoading(false);
        if (res.ok) {
            showToast('Cours créé avec succès', 'success');
            router.push('/course');
        } else {
            const data = await res.json();
            showToast(data.error || 'Erreur lors de la création', 'error');
        }
    };

    return (
        <div className="p-8 flex justify-center">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl">
                <h1 className="text-2xl font-bold mb-6">Créer un nouveau cours</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-[1fr_2fr] gap-4 items-center">
                        <label htmlFor="title" className="font-semibold text-gray-700">Titre</label>
                        <input id="title" name="title" placeholder="Titre" required value={form.title} onChange={handleChange} className="border px-2 py-2 rounded" />

                        <label htmlFor="teacher" className="font-semibold text-gray-700">Enseignant</label>
                        <select id="teacher" name="teacher" required value={form.teacher} onChange={handleChange} className="border px-2 py-2 rounded">
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
                    </div>
                    <div className="flex gap-4 mt-6">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
                            disabled={loading}
                        >
                            {/* Plus icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {loading ? 'Création...' : 'Créer'}
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