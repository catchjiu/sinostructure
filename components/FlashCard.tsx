'use client';
import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, BookOpen, Check, X, Flame, Star } from 'lucide-react';
import { VocabWord, GrammarRole } from '@/types';
import { VOCAB, ROLE_LABELS } from '@/constants/vocab';
import { speakChinese } from '@/lib/audio';
import { useAppStore, cardWeight } from '@/store/useAppStore';

// ── Styling maps ─────────────────────────────────────────────────────────
const ROLE_BADGE: Record<GrammarRole, string> = {
  S: 'bg-violet-100 text-violet-700 ring-violet-200',
  T: 'bg-amber-100 text-amber-700 ring-amber-200',
  P: 'bg-sky-100 text-sky-700 ring-sky-200',
  V: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  O: 'bg-rose-100 text-rose-700 ring-rose-200',
};

const ROLE_GRADIENT: Record<GrammarRole, string> = {
  S: 'from-violet-50 to-white',
  T: 'from-amber-50 to-white',
  P: 'from-sky-50 to-white',
  V: 'from-emerald-50 to-white',
  O: 'from-rose-50 to-white',
};

const ROLE_FILTER_STYLE: Record<string, string> = {
  all: 'bg-slate-800 text-white',
  S:   'bg-violet-500 text-white',
  T:   'bg-amber-500 text-white',
  P:   'bg-sky-500 text-white',
  V:   'bg-emerald-500 text-white',
  O:   'bg-rose-500 text-white',
};

const ROLE_FILTER_IDLE: Record<string, string> = {
  all: 'text-slate-500 hover:bg-slate-100',
  S:   'text-violet-600 hover:bg-violet-50',
  T:   'text-amber-600 hover:bg-amber-50',
  P:   'text-sky-600 hover:bg-sky-50',
  V:   'text-emerald-600 hover:bg-emerald-50',
  O:   'text-rose-600 hover:bg-rose-50',
};

type RoleFilter = 'all' | GrammarRole;

