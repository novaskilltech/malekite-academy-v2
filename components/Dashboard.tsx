import React from 'react';
import { 
  BookOpen, 
  CheckCircle, 
  ChevronRight, 
  GraduationCap, 
  Unlock,
  Search,
  ShieldCheck,
  PenTool,
  Quote
} from 'lucide-react';
import { Level } from '../types';
import { LEVELS, LIBRARY_ITEMS } from '../constants';
import { useStore } from '../store';

export const Dashboard: React.FC = () => {
  const { 
    activeLevel, 
    setActiveLevel, 
    progress, 
    loading, 
    generateLesson, 
    viewMode,
    setView,
    setSelectedBook
  } = useStore();

   const currentLevelConfig = LEVELS.find(l => l.id === activeLevel);
  
  if (!currentLevelConfig) {
    console.error('Level config not found for:', activeLevel);
    return null;
  }

  return (
    <div className={`w-full space-y-12 animate-in fade-in duration-700 pb-24 px-4 ${viewMode === 'desktop' ? 'max-w-6xl mx-auto' : ''}`}>
      <header className="text-center py-12 space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-100 font-bold text-sm">
            <ShieldCheck size={18} /> بَرْنَامَجُ الِاجْتِيَازِ الأَكَادِيمِيِّ v2.0
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
             <div className={`w-2 h-2 rounded-full ${progress.completedLessons.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
             تَمَّتِ المَزَامَنَةُ مَعَ السَّحَابَةِ (Supabase)
          </div>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 font-serif-arabic">الأَكَادِيمِيَّةُ المَالِكِيَّةُ</h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-xl font-serif-arabic italic leading-relaxed">"عَلَى خُطَى الصَّحَابَةِ وَالسَّلَفِ الصَّالِحِ فِي العَقِيدَةِ، وَعَلَى مَذْهَبِ إِمَامِ دَارِ الهِجْرَةِ فِي الفِقْهِ"</p>
      </header>

      {/* Global Progress Bar */}
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-4">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">التَّقَدُّمُ الإِجْمَالِيُّ فِي المَنْهَجِ</p>
            <h3 className="text-2xl font-black text-slate-900 font-serif-arabic">مَسَارُ طَالِبِ العِلْمِ</h3>
          </div>
          <p className="text-3xl font-black text-emerald-600">
            {Math.round((progress.completedLessons.length / LEVELS.reduce((acc, l) => acc + l.topics.length, 0)) * 100)}%
          </p>
        </div>
        <div className="w-full h-6 bg-slate-100 rounded-full overflow-hidden border-2 border-slate-50 p-1">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            style={{ width: `${(progress.completedLessons.length / LEVELS.reduce((acc, l) => acc + l.topics.length, 0)) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs font-bold text-slate-400">
          <span>{progress.completedLessons.length} مَسَاقًا مُكْتَمَلًا</span>
          <span>{LEVELS.reduce((acc, l) => acc + l.topics.length, 0)} مَسَاقًا إِجْمَالِيًّا</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {LEVELS.map((lvl) => (
          <div key={lvl.id} onClick={() => setActiveLevel(lvl.id)} className={`p-8 rounded-[2.5rem] border-4 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-full ${activeLevel === lvl.id ? 'border-emerald-600 bg-white shadow-xl scale-105 z-10' : 'border-slate-100 bg-slate-50 hover:border-emerald-200'}`}>
            <div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${activeLevel === lvl.id ? 'bg-emerald-600 text-white' : 'bg-white text-slate-400'}`}>
                {lvl.id === Level.EXPERT ? <PenTool size={24} /> : <GraduationCap size={24} />}
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-900 font-serif-arabic leading-tight">{lvl.title}</h3>
              <p className="text-sm text-slate-600 font-serif-arabic line-clamp-3 leading-relaxed mb-4">{lvl.description}</p>
            </div>
            <div className={`flex items-center gap-2 font-black text-sm ${activeLevel === lvl.id ? 'text-emerald-700' : 'text-slate-500'}`}>
              {activeLevel === lvl.id ? <Unlock size={16} /> : <Search size={16} />}
              {activeLevel === lvl.id ? 'تَصَفَّحِ المَسَاقَاتِ' : 'اسْتِعْرَاضُ المَنْهَجِ'}
            </div>
          </div>
        ))}
      </div>

      <section className="bg-white rounded-[3rem] p-8 md:p-16 shadow-2xl border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b pb-8">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 font-serif-arabic flex items-center gap-4">
              <BookOpen className="text-emerald-600" size={32} /> {currentLevelConfig.mainText}
            </h2>
          </div>
          <div className="bg-slate-50 px-6 py-3 rounded-2xl flex gap-8">
             <div className="text-center">
               <p className="text-slate-500 text-xs font-bold">المُعَدَّلُ</p>
               <p className="text-emerald-700 font-black">{Math.round((currentLevelConfig.topics.reduce((acc, t) => acc + (progress.scores[t] || 0), 0)) / (currentLevelConfig.topics.filter(t => progress.completedLessons.includes(t)).length || 1))}%</p>
             </div>
             <div className="text-center">
               <p className="text-slate-500 text-xs font-bold">المَسَاقَاتُ</p>
               <p className="text-emerald-700 font-black">{currentLevelConfig.topics.filter(t => progress.completedLessons.includes(t)).length} / {currentLevelConfig.topics.length}</p>
             </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-amber-50/40 p-6 rounded-3xl border border-amber-100 flex gap-4 items-start shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0 border border-amber-200">
              <Quote className="text-amber-800" size={24} />
            </div>
            <div>
              <h4 className="text-amber-900 font-black font-serif-arabic text-lg mb-1 underline decoration-amber-300 underline-offset-4">تَرْجَمَةُ مُؤَلِّفِي المَتْنِ:</h4>
              <p className="text-slate-800 font-serif-arabic text-lg leading-relaxed font-bold italic">
                {currentLevelConfig.mainTextBio}
              </p>
            </div>
          </div>

          <div 
            onClick={() => {
              const book = LIBRARY_ITEMS.find(b => b.id === currentLevelConfig.mainTextId);
              if (book) {
                setSelectedBook(book);
                setView('library');
                window.scrollTo(0,0);
              } else {
                setView('library');
                window.scrollTo(0,0);
              }
            }}
            className="bg-emerald-900 text-white p-6 rounded-3xl border border-emerald-800 shadow-xl flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-all relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabic-pattern-thin.png')]"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-2 uppercase tracking-widest">
                <ShieldCheck size={14} /> مَصْدَرٌ مَوْثُوقٌ
              </div>
              <h4 className="text-xl font-black font-serif-arabic mb-1">المَتْنُ الرَّسْمِيُّ لِلْمُسْتَوَى</h4>
              <p className="text-emerald-200/80 text-sm font-serif-arabic">{currentLevelConfig.mainText}</p>
            </div>
            <div className="relative z-10 flex items-center justify-between mt-4">
               <span className="text-xs font-bold bg-emerald-800 px-3 py-1 rounded-lg group-hover:bg-emerald-700 transition-colors">مُرَاجَعَةُ النَّصِّ الكَامِلِ</span>
               <ChevronRight size={18} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {currentLevelConfig.topics.map((topic, idx) => (
            <div key={idx} onClick={() => !loading && generateLesson(topic, activeLevel)} className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between group ${progress.completedLessons.includes(topic) ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100 hover:border-emerald-400 hover:shadow-lg'}`}>
              <div className="flex items-center gap-6">
                <span className={`w-12 h-12 rounded-xl flex items-center justify-center font-black transition-colors ${progress.completedLessons.includes(topic) ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-600'}`}>{idx + 1}</span>
                <h4 className="font-bold text-lg text-slate-900 font-serif-arabic">{topic}</h4>
              </div>
              <div className="flex items-center gap-2">
                {progress.completedLessons.includes(topic) && <CheckCircle size={18} className="text-emerald-600" />}
                <ChevronRight size={20} className="text-slate-400 group-hover:text-emerald-600" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
