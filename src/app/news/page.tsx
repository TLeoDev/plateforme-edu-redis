'use client';

import { useEffect, useState, useRef } from 'react';

interface NewsItem {
    courseId: string;
    message: string;
    timestamp: string;
}

interface CourseUpdate {
    type: string;
    courseId: string;
    title?: string;
    teacher?: string;
    level?: string;
    summary?: string;
    placesAvailable?: number;
    students?: string[];
    updates?: any;
    timestamp: string;
}

export default function NewsPage() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [updates, setUpdates] = useState<CourseUpdate[]>([]);
    const wsRef = useRef<WebSocket | null>(null);

    // Récupère l'historique des news publiées
    useEffect(() => {
        fetch('/api/news')
            .then(res => res.json())
            .then(setNews);
    }, []);

    // WebSocket pour les mises à jour de cours en temps réel
    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');
        wsRef.current = ws;
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setUpdates(prev => [data, ...prev]);
            } catch {}
        };
        return () => ws.close();
    }, []);

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Actualités & mises à jour de cours</h1>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Mises à jour de cours (temps réel)</h2>
                <ul className="space-y-2">
                    {updates.length === 0 && <li className="text-gray-500">Aucune mise à jour reçue.</li>}
                    {updates.map((u, i) => (
                        <li key={i} className="border rounded p-2 bg-blue-50">
                            <b>{u.type === 'created' ? 'Nouveau cours' : 'Mise à jour'} :</b> {u.title || u.courseId}
                            <div className="text-xs text-gray-500">{new Date(u.timestamp).toLocaleString()}</div>
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-2">News publiées</h2>
                <ul className="space-y-2">
                    {news.length === 0 && <li className="text-gray-500">Aucune news publiée.</li>}
                    {news.map((n, i) => (
                        <li key={i} className="border rounded p-2 bg-orange-50">
                            <b>Cours :</b> {n.courseId}<br />
                            <b>Message :</b> {n.message}
                            <div className="text-xs text-gray-500">{new Date(n.timestamp).toLocaleString()}</div>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}