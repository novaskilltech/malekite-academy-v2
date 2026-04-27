
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  BookOpen, 
  Award, 
  CheckCircle, 
  ChevronRight, 
  ArrowRight, 
  GraduationCap, 
  Library,
  Unlock,
  Scale,
  Search,
  ShieldCheck,
  Lightbulb,
  MessageSquareQuote,
  Layers,
  PenTool,
  Monitor,
  BarChart3,
  BookMarked,
  X,
  ScrollText,
  FileText,
  User,
  ShoppingBag,
  Info,
  Quote
} from 'lucide-react';
import { Level, LessonContent, UserProgress, LibraryItem } from './types';
import { LEVELS, LIBRARY_ITEMS } from './constants';
import { LOCAL_DB } from './db';

const Type = {
  OBJECT: 'OBJECT',
  STRING: 'STRING',
  ARRAY: 'ARRAY',
  INTEGER: 'INTEGER'
} as const;

const ai = {
  models: {
    async generateContent(payload: unknown): Promise<{ text: string }> {
      const response = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Lesson generation failed: ${response.status}`);
      }

      return { text: JSON.stringify(await response.json()) };
    }
  }
};

const App = () => {
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('maliki_fiqh_progress_v2_0');
    return saved ? JSON.parse(saved) : {
      currentLevel: Level.BEGINNER,
      completedLessons: [],
      scores: {},
      certificates: []
    };
  });

  const [view, setView] = useState<'dashboard' | 'lesson' | 'quiz' | 'certificate' | 'library'>('dashboard');
  const [viewMode, setViewMode] = useState<'responsive' | 'desktop'>(() => {
    const saved = localStorage.getItem('view_mode');
    return (saved as 'responsive' | 'desktop') || 'responsive';
  });
  
  const [activeLevel, setActiveLevel] = useState<Level>(progress.currentLevel);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showRiddleAnswers, setShowRiddleAnswers] = useState<Record<number, boolean>>({});
  
  // Library State
  const [selectedBook, setSelectedBook] = useState<LibraryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    localStorage.setItem('maliki_fiqh_progress_v2_0', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('view_mode', viewMode);
  }, [viewMode]);

  const generateLesson = async (topic: string, levelId: Level, forceNew: boolean = false) => {
    setLoading(true);
    setCurrentTopic(topic);
    setShowRiddleAnswers({});
    setQuizScore(null);
    setSelectedAnswers({});

    if (LOCAL_DB[topic] && !forceNew) {
      setLessonContent(LOCAL_DB[topic]);
      setLoading(false);
      setView('lesson');
      return;
    }

    const cacheKey = `cache_lesson_v2_0_${topic}`;
    if (!forceNew) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setLessonContent(JSON.parse(cached));
        setLoading(false);
        setView('lesson');
        return;
      }
    }

    try {
      const useProModel = levelId === Level.ADVANCED || levelId === Level.EXPERT;
      const prompt = `أَنْتَ "شَيْخُ المُحَقِّقِينَ" المَالِكِيِّينَ، عَالِمٌ بِالفِقْهِ وَالعَقِيدَةِ. 
      أَنْشِئْ دَرْسًا لِـ "${topic}" فِي المُسْتَوَى "${levelId}".
      
      تَنْبِيهٌ هَامٌّ جِدًّا: 
      - فِي العَقِيدَةِ: يَجِبُ الِالْتِزَامُ التَّامُّ بِمَنْهَجِ "الصَّحَابَةِ رَضِيَ اللهُ عَنْهُمْ وَالسَّلَفِ الصَّالِحِ" (أَهْلُ الحَدِيثِ وَالأَثَرِ)، وَالِابْتِعَادُ عَنْ أَيِّ تَأْوِيلَاتٍ كَلَامِيَّةٍ مُتَأَخِّرَةٍ.
      - فِي الفِقْهِ: الِالْتِزَامُ بِمَذْهَبِ الإِمَامِ مَالِكٍ رَحِمَهُ اللهُ مَعَ ذِكْرِ الأَدِلَّةِ وَالخِلَافِ العَالِي.

      المَعَايِيرُ:
      1. التَّشْكِيلُ الكَامِلُ لِكُلِّ الحُرُوفِ.
      2. المَتْنُ: نَصٌّ مُرَكَّزٌ مَشْكُولٌ.
      3. الشَّرْحُ: بَسْطٌ فِقْهِيٌّ دَقِيقٌ.
      4. الدَّلِيلُ: مِنَ الكِتَابِ وَالسُّنَّةِ وَعَمَلِ أَهْلِ المَدِينَةِ.
      5. الخِلَافُ: مُقَارَنَةٌ مَعَ المَذَاهِبِ الأُخْرَى.
      6. 7 أَسْئِلَة MCQ مَشْكُولَة.`;

      const response = await ai.models.generateContent({
        model: useProModel ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              matn: { type: Type.STRING },
              body: { type: Type.STRING },
              detailedExamples: { type: Type.ARRAY, items: { type: Type.STRING } },
              fiqhIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
              fiqhRiddles: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { riddle: { type: Type.STRING }, answer: { type: Type.STRING } },
                  required: ['riddle', 'answer']
                }
              },
              evidence: { type: Type.STRING },
              comparativeFiqh: { type: Type.STRING },
              references: { type: Type.ARRAY, items: { type: Type.STRING } },
              quiz: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswer: { type: Type.INTEGER },
                    explanation: { type: Type.STRING }
                  },
                  required: ['question', 'options', 'correctAnswer', 'explanation']
                }
              }
            },
            required: ['title', 'matn', 'body', 'detailedExamples', 'fiqhIssues', 'fiqhRiddles', 'evidence', 'comparativeFiqh', 'references', 'quiz']
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      localStorage.setItem(cacheKey, JSON.stringify(data));
      setLessonContent(data);
      setView('lesson');
      window.scrollTo(0,0);
    } catch (error) {
      console.error(error);
      alert("حَدَثَ خَطَأٌ فِي الِاتِّصَالِ بِمَكْتَبَةِ العُلُومِ الذَّكِيَّةِ.");
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = () => {
    if (!lessonContent) return;
    let score = 0;
    lessonContent.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) score++;
    });
    const finalScore = Math.round((score / lessonContent.quiz.length) * 100);
    setQuizScore(finalScore);

    setProgress(prev => {
      const newCompleted = [...new Set([...prev.completedLessons, currentTopic!])];
      const levelConfig = LEVELS.find(l => l.id === activeLevel)!;
      const allTopicsDone = levelConfig.topics.every(t => newCompleted.includes(t));
      let newCerts = prev.certificates;
      if (allTopicsDone && !prev.certificates.includes(activeLevel) && finalScore >= 70) {
        newCerts = [...prev.certificates, activeLevel];
      }
      return {
        ...prev,
        completedLessons: newCompleted,
        certificates: newCerts,
        scores: { ...prev.scores, [currentTopic!]: Math.max(prev.scores[currentTopic!] || 0, finalScore) }
      };
    });
  };

  const renderDashboard = () => {
    const currentLevelConfig = LEVELS.find(l => l.id === activeLevel)!;
    return (
      <div className={`w-full space-y-12 animate-in fade-in duration-700 pb-24 px-4 ${viewMode === 'desktop' ? 'max-w-6xl mx-auto' : ''}`}>
        <header className="text-center py-12 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-100 font-bold text-sm">
              <ShieldCheck size={18} /> بَرْنَامَجُ الِاجْتِيَازِ الأَكَادِيمِيِّ v2.0
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 font-serif-arabic">الأَكَادِيمِيَّةُ المَالِكِيَّةُ</h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-xl font-serif-arabic italic leading-relaxed">"عَلَى خُطَى الصَّحَابَةِ وَالسَّلَفِ الصَّالِحِ فِي العَقِيدَةِ، وَعَلَى مَذْهَبِ إِمَامِ دَارِ الهِجْرَةِ فِي الفِقْهِ"</p>
        </header>

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

          {/* Author Bio Section in Dashboard */}
          <div className="mb-12 bg-amber-50/40 p-6 rounded-3xl border border-amber-100 flex gap-4 items-start shadow-sm">
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

  const renderLesson = () => {
    if (!lessonContent) return null;
    return (
      <div className={`max-w-4xl mx-auto py-12 space-y-12 animate-in slide-in-from-bottom duration-700 px-4 ${viewMode === 'desktop' ? 'max-w-5xl' : ''}`}>
        <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-slate-700 hover:text-emerald-700 transition-colors font-bold font-serif-arabic"><ArrowRight size={20} /> العَوْدَةُ لِلْمَنْهَجِ</button>
        <article className="bg-white rounded-[3rem] p-8 md:p-16 shadow-2xl border border-slate-50 space-y-12">
          <header className="text-center space-y-4">
             <h1 className="text-3xl md:text-4xl font-black font-serif-arabic text-slate-900 leading-tight">{lessonContent.title}</h1>
             <div className="h-1 w-24 bg-emerald-600 mx-auto rounded-full"></div>
          </header>
          
          <div className="bg-amber-50/50 p-8 rounded-[2rem] border-2 border-amber-100 text-2xl md:text-3xl font-serif-arabic text-center leading-[2.2] font-black text-amber-950 whitespace-pre-wrap">
            {lessonContent.matn}
          </div>

          <div className="space-y-10">
            <section className="space-y-6">
              <h3 className="text-2xl font-black text-emerald-900 font-serif-arabic border-r-8 border-emerald-600 pr-4">شَرْحُ المَسَائِلِ</h3>
              <p className="text-xl leading-[2.4] font-serif-arabic text-slate-900 text-justify whitespace-pre-line">{lessonContent.body}</p>
            </section>

            <section className="bg-blue-50/30 p-8 rounded-[2rem] border border-blue-100 space-y-6">
              <h3 className="text-xl font-black text-blue-900 font-serif-arabic flex items-center gap-2"><Lightbulb /> أَمْثِلَةٌ تَطْبِيقِيَّةٌ</h3>
              <ul className="space-y-4">
                {lessonContent.detailedExamples.map((ex, i) => <li key={i} className="text-lg font-serif-arabic text-slate-900 bg-white p-4 rounded-xl shadow-sm border-r-4 border-blue-400 font-bold">{ex}</li>)}
              </ul>
            </section>

            <section className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
              <h3 className="text-xl font-black text-slate-900 font-serif-arabic flex items-center gap-2"><Layers /> مَسَائِلُ مُهِمَّةٌ</h3>
              <div className="space-y-4">
                {lessonContent.fiqhIssues.map((issue, i) => <div key={i} className="flex gap-4 items-start"><span className="bg-emerald-600 text-white w-6 h-6 rounded flex items-center justify-center text-xs shrink-0 mt-1">{i+1}</span><p className="text-lg font-serif-arabic text-slate-900 font-bold">{issue}</p></div>)}
              </div>
            </section>

            <section className="bg-amber-50/30 p-8 rounded-[2rem] border border-amber-100 space-y-6">
              <h3 className="text-xl font-black text-amber-900 font-serif-arabic flex items-center gap-2"><MessageSquareQuote /> أَحَاجِي وَأَلْغَازٌ ذَكِيَّةٌ</h3>
              <div className="space-y-6">
                {lessonContent.fiqhRiddles.map((riddle, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100">
                    <p className="text-lg font-serif-arabic text-slate-900 font-bold italic mb-4">"{riddle.riddle}"</p>
                    <button 
                      onClick={() => setShowRiddleAnswers(prev => ({...prev, [i]: !prev[i]}))}
                      className="text-amber-800 text-sm font-bold hover:underline mb-2 block"
                    >
                      {showRiddleAnswers[i] ? 'إِخْفَاءُ الجَوَابِ' : 'كَشْفُ الجَوَابِ'}
                    </button>
                    {showRiddleAnswers[i] && (
                      <div className="p-4 bg-amber-50 rounded-xl text-lg font-serif-arabic text-amber-950 font-bold animate-in fade-in slide-in-from-top-2">
                        {riddle.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-50/20 p-6 rounded-3xl border border-emerald-100">
                <h4 className="font-black text-emerald-900 mb-2 font-serif-arabic">الأَدِلَّةُ وَالِاسْتِنْبَاطُ:</h4>
                <p className="text-lg font-serif-arabic text-slate-900 leading-relaxed font-bold">{lessonContent.evidence}</p>
              </div>
              <div className="bg-amber-50/20 p-6 rounded-3xl border border-amber-100">
                <h4 className="font-black text-amber-900 mb-2 font-serif-arabic">الخِلَافُ العَالِي:</h4>
                <p className="text-lg font-serif-arabic text-slate-900 leading-relaxed font-bold">{lessonContent.comparativeFiqh}</p>
              </div>
            </div>

            <section className="pt-8 border-t border-slate-100">
               <h3 className="text-sm font-black text-slate-500 mb-4 font-serif-arabic italic flex items-center gap-2"><Library size={16} /> مَرَاجِعُ المَسَاقِ:</h3>
               <div className="flex flex-wrap gap-2">
                 {lessonContent.references.map((ref, i) => (
                   <span key={i} className="bg-white text-slate-800 px-3 py-1 rounded-lg text-xs font-bold border border-slate-300">📚 {ref}</span>
                 ))}
               </div>
            </section>
          </div>

          <button onClick={() => { setView('quiz'); window.scrollTo(0,0); }} className="w-full py-6 bg-emerald-700 text-white rounded-[2rem] font-black text-2xl hover:bg-emerald-800 shadow-xl transition-all font-serif-arabic active:scale-95">الِامْتِحَانُ التَّقْوِيمِيُّ <ArrowRight className="inline mr-2" /></button>
        </article>
      </div>
    );
  };

  const renderQuiz = () => {
    if (!lessonContent) return null;
    return (
      <div className="max-w-3xl mx-auto py-12 space-y-12 px-4 animate-in zoom-in duration-500">
        <h2 className="text-4xl font-black text-center font-serif-arabic text-slate-900">تَقْوِيمُ المَلَكَةِ الفِقْهِيَّةِ</h2>
        <div className="space-y-8">
          {lessonContent.quiz.map((q, qIdx) => (
            <div key={qIdx} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200 space-y-8">
              <h4 className="font-bold text-2xl text-slate-900 font-serif-arabic leading-relaxed">
                <span className="text-emerald-700 ml-2 font-black">{qIdx + 1}.</span> {q.question}
              </h4>
              <div className="grid gap-3">
                {q.options.map((opt, oIdx) => (
                  <button 
                    key={oIdx} 
                    disabled={quizScore !== null} 
                    onClick={() => setSelectedAnswers(p => ({...p, [qIdx]: oIdx}))} 
                    className={`w-full text-right p-5 rounded-2xl border-2 transition-all font-black text-xl font-serif-arabic ${
                      quizScore !== null 
                      ? (q.correctAnswer === oIdx 
                          ? 'border-emerald-600 bg-emerald-100 text-emerald-950 shadow-md ring-2 ring-emerald-400' 
                          : selectedAnswers[qIdx] === oIdx 
                            ? 'border-red-600 bg-red-100 text-red-950' 
                            : 'border-slate-100 text-slate-400 opacity-60'
                        ) 
                      : (selectedAnswers[qIdx] === oIdx 
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500 shadow-lg' 
                          : 'border-slate-200 bg-slate-50 text-slate-900 hover:border-emerald-400 hover:bg-white'
                        )
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {quizScore !== null && (
                <div className="p-6 bg-slate-900 text-white rounded-2xl font-serif-arabic text-xl leading-relaxed animate-in fade-in slide-in-from-top-4 shadow-lg">
                  <strong className="text-emerald-400 block mb-2 text-2xl">تَعْلِيقُ الشَّيْخِ:</strong> 
                  <p className="font-bold opacity-100">{q.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {quizScore === null ? (
          <button 
            onClick={submitQuiz} 
            disabled={Object.keys(selectedAnswers).length < lessonContent.quiz.length} 
            className="w-full py-8 bg-slate-900 text-white rounded-[2rem] font-black text-3xl shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed transition-all font-serif-arabic active:scale-95"
          >
            إِرْسَالُ الإِجَابَاتِ لِلتَّقْيِيمِ
          </button>
        ) : (
          <div className="flex flex-col gap-6">
             <div className={`p-10 rounded-[2.5rem] text-center text-white shadow-2xl ${quizScore >= 70 ? 'bg-emerald-700' : 'bg-red-700'}`}>
                <h3 className="text-7xl font-black mb-4">{quizScore}%</h3>
                <p className="text-3xl font-serif-arabic font-bold">
                  {quizScore >= 70 ? 'مُبَارَكٌ! لَقَدْ أَجَزْتَ هَذَا المَسَاقَ بِنَجَاحٍ.' : 'تَحْتَاجُ إِلَى إِعَادَةِ النَّظَرِ فِي هَذَا الدَّرْسِ.'}
                </p>
             </div>
             <button 
                onClick={() => { setView('dashboard'); window.scrollTo(0,0); }} 
                className="w-full py-8 bg-slate-900 text-white rounded-[2rem] font-black text-3xl font-serif-arabic hover:bg-black transition-all shadow-xl"
             >
                العَوْدَةُ لِلْخِطَّةِ الدِّرَاسِيَّةِ
             </button>
          </div>
        )}
      </div>
    );
  };

  const renderCertificate = () => {
    const lastCertId = progress.certificates[progress.certificates.length-1];
    const certLvl = LEVELS.find(l => l.id === lastCertId);
    if (!certLvl) return <div className="text-center py-20 font-serif-arabic text-3xl text-slate-900 font-bold">لَمْ تَجْتَزْ أَيَّ مُسْتَوًى بَعْدُ.</div>;
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center space-y-12">
        <div className="bg-white p-16 md:p-24 border-[25px] border-amber-900/10 shadow-3xl font-serif-arabic rounded-3xl relative overflow-hidden border-double">
          <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none text-slate-900"><Scale size={600} /></div>
          <div className="flex justify-between items-start mb-12 relative z-10">
             <div className="text-right text-sm text-amber-900 font-black">المَمْلَكَةُ المَغْرِبِيَّةُ<br/>الأَكَادِيمِيَّةُ المَالِكِيَّةُ</div>
             <div className="w-24 h-24 bg-amber-50 rounded-full border-4 border-amber-800 flex items-center justify-center mx-auto md:mx-0 shadow-inner"><GraduationCap size={40} className="text-amber-800" /></div>
             <div className="text-left text-sm text-slate-800 font-black">الرقم: ACAD-{Math.floor(Math.random()*9999)}<br/>{new Date().toLocaleDateString('ar-SA')}</div>
          </div>
          <h1 className="text-7xl font-black text-slate-900 mb-8 tracking-tight">إِجَازَةٌ عِلْمِيَّةٌ</h1>
          <p className="text-3xl text-slate-800 mb-12 font-bold italic">نَشْهَدُ بِأَنَّ الطَّالِبَ قَدْ نَالَ شَرَفَ إِتْقَانِ:</p>
          <div className="py-10 bg-amber-50 rounded-[2rem] border-4 border-amber-200 mb-12 shadow-inner"><span className="text-5xl font-black text-amber-950 tracking-wide">{certLvl.title}</span></div>
          <p className="text-2xl text-slate-800 mb-12 font-bold">بِتَقْدِيرِ: <span className="text-emerald-800 font-black text-3xl">مُمْتَازٍ مَعَ مَرْتَبَةِ الشَّرَفِ</span></p>
          <div className="flex justify-between items-end mt-24 px-10">
            <div className="text-center"><div className="w-40 h-1 bg-amber-900/30 mb-2"></div><p className="font-black text-slate-900 text-xl">تَوْقِيعُ العَمِيدِ</p></div>
            <div className="text-center"><div className="w-40 h-1 bg-amber-900/30 mb-2"></div><p className="font-black text-slate-900 text-xl">خَتْمُ الأَكَادِيمِيَّةِ</p></div>
          </div>
        </div>
        <div className="flex gap-4 justify-center no-print">
          <button onClick={() => window.print()} className="px-12 py-6 bg-emerald-800 text-white rounded-full font-black text-2xl font-serif-arabic shadow-xl hover:bg-emerald-900 transition-all active:scale-95">طِبَاعَةُ الوَثِيقَةِ</button>
          <button onClick={() => { setView('dashboard'); window.scrollTo(0,0); }} className="px-12 py-6 bg-slate-900 text-white rounded-full font-black text-2xl font-serif-arabic shadow-xl hover:bg-black transition-all">الرُّجُوعُ لِلرَّئِيسِيَّةِ</button>
        </div>
      </div>
    );
  };

  const renderLibrary = () => {
    const filteredBooks = LIBRARY_ITEMS.filter(book => 
      book.title.includes(searchTerm) || 
      book.author.includes(searchTerm) ||
      book.description.includes(searchTerm)
    );

    if (selectedBook) {
      return (
        <div className="max-w-4xl mx-auto py-12 px-4 animate-in slide-in-from-left duration-500 pb-48">
          <button onClick={() => setSelectedBook(null)} className="flex items-center gap-2 text-slate-700 hover:text-amber-800 mb-8 font-bold font-serif-arabic transition-colors"><ArrowRight size={20} /> العَوْدَةُ لِلْمَكْتَبَةِ</button>
          
          <div className="bg-white rounded-[3rem] shadow-3xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="bg-[#3d2b1f] p-12 text-center space-y-4 shadow-lg">
              <h1 className="text-4xl md:text-5xl font-black text-amber-50 font-serif-arabic">{selectedBook.title}</h1>
              <p className="text-amber-200 text-xl font-bold">{selectedBook.author}</p>
              <div className="inline-block px-4 py-1 bg-amber-900 text-amber-100 rounded-full text-sm font-black border border-amber-800/50">{selectedBook.category}</div>
            </div>

            {/* Info Tabs Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-8 bg-amber-50/30 border-b border-amber-100">
               <div className="bg-white p-6 rounded-3xl shadow-sm border border-amber-100 space-y-3">
                  <h3 className="flex items-center gap-2 font-black text-amber-900 font-serif-arabic text-xl"><User size={20} /> تَرْجَمَةُ المُؤَلِّفِ</h3>
                  <p className="text-sm font-serif-arabic text-slate-800 leading-relaxed font-bold italic">{selectedBook.authorBio}</p>
               </div>
               <div className="bg-white p-6 rounded-3xl shadow-sm border border-amber-100 space-y-3">
                  <h3 className="flex items-center gap-2 font-black text-amber-900 font-serif-arabic text-xl"><ShoppingBag size={20} /> أَحْسَنُ طَبْعَةٍ فِي السُّوقِ</h3>
                  <p className="text-sm font-serif-arabic text-emerald-900 leading-relaxed font-black">{selectedBook.recommendedEdition}</p>
                  <div className="text-[10px] text-slate-500 font-bold">💡 يُنْصَحُ بِهَذِهِ الطَّبْعَةِ لِطَالِبِ العِلْمِ لِدِقَّتِهَا وَتَحْقِيقِهَا.</div>
               </div>
            </div>

            <div className="p-8 md:p-16 space-y-12">
              <div className="bg-amber-50/50 p-8 rounded-[2rem] border-2 border-amber-100 font-serif-arabic text-2xl md:text-3xl leading-[2.5] text-[#2d1e12] whitespace-pre-line text-justify shadow-inner">
                {selectedBook.content}
              </div>
              
              <div className="bg-slate-50 p-6 rounded-2xl border-r-4 border-amber-800 flex gap-4 items-start">
                <Info className="text-amber-800 shrink-0 mt-1" />
                <div>
                  <h4 className="font-black text-amber-900 mb-2 font-serif-arabic">عَنْ هَذَا المَتْنِ:</h4>
                  <p className="text-lg text-[#3d2b1f] font-serif-arabic font-bold leading-relaxed">{selectedBook.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full space-y-12 animate-in fade-in duration-700 pb-32 px-4">
        <header className="text-center py-12 space-y-6">
          <h1 className="text-5xl md:text-6xl font-black text-[#2d1e12] font-serif-arabic">المَكْتَبَةُ الرَّقْمِيَّةُ</h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-xl font-serif-arabic leading-relaxed">"مُسْتَوْدَعُ المَتُونِ وَالأُمَّهَاتِ لِطَالِبِ العِلْمِ المُجْتَهِدِ"</p>
          
          <div className="max-w-xl mx-auto relative group">
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-800 transition-colors" size={24} />
            <input 
              type="text" 
              placeholder="ابْحَثْ عَنْ مَتْنٍ، مُؤَلِّفٍ، أَوْ مَوْضُوعٍ..."
              className="w-full py-5 pr-16 pl-8 rounded-full border-2 border-slate-200 focus:border-amber-700 focus:ring-4 focus:ring-amber-50 outline-none text-xl font-serif-arabic transition-all shadow-lg bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {filteredBooks.map(book => (
            <div 
              key={book.id} 
              onClick={() => setSelectedBook(book)}
              className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 hover:border-amber-700 hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -mr-16 -mt-16 group-hover:bg-amber-100 transition-colors opacity-50"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-amber-800 text-amber-50 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:rotate-6 transition-transform">
                  <ScrollText size={30} />
                </div>
                <h3 className="text-2xl font-black text-[#2d1e12] font-serif-arabic mb-3 leading-tight group-hover:text-amber-900 transition-colors">{book.title}</h3>
                <p className="text-amber-800 font-black text-sm mb-4 font-serif-arabic">{book.author}</p>
                <p className="text-slate-600 text-base font-serif-arabic line-clamp-3 leading-relaxed mb-6 italic">"{book.description}"</p>
              </div>
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-amber-50">
                <span className="text-xs font-black px-4 py-1 bg-amber-50 text-amber-900 rounded-full border border-amber-100">{book.category}</span>
                <span className="flex items-center gap-1 text-amber-800 font-black text-sm group-hover:gap-2 transition-all">تَصَفَّحِ المَتْنَ <ChevronRight size={16}/></span>
              </div>
            </div>
          ))}
          
          {filteredBooks.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-4">
              <FileText size={64} className="mx-auto text-slate-200" />
              <p className="text-2xl font-serif-arabic text-slate-400 font-bold">لَمْ نَعْثُرْ عَلَى هَذَا المَصْدَرِ فِي خِزَانَتِنَا بَعْدُ.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="fixed inset-0 bg-white/98 flex flex-col items-center justify-center z-[200] text-center p-6">
      <div className="w-28 h-28 border-[14px] border-emerald-50 border-t-emerald-700 rounded-full animate-spin mb-10 shadow-2xl"></div>
      <h3 className="text-4xl font-black text-slate-900 font-serif-arabic mb-4">جَارِي اسْتِحْضَارُ المَسَائِلِ...</h3>
      <p className="text-slate-600 font-serif-arabic italic text-2xl font-bold">"العِلْمُ صَيْدٌ وَالكِتَابَةُ قَيْدُهُ"</p>
    </div>
  );

  return (
    <main className="min-h-screen pb-48 bg-[#fafaf9] transition-all duration-500">
      <style>{`
        @media print { .no-print { display: none !important; } }
        .font-serif-arabic { font-family: 'Amiri', serif; }
        body { font-family: 'Noto Kufi Arabic', sans-serif; overflow-x: hidden; color: #0f172a; }
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #059669; border-radius: 10px; }
        .shadow-3xl { box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3); }
      `}</style>
      
      <div className="max-w-[1400px] mx-auto">
        {view === 'dashboard' && renderDashboard()}
        {view === 'lesson' && renderLesson()}
        {view === 'quiz' && renderQuiz()}
        {view === 'certificate' && renderCertificate()}
        {view === 'library' && renderLibrary()}
      </div>
      
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-[150] no-print w-full max-w-lg px-4">
        <div className="text-slate-800 font-serif-arabic text-xl font-black bg-white/40 backdrop-blur-sm px-6 py-1 rounded-full border border-white/20 shadow-sm animate-pulse">
          تَصْمِيمُ: أَبُو سُلَيْمَانَ صَلَاحُ الدِّينِ المخانت
        </div>
        <nav className="bg-white/95 backdrop-blur-2xl border-2 border-slate-200 py-4 px-10 flex justify-around gap-12 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-4 ring-white/50 w-full">
          <button 
            onClick={() => { setView('dashboard'); window.scrollTo(0,0); setSelectedBook(null); }} 
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${view === 'dashboard' ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-blue-500'}`}
          >
            <BarChart3 size={28} />
            <span className="text-[10px] font-black font-serif-arabic">المَنْهَجُ</span>
          </button>
          
          <button 
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${view === 'library' ? 'text-amber-900 scale-110' : 'text-slate-400 hover:text-amber-800'}`}
            onClick={() => { setView('library'); window.scrollTo(0,0); setSelectedBook(null); }}
          >
            <BookMarked size={28} />
            <span className="text-[10px] font-black font-serif-arabic">المَكْتَبَةُ</span>
          </button>

          <button 
            onClick={() => setViewMode(prev => prev === 'responsive' ? 'desktop' : 'responsive')}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${viewMode === 'desktop' ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-indigo-500'}`}
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
