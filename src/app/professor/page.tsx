'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ToastContext';

interface Professor {
    professorId: string;
    name: string;
    forename: string;
    mail?: string;
    courses: string[];
}

export default function ProfessorsPage() {
    const [professors, setProfessors] = useState<Professor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showConfirm, setShowConfirm] = useState(false);
    const [toDelete, setToDelete] = useState<string | null>(null);
    const { showToast } = useToast();

    const fetchProfessors = async () => {
        setLoading(true);
        const res = await fetch('/api/professors');
        const data = await res.json();
        setProfessors(data);
        setLoading(false);
    };

    useEffect(() => { fetchProfessors(); }, []);

    const handleDelete = async () => {
        if (!toDelete) return;
        const res = await fetch(`/api/professors?professorId=${toDelete}`, { method: 'DELETE' });
        setShowConfirm(false);
        setToDelete(null);
        if (res.ok) {
            showToast('Professeur supprimé', 'success');
            fetchProfessors();
        } else {
            const data = await res.json();
            showToast(data.error || 'Erreur lors de la suppression', 'error');
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Liste des professeurs</h1>
            <div className="flex mb-6">
                <Link href="/professor/new" className="bg-green-600 text-white px-4 py-1 rounded ml-auto flex items-center gap-2">
                    {/* Plus icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nouveau professeur
                </Link>
            </div>
            {loading ? (
                <div>Chargement...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border">
                        <thead>
                        <tr className="bg-gray-100">
                            <th className="p-3 text-left">Prénom</th>
                            <th className="p-3 text-left">Nom</th>
                            <th className="p-3 text-left">Mail</th>
                            <th className="p-3 text-left">ID</th>
                            <th className="p-3 text-left">Cours</th>
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {professors.map(prof => (
                            <tr key={prof.professorId} className="border-t">
                                <td className="p-3">{prof.forename}</td>
                                <td className="p-3">{prof.name}</td>
                                <td className="p-3">{prof.mail || <span className="italic text-gray-400">-</span>}</td>
                                <td className="p-3">{prof.professorId}</td>
                                <td className="p-3">
                                    {prof.courses && prof.courses.length > 0
                                        ? `${prof.courses.length} cours`
                                        : <span className="italic text-gray-400">Aucun</span>
                                    }
                                </td>
                                <td className="p-3 flex gap-2">
                                    <Link
                                        href={`/professor/${prof.professorId}`}
                                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition flex items-center gap-1"
                                    >
                                        {/* Détail icon */}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Détail
                                    </Link>
                                    <Link
                                        href={`/professor/${prof.professorId}/edit`}
                                        className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200 transition flex items-center gap-1"
                                    >
                                        {/* Edit icon */}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-2.828 1.172H7v-2a4 4 0 011.172-2.828z" />
                                        </svg>
                                        Éditer
                                    </Link>
                                    <button
                                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition flex items-center gap-1"
                                        onClick={() => { setShowConfirm(true); setToDelete(prof.professorId); }}
                                    >
                                        {/* Trash icon */}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                                        </svg>
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Popup de confirmation */}
            {showConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                        <h2 className="text-xl font-bold mb-2 text-gray-900">Confirmer la suppression</h2>
                        <p className="mb-6 text-gray-700 text-center">Voulez-vous vraiment supprimer ce professeur ? Cette action est irréversible.</p>
                        <div className="flex gap-4 w-full">
                            <button
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 flex-1"
                                onClick={() => { setShowConfirm(false); setToDelete(null); }}
                            >
                                Annuler
                            </button>
                            <button
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex-1"
                                onClick={handleDelete}
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}