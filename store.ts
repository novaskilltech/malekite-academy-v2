import { create } from 'zustand';
import { Level, UserProgress, LessonContent, LibraryItem } from './types';
import { supabase } from './lib/supabase';
import { LOCAL_DB } from './db';

interface AppState {
  // User Data
  progress: UserProgress;
  deviceId: string;
  
  // Navigation
  view: 'dashboard' | 'lesson' | 'quiz' | 'certificate' | 'library';
  viewMode: 'responsive' | 'desktop';
  activeLevel: Level;
  theme: 'light' | 'everest';
  modelConfig: { provider: 'google' | 'openai'; model: string };
  
  // Lesson/Quiz Data
  currentTopic: string | null;
  lessonContent: LessonContent | null;
  loading: boolean;
  quizScore: number | null;
  selectedAnswers: Record<number, number>;
  showRiddleAnswers: Record<number, boolean>;
  
  // Library
  selectedBook: LibraryItem | null;
  searchTerm: string;

  // Actions
  setView: (view: AppState['view']) => void;
  setViewMode: (mode: AppState['viewMode']) => void;
  setActiveLevel: (level: Level) => void;
  setTheme: (theme: 'light' | 'everest') => void;
  setModelConfig: (config: { provider: 'google' | 'openai'; model: string }) => void;
  setSelectedBook: (book: LibraryItem | null) => void;
  setSearchTerm: (term: string) => void;
  setShowRiddleAnswers: (updater: (prev: Record<number, boolean>) => Record<number, boolean>) => void;
  setSelectedAnswers: (updater: (prev: Record<number, number>) => Record<number, number>) => void;
  
  // Async Actions
  init: () => Promise<void>;
  generateLesson: (topic: string, levelId: Level, forceNew?: boolean) => Promise<void>;
  submitQuiz: () => void;
}

const STORAGE_KEY = 'maliki_fiqh_progress_v3_0';
const DEVICE_ID_KEY = 'maliki_academy_device_id_v3';

