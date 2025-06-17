'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProfessorPage() {
    const [form, setForm] = useState({ professorId: '', name: '' });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await fetch('/api/professors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, courses: [] }),
        });
        setLoading(false);
        router.push('/professor');
    };

    return (
        <div className="p-8 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Nouveau professeur</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input name="professorId" placeholder="ID professeur" required value={form.professorId} onChange={handleChange} className="border px-2 py-1 rounded" />
                <input name="name" placeholder="Nom" required value={form.name} onChange={handleChange} className="border px-2 py-1 rounded" />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
                    {loading ? 'Création...' : 'Créer'}
                </button>
            </form>
        </div>
    );
}