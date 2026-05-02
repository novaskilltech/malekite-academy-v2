import React, { useState } from 'react';
import { 
  ArrowLeft, 
  HelpCircle, 
  Lightbulb, 
  PlayCircle,
  ChevronRight,
  BookOpenCheck,
  ScrollText,
  Scale,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { useStore } from '../store';
import { LEVELS, LIBRARY_ITEMS } from '../constants';

export const LessonView: React.FC = () => {
  const { 
    lessonContent, 
    viewMode, 
    setView, 
    showRiddleAnswers, 
    setShowRiddleAnswers,
    generateLesson,
    currentTopic,
    activeLevel,
    setSelectedBook
  } = useStore();

  const currentLevelConfig = LEVELS.find(l => l.id === activeLevel);

  const [isGenerating, setIsGenerating] = useState(false);

  if (!lessonContent) return null;

  const handleRegenerate = async () => {
    if (currentTopic) {
      setIsGenerating(true);
      await generateLesson(currentTopic, activeLevel, true);
      setIsGenerating(false);
    }
  };

  return (
    <div className={`animate-in slide-in-from-bottom duration-700 pb-24 px-4 ${viewMode === 'desktop' ? 'max-w-5xl mx-auto' : ''}`}>
      {/* Header */}
      <div className="flex items-center gap-4 py-8 mb-8 sticky top-0 bg-[#fafaf9]/80 backdrop-blur-md z-50">
        <button onClick={() => setView('dashboard')} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-600 hover:text-emerald-600 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 font-serif-arabic">{lessonContent.title}</h2>
      </div>

      <div className="space-y-12">
        {/* 1. المَتْنُ أَوِ النَّظْمُ المَوْثُوقُ */}
        <section className="relative">
          <div className="absolute -top-16 right-0 flex gap-4 no-print">
            <button 
              onClick={handleRegenerate}
              disabled={isGenerating}
              className={`flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full font-black font-serif-arabic shadow-xl hover:bg-emerald-700 transition-all hover:scale-105 ${isGenerating ? 'opacity-70 cursor-wait' : ''}`}
              title="إِعَادَةُ التَّوْلِيدِ بِمُودِيلٍ آخَرَ"
            >
              <RefreshCw size={20} className={isGenerating ? 'animate-spin' : ''} /> 
              {isGenerating ? 'يَجْرِي التَّوْلِيدُ...' : 'إِعَادَةُ التَّوْلِيدِ'}
            </button>
          </div>

          {currentLevelConfig && (
            <div className="mb-6 bg-emerald-950 text-white rounded-3xl p-6 border-b-4 border-emerald-500 shadow-xl no-print">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-emerald-400 font-black font-serif-arabic text-lg flex items-center gap-2">
                  <ShieldCheck size={20} /> المَتْنُ الرَّسْمِيُّ المُعْتَمَدُ لِهَذَا المُسْتَوَى
                </h4>
                <button 
                  onClick={() => {
                    const book = LIBRARY_ITEMS.find(b => b.id === currentLevelConfig.mainTextId);
                    if (book) {
                      setSelectedBook(book);
                      setView('library');
                      window.scrollTo(0,0);
                    }
                  }}
                  className="text-xs bg-emerald-800 hover:bg-emerald-700 px-3 py-1 rounded-lg transition-colors font-bold"
                >
                  فَتْحُ النَّصِّ الكَامِلِ
                </button>
              </div>
              <p className="text-emerald-100 font-serif-arabic text-xl leading-relaxed italic border-r-2 border-emerald-500 pr-4">
                {currentLevelConfig.mainText}
              </p>
            </div>
          )}

          {lessonContent.nazmOrMatn && (
            <section className="bg-slate-900 text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden border-4 border-emerald-600/30">
              <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/arabic-pattern-thin.png')]"></div>
              <h3 className="text-emerald-400 font-black text-2xl mb-6 font-serif-arabic border-r-4 border-emerald-500 pr-4 italic">المَتْنُ المُقْتَبَسُ لِهَذَا الدَّرْسِ</h3>
              <p className="text-xl md:text-2xl text-center font-black font-serif-arabic leading-[1.8] py-4">{lessonContent.nazmOrMatn}</p>
            </section>
          )}
        </section>

        {/* Introduction */}
        {lessonContent.introduction && (
          <section className="bg-emerald-50 border-r-8 border-emerald-600 rounded-3xl p-10 shadow-sm">
            <p className="text-xl text-emerald-900 font-serif-arabic leading-relaxed italic font-bold">{lessonContent.introduction}</p>
          </section>
        )}

        {/* 2. تَقْرِيرُ المَسَائِلِ (الشَّرْحُ) */}
        <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[5rem] -mr-16 -mt-16 z-0"></div>
          <div className="relative z-10">
            <h3 className="text-emerald-800 font-black text-2xl mb-8 flex items-center gap-3 font-serif-arabic border-r-4 border-emerald-600 pr-4">
              <Lightbulb /> تَقْرِيرُ المَسَائِلِ (الشَّرْحُ)
            </h3>
            <div className="space-y-8 text-2xl text-slate-800 font-serif-arabic leading-[1.8] text-justify">
              {(lessonContent.content || []).map((p, i) => (
                <p key={i} className="hover:text-emerald-900 transition-colors">{p}</p>
              ))}
            </div>
          </div>
        </section>

        {/* 3. الدَّلِيلُ (الِاسْتِدْلَالُ الأُصُولِيُّ) */}
        {lessonContent.evidence && (
          <section className="bg-slate-50 rounded-[2.5rem] p-10 border-2 border-slate-200">
            <h3 className="text-2xl font-black text-slate-900 mb-6 font-serif-arabic flex items-center gap-3 border-r-4 border-slate-900 pr-4">
              <ScrollText className="text-slate-700" /> الدَّلِيلُ (الِاسْتِدْلَالُ الأُصُولِيُّ)
            </h3>
            <div className="text-2xl text-slate-800 font-serif-arabic leading-[1.8] whitespace-pre-wrap">
              {lessonContent.evidence}
            </div>
          </section>
        )}

        {/* 4. الأَمْثِلَةُ (حَالَاتٌ نَادِرَةٌ وَمُعَاصِرَةٌ) */}
        {lessonContent.examples && (lessonContent.examples || []).length > 0 && (
          <section className="bg-amber-50 rounded-[2.5rem] p-10 border-2 border-amber-100">
            <h3 className="text-2xl font-black text-amber-900 mb-6 font-serif-arabic border-r-4 border-amber-600 pr-4">أَمْثِلَةٌ (حَالَاتٌ نَادِرَةٌ وَمُعَاصِرَةٌ)</h3>
            <ul className="space-y-6">
              {(lessonContent.examples || []).map((ex, i) => (
                <li key={i} className="flex gap-4 text-xl text-amber-900 font-serif-arabic bg-white/50 p-6 rounded-2xl shadow-sm">
                  <span className="text-amber-500 font-bold text-2xl">◈</span> {ex}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 5. الأَلْغَازُ (مَلَكَةُ الطَّالِبِ) */}
        {lessonContent.riddles && (lessonContent.riddles || []).length > 0 && (
          <section className="bg-indigo-900 text-white rounded-[2.5rem] p-10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/arabic-pattern-thin.png')]"></div>
            <h3 className="text-2xl font-black mb-8 font-serif-arabic text-indigo-300 flex items-center gap-3 border-r-4 border-indigo-400 pr-4">
              <HelpCircle /> مَلَكَةُ الطَّالِبِ (أَلْغَازٌ فِقْهِيَّةٌ ذَكِيَّةٌ)
            </h3>
            <div className="grid grid-cols-1 gap-8">
              {(lessonContent.riddles || []).map((r, i) => (
                <div key={i} className="bg-indigo-800/50 p-8 rounded-3xl border border-indigo-700/50 shadow-inner">
                  <p className="text-2xl font-black font-serif-arabic mb-6 leading-relaxed">اللُّغْزُ: {r.question}</p>
                  <button 
                    onClick={() => setShowRiddleAnswers(prev => ({ ...prev, [i]: !prev[i] }))}
                    className="w-full py-4 bg-indigo-700 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all font-serif-arabic text-xl border border-indigo-500/50"
                  >
                    {showRiddleAnswers[i] ? 'إِخْفَاءُ الجَوَابِ' : 'كَشْفُ الجَوَابِ'}
                  </button>
                  {showRiddleAnswers[i] && (
                    <div className="mt-6 p-6 bg-emerald-900/60 text-emerald-200 font-black text-2xl text-center rounded-2xl border border-emerald-500/30 animate-in slide-in-from-top duration-300 font-serif-arabic">
                      {r.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. الفِقْهُ المُقَارَنُ (تَحْلِيلُ الخِلَافِ العَالِي) */}
        {lessonContent.comparativeFiqh && (
          <section className="bg-rose-50 rounded-[2.5rem] p-10 border-2 border-rose-100 shadow-sm">
            <h3 className="text-2xl font-black text-rose-900 mb-6 font-serif-arabic flex items-center gap-3 border-r-4 border-rose-600 pr-4">
              <Scale className="text-rose-700" /> الفِقْهُ المُقَارَنُ (تَحْلِيلُ الخِلَافِ العَالِي)
            </h3>
            <div className="text-2xl text-rose-800 font-serif-arabic leading-[1.8] text-justify">
              {lessonContent.comparativeFiqh}
            </div>
          </section>
        )}

        {/* 7. المَنْظُومَاتُ (لِلْحِفْظِ) */}
        {lessonContent.mnemonics && (lessonContent.mnemonics || []).length > 0 && (
          <section className="bg-emerald-900 text-emerald-50 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
            <h3 className="font-black text-2xl mb-8 flex items-center gap-3 font-serif-arabic text-emerald-200 border-r-4 border-emerald-400 pr-4">
              <PlayCircle /> المَنْظُومَاتُ لِلْحِفْظِ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {(lessonContent.mnemonics || []).map((m, i) => (
                <div key={i} className="bg-emerald-800/40 p-8 rounded-3xl border border-emerald-700/50 hover:bg-emerald-800/60 transition-all text-center">
                  <p className="text-2xl font-black mb-4 font-serif-arabic leading-relaxed">{m.verse}</p>
                  <p className="text-emerald-300 text-lg font-serif-arabic italic opacity-80">{m.explanation}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 8. الِاخْتِبَارُ وَالتَّقْيِيمُ */}
        <section className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 flex flex-col justify-center items-center text-center space-y-8">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center animate-bounce">
            <BookOpenCheck size={48} />
          </div>
          <div className="space-y-2">
            <h3 className="text-4xl font-black text-slate-900 font-serif-arabic">هَلْ أَنْتَ مُسْتَعِدٌّ لِلِاخْتِبَارِ؟</h3>
            <p className="text-slate-500 font-serif-arabic text-xl font-bold italic">"اخْتَبِرْ مَلَكَتَكَ الفِقْهِيَّةَ لِتَنْتَقِلَ لِلْمَرْحَلَةِ التَّالِيَةِ"</p>
          </div>
          <button 
            onClick={() => { setView('quiz'); window.scrollTo(0,0); }}
            className="group w-full max-w-2xl py-8 bg-emerald-700 text-white font-black rounded-[2rem] shadow-2xl hover:bg-emerald-800 transition-all flex items-center justify-center gap-4 text-3xl font-serif-arabic relative overflow-hidden"
          >
            ابْدَأِ الِاخْتِبَارَ الآنَ <ChevronRight className="w-8 h-8" />
          </button>
        </section>

        {/* 9. المَصَادِرُ (تَوْثِيقُ المَصَادِرِ الأُمِّ) */}
        {lessonContent.references && (lessonContent.references || []).length > 0 && (
          <section className="bg-slate-900 text-slate-400 rounded-3xl p-10 border border-slate-800">
            <h3 className="text-white font-black text-2xl mb-6 font-serif-arabic border-r-4 border-slate-700 pr-4">تَوْثِيقُ المَصَادِرِ الأُمِّ</h3>
            <div className="flex flex-wrap gap-4">
              {(lessonContent.references || []).map((ref, i) => (
                <span key={i} className="bg-slate-800 px-6 py-3 rounded-xl text-lg font-serif-arabic font-bold text-slate-300">📚 {ref}</span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
