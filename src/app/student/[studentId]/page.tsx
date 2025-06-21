'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Student {
    studentId: string;
    name: string;
    courses: string[];
}

interface Course {
    courseId: string;
    title: string;
    teacher?: string;
    teacherName?: string;
}

interface Professor {
    professorId: string;
    name: string;
}

export default function StudentProfilePage() {
    const { studentId } = useParams();
    const [student, setStudent] = useState<Student | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            const res = await fetch(`/api/students?studentId=${studentId}`);
            if (!res.ok) {
                router.push('/404');
                return;
            }
            const data = await res.json();
            setStudent(data);

            if (data.courses.length > 0) {
                const [resCourses, resProfs] = await Promise.all([
                    fetch('/api/courses'),
                    fetch('/api/professors')
                ]);
                const allCourses = await resCourses.json();
                const allProfs = await resProfs.json();

                // Ajoute le nom du prof à chaque cours
                const coursesWithProf = allCourses
                    .filter((c: Course) => data.courses.includes(c.courseId))
                    .map((c: Course) => ({
                        ...c,
                        teacherName: c.teacher
                            ? (allProfs.find((p: Professor) => p.professorId === c.teacher)?.name || c.teacher)
                            : null
                    }));
                setCourses(coursesWithProf);
            }
            setLoading(false);
        }
        fetchData();
    }, [studentId, router]);

    const handleDelete = async () => {
        setShowConfirm(false);
        await fetch(`/api/students?studentId=${studentId}`, { method: 'DELETE' });
        router.push('/student');
    };

    if (loading) return <div>Chargement...</div>;
    if (!student) return <div>Étudiant non trouvé.</div>;

    return (
        <div className="p-8 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-2">{student.name}</h1>
            <p><b>ID :</b> {student.studentId}</p>
            <div className="my-4">
                <b>Cours inscrits :</b>
                {courses.length > 0 ? (
                    <div className="overflow-x-auto mt-2">
                        <table className="w-full border">
                            <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 text-left">Nom</th>
                                <th className="p-2 text-left">ID</th>
                                <th className="p-2 text-left">Professeur</th>
                            </tr>
                            </thead>
                            <tbody>
                            {courses.map(c => (
                                <tr key={c.courseId} className="border-t">
                                    <td className="p-2">{c.title}</td>
                                    <td className="p-2">{c.courseId}</td>
                                    <td className="p-2">
                                        {c.teacherName
                                            ? c.teacherName
                                            : <span className="italic text-gray-400">Aucun</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="italic text-gray-400 mt-2">Aucun cours inscrit</div>
                )}
            </div>
            <div className="flex gap-4 mt-6">
                <button
                    onClick={() => setShowConfirm(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded"
                >
                    Supprimer
                </button>
                <button
                    onClick={() => router.push(`/student/${studentId}/edit`)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded"
                >
                    Éditer
                </button>
                <button
                    onClick={() => router.push('/student')}
                    className="bg-gray-300 px-4 py-2 rounded"
                >
                    Retour
                </button>
            </div>

            {/* Popup de confirmation */}
            {showConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                        <h2 className="text-xl font-bold mb-2 text-gray-900">Confirmer la suppression</h2>
                        <p className="mb-6 text-gray-700 text-center">Voulez-vous vraiment supprimer cet étudiant ? Cette action est irréversible.</p>
                        <div className="flex gap-4 w-full">
                            <button
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 flex-1"
                                onClick={() => setShowConfirm(false)}
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