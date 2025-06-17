'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditCoursePage() {
    const { courseId } = useParams();
    const [form, setForm] = useState({
        title: '',
        teacher: '',
        level: '',
        summary: '',
        placesAvailable: 0,
    });
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
            setForm({
                title: data.title,
                teacher: data.teacher,
                level: data.level,
                summary: data.summary || '',
                placesAvailable: data.placesAvailable ?? 0,
            });
            setLoading(false);
        }
        fetchCourse();
    }, [courseId, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/courses', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseId, ...form, placesAvailable: Number(form.placesAvailable) }),
        });
        router.push(`/course/${courseId}`);
    };

    if (loading) return <div>Chargement...</div>;

    return (
        <div className="p-8 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Éditer le cours</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded">Enregistrer</button>
            </form>
        </div>
    );
}