// ── Weighted random sampler ───────────────────────────────────────────────
function pickNextCard(
  pool: VocabWord[],
  progress: Record<string, import('@/types').UserProgress>,
  lastId: string | null,
): VocabWord {
  // Build weight array; never repeat the just-shown card (weight 0 for it)
  const weights = pool.map(w => w.id === lastId ? 0 : cardWeight(progress[w.id]));
  const total = weights.reduce((a, b) => a + b, 0);

  // If all weights are 0 (only 1 card in pool), just return it
  if (total === 0) return pool[0];

  let rand = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

// ── Streak pips (shows consecutive correct progress toward mastery) ───────
function StreakPips({ count }: { count: number }) {
  const filled = Math.min(count, 10);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 w-3 rounded-full transition-all duration-300 ${
            i < filled
              ? i < 3 ? 'bg-rose-400' : i < 7 ? 'bg-amber-400' : 'bg-emerald-400'
              : 'bg-slate-200'
          }`}
        />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function FlashCard() {
  const { recordCorrect, recordIncorrect, progress } = useAppStore();

  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [currentWord, setCurrentWord] = useState<VocabWord | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [lastFeedback, setLastFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const lastIdRef = useRef<string | null>(null);

  // Derive the current filtered word pool
  const pool = VOCAB.filter(w => roleFilter === 'all' || w.role === roleFilter);

  // Draw the first card on mount / when role changes
  const getPool = useCallback(() =>
    VOCAB.filter(w => roleFilter === 'all' || w.role === roleFilter),
  [roleFilter]);

  const drawNext = useCallback((afterRole?: RoleFilter) => {
    const activePool = VOCAB.filter(w =>
      (afterRole ?? roleFilter) === 'all' || w.role === (afterRole ?? roleFilter)
    );
    if (activePool.length === 0) return;
    const next = pickNextCard(activePool, progress, lastIdRef.current);
    lastIdRef.current = next.id;
    setCurrentWord(next);
    setIsFlipped(false);
    setLastFeedback(null);
  }, [roleFilter, progress]);

  // Initialise on first render
  if (!currentWord && pool.length > 0) {
    const first = pickNextCard(pool, progress, null);
    lastIdRef.current = first.id;
    // setState during render is not ideal; use lazy initial state trick
  }

  // Lazy-init: draw first card synchronously on first call
  const word = currentWord ?? (() => {
    if (pool.length === 0) return null;
    const first = pickNextCard(pool, progress, null);
    lastIdRef.current = first.id;
    return first;
  })();

  const wordProgress = word ? progress[word.id] : undefined;

  const handleRoleChange = (r: RoleFilter) => {
    setRoleFilter(r);
    lastIdRef.current = null;
    setIsFlipped(false);
    setLastFeedback(null);
    // Draw immediately with the new role
    const newPool = VOCAB.filter(w => r === 'all' || w.role === r);
    if (newPool.length > 0) {
      const next = pickNextCard(newPool, progress, null);
      lastIdRef.current = next.id;
      setCurrentWord(next);
    }
  };

  const speak = () => {
    if (!word) return;
    setIsSpeaking(true);
    speakChinese(word.traditional, () => setIsSpeaking(false));
  };

  const handleCorrect = () => {
    if (!word) return;
    recordCorrect(word.id);
    setLastFeedback('correct');
    setSessionCount(n => n + 1);
    setTimeout(() => drawNext(), 400);
  };

  const handleIncorrect = () => {
    if (!word) return;
    recordIncorrect(word.id);
    setLastFeedback('incorrect');
    setSessionCount(n => n + 1);
    setTimeout(() => drawNext(), 400);
  };

  if (!word) return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <BookOpen className="w-12 h-12 mb-4 opacity-50" />
      <p>No words in this set.</p>
    </div>
  );

  const consec = wordProgress?.consecutiveCorrect ?? 0;
  const isMastered = wordProgress?.mastered ?? false;

  // Compute how many cards in pool are still needing work (not mastered)
  const activeCount = pool.filter(w => !progress[w.id]?.mastered).length;
  const masteredCount = pool.filter(w => progress[w.id]?.mastered).length;

  return (
    <div className="w-full max-w-lg mx-auto space-y-5">

      {/* Role Filter */}
      <div className="bg-slate-100 p-1 rounded-2xl">
        <div className="flex gap-1 flex-wrap">
          {(['all', 'S', 'T', 'P', 'V', 'O'] as const).map((r) => {
            const active = roleFilter === r;
            const label = r === 'all' ? 'All' : `${r} · ${ROLE_LABELS[r]?.split(' ')[0]}`;
            return (
              <button
                key={r}
                onClick={() => handleRoleChange(r)}
                className={`flex-1 min-w-[60px] py-2 px-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  active ? ROLE_FILTER_STYLE[r] + ' shadow-sm' : ROLE_FILTER_IDLE[r]
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Session stats */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-400" />
            {sessionCount} this session
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400" />
            {masteredCount}/{pool.length} mastered
          </span>
        </div>
        <span>{activeCount} active</span>
      </div>

      {/* Flash Card */}
      <div className="relative" style={{ perspective: '1200px' }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={word.id + (isFlipped ? '-back' : '-front') + lastFeedback}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{
              rotateY: 0,
              opacity: 1,
              scale: lastFeedback === 'correct' ? [1, 1.02, 1] : lastFeedback === 'incorrect' ? [1, 0.98, 1] : 1,
            }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            onClick={() => !lastFeedback && setIsFlipped(f => !f)}
            className={`
              bg-gradient-to-br ${ROLE_GRADIENT[word.role]}
              border rounded-3xl p-8 shadow-lg
              min-h-[300px] flex flex-col items-center justify-center gap-5
              select-none relative overflow-hidden
              ${lastFeedback === 'correct' ? 'border-emerald-300' : lastFeedback === 'incorrect' ? 'border-rose-300' : 'border-slate-100'}
              ${lastFeedback ? 'cursor-default' : 'cursor-pointer'}
            `}
          >
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-current opacity-[0.03] text-slate-800" />

            {/* Top badges */}
            <span className={`absolute top-4 left-4 text-[11px] font-semibold px-2.5 py-1 rounded-full ring-1 ${ROLE_BADGE[word.role]}`}>
              {ROLE_LABELS[word.role]}
            </span>

            {isMastered && (
              <span className="absolute top-4 right-4 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                Mastered ★
              </span>
            )}

            {/* Card content */}
            {!isFlipped ? (
              <div className="flex flex-col items-center gap-3 mt-4">
                <span
                  className="text-8xl font-medium leading-none text-slate-800"
                  style={{ fontFamily: "'Noto Sans TC', sans-serif" }}
                >
                  {word.traditional}
                </span>
                <span className="text-slate-400 text-sm">tap to reveal</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center w-full mt-4">
                <span
                  className="text-5xl font-medium text-slate-800 leading-none"
                  style={{ fontFamily: "'Noto Sans TC', sans-serif" }}
                >
                  {word.traditional}
                </span>
                <div className="space-y-1">
                  <p className="text-2xl text-slate-500 font-light tracking-wide">{word.pinyin}</p>
                  <p className="text-base text-slate-700 font-medium max-w-xs">{word.definition}</p>
                </div>
                <p className="text-xs text-slate-400">Freq. #{word.frequency}</p>
              </div>
            )}

            {/* Consecutive streak pips */}
            <div className="absolute bottom-4 flex flex-col items-center gap-1">
              <StreakPips count={consec} />
              {consec > 0 && (
                <span className="text-[10px] text-slate-400">{consec}/10 to mastery</span>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Previous card progress hint */}
      {(wordProgress?.correct || wordProgress?.incorrect) ? (
        <div className="flex justify-center gap-4 text-xs text-slate-400">
          <span className="text-emerald-600">✓ {wordProgress.correct} correct</span>
          <span className="text-rose-500">✗ {wordProgress.incorrect} incorrect</span>
        </div>
      ) : null}

      {/* Controls */}
      <div className="flex items-center gap-3">
        {isFlipped ? (
          <>
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleIncorrect}
              disabled={!!lastFeedback}
              className="flex-1 py-3.5 bg-rose-50 text-rose-700 rounded-xl font-medium text-sm
                hover:bg-rose-100 transition-colors flex items-center justify-center gap-2
                border border-rose-200 disabled:opacity-50"
            >
              <X className="w-4 h-4" /> Again
            </motion.button>

            <button
              onClick={speak}
              className={`p-3.5 rounded-xl transition-colors ${
                isSpeaking ? 'bg-sky-100 text-sky-700' : 'hover:bg-slate-100 text-slate-400'
              }`}
            >
              <Volume2 className="w-5 h-5" />
            </button>

            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleCorrect}
              disabled={!!lastFeedback}
              className="flex-1 py-3.5 bg-emerald-50 text-emerald-700 rounded-xl font-medium text-sm
                hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2
                border border-emerald-200 disabled:opacity-50"
            >
              <Check className="w-4 h-4" /> Got it
            </motion.button>
          </>
        ) : (
          <>
            <button
              onClick={speak}
              className={`flex-1 py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2
                transition-colors ${isSpeaking ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <Volume2 className="w-4 h-4" /> Listen
            </button>
            <button
              onClick={() => setIsFlipped(true)}
              className="flex-1 py-3.5 bg-slate-800 text-white rounded-xl font-medium text-sm
                hover:bg-slate-700 transition-colors"
            >
              Reveal
            </button>
          </>
        )}
      </div>

      {/* Algorithm legend */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
        <p className="text-[11px] text-slate-400 text-center leading-relaxed">
          Wrong cards appear <strong className="text-slate-600">6×</strong> more often ·
          3 in a row = confident · 10 in a row = <span className="text-emerald-600">mastered</span>
        </p>
      </div>
    </div>
  );
}
