
export type Theme = 'light' | 'everest';
export type Provider = 'google' | 'openai';

export interface ModelConfig {
  provider: Provider;
  model: string;
}

export enum Level {
  BEGINNER = 'مبتدئ',
  INTERMEDIATE = 'متوسط',
  ADVANCED = 'متقدم',
  EXPERT = 'خبير'
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Mnemonic {
  verse: string;
  explanation: string;
}

export interface Riddle {
  question: string;
  answer: string;
}

export interface LessonContent {
  title: string;
  nazmOrMatn: string; // المتن أو النظم الموثق
  introduction?: string;
  content: string[]; // التقرير الفقهي (الشرح) - array of sections
  evidence?: string; // الدليل بالمنهجية الأصولية
  examples?: string[]; // الأمثلة المعاصرة والنادرة
  importantIssues?: { title: string; content: string }[];
  mnemonics?: Mnemonic[];
  riddles: Riddle[];
  comparativeFiqh?: string;
  references?: string[];
  quiz: QuizQuestion[];
}

export interface UserProgress {
  currentLevel: Level;
  completedLessons: string[];
  scores: Record<string, number>;
  certificates: Level[];
}

export interface LevelConfig {
  id: Level;
  title: string;
  description: string;
  mainText: string;
  mainTextId?: string;
  mainTextBio: string;
  topics: string[];
}

export interface LibraryItem {
  id: string;
  title: string;
  author: string;
  authorBio: string;
  recommendedEdition: string;
  description: string;
  content: string;
  category: 'متون' | 'شروح' | 'أصول';
  level: Level;
  url?: string; // Optionnel pour éviter les erreurs TS
}
