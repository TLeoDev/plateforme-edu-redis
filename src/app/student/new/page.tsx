'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewStudentPage() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });
        setLoading(false);
        if (res.ok) {
            router.push('/student');
        } else {
            alert('Erreur lors de la création');
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Nouvel étudiant</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
                <label>
                    Nom :
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="border px-2 py-1 rounded w-full"
                        required
                    />
                </label>
                <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-1 rounded"
                    disabled={loading}
                >
                    {loading ? 'Création...' : 'Créer'}
                </button>
            </form>
        </div>
    );
}