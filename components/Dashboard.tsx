'use client';
import { motion } from 'framer-motion';
import { BookOpen, Layers, Flame, Trophy, BarChart2, Star, Zap } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { VOCAB } from '@/constants/vocab';
import ProgressRing from './ProgressRing';
import Link from 'next/link';

const TOTAL = VOCAB.length;

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
        <p className="text-xs text-slate-500 mt-1">{label}</p>
      </div>
    </motion.div>
  );
}

function ModeCard({
  href,
  icon: Icon,
  title,
  description,
  badge,
  gradient,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  badge?: string;
  gradient: string;
}) {
  return (
    <motion.div variants={fadeUp}>
      <Link href={href}>
        <div className={`group relative bg-gradient-to-br ${gradient} rounded-2xl p-6 border border-white/60 shadow-sm
          hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden`}>
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
          <div className="relative flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm">
              <Icon className="w-6 h-6 text-slate-700" />
            </div>
            {badge && (
              <span className="text-[11px] font-semibold px-2.5 py-1 bg-white/70 rounded-full text-slate-600 shadow-sm">
                {badge}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-slate-800 text-base mb-1">{title}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-slate-700 group-hover:gap-2 transition-all duration-200">
            Start <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Dashboard() {
  const { getMasteredCount, currentStreak, progress } = useAppStore();
  const masteredCount = getMasteredCount();
  const seenCount = Object.keys(progress).length;
  const masteredPct = Math.round((masteredCount / TOTAL) * 100);
  const seenPct = Math.round((seenCount / TOTAL) * 100);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-8 w-full max-w-3xl mx-auto"
    >
      {/* Hero Section */}
      <motion.div
        variants={fadeUp}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-8 text-[120px] font-bold leading-none select-none" style={{ fontFamily: "'Noto Sans TC', sans-serif" }}>
            學
          </div>
        </div>
        <div className="relative flex flex-col sm:flex-row items-center gap-8">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">歡迎回來！</h1>
            <p className="text-slate-400 text-sm mb-4">Welcome back. Keep building your STPVO mastery.</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-medium">{currentStreak} streak</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-medium">{masteredCount} mastered</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5">
                <Zap className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-xs font-medium">{seenCount} seen</span>
              </div>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex flex-col items-center gap-2">
              <ProgressRing value={masteredPct} size={100} color="#10b981" label={`${masteredPct}%`} sublabel="Mastered" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <ProgressRing value={seenPct} size={100} color="#6366f1" label={`${seenPct}%`} sublabel="Seen" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Star} label="Total Words" value={TOTAL} color="bg-violet-50 text-violet-600" />
        <StatCard icon={Trophy} label="Mastered" value={masteredCount} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={BookOpen} label="Seen" value={seenCount} color="bg-sky-50 text-sky-600" />
        <StatCard icon={Flame} label="Streak" value={currentStreak} color="bg-orange-50 text-orange-500" />
      </div>

      {/* Progress by Role */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 className="w-4 h-4 text-slate-500" />
          <h3 className="font-semibold text-slate-700 text-sm">Progress by Grammar Role</h3>
        </div>
        <div className="space-y-3">
          {(['S', 'T', 'P', 'V', 'O'] as const).map((role) => {
            const roleWords = VOCAB.filter(w => w.role === role);
            const mastered = roleWords.filter(w => progress[w.id]?.mastered).length;
            const pct = Math.round((mastered / roleWords.length) * 100);
            const COLORS: Record<string, string> = {
              S: 'bg-violet-400', T: 'bg-amber-400', P: 'bg-sky-400', V: 'bg-emerald-400', O: 'bg-rose-400',
            };
            const LABELS: Record<string, string> = {
              S: 'Subject', T: 'Time', P: 'Place', V: 'Verb', O: 'Object',
            };
            return (
              <div key={role} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 w-4">{role}</span>
                <span className="text-xs text-slate-400 w-14">{LABELS[role]}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${COLORS[role]}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-12 text-right">{mastered}/{roleWords.length}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Mode Cards */}
      <div>
        <motion.h2 variants={fadeUp} className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">
          Learning Modes
        </motion.h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <ModeCard
            href="/flashcards"
            icon={BookOpen}
            title="Flashcard Mode"
            description="Master Traditional Chinese characters with pinyin and definitions. Tap to flip, rate yourself."
            badge={`${TOTAL} cards`}
            gradient="from-sky-50 via-indigo-50 to-violet-50"
          />
          <ModeCard
            href="/stpvo"
            icon={Layers}
            title="STPVO Challenge"
            description="Drag and drop word tiles into the correct Subject–Time–Place–Verb–Object sentence structure."
            badge="Adaptive"
            gradient="from-emerald-50 via-teal-50 to-sky-50"
          />
        </div>
      </div>

      {/* STPVO Reference */}
      <motion.div variants={fadeUp} className="bg-gradient-to-r from-slate-50 to-slate-50/50 rounded-2xl p-6 border border-slate-100">
        <h3 className="font-semibold text-slate-700 text-sm mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" /> STPVO Sentence Structure
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { role: 'S', label: 'Subject', example: '我', color: 'bg-violet-100 text-violet-800 border-violet-200' },
            { role: 'T', label: 'Time', example: '明天', color: 'bg-amber-100 text-amber-800 border-amber-200' },
            { role: 'P', label: 'Place', example: '在家', color: 'bg-sky-100 text-sky-800 border-sky-200' },
            { role: 'V', label: 'Verb', example: '看', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
            { role: 'O', label: 'Object', example: '書', color: 'bg-rose-100 text-rose-800 border-rose-200' },
          ].map(({ role, label, example, color }, i) => (
            <div key={role} className="flex items-center gap-1">
              {i > 0 && <span className="text-slate-300 text-sm">+</span>}
              <div className={`rounded-xl border px-3 py-2 ${color} flex flex-col items-center min-w-[64px]`}>
                <span className="text-[10px] font-bold opacity-60">{role} · {label}</span>
                <span className="text-xl font-medium mt-0.5" style={{ fontFamily: "'Noto Sans TC', sans-serif" }}>{example}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Chinese sentences follow <strong>Subject → Time → Place → Verb → Object</strong> order.
          Example: 我明天在家看書 = <em>&ldquo;I will read a book at home tomorrow.&rdquo;</em>
        </p>
      </motion.div>
    </motion.div>
  );
}
