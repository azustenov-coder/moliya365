import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Business Finance Manager',
  description: 'MVP Finance Manager',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body className={`${inter.className} min-h-screen flex bg-gray-50`}>
        <aside className="w-64 bg-white border-r h-screen fixed">
          <div className="p-6 font-bold text-xl text-blue-600">Finance Manager</div>
          <nav className="flex flex-col gap-2 px-4 mt-6">
            <Link href="/" className="px-4 py-2 hover:bg-gray-100 rounded-lg">Dashboard</Link>
            <Link href="/transactions" className="px-4 py-2 hover:bg-gray-100 rounded-lg">Tranzaksiyalar</Link>
            <Link href="/analytics" className="px-4 py-2 hover:bg-gray-100 rounded-lg">Analitika</Link>
            <Link href="/debts" className="px-4 py-2 hover:bg-gray-100 rounded-lg">Qarzlar Daftari</Link>
          </nav>
        </aside>
        <main className="flex-1 ml-64 p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
