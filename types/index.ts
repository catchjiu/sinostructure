export type GrammarRole = 'S' | 'T' | 'P' | 'V' | 'O';

export interface VocabWord {
  id: string;
  traditional: string;
  simplified: string;
  pinyin: string;
  definition: string;
  role: GrammarRole;
  frequency: number; // 1–2000
  examples?: string[];
}

export interface SentenceTemplate {
  id: string;
  components: SentenceComponent[];
  audioText: string;
  englishTranslation: string;
}

export interface SentenceComponent {
  role: GrammarRole;
  word: VocabWord;
}

export interface UserProgress {
  wordId: string;
  correct: number;
  incorrect: number;
  consecutiveCorrect: number; // resets to 0 on any wrong answer
  lastSeen: number;
  mastered: boolean; // true once consecutiveCorrect >= 10
}

export interface AppState {
  progress: Record<string, UserProgress>;
  currentMode: 'dashboard' | 'flashcard' | 'stpvo';
  seenWords: Set<string>;
}
