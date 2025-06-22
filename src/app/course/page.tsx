'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ToastContext';

interface Course {
    courseId: string;
    title: string;
    teacher: string; // ID du professeur
    level: string;
    summary?: string;
    placesAvailable?: number;
    placesTotal?: number;
    students?: string[];
}

interface Professor {
    professorId: string;
    name: string;
    forename: string;
    mail?: string;
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [professors, setProfessors] = useState<Professor[]>([]);
    const [search, setSearch] = useState({ title: '', teacher: '', level: '' });
    const [loading, setLoading] = useState(true);
    const [showConfirm, setShowConfirm] = useState(false);
    const [toDelete, setToDelete] = useState<string | null>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const { showToast } = useToast();

    // Récupère les cours
    const fetchCourses = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (search.title) params.append('title', search.title);
        if (search.teacher) params.append('teacher', search.teacher);
        if (search.level) params.append('level', search.level);
        const res = await fetch(`/api/courses?${params.toString()}`);
        const data = await res.json();
        setCourses(data);
        setLoading(false);
    };

    // Récupère les professeurs
    useEffect(() => {
        fetch('/api/professors')
            .then(res => res.ok ? res.json() : [])
            .then(data => setProfessors(data))
            .catch(() => setProfessors([]));
    }, []);

    useEffect(() => { fetchCourses(); }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchCourses();
        }, 300);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search.title, search.teacher, search.level]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setSearch({ ...search, [e.target.name]: e.target.value });
    };

    const handleClear = () => {
        setSearch({ title: '', teacher: '', level: '' });
    };

    const handleDelete = async () => {
        if (!toDelete) return;
        const res = await fetch(`/api/courses?courseId=${toDelete}`, { method: 'DELETE' });
        setShowConfirm(false);
        setToDelete(null);
        if (res.ok) {
            showToast('Cours supprimé', 'success');
            fetchCourses();
        } else {
            const data = await res.json();
            showToast(data.error || 'Erreur lors de la suppression', 'error');
        }
    };

    // Affiche le nom complet et le mail du professeur
    const getTeacherDisplay = (teacherId: string) => {
        if (!teacherId) return <span className="italic text-gray-400">Aucun</span>;
        const prof = professors.find(p => p.professorId === teacherId);
        if (!prof) return <span className="italic text-gray-400">Aucun</span>;
        return (
            <span>
                {prof.forename} {prof.name}
                {prof.mail && (
                    <span className="block text-xs text-gray-500">{prof.mail}</span>
                )}
            </span>
        );
    };

    // Utilitaire pour label flottant
    const floatLabel = (value: string) =>
        value ? 'text-xs -top-2 left-2 bg-gray-50 px-1 text-gray-500' : 'text-gray-400 left-3 top-1/2 -translate-y-1/2 pointer-events-none';

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Liste des cours</h1>
            <form className="flex gap-4 mb-6 flex-wrap items-end">
                <div className="relative">
                    <input
                        name="title"
                        id="search-title"
                        value={search.title}
                        onChange={handleChange}
                        className="border px-2 py-1 rounded w-44 peer"
                        autoComplete="off"
                    />
                    <label
                        htmlFor="search-title"
                        className={`absolute transition-all duration-150 bg-transparent px-1 pointer-events-none ${floatLabel(search.title)}`}
                    >
                        Titre
                    </label>
                </div>
                <div className="relative">
                    <input
                        name="teacher"
                        id="search-teacher"
                        value={search.teacher}
                        onChange={handleChange}
                        className="border px-2 py-1 rounded w-44 peer"
                        autoComplete="off"
                    />
                    <label
                        htmlFor="search-teacher"
                        className={`absolute transition-all duration-150 bg-transparent px-1 pointer-events-none ${floatLabel(search.teacher)}`}
                    >
                        Enseignant
                    </label>
                </div>
                <div className="relative">
                    <select
                        name="level"
                        id="search-level"
                        value={search.level}
                        onChange={handleChange}
                        className="border px-2 py-1 rounded w-44 peer"
                    >
                        <option value="" disabled hidden />
                        <option value="débutant">Débutant</option>
                        <option value="intermédiaire">Intermédiaire</option>
                        <option value="avancé">Avancé</option>
                    </select>
                    <label
                        htmlFor="search-level"
                        className={`absolute transition-all duration-150 bg-transparent px-1 pointer-events-none ${floatLabel(search.level)}`}
                    >
                        Niveau
                    </label>
                </div>
                <button
                    type="button"
                    className="bg-gray-200 text-gray-800 px-4 py-1 rounded hover:bg-gray-300 transition flex items-center gap-2"
                    onClick={handleClear}
                    disabled={!search.title && !search.teacher && !search.level}
                >
                    {/* X icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Vider les filtres
                </button>
                <Link href="/course/new" className="bg-green-600 text-white px-4 py-1 rounded ml-auto flex items-center gap-2">
                    {/* Plus icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nouveau cours
                </Link>
            </form>
            {loading ? (
                <div>Chargement...</div>
            ) : (
                <table className="w-full border">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2 text-left">Titre</th>
                        <th className="p-2 text-left">Enseignant</th>
                        <th className="p-2 text-left">Niveau</th>
                        <th className="p-2 text-left">Places</th>
                        <th className="p-2 text-left">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {courses.map(course => (
                        <tr key={course.courseId} className="border-t">
                            <td className="p-2 text-left">{course.title}</td>
                            <td className="p-2 text-left">{getTeacherDisplay(course.teacher)}</td>
                            <td className="p-2 text-left">{course.level}</td>
                            <td className="p-2 text-left">
                                {(course.placesAvailable ?? 0)}/{course.placesTotal ?? 0}
                            </td>
                            <td className="p-2 flex items-center gap-2">
                                <Link
                                    href={`/course/${course.courseId}`}
                                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition flex items-center gap-1"
                                >
                                    {/* Eye icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 5-7 9-9 9s-9-4-9-9 7-9 9-9 9 4 9 9z" />
                                    </svg>
                                    Détail
                                </Link>
                                <Link
                                    href={`/course/${course.courseId}/edit`}
                                    className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200 transition flex items-center gap-1"
                                >
                                    {/* Pencil icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2h6" />
                                    </svg>
                                    Éditer
                                </Link>
                                <button
                                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition flex items-center gap-1"
                                    onClick={() => { setShowConfirm(true); setToDelete(course.courseId); }}
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
            )}

            {/* Popup de confirmation */}
            {showConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                        <h2 className="text-xl font-bold mb-2 text-gray-900">Confirmer la suppression</h2>
                        <p className="mb-6 text-gray-700 text-center">Voulez-vous vraiment supprimer ce cours ? Cette action est irréversible.</p>
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