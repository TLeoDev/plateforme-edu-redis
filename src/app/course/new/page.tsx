'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewCoursePage() {
    const [form, setForm] = useState({
        courseId: '',
        title: '',
        teacher: '',
        level: '',
        summary: '',
        placesAvailable: 0,
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await fetch('/api/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, placesAvailable: Number(form.placesAvailable), students: [] }),
        });
        setLoading(false);
        router.push('/course');
    };

    return (
        <div className="p-8 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Créer un nouveau cours</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input name="courseId" placeholder="ID du cours" required value={form.courseId} onChange={handleChange} className="border px-2 py-1 rounded" />
                <input name="title" placeholder="Titre" required value={form.title} onChange={handleChange} className="border px-2 py-1 rounded" />
                <input name="teacher" placeholder="Enseignant" required value={form.teacher} onChange={handleChange} className="border px-2 py-1 rounded" />
                <select name="level" required value={form.level} onChange={handleChange} className="border px-2 py-1 rounded">
                    <option value="">Niveau</option>
                    <option value="débutant">Débutant</option>
                    <option value="intermédiaire">Intermédiaire</option>
                    <option value="avancé">Avancé</option>
                </select>
                <textarea name="summary" placeholder="Résumé" value={form.summary} onChange={handleChange} className="border px-2 py-1 rounded" />
                <input name="placesAvailable" type="number" min={0} placeholder="Places disponibles" required value={form.placesAvailable} onChange={handleChange} className="border px-2 py-1 rounded" />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
                    {loading ? 'Création...' : 'Créer'}
                </button>
            </form>
        </div>
    );
}