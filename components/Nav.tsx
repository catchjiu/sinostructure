'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, BookOpen, Layers } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/flashcards', label: 'Flashcards', icon: BookOpen },
  { href: '/stpvo', label: 'STPVO', icon: Layers },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-slate-700 transition-colors">
            <span
              className="text-white text-sm font-bold leading-none"
              style={{ fontFamily: "'Noto Sans TC', sans-serif" }}
            >
              漢
            </span>
          </div>
          <span className="font-semibold text-slate-800 text-sm hidden sm:block">SinoStructure</span>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}>
                <div className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                  ${active ? 'text-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:block">{label}</span>
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-slate-100 rounded-lg -z-10"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
