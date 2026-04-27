
# كود الأكاديمية المالكية للفقه v2.0 🕌

يحتوي هذا الملف على كافة الملفات الضرورية لتشغيل التطبيق بشكل مستقل.

---

## 1. index.html
هذا الملف هو نقطة الدخول ويحتوي على استيراد الخطوط والمكتبات اللازمة.

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>الأكاديمية المالكية للفقه</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Kufi+Arabic:wght@100..900&display=swap" rel="stylesheet">
    <style>
      body { font-family: 'Noto Kufi Arabic', sans-serif; background-color: #f8fafc; }
      .font-serif-arabic { font-family: 'Amiri', serif; }
    </style>
    <script type="importmap">
    {
      "imports": {
        "react": "https://esm.sh/react@^19.2.3",
        "react-dom/client": "https://esm.sh/react-dom@^19.2.3/client",
        "@google/genai": "https://esm.sh/@google/genai@^1.34.0",
        "lucide-react": "https://esm.sh/lucide-react@^0.562.0"
      }
    }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="index.tsx"></script>
  </body>
</html>
```

---

## 2. index.tsx
المحرك الرئيسي للتطبيق (React).

```tsx
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  BookOpen, Award, CheckCircle, ChevronRight, ArrowRight, GraduationCap, 
  Library, RefreshCw, Unlock, HelpCircle, Scale, Search, Lightbulb, 
  MessageSquareQuote, Layers, Monitor, Smartphone, Heart 
} from 'lucide-react';
import { Level, LessonContent, UserProgress } from './types';
import { LEVELS } from './constants';
import { LOCAL_DB } from './db';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const App = () => {
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('maliki_fiqh_progress_v2_0');
    return saved ? JSON.parse(saved) : {
      currentLevel: Level.BEGINNER, completedLessons: [], scores: {}, certificates: []
    };
  });

  const [view, setView] = useState<'dashboard' | 'lesson' | 'quiz' | 'certificate'>('dashboard');
  const [viewMode, setViewMode] = useState<'responsive' | 'desktop'>(() => {
    return (localStorage.getItem('view_mode') as 'responsive' | 'desktop') || 'responsive';
  });
  
  const [activeLevel, setActiveLevel] = useState<Level>(progress.currentLevel);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showRiddleAnswers, setShowRiddleAnswers] = useState<Record<number, boolean>>({});

  useEffect(() => {
    localStorage.setItem('maliki_fiqh_progress_v2_0', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('view_mode', viewMode);
  }, [viewMode]);

  const generateLesson = async (topic: string, levelId: Level, forceNew: boolean = false) => {
    setLoading(true);
    setCurrentTopic(topic);
    if (LOCAL_DB[topic] && !forceNew) {
      setLessonContent(LOCAL_DB[topic]);
      setLoading(false);
      setView('lesson');
      return;
    }
    // AI Generation Logic ... (يرجى مراجعة الكود الأصلي للتفاصيل الكاملة)
  };

  // ... باقي دوال الـ Rendering (Dashboard, Lesson, Quiz, Certificate)
  // تم اختصارها هنا لتوفير المساحة، الكود الكامل موجود في ملف index.tsx الأصلي
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
```

---

## 3. types.ts
تعريف هياكل البيانات.

```typescript
export enum Level { BEGINNER = 'BEGINNER', INTERMEDIATE = 'INTERMEDIATE', ADVANCED = 'ADVANCED' }

export interface QuizQuestion {
  question: string; options: string[]; correctAnswer: number; explanation: string;
}

export interface FiqhRiddle { riddle: string; answer: string; }

export interface LessonContent {
  title: string; matn: string; body: string; detailedExamples: string[];
  fiqhIssues: string[]; fiqhRiddles: FiqhRiddle[]; evidence: string;
  comparativeFiqh: string; references: string[]; quiz: QuizQuestion[];
}

export interface UserProgress {
  currentLevel: Level; completedLessons: string[]; scores: Record<string, number>; certificates: Level[];
}

export interface LevelConfig {
  id: Level; title: string; description: string; mainText: string; topics: string[];
}
```

---

## 4. constants.ts
المنهج الدراسي المعتمد.

```typescript
import { Level, LevelConfig } from './types';

export const LEVELS: LevelConfig[] = [
  {
    id: Level.BEGINNER,
    title: 'المُسْتَوَى المُبْتَدِئُ (دِبْلُومُ التَّأْسِيسِ الفِقْهِيِّ)',
    description: 'ضبط أركان العبادات وعقيدة أهل السنة على طريقة الإمام ابن عاشر والأخضري.',
    mainText: 'المُرْشِدُ المُعِينُ وَمُخْتَصَرُ الأَخْضَرِيِّ',
    topics: [
      'مُقَدِّمَةُ العَقِيدَةِ وَأُصُولِ الدِّينِ', 'أَحْكَامُ الطَّهَارَةِ (المِيَاهُ وَالوَسَائِلُ)', 
      'فِقهُ الصَّلَاةِ (الأَرْكَانُ وَالسُّنَنُ)', 'أَحْكَامُ السَّهْوِ وَإِصْلَاحُ الصَّلَاةِ',
      'صَلَاةُ الجَمَاعَةِ وَالجُمُعَةِ وَالجَنَائِزِ', 'مُقَدِّمَةُ فِي آدَابِ المُرِيدِ وَالطَّالِبِ'
    ]
  },
  // ... باقي المستويات (INTERMEDIATE, ADVANCED)
];
```

---

## 5. db.ts
قاعدة البيانات المحلية للدروس المحققة.

```typescript
import { LessonContent } from './types';

export const LOCAL_DB: Record<string, LessonContent> = {
  'أَحْكَامُ الطَّهَارَةِ (المِيَاهُ وَالوَسَائِلُ)': {
    title: 'تَحْقِيقُ المَسَائِلِ فِي أَحْكِامِ المِيَاهِ',
    matn: 'يَقُولُ الإِمَامُ ابْنُ عَاشِرٍ رَحِمَهُ اللَّهُ: فَصْلٌ وَتَحْصُلُ الطَّهَارَةُ بِمَا ...',
    body: 'الشَّرْحُ الفِقْهِيُّ المُوسَّعُ: يَنْطَلِقُ المَالِكِيَّةُ مِنْ أَصْلِ أَنَّ الأَصْلَ فِي المِيَاهِ الطَّهُورِيَّةُ...',
    detailedExamples: ["مَاءُ البَحْرِ: طَهُورٌ...", "مَاءٌ سَقَطَ فِيهِ زَعْفَرَانٌ..."],
    fiqhIssues: ["مسألة الماء المستعمل...", "مسألة الأسآر..."],
    fiqhRiddles: [{ riddle: "مَاءٌ طَاهِرٌ سَقَطَتْ فِيهِ نَجَاسَةٌ فَزَادَتْهُ طَهُورِيَّةً؟", answer: "..." }],
    evidence: '...', comparativeFiqh: '...', references: ['مَوَاهِبُ الجَلِيلِ'],
    quiz: [{ question: '...', options: [], correctAnswer: 0, explanation: '...' }]
  }
};
```
---
**ملاحظة**: لنقل التطبيق، تأكد من إعداد مفتاح API الخاص بـ Google Gemini في متغيرات البيئة باسم `API_KEY`.
