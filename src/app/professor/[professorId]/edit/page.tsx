'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditProfessorPage() {
    const { professorId } = useParams();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function fetchProfessor() {
            const res = await fetch(`/api/professors?professorId=${professorId}`);
            if (!res.ok) {
                router.push('/404');
                return;
            }
            const data = await res.json();
            setName(data.name);
            setLoading(false);
        }
        fetchProfessor();
    }, [professorId, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        await fetch('/api/professors', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ professorId, name }),
        });
        setSaving(false);
        router.push(`/professor/${professorId}`);
    };

    if (loading) return <div>Chargement...</div>;

    return (
        <div className="p-8 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Éditer le professeur</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    name="name"
                    placeholder="Nom"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="border px-2 py-1 rounded"
                />
                <div className="flex gap-4 mt-4">
                    <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded" disabled={saving}>
                        {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    <button
                        type="button"
                        className="bg-gray-300 px-4 py-2 rounded"
                        onClick={() => router.push('/professor')}
                    >
                        Retour
                    </button>
                </div>
            </form>
        </div>
    );
}