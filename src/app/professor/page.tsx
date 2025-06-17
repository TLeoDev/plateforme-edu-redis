'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Professor {
    professorId: string;
    name: string;
    courses: string[];
}

export default function ProfessorsPage() {
    const [professors, setProfessors] = useState<Professor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/professors')
            .then(res => res.json())
            .then(data => {
                setProfessors(data);
                setLoading(false);
            });
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Liste des professeurs</h1>
            <Link href="/professor/new" className="bg-green-600 text-white px-4 py-1 rounded mb-4 inline-block">Nouveau professeur</Link>
            {loading ? (
                <div>Chargement...</div>
            ) : (
                <table className="w-full border">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2">Nom</th>
                        <th className="p-2">ID</th>
                        <th className="p-2">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {professors.map(prof => (
                        <tr key={prof.professorId} className="border-t">
                            <td className="p-2">{prof.name}</td>
                            <td className="p-2">{prof.professorId}</td>
                            <td className="p-2">
                                <Link href={`/professor/${prof.professorId}`} className="text-blue-600 underline">Profil</Link>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}