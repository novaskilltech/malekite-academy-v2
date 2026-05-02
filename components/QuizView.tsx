import React from 'react';
import { 
  Trophy, 
  RotateCcw, 
  Home, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useStore } from '../store';

export const QuizView: React.FC = () => {
  const { 
    lessonContent, 
    quizScore, 
    selectedAnswers, 
    setSelectedAnswers, 
    submitQuiz, 
    setView 
  } = useStore();

  if (!lessonContent) return null;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-slate-900 font-serif-arabic mb-2">اخْتِبَارُ المَعْلُومَاتِ</h2>
        <p className="text-slate-500 font-serif-arabic text-xl italic font-bold">"فَاسْأَلُوا أَهْلَ الذِّكْرِ إِنْ كُنْتُمْ لَا تَعْلَمُونَ"</p>
      </div>

      {quizScore === null ? (
        <div className="space-y-8">
          {lessonContent.quiz.map((q, idx) => (
            <div key={idx} className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-slate-100 transform transition-all">
              <h4 className="text-2xl font-black text-slate-900 mb-8 font-serif-arabic leading-relaxed flex gap-4">
                <span className="w-10 h-10 shrink-0 bg-emerald-600 text-white rounded-full flex items-center justify-center text-lg">{idx + 1}</span>
                {q.question}
              </h4>
              <div className="grid grid-cols-1 gap-4">
                {q.options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => setSelectedAnswers(prev => ({ ...prev, [idx]: optIdx }))}
                    className={`p-6 rounded-3xl text-right font-black transition-all font-serif-arabic text-xl border-2 ${
                      selectedAnswers[idx] === optIdx
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg scale-[1.02]'
                        : 'bg-slate-50 text-slate-700 border-transparent hover:border-emerald-200 hover:bg-white'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={submitQuiz}
            disabled={Object.keys(selectedAnswers).length < lessonContent.quiz.length}
            className="w-full py-8 bg-emerald-700 text-white font-black rounded-[2.5rem] shadow-2xl hover:bg-emerald-800 transition-all disabled:opacity-50 disabled:grayscale text-3xl font-serif-arabic flex items-center justify-center gap-4 group"
          >
            تَصْحِيحُ الإِجَابَاتِ <ChevronRight className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      ) : (
        <div className="text-center space-y-12 animate-in zoom-in duration-700">
          <div className={`p-16 rounded-[4rem] shadow-3xl border-8 inline-block relative ${quizScore >= 70 ? 'bg-emerald-50 border-emerald-500' : 'bg-rose-50 border-rose-500'}`}>
            <div className={`absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full flex items-center justify-center shadow-xl ${quizScore >= 70 ? 'bg-emerald-500' : 'bg-rose-500'}`}>
              <Trophy size={48} className="text-white" />
            </div>
            <p className="text-7xl font-black text-slate-900 mb-2">{quizScore}%</p>
            <p className={`text-3xl font-black font-serif-arabic ${quizScore >= 70 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {quizScore >= 70 ? 'نَجَاحٌ مُبَارَكٌ' : 'حَاوِلْ مَرَّةً أُخْرَى'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 text-right max-w-2xl mx-auto">
             {lessonContent.quiz.map((q, idx) => (
               <div key={idx} className={`p-6 rounded-3xl border-2 flex items-center justify-between gap-6 ${selectedAnswers[idx] === q.correctAnswer ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                 <div className="flex-1">
                   <p className="font-bold text-lg font-serif-arabic mb-2">{q.question}</p>
                   <p className="text-sm font-black text-slate-600 font-serif-arabic">
                     الإِجَابَةُ الصَّحِيحَةُ: <span className="text-emerald-700">{q.options[q.correctAnswer]}</span>
                   </p>
                 </div>
                 {selectedAnswers[idx] === q.correctAnswer ? <CheckCircle2 className="text-emerald-600 shrink-0" /> : <XCircle className="text-rose-600 shrink-0" />}
               </div>
             ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pb-24">
            <button
              onClick={() => { setView('dashboard'); window.scrollTo(0,0); }}
              className="px-12 py-5 bg-slate-900 text-white font-black rounded-3xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 text-xl font-serif-arabic"
            >
              <Home size={24} /> العَوْدَةُ لِلرَّئِيسِيَّةِ
            </button>
            {quizScore < 70 && (
              <button
                onClick={() => setView('lesson')}
                className="px-12 py-5 bg-amber-600 text-white font-black rounded-3xl shadow-xl hover:bg-amber-700 transition-all flex items-center justify-center gap-3 text-xl font-serif-arabic"
              >
                <RotateCcw size={24} /> مُرَاجَعَةُ الدَّرْسِ
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
