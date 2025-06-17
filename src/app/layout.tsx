import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link";

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export const metadata: Metadata = {
    title: "Plateforme éducative",
    description: "Plateforme éducative interactive avec Next.js et Redis",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}>
        <nav className="px-8 py-4 bg-gray-900 shadow-md flex items-center gap-8 mb-8">
            <span className="text-white text-xl font-bold tracking-wide mr-8">🎓 Plateforme éducative</span>
            <Link href="/" className="text-gray-200 hover:text-white transition">Accueil</Link>
            <Link href="/course" className="text-gray-200 hover:text-white transition">Cours</Link>
            <Link href="/student" className="text-gray-200 hover:text-white transition">Étudiants</Link>
            <Link href="/professor" className="text-gray-200 hover:text-white transition">Professeurs</Link>
            <Link href="/news" className="text-gray-200 hover:text-white transition">News</Link>
        </nav>
        {children}
        </body>
        </html>
    );
}