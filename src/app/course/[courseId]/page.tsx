'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Course {
    courseId: string;
    title: string;
    teacher: string;
    level: string;
    summary?: string;
    placesAvailable?: number;
    placesTotal?: number;
    students?: string[];
}

interface Student {
    studentId: string;
    name: string;
}

export default function CoursePage() {
    const { courseId } = useParams();
    const [course, setCourse] = useState<Course | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function fetchCourse() {
            const res = await fetch(`/api/courses?courseId=${courseId}`);
            if (!res.ok) {
                router.push('/404');
                return;
            }
            const data = await res.json();
            setCourse(data);

            if (data.students && data.students.length > 0) {
                const resStudents = await fetch('/api/students');
                const allStudents = await resStudents.json();
                setStudents(allStudents.filter((s: Student) => data.students.includes(s.studentId)));
            }
            setLoading(false);
        }
        fetchCourse();
    }, [courseId, router]);

    const handleDelete = async () => {
        setDeleting(true);
        await fetch(`/api/courses?courseId=${courseId}`, { method: 'DELETE' });
        setDeleting(false);
        setShowConfirm(false);
        router.push('/course');
    };

    if (loading) return <div>Chargement...</div>;
    if (!course) return <div>Cours non trouvé.</div>;

    return (
        <div className="p-8 flex justify-center">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl">
                <h1 className="text-2xl font-bold mb-4">{course.title}</h1>
                <div className="mb-2"><b>Enseignant :</b> {course.teacher}</div>
                <div className="mb-2"><b>Niveau :</b> {course.level}</div>
                <div className="mb-2"><b>Résumé :</b> {course.summary || <span className="italic text-gray-500">Aucun résumé</span>}</div>
                <div className="mb-2">
                    <b>Places :</b> {(course.placesAvailable ?? 0)}/{course.placesTotal ?? 0}
                </div>
                <div className="mb-4">
                    <b>Étudiants inscrits :</b>
                    {students.length > 0 ? (
                        <table className="w-full border mt-2">
                            <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 text-left">Nom</th>
                                <th className="p-2 text-left">ID</th>
                            </tr>
                            </thead>
                            <tbody>
                            {students.map(s => (
                                <tr key={s.studentId} className="border-t">
                                    <td className="p-2">{s.name}</td>
                                    <td className="p-2">{s.studentId}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="italic text-gray-500 mt-2">Aucun étudiant inscrit</div>
                    )}
                </div>
                <div className="flex gap-4 mt-8">
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition flex items-center gap-2"
                    >
                        {/* Trash icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                        Supprimer
                    </button>
                    <button
                        onClick={() => router.push(`/course/${courseId}/edit`)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition flex items-center gap-2"
                    >
                        {/* Pencil icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2h6" />
                        </svg>
                        Éditer
                    </button>
                    <button
                        onClick={() => router.push('/course')}
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition flex items-center gap-2 ml-auto"
                    >
                        {/* Arrow left icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Retour
                    </button>
                </div>
            </div>

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
                                onClick={() => setShowConfirm(false)}
                                disabled={deleting}
                            >
                                Annuler
                            </button>
                            <button
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex-1"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? 'Suppression...' : 'Supprimer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}