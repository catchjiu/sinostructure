'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProgress } from '@/types';

const MASTERED_THRESHOLD = 10; // consecutive correct answers to reach mastered

// Weight used when sampling the next flashcard.
// Higher = shown more frequently.
export function cardWeight(p: UserProgress | undefined): number {
  if (!p) return 5;                            // never seen → introduce it
  if (p.mastered) return 0.15;                 // mastered → surface very rarely
  switch (p.consecutiveCorrect) {
    case 0: return 6;                          // just got it wrong → drill hard
    case 1: return 4;
    case 2: return 2;
    default: return 1;                         // 3+ consecutive correct → light review
  }
}

interface AppStore {
  progress: Record<string, UserProgress>;
  totalSeen: number;
  currentStreak: number;
  recordCorrect: (wordId: string) => void;
  recordIncorrect: (wordId: string) => void;
  getWeakWords: () => string[];
  getMasteredCount: () => number;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      progress: {},
      totalSeen: 0,
      currentStreak: 0,

      recordCorrect: (wordId) =>
        set((state) => {
          const prev = state.progress[wordId] ?? {
            wordId, correct: 0, incorrect: 0, consecutiveCorrect: 0, lastSeen: 0, mastered: false,
          };
          const consec = prev.consecutiveCorrect + 1;
          const next: UserProgress = {
            ...prev,
            correct: prev.correct + 1,
            consecutiveCorrect: consec,
            lastSeen: Date.now(),
            mastered: consec >= MASTERED_THRESHOLD,
          };
          return {
            progress: { ...state.progress, [wordId]: next },
            currentStreak: state.currentStreak + 1,
            totalSeen: Object.keys({ ...state.progress, [wordId]: next }).length,
          };
        }),

      recordIncorrect: (wordId) =>
        set((state) => {
          const prev = state.progress[wordId] ?? {
            wordId, correct: 0, incorrect: 0, consecutiveCorrect: 0, lastSeen: 0, mastered: false,
          };
          const next: UserProgress = {
            ...prev,
            incorrect: prev.incorrect + 1,
            consecutiveCorrect: 0,
            lastSeen: Date.now(),
            mastered: false, // losing the streak un-masters a card
          };
          return {
            progress: { ...state.progress, [wordId]: next },
            currentStreak: 0,
          };
        }),

      getWeakWords: () => {
        const { progress } = get();
        return Object.values(progress)
          .filter((p) => !p.mastered && p.consecutiveCorrect === 0 && p.incorrect > 0)
          .sort((a, b) => b.incorrect - a.incorrect)
          .map((p) => p.wordId);
      },

      getMasteredCount: () =>
        Object.values(get().progress).filter((p) => p.mastered).length,
    }),
    { name: 'sino-structure-progress' }
  )
);
