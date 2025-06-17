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
}

export default function StudentProfilePage() {
    const { studentId } = useParams();
    const [student, setStudent] = useState<Student | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [loading, setLoading] = useState(true);
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

            // Récupère tous les cours pour l'inscription
            const resCourses = await fetch('/api/courses');
            const all = await resCourses.json();
            setAllCourses(all);

            // Récupère les cours inscrits
            const enrolled = all.filter((c: Course) => data.courses.includes(c.courseId));
            setCourses(enrolled);

            setLoading(false);
        }
        fetchData();
    }, [studentId, router]);

    const handleEnroll = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourse) return;
        await fetch('/api/students', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, courseId: selectedCourse }),
        });
        router.refresh();
    };

    if (loading) return <div>Chargement...</div>;
    if (!student) return <div>Étudiant non trouvé.</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-2">{student.name}</h1>
            <p><b>ID :</b> {student.studentId}</p>
            <div className="my-4">
                <b>Cours inscrits :</b>
                <ul className="list-disc ml-6">
                    {courses.length > 0
                        ? courses.map(c => <li key={c.courseId}>{c.title} ({c.courseId})</li>)
                        : <li>Aucun cours inscrit</li>}
                </ul>
            </div>
            <form onSubmit={handleEnroll} className="flex gap-2 items-center mt-4">
                <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="border px-2 py-1 rounded">
                    <option value="">S'inscrire à un cours</option>
                    {allCourses
                        .filter(c => !student.courses.includes(c.courseId))
                        .map(c => (
                            <option key={c.courseId} value={c.courseId}>{c.title}</option>
                        ))}
                </select>
                <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">S'inscrire</button>
            </form>
        </div>
    );
}