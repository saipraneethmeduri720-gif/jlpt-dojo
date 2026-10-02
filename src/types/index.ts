export type JLPTLevel = 'n5' | 'n4' | 'n3' | 'n2' | 'n1';

export type CategoryType = 'kanji' | 'vocabulary' | 'grammar' | 'other';

export type SectionTab = 'learning' | 'quiz' | 'progress';

export type ItemLearningStatus = 'unlearned' | 'learned' | 'reviewing';

export type ItemQuizStatus = 'untested' | 'correct' | 'wrong' | 'needs_review';

export interface KanjiExampleWord {
  word: string;
  reading: string;
  meaning: string;
}

export interface KanjiExampleSentence {
  japanese: string;
  reading?: string;
  english: string;
}

export interface KanjiItem {
  id: string;
  character: string;
  meaning: string;
  onyomi: string[];
  kunyomi: string[];
  strokeCount?: number;
  radical?: string;
  grade?: number;
  exampleWords: KanjiExampleWord[];
  exampleSentences: KanjiExampleSentence[];
  jlptLevel: JLPTLevel;
}

export interface VocabularyItem {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  kanji: string;
  jlptLevel: JLPTLevel;
  partOfSpeech: string;
  exampleSentence: {
    japanese: string;
    english: string;
  };
  commonCollocations?: string[];
}

export interface GrammarExample {
  japanese: string;
  english: string;
}

export interface GrammarItem {
  id: string;
  pattern: string;
  meaning: string;
  structure: string;
  usage: string;
  jlptLevel: JLPTLevel;
  examples: GrammarExample[];
  notes: string;
  categoryTag?: string;
}

export interface OtherItem {
  id: string;
  title: string;
  subCategory: string; // e.g. 'hiragana' | 'katakana' | 'numbers' | 'counters' | 'time' | 'expressions'
  japanese: string;
  reading: string;
  meaning: string;
  jlptLevel: JLPTLevel;
  notes?: string;
  examples?: { japanese: string; english: string }[];
}

export type JLPTItem = KanjiItem | VocabularyItem | GrammarItem | OtherItem;

export interface SkillStat {
  correct: number;
  total: number;
}

export interface ItemProgressRecord {
  itemId: string;
  category: CategoryType;
  level: JLPTLevel;
  learningStatus: ItemLearningStatus;
  learnedAt?: string;
  lastReviewedAt?: string;
  quizStatus: ItemQuizStatus;
  attempts: number;
  correct: number;
  wrong: number;
  lastAttemptAt?: string;
  skillBreakdown: Record<string, SkillStat>;
}

export type KanjiSkillType =
  | 'meaning'
  | 'onyomi'
  | 'kunyomi'
  | 'vocabulary'
  | 'reading'
  | 'sentence';

export type VocabularySkillType =
  | 'meaning'
  | 'reading'
  | 'kanji_match'
  | 'sentence_context';

export type GrammarSkillType =
  | 'structure'
  | 'meaning'
  | 'particle'
  | 'sentence_fill';

export type OtherSkillType =
  | 'recognition'
  | 'reading'
  | 'meaning'
  | 'usage';

export interface QuizQuestion {
  id: string;
  itemId: string;
  level: JLPTLevel;
  category: CategoryType;
  skillType: string;
  prompt: string;
  subPrompt?: string;
  hint?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  itemDetails?: JLPTItem;
}

export interface QuizAnswerRecord {
  questionId: string;
  itemId: string;
  level: JLPTLevel;
  category: CategoryType;
  skill: string;
  prompt: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timestamp: string;
}

export interface DailyLogEntry {
  date: string; // YYYY-MM-DD
  level: JLPTLevel;
  category: CategoryType;
  newLearnedCount: number;
  questionsAnswered: number;
  correctCount: number;
  wrongCount: number;
  studyTimeMinutes: number;
  reviewedItemIds: string[];
  wrongItemIds: string[];
  correctItemIds: string[];
}

export interface WeakAreaItem {
  id: string;
  itemId: string;
  itemTitle: string;
  level: JLPTLevel;
  category: CategoryType;
  skill: string;
  mistakeCount: number;
  lastMistakeAt: string;
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  dailyStudyGoalMinutes: number;
  dailyNewItemsGoal: number;
  defaultQuizCount: number;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  furiganaAlwaysVisible: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  targetLevel: JLPTLevel;
  createdAt: string;
  avatarSeed?: string;
}
