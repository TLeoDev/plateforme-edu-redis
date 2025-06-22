'use client';

import { useEffect, useState, useRef } from 'react';

interface Student {
    studentId: string;
    name: string;
    forename: string;
    courses: string[];
}

interface NewsItem {
    courseId: string;
    message: string;
    timestamp: string;
}

export default function NewsStudentPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [pendingStudentId, setPendingStudentId] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [news, setNews] = useState<NewsItem[]>([]);
    const wsRef = useRef<WebSocket | null>(null);
    const coursesRef = useRef<string[]>([]); // <-- ref pour les cours

    useEffect(() => {
        fetch('/api/students').then(res => res.json()).then(setStudents);
    }, []);

    useEffect(() => {
        const s = students.find(stu => stu.studentId === pendingStudentId) || null;
        setSelectedStudent(s);
    }, [pendingStudentId, students]);

    useEffect(() => {
        if (!selectedStudent) {
            setNews([]);
            coursesRef.current = [];
            return;
        }
        coursesRef.current = selectedStudent.courses;
        let stopped = false;

        const fetchAndUpdate = async () => {
            const res = await fetch(`/api/news?studentId=${selectedStudent.studentId}`);
            const newsList: NewsItem[] = await res.json();
            // Compare la nouvelle liste à l'ancienne
            setNews(prev => {
                const prevStr = JSON.stringify(prev);
                const nextStr = JSON.stringify(newsList);
                return prevStr !== nextStr ? newsList : prev;
            });
        };

        fetchAndUpdate(); // premier appel immédiat
        const interval = setInterval(() => {
            if (!stopped) fetchAndUpdate();
        }, 300);

        return () => {
            stopped = true;
            clearInterval(interval);
        };
    }, [selectedStudent]);

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">News étudiant</h1>
            <div className="mb-6 flex gap-4 items-center flex-wrap">
                <label className="font-semibold">Profil :</label>
                <select
                    className="border px-2 py-1 rounded"
                    value={pendingStudentId}
                    onChange={e => setPendingStudentId(e.target.value)}
                >
                    <option value="">Sélectionner un étudiant</option>
                    {students.map(s => (
                        <option key={s.studentId} value={s.studentId}>
                            {s.forename} {s.name} ({s.studentId})
                        </option>
                    ))}
                </select>
            </div>
            {selectedStudent && (
                <section>
                    <h2 className="text-xl font-semibold mb-2">
                        News des cours inscrits pour {selectedStudent.forename} {selectedStudent.name}
                    </h2>
                    <ul className="space-y-2">
                        {news.length === 0 && <li className="text-gray-500">Aucune news pour vos cours.</li>}
                        {news.map((n, i) => (
                            <li key={i} className="border rounded p-2 bg-orange-50">
                                <b>Cours :</b> {n.courseId}<br />
                                <b>Message :</b> {n.message}
                                <div className="text-xs text-gray-500">{new Date(n.timestamp).toLocaleString()}</div>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}