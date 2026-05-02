import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Monitor, 
  BarChart3, 
  BookMarked,
  Palette,
  Settings
} from 'lucide-react';

// Store
import { useStore } from './store';

// Components
import { Dashboard } from './components/Dashboard';
import { LessonView } from './components/LessonView';
import { QuizView } from './components/QuizView';
import { CertificateView } from './components/CertificateView';
import { LibraryView } from './components/LibraryView';

const App = () => {
  const { 
    view, 
    setView, 
    viewMode, 
    setViewMode, 
    loading, 
    lessonContent, 
    init,
    setSelectedBook,
    theme,
    setTheme,
    modelConfig,
    setModelConfig
  } = useStore();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    document.documentElement.className = theme === 'everest' ? 'theme-everest' : 'theme-light';
  }, [theme]);

  if (loading) return (
    <div className="fixed inset-0 bg-white/98 flex flex-col items-center justify-center z-[200] text-center p-6">
      <div className="w-28 h-28 border-[14px] border-emerald-50 border-t-emerald-700 rounded-full animate-spin mb-10 shadow-2xl"></div>
      <h3 className="text-4xl font-black text-slate-900 font-serif-arabic mb-4">جَارِي اسْتِحْضَارُ المَسَائِلِ...</h3>
      <p className="text-slate-600 font-serif-arabic italic text-2xl font-bold">"العِلْمُ صَيْدٌ وَالكِتَابَةُ قَيْدُهُ"</p>
    </div>
  );

  return (
    <main className={`min-h-screen pb-48 transition-all duration-500 ${theme === 'everest' ? 'bg-[#0b0e14] text-[#e0e0e0] theme-everest' : 'bg-[#fafaf9] text-[#0f172a] theme-light'}`}>
      <style>{`
        @media print { .no-print { display: none !important; } }
        .font-serif-arabic { font-family: 'Amiri', serif; }
        body { 
          font-family: 'Noto Kufi Arabic', sans-serif; 
          overflow-x: hidden; 
          transition: background-color 0.5s ease;
        }
        
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
        
        /* THEME LIGHT (Default) */
        .theme-light ::-webkit-scrollbar-thumb { background: #059669; border-radius: 10px; }
        .theme-light .shadow-3xl { box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.1); }
        
        /* THEME EVEREST */
        .theme-everest { background-color: #0b0e14; }
        .theme-everest ::-webkit-scrollbar-thumb { background: #00ff9d; border-radius: 10px; }
        .theme-everest .shadow-3xl { box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.7); }
        
        .theme-everest .bg-white { background-color: #11151c !important; }
        .theme-everest .text-slate-900 { color: #ffffff !important; }
        .theme-everest .text-slate-800 { color: #f0f0f0 !important; }
        .theme-everest .text-slate-700 { color: #e0e0e0 !important; }
        .theme-everest .text-slate-600 { color: #a0a0a0 !important; }
        .theme-everest .text-slate-500 { color: #808080 !important; }
        .theme-everest .border-slate-100 { border-color: #1a1f29 !important; }
        .theme-everest .border-slate-200 { border-color: #2a2f39 !important; }
        .theme-everest .bg-slate-50 { background-color: #0b0e14 !important; }
        .theme-everest .bg-slate-900 { background-color: #05070a !important; }
        .theme-everest .bg-emerald-50 { background-color: rgba(0, 255, 157, 0.05) !important; }
        .theme-everest .bg-emerald-600 { background-color: #00ff9d !important; color: #0b0e14 !important; }
        .theme-everest .text-emerald-700 { color: #00ff9d !important; }
        .theme-everest .text-emerald-800 { color: #00ff9d !important; }
        .theme-everest .text-emerald-900 { color: #00ff9d !important; }
        .theme-everest .border-emerald-600 { border-color: #00ff9d !important; }
        .theme-everest .border-emerald-500 { border-color: #00ff9d !important; }
        .theme-everest .border-emerald-100 { border-color: rgba(0, 255, 157, 0.2) !important; }
        
        .theme-everest .bg-amber-50 { background-color: rgba(255, 191, 0, 0.05) !important; }
        .theme-everest .bg-amber-50\/40 { background-color: rgba(255, 191, 0, 0.02) !important; }
        .theme-everest .text-amber-900 { color: #ffbf00 !important; }
        .theme-everest .text-amber-800 { color: #ffbf00 !important; }
        .theme-everest .border-amber-100 { border-color: rgba(255, 191, 0, 0.2) !important; }
        .theme-everest .border-amber-200 { border-color: rgba(255, 191, 0, 0.3) !important; }
        
        .theme-everest .bg-gradient-to-r.from-emerald-500.to-emerald-700 {
          background: linear-gradient(to right, #00ff9d, #00a86b) !important;
        }
        
        .theme-everest nav { background-color: rgba(17, 21, 28, 0.95) !important; border-color: #2a2f39 !important; }
        
        /* LessonView Overrides for Everest */
        .theme-everest .sticky { background-color: rgba(11, 14, 20, 0.9) !important; border-color: #1a1f29 !important; }
        .theme-everest .bg-rose-50 { background-color: rgba(244, 63, 94, 0.05) !important; border-color: rgba(244, 63, 94, 0.2) !important; }
        .theme-everest .text-rose-900 { color: #f43f5e !important; }
        .theme-everest .text-rose-800 { color: #fb7185 !important; }
        .theme-everest .bg-indigo-900 { background-color: #1a1b26 !important; border-color: #24283b !important; }
        .theme-everest .bg-indigo-800\/50 { background-color: #24283b !important; border-color: #414868 !important; }
        .theme-everest .bg-indigo-700 { background-color: #00ff9d !important; color: #0b0e14 !important; }
        .theme-everest .bg-emerald-900 { background-color: #0d1117 !important; border-color: #30363d !important; }
        .theme-everest .bg-emerald-800\/40 { background-color: #161b22 !important; border-color: #21262d !important; }
        .theme-everest .bg-emerald-800\/60 { background-color: #21262d !important; }
        .theme-everest .bg-emerald-100 { background-color: rgba(0, 255, 157, 0.1) !important; }

        /* Certificate exception */
        .certificate-container .bg-white { background-color: #ffffff !important; }
        .certificate-container .text-slate-900 { color: #0f172a !important; }
        .certificate-container .text-slate-600 { color: #475569 !important; }
        .certificate-container .text-slate-700 { color: #334155 !important; }
      `}</style>
      
      <div className="max-w-[1400px] mx-auto">
        {view === 'dashboard' && <Dashboard />}
        {view === 'lesson' && lessonContent && <LessonView />}
        {view === 'quiz' && lessonContent && <QuizView />}
        {view === 'certificate' && <CertificateView />}
        {view === 'library' && <LibraryView />}
      </div>
      
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-[150] no-print w-full max-w-lg px-4">
        <div className={`font-serif-arabic text-xl font-black backdrop-blur-sm px-6 py-1 rounded-full border shadow-sm animate-pulse ${theme === 'everest' ? 'text-[#00ff9d] bg-[#11151c]/60 border-white/10' : 'text-slate-800 bg-white/40 border-white/20'}`}>
          تَصْمِيمُ: أَبُو سُلَيْمَانَ صَلَاحُ الدِّينِ المخانت
        </div>
        <nav className="bg-white/95 backdrop-blur-2xl border-2 border-slate-200 py-4 px-10 flex justify-around gap-12 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-4 ring-white/50 w-full">
          <button 
            onClick={() => { setView('dashboard'); window.scrollTo(0,0); setSelectedBook(null); }} 
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${view === 'dashboard' ? (theme === 'everest' ? 'text-[#00ff9d] scale-110' : 'text-emerald-700 scale-110') : 'text-slate-400 hover:text-[#00ff9d]'}`}
          >
            <BarChart3 size={28} />
            <span className="text-[10px] font-black font-serif-arabic">المَنْهَجُ</span>
          </button>
          
          <button 
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${view === 'library' ? (theme === 'everest' ? 'text-[#00ff9d] scale-110' : 'text-emerald-700 scale-110') : 'text-slate-400 hover:text-[#00ff9d]'}`}
            onClick={() => { setView('library'); window.scrollTo(0,0); setSelectedBook(null); }}
          >
            <BookMarked size={28} />
            <span className="text-[10px] font-black font-serif-arabic">المَكْتَبَةُ</span>
          </button>

          <button 
            onClick={() => setTheme(theme === 'everest' ? 'light' : 'everest')}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${theme === 'everest' ? 'text-[#00ff9d]' : 'text-slate-400 hover:text-emerald-700'}`}
          >
            <Palette size={28} />
            <span className="text-[10px] font-black font-serif-arabic">المَظْهَرُ</span>
          </button>

          <div className="flex flex-col items-center gap-1 opacity-80">
            <span className="text-[10px] font-black font-serif-arabic text-emerald-400">Gemini 2.5 Pro (Élite)</span>
            <span className="text-[10px] font-black font-serif-arabic opacity-50">الذَّكَاءُ</span>
          </div>

          <button 
            onClick={() => setViewMode(viewMode === 'responsive' ? 'desktop' : 'responsive')}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${viewMode === 'desktop' ? (theme === 'everest' ? 'text-[#00ff9d] scale-110' : 'text-emerald-700 scale-110') : 'text-slate-400 hover:text-[#00ff9d]'}`}
          >
            <Monitor size={28} />
            <span className="text-[10px] font-black font-serif-arabic">وَضْعُ الحَاسُوبِ</span>
          </button>
        </nav>
      </div>
    </main>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
