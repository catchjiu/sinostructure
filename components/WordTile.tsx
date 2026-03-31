'use client';
import { motion } from 'framer-motion';
import { GrammarRole } from '@/types';
import { ROLE_LABELS } from '@/constants/vocab';

interface WordTileProps {
  traditional: string;
  pinyin?: string;
  role: GrammarRole;
  showRole?: boolean;
  isPlaceholder?: boolean;
  isCorrect?: boolean | null;
  isSelected?: boolean;
  isDragging?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const ROLE_STYLES: Record<GrammarRole, string> = {
  S: 'bg-violet-100 border-violet-300 text-violet-800 shadow-violet-100',
  T: 'bg-amber-100 border-amber-300 text-amber-800 shadow-amber-100',
  P: 'bg-sky-100 border-sky-300 text-sky-800 shadow-sky-100',
  V: 'bg-emerald-100 border-emerald-300 text-emerald-800 shadow-emerald-100',
  O: 'bg-rose-100 border-rose-300 text-rose-800 shadow-rose-100',
};

const ROLE_ACCENT: Record<GrammarRole, string> = {
  S: 'bg-violet-500',
  T: 'bg-amber-500',
  P: 'bg-sky-500',
  V: 'bg-emerald-500',
  O: 'bg-rose-500',
};

export default function WordTile({
  traditional,
  pinyin,
  role,
  showRole = false,
  isPlaceholder = false,
  isCorrect = null,
  isSelected = false,
  isDragging = false,
  onClick,
  size = 'md',
}: WordTileProps) {
  const sizeClasses = {
    sm: 'px-3 py-2 min-w-[64px]',
    md: 'px-4 py-3 min-w-[80px]',
    lg: 'px-5 py-4 min-w-[96px]',
  };

  const charSize = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  if (isPlaceholder) {
    return (
      <div
        className={`
          ${sizeClasses[size]} rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1
          ${isSelected ? 'border-slate-400 bg-slate-50' : 'border-slate-200 bg-slate-50/50'}
          transition-colors duration-200
        `}
      >
        <span className="text-slate-300 text-xs font-medium tracking-wide">
          {ROLE_LABELS[role]?.split(' ')[0]}
        </span>
      </div>
    );
  }

  const correctStyle =
    isCorrect === true
      ? 'border-emerald-400 bg-emerald-50 shadow-emerald-200 ring-2 ring-emerald-300'
      : isCorrect === false
      ? 'border-rose-400 bg-rose-50 shadow-rose-200 ring-2 ring-rose-300'
      : ROLE_STYLES[role];

  return (
    <motion.button
      onClick={onClick}
      whileHover={onClick ? { y: -3, scale: 1.04 } : {}}
      whileTap={onClick ? { scale: 0.96 } : {}}
      animate={
        isDragging
          ? { scale: 1.08, rotate: 2, boxShadow: '0 12px 32px rgba(0,0,0,0.18)' }
          : isCorrect === true
          ? { scale: [1, 1.06, 1] }
          : isCorrect === false
          ? { x: [0, -8, 8, -8, 8, 0] }
          : { scale: 1 }
      }
      transition={{ duration: 0.35 }}
      className={`
        relative ${sizeClasses[size]} rounded-xl border-2 flex flex-col items-center justify-center gap-1
        select-none cursor-pointer shadow-md
        ${correctStyle}
        transition-all duration-200
        ${isSelected ? 'ring-2 ring-offset-1 ring-slate-400' : ''}
        ${onClick ? '' : 'cursor-default'}
      `}
    >
      {/* Role accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-xl ${ROLE_ACCENT[role]} opacity-60`} />

      {showRole && (
        <span className="text-[9px] font-semibold tracking-widest uppercase opacity-50 leading-none">
          {ROLE_LABELS[role]?.split(' ')[0]}
        </span>
      )}

      <span
        className={`${charSize[size]} font-medium leading-none`}
        style={{ fontFamily: "'Noto Sans TC', sans-serif" }}
      >
        {traditional}
      </span>

      {pinyin && (
        <span className="text-[11px] opacity-60 leading-none font-light tracking-wide">
          {pinyin}
        </span>
      )}

      {isCorrect === true && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm"
        >
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}
