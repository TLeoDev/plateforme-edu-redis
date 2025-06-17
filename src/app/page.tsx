import Link from "next/link";

export default function Home() {
    return (
        <div className="p-8 flex flex-col items-center gap-8 text-gray-900">
            <h1 className="text-3xl font-bold mb-4">Plateforme éducative</h1>
            <p className="mb-6 text-center max-w-xl">
                Bienvenue sur la plateforme éducative interactive. Utilisez la navigation ci-dessus ou les liens ci-dessous pour accéder aux différentes sections : cours, étudiants, professeurs et actualités.
            </p>
            <div className="flex gap-6">
                <Link href="/course" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Cours</Link>
                <Link href="/student" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Étudiants</Link>
                <Link href="/professor" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Professeurs</Link>
                <Link href="/news" className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">News</Link>
            </div>
        </div>
    );
}