export const useStore = create<AppState>((set, get) => ({
  progress: {
    currentLevel: Level.BEGINNER,
    completedLessons: [],
    scores: {},
    certificates: []
  },
  deviceId: '',
  view: 'dashboard',
  viewMode: (localStorage.getItem('view_mode') as 'responsive' | 'desktop') || 'responsive',
  activeLevel: Level.BEGINNER,
  theme: (localStorage.getItem('theme') as 'light' | 'everest') || 'light',
  modelConfig: (() => {
    const saved = localStorage.getItem('model_config_v4');
    if (saved) return JSON.parse(saved);
    // v4: OpenRouter only — 3 modèles élite
    const config = { provider: 'openrouter', model: 'google/gemini-2.5-pro-preview' };
    localStorage.setItem('model_config_v4', JSON.stringify(config));
    return config;
  })(),
  currentTopic: null,
  lessonContent: null,
  loading: false,
  quizScore: null,
  selectedAnswers: {},
  showRiddleAnswers: {},
  selectedBook: null,
  searchTerm: '',

  setView: (view) => set({ view }),
  setViewMode: (viewMode) => {
    localStorage.setItem('view_mode', viewMode);
    set({ viewMode });
  },
  setActiveLevel: (activeLevel) => set({ activeLevel }),
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },
  setModelConfig: (config) => {
    set({ modelConfig: config });
    localStorage.setItem('model_config_v4', JSON.stringify(config));
  },
  setSelectedBook: (selectedBook) => set({ selectedBook }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setShowRiddleAnswers: (updater) => set((state) => ({ showRiddleAnswers: updater(state.showRiddleAnswers) })),
  setSelectedAnswers: (updater) => set((state) => ({ selectedAnswers: updater(state.selectedAnswers) })),

  init: async () => {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    set({ deviceId });

    // Load from LocalStorage first
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Migration of old English level IDs to new Arabic ones
        const migrationMap: Record<string, string> = {
          'BEGINNER': Level.BEGINNER,
          'INTERMEDIATE': Level.INTERMEDIATE,
          'ADVANCED': Level.ADVANCED,
          'EXPERT': Level.EXPERT
        };
        
        if (typeof parsed.currentLevel === 'string' && migrationMap[parsed.currentLevel]) {
          parsed.currentLevel = migrationMap[parsed.currentLevel];
        }
        
        set({ progress: parsed, activeLevel: parsed.currentLevel });
      } catch (e) {
        console.error('Failed to parse progress', e);
      }
    }

    // Try to sync with Supabase
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('device_id', deviceId)
        .maybeSingle();

      if (data) {
        const migrationMap: Record<string, string> = {
          'BEGINNER': Level.BEGINNER,
          'INTERMEDIATE': Level.INTERMEDIATE,
          'ADVANCED': Level.ADVANCED,
          'EXPERT': Level.EXPERT
        };
        
        const currentLevel = migrationMap[data.current_level] || data.current_level;

        const progress: UserProgress = {
          currentLevel: currentLevel as Level,
          completedLessons: data.completed_lessons,
          scores: data.scores,
          certificates: data.certificates
        };
        set({ progress, activeLevel: progress.currentLevel });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } else if (!error && !data) {
        // Create initial record in Supabase
        const initial = get().progress;
        await supabase.from('user_progress').insert({
          device_id: deviceId,
          current_level: initial.currentLevel,
          completed_lessons: initial.completedLessons,
          scores: initial.scores,
          certificates: initial.certificates
        });
      }
    } catch (e) {
      console.warn('Supabase sync failed, using local storage.');
    }
  },

  generateLesson: async (topic, levelId, forceNew = false) => {
    set({ loading: true, currentTopic: topic, showRiddleAnswers: {}, quizScore: null, selectedAnswers: {} });

     // Cache check
      const cacheKey = `cache_lesson_v3_0_${topic}`;
      if (!forceNew) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            // Validate cache structure - content must be array
            if (parsed && Array.isArray(parsed.content) && parsed.riddles && Array.isArray(parsed.quiz)) {
              set({ lessonContent: parsed, loading: false, view: 'lesson' });
              return;
            }
          } catch (e) {
            localStorage.removeItem(cacheKey);
          }
        }
      }

    // Try API call
    try {
      const { modelConfig } = get();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000); // 60s timeout for generation

      const response = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, levelId, modelConfig }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Generation failed');
      }
      const data = await response.json();
      
      localStorage.setItem(cacheKey, JSON.stringify(data));
      set({ lessonContent: data, loading: false, view: 'lesson' });
      window.scrollTo(0,0);
    } catch (error) {
      console.error('API call failed:', error);
      alert("حَدَثَ خَطَأٌ فِي الِاتِّصَالِ بِمَكْتَبَةِ العُلُومِ الذَّكِيَّةِ. تَأَكَّدْ مِنِ اتِّصَالِكَ بِالإِنْتَرْنِتِ.");
      set({ loading: false });
    }
  },

  submitQuiz: async () => {
    const { lessonContent, selectedAnswers, currentTopic, activeLevel, deviceId } = get();
    if (!lessonContent) return;

    let score = 0;
    lessonContent.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) score++;
    });
    const finalScore = Math.round((score / lessonContent.quiz.length) * 100);
    set({ quizScore: finalScore });

    const newCompleted = [...new Set([...get().progress.completedLessons, currentTopic!])];
    // Logic for certificates (simplified for store)
    // In a real app, this should be more robust
    const newProgress = {
      ...get().progress,
      completedLessons: newCompleted,
      scores: { ...get().progress.scores, [currentTopic!]: Math.max(get().progress.scores[currentTopic!] || 0, finalScore) }
    };

    set({ progress: newProgress });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));

    // Sync with Supabase
    try {
      await supabase.from('user_progress').update({
        current_level: newProgress.currentLevel,
        completed_lessons: newProgress.completedLessons,
        scores: newProgress.scores,
        certificates: newProgress.certificates
      }).eq('device_id', deviceId);
    } catch (e) {
      console.error('Supabase update failed');
    }
  }
}));
