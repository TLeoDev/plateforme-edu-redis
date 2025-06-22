// src/app/professor/new/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProfessorPage() {
    const [name, setName] = useState('');
    const [forename, setForename] = useState('');
    const [mail, setMail] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await fetch('/api/professors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, forename, mail }),
        });
        setLoading(false);
        if (res.ok) {
            router.push('/professor');
        } else {
            alert('Erreur lors de la création');
        }
    };

    return (
        <div className="p-8 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Nouveau professeur</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    name="forename"
                    placeholder="Prénom"
                    required
                    value={forename}
                    onChange={e => setForename(e.target.value)}
                    className="border px-2 py-1 rounded"
                />
                <input
                    name="name"
                    placeholder="Nom"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="border px-2 py-1 rounded"
                />
                <input
                    name="mail"
                    placeholder="Mail (optionnel)"
                    value={mail}
                    onChange={e => setMail(e.target.value)}
                    className="border px-2 py-1 rounded"
                    type="email"
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
                    {loading ? 'Création...' : 'Créer'}
                </button>
            </form>
        </div>
    );
}