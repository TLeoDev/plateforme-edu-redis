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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <nav className="p-4 bg-gray-100 flex gap-6 mb-8">
        <Link href="/">Accueil</Link>
        <Link href="/course">Cours</Link>
        <Link href="/student">Étudiants</Link>
        <Link href="/professor">Professeurs</Link>
        <Link href="/news">News</Link>
      </nav>
      {children}
      </body>
      </html>
  );
}