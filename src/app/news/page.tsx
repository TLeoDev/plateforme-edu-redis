// src/app/news/new/page.tsx
'use client';
import { useRouter } from 'next/navigation';

export default function NewsNewPage() {
    const router = useRouter();
    return (
        <div className="p-8 flex flex-col items-center gap-8">
            <h1 className="text-2xl font-bold mb-6">Êtes-vous…</h1>
            <div className="flex gap-8">
                <button
                    className="bg-blue-600 text-white px-6 py-3 rounded text-lg"
                    onClick={() => router.push('/news/student')}
                >
                    Étudiant
                </button>
                <button
                    className="bg-green-600 text-white px-6 py-3 rounded text-lg"
                    onClick={() => router.push('/news/professor')}
                >
                    Professeur
                </button>
            </div>
        </div>
    );
}