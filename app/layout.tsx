import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Nav from '@/components/Nav';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'SinoStructure · Master Traditional Chinese STPVO',
  description: 'Learn Traditional Chinese sentences with the STPVO structure — Subject, Time, Place, Verb, Object.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-sans bg-slate-50 min-h-screen antialiased`}>
        <Nav />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-20">
          {children}
        </main>
      </body>
    </html>
  );
}
