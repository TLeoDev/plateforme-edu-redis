'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Student {
    studentId: string;
    name: string;
    courses: string[];
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/students')
            .then(res => res.json())
            .then(data => {
                setStudents(data);
                setLoading(false);
            });
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Liste des étudiants</h1>
            <Link href="/student/new" className="bg-green-600 text-white px-4 py-1 rounded mb-4 inline-block">Nouvel étudiant</Link>
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
                    {students.map(student => (
                        <tr key={student.studentId} className="border-t">
                            <td className="p-2">{student.name}</td>
                            <td className="p-2">{student.studentId}</td>
                            <td className="p-2">
                                <Link href={`/student/${student.studentId}`} className="text-blue-600 underline">Profil</Link>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}