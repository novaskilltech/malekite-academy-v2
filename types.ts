
export enum Level {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface FiqhRiddle {
  riddle: string;
  answer: string;
}

export interface LessonContent {
  title: string;
  matn: string;
  body: string;
  detailedExamples: string[];
  fiqhIssues: string[];
  fiqhRiddles: FiqhRiddle[];
  evidence: string;
  comparativeFiqh: string;
  references: string[];
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
  mainTextBio: string; // ترجمة مؤلف المتن المعتمد في المستوى
  topics: string[];
}

export interface LibraryItem {
  id: string;
  title: string;
  author: string;
  authorBio: string; // ترجمة المؤلف
  recommendedEdition: string; // أفضل طبعة في السوق
  description: string;
  content: string; // النص الكامل للمتن
  category: 'متون' | 'شروح' | 'أصول';
  level: Level;
}
