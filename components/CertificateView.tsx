import React from 'react';
import { 
  ArrowLeft, 
  Award, 
  Download, 
  Printer, 
  ShieldCheck,
  Star,
  BookOpen
} from 'lucide-react';
import { LEVELS } from '../constants';
import { useStore } from '../store';

export const CertificateView: React.FC = () => {
  const { progress, setView } = useStore();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-in fade-in slide-in-from-top duration-700 pb-24 px-4 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 py-8 mb-8 no-print">
        <button onClick={() => setView('dashboard')} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-600 hover:text-emerald-600 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-3xl font-black text-slate-900 font-serif-arabic">سِجِلُّ الإِنْجَازَاتِ الأَكَادِيمِيَّةِ</h2>
      </div>

      {progress.certificates.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-20 text-center space-y-8 border-4 border-dashed border-slate-200 shadow-inner">
           <div className="w-32 h-32 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
             <Award size={64} />
           </div>
           <div className="space-y-4">
             <h3 className="text-3xl font-black text-slate-400 font-serif-arabic">لَا تُوجَدُ شَهَادَاتٌ بَعْدُ</h3>
             <p className="text-slate-500 font-serif-arabic text-xl italic font-bold">"اجْتَهِدْ فِي دُرُوسِكَ لِتَنَالَ شَرَفَ الإِجَازَةِ"</p>
           </div>
           <button onClick={() => setView('dashboard')} className="px-12 py-5 bg-emerald-600 text-white font-black rounded-3xl shadow-xl hover:bg-emerald-700 transition-all font-serif-arabic text-xl">
             ابْدَأِ التَّعَلُّمَ الآنَ
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-12">
          {progress.certificates.map((certId) => {
            const level = LEVELS.find(l => l.id === certId)!;
            return (
              <div key={certId} className="certificate-container group relative">
                <div className="absolute -inset-4 bg-emerald-600/20 rounded-[4rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 no-print"></div>
                
                {/* Visual Certificate */}
                <div className="bg-white border-[20px] border-emerald-900 p-12 md:p-20 rounded-lg shadow-2xl relative overflow-hidden aspect-[1.414/1]">
                  {/* Ornaments */}
                  <div className="absolute top-0 left-0 w-40 h-40 border-l-[10px] border-t-[10px] border-amber-500 opacity-30"></div>
                  <div className="absolute top-0 right-0 w-40 h-40 border-r-[10px] border-t-[10px] border-amber-500 opacity-30"></div>
                  <div className="absolute bottom-0 left-0 w-40 h-40 border-l-[10px] border-b-[10px] border-amber-500 opacity-30"></div>
                  <div className="absolute bottom-0 right-0 w-40 h-40 border-r-[10px] border-b-[10px] border-amber-500 opacity-30"></div>
                  
                  <div className="text-center space-y-12 relative z-10">
                    <div className="flex justify-center mb-8">
                      <div className="w-32 h-32 bg-emerald-900 text-amber-500 rounded-full flex items-center justify-center border-4 border-amber-500 shadow-2xl ring-8 ring-emerald-900">
                        <Award size={64} />
                      </div>
                    </div>
                    
                    <h1 className="text-6xl font-black text-slate-900 font-serif-arabic tracking-widest">إِجَازَةٌ أَكَادِيمِيَّةٌ</h1>
                    
                    <div className="space-y-6">
                      <p className="text-2xl font-serif-arabic text-slate-600 font-bold italic">نَشْهَدُ أَنَّ الطَّالِبَ قَدْ أَتَمَّ بِنَجَاحٍ مَسَاقَ:</p>
                      <h2 className="text-5xl font-black text-emerald-900 font-serif-arabic py-4 border-y-2 border-emerald-100 inline-block px-12">{level.title}</h2>
                    </div>

                    <p className="text-2xl font-serif-arabic text-slate-700 max-w-3xl mx-auto leading-loose font-bold italic">
                      "وَبِذَلِكَ اسْتَحَقَّ هَذِهِ الشَّهَادَةَ تَقْدِيرًا لِجُهْدِهِ فِي تَحْصِيلِ عُلُومِ فِقْهِ الإِمَامِ مَالِكٍ، سَائِلِينَ اللهَ لَهُ التَّوْفِيقَ وَالسَّدَادَ."
                    </p>

                    <div className="pt-12 flex justify-between items-end border-t border-slate-100">
                      <div className="text-right space-y-2">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">التَّارِيخُ</p>
                        <p className="text-xl font-black text-slate-900 font-serif-arabic">{new Date().toLocaleDateString('ar-SA')}</p>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <ShieldCheck size={80} className="text-emerald-900 opacity-20 mb-2" />
                        <p className="text-xs font-black text-slate-400 font-serif-arabic">خَتْمُ الأَكَادِيمِيَّةِ</p>
                      </div>

                      <div className="text-left space-y-2">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">تَوْقِيعُ العَمِيدِ</p>
                        <p className="text-2xl font-serif-arabic font-black text-emerald-900 italic underline decoration-amber-500 underline-offset-8">أَبُو سُلَيْمَانَ</p>
                      </div>
                    </div>
                  </div>

                  {/* Watermark */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-[-30deg] pointer-events-none whitespace-nowrap text-[200px] font-black font-serif-arabic">
                    أَكَادِيمِيَّةُ مَالِكٍ
                  </div>
                </div>

                <div className="mt-8 flex justify-center gap-6 no-print">
                   <button onClick={handlePrint} className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-slate-800 transition-all flex items-center gap-3 font-serif-arabic text-xl">
                     <Printer size={20} /> طِبَاعَةُ الشَّهَادَةِ
                   </button>
                   <button className="px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl hover:bg-emerald-700 transition-all flex items-center gap-3 font-serif-arabic text-xl">
                     <Download size={20} /> تَحْمِيلُ (PDF)
                   </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats Section */}
      <div className="mt-20 no-print grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100 flex items-center gap-6">
           <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
             <Star size={32} />
           </div>
           <div>
             <p className="text-slate-500 text-sm font-bold">إِجْمَالِي النُّقَاطِ</p>
             <p className="text-3xl font-black text-slate-900">{Object.values(progress.scores).reduce((a, b) => a + b, 0)}</p>
           </div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100 flex items-center gap-6">
           <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
             <BookOpen size={32} />
           </div>
           <div>
             <p className="text-slate-500 text-sm font-bold">المَسَاقَاتُ المُنْتَهِيَةُ</p>
             <p className="text-3xl font-black text-slate-900">{progress.completedLessons.length}</p>
           </div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100 flex items-center gap-6">
           <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
             <Award size={32} />
           </div>
           <div>
             <p className="text-slate-500 text-sm font-bold">الشَّهَادَاتُ</p>
             <p className="text-3xl font-black text-slate-900">{progress.certificates.length}</p>
           </div>
         </div>
      </div>
    </div>
  );
};
