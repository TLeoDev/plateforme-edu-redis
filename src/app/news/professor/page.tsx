'use client';

import { useEffect, useState } from 'react';

interface Professor {
    professorId: string;
    name: string;
    forename: string;
    courses: string[];
}

interface Course {
    courseId: string;
    title: string;
}

export default function NewsProfessorPage() {
    const [professors, setProfessors] = useState<Professor[]>([]);
    const [pendingProfessorId, setPendingProfessorId] = useState('');
    const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
    const [profCourses, setProfCourses] = useState<Course[]>([]);
    const [selectedProfCourseId, setSelectedProfCourseId] = useState('');
    const [profMessage, setProfMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [profSuccess, setProfSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/professors').then(res => res.json()).then(setProfessors);
    }, []);

    useEffect(() => {
        const p = professors.find(prof => prof.professorId === pendingProfessorId) || null;
        setSelectedProfessor(p);
    }, [pendingProfessorId, professors]);

    useEffect(() => {
        if (!selectedProfessor) {
            setProfCourses([]);
            setSelectedProfCourseId('');
            return;
        }
        if (selectedProfessor.courses.length === 0) {
            setProfCourses([]);
            setSelectedProfCourseId('');
            return;
        }
        Promise.all(
            selectedProfessor.courses.map((id) =>
                fetch(`/api/courses?courseId=${id}`).then(res => res.json())
            )
        ).then((courses) => {
            setProfCourses(courses.filter((c: Course) => !('error' in c)));
        });
        setSelectedProfCourseId('');
    }, [selectedProfessor]);

    const handlePublish = async () => {
        if (!selectedProfCourseId || !profMessage) return;
        setLoading(true);
        setProfSuccess(null);
        await fetch('/api/news', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseId: selectedProfCourseId, message: profMessage }),
        });
        setLoading(false);
        setProfMessage('');
        setProfSuccess('News publiée !');
        setTimeout(() => setProfSuccess(null), 2000);
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">News professeur</h1>
            <div className="mb-6 flex gap-4 items-center flex-wrap">
                <label className="font-semibold">Profil :</label>
                <select
                    className="border px-2 py-1 rounded"
                    value={pendingProfessorId}
                    onChange={e => setPendingProfessorId(e.target.value)}
                >
                    <option value="">Sélectionner un professeur</option>
                    {professors.map(p => (
                        <option key={p.professorId} value={p.professorId}>
                            {p.forename} {p.name} ({p.professorId})
                        </option>
                    ))}
                </select>
            </div>
            {selectedProfessor && (
                <section className="mt-6">
                    <h2 className="text-xl font-semibold mb-2">
                        Publier une news pour {selectedProfessor.forename} {selectedProfessor.name}
                    </h2>
                    {profCourses.length === 0 ? (
                        <div className="text-gray-500 mb-2">Aucun cours associé à ce professeur.</div>
                    ) : (
                        <div className="mb-4">
                            <label className="font-semibold">Cours :</label>
                            <select
                                className="border px-2 py-1 rounded ml-2"
                                value={selectedProfCourseId}
                                onChange={e => setSelectedProfCourseId(e.target.value)}
                            >
                                <option value="">Sélectionner un cours</option>
                                {profCourses.map(c => (
                                    <option key={c.courseId} value={c.courseId}>
                                        {c.title} ({c.courseId})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {selectedProfCourseId && (
                        <div className="mb-4">
                            <label className="font-semibold">Message :</label>
                            <textarea
                                className="border px-2 py-1 rounded w-full"
                                value={profMessage}
                                onChange={e => setProfMessage(e.target.value)}
                                rows={3}
                            />
                        </div>
                    )}
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        onClick={handlePublish}
                        disabled={!selectedProfCourseId || !profMessage || loading}
                    >
                        {loading ? 'Publication...' : 'Publier'}
                    </button>
                    {profSuccess && (
                        <div className="text-green-600 mt-2">{profSuccess}</div>
                    )}
                </section>
            )}
        </div>
    );
}