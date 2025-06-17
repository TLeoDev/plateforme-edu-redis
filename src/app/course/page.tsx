'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Course {
    courseId: string;
    title: string;
    teacher: string;
    level: string;
    summary?: string;
    placesAvailable?: number;
    students?: string[];
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [search, setSearch] = useState({ title: '', teacher: '', level: '' });
    const [loading, setLoading] = useState(true);

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

    useEffect(() => { fetchCourses(); }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setSearch({ ...search, [e.target.name]: e.target.value });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchCourses();
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Liste des cours</h1>
            <form onSubmit={handleSearch} className="flex gap-4 mb-6 flex-wrap">
                <input name="title" placeholder="Titre" value={search.title} onChange={handleChange} className="border px-2 py-1 rounded" />
                <input name="teacher" placeholder="Enseignant" value={search.teacher} onChange={handleChange} className="border px-2 py-1 rounded" />
                <select name="level" value={search.level} onChange={handleChange} className="border px-2 py-1 rounded">
                    <option value="">Niveau</option>
                    <option value="débutant">Débutant</option>
                    <option value="intermédiaire">Intermédiaire</option>
                    <option value="avancé">Avancé</option>
                </select>
                <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">Rechercher</button>
                <Link href="/course/new" className="bg-green-600 text-white px-4 py-1 rounded ml-auto">Nouveau cours</Link>
            </form>
            {loading ? (
                <div>Chargement...</div>
            ) : (
                <table className="w-full border">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2">Titre</th>
                        <th className="p-2">Enseignant</th>
                        <th className="p-2">Niveau</th>
                        <th className="p-2">Places</th>
                        <th className="p-2">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {courses.map(course => (
                        <tr key={course.courseId} className="border-t">
                            <td className="p-2">{course.title}</td>
                            <td className="p-2">{course.teacher}</td>
                            <td className="p-2">{course.level}</td>
                            <td className="p-2">{course.placesAvailable ?? 0}</td>
                            <td className="p-2 flex gap-2">
                                <Link href={`/course/${course.courseId}`} className="text-blue-600 underline">Détail</Link>
                                <Link href={`/course/${course.courseId}/edit`} className="text-yellow-600 underline">Éditer</Link>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}