import React from 'react';
import { 
  ArrowLeft, 
  Search, 
  Book, 
  ExternalLink,
  ChevronRight,
  Library,
  Star
} from 'lucide-react';
import { LIBRARY_ITEMS } from '../constants';
import { useStore } from '../store';

export const LibraryView: React.FC = () => {
  const { 
    selectedBook, 
    setSelectedBook, 
    searchTerm, 
    setSearchTerm 
  } = useStore();

  const filteredLibrary = LIBRARY_ITEMS.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [isReading, setIsReading] = React.useState(false);

  return (
    <div className="animate-in fade-in slide-in-from-right duration-700 pb-24 px-4 max-w-6xl mx-auto">
      {/* ... existing header ... */}
      <header className="py-12 space-y-8 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2 bg-amber-50 text-amber-900 rounded-full border border-amber-100 font-bold text-sm">
          <Library size={18} /> خِزَانَةُ التُّرَاثِ المَالِكِيِّ
        </div>
        <h2 className="text-5xl font-black text-slate-900 font-serif-arabic tracking-tight">المَكْتَبَةُ الشَّامِلَةُ</h2>
        <p className="text-slate-500 font-serif-arabic text-xl italic font-bold">"كُلُّ عِزٍّ لَمْ يُؤَكَّدْ بِعِلْمٍ فَإِلَى ذُلٍّ مَا يَصِيرُ"</p>
        
        {!selectedBook && (
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none">
              <Search className="text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={24} />
            </div>
            <input
              type="text"
              placeholder="ابْحَثْ عَنْ كِتَابٍ، مُؤَلِّفٍ، أَوْ مَوْضُوعٍ..."
              className="w-full h-16 bg-white border-2 border-slate-100 rounded-3xl pr-16 pl-8 text-xl font-serif-arabic focus:outline-none focus:border-emerald-500 focus:shadow-2xl transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </header>

      {!selectedBook ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredLibrary.map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => { setSelectedBook(item); setIsReading(false); }}
              className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-lg hover:shadow-2xl hover:border-emerald-100 transition-all cursor-pointer group flex flex-col justify-between h-full relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-emerald-600/10"></div>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    <Book size={28} />
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={14} fill="currentColor" />
                    <span className="text-xs font-black">نَادِرٌ</span>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 font-serif-arabic leading-relaxed group-hover:text-emerald-800 transition-colors">{item.title}</h3>
                <p className="text-slate-500 font-serif-arabic text-sm font-bold">المُؤَلِّفُ: <span className="text-slate-900">{item.author}</span></p>
                <p className="text-slate-600 font-serif-arabic leading-relaxed line-clamp-3 text-lg italic">{item.description}</p>
              </div>
              <div className="pt-8 flex items-center gap-2 text-emerald-600 font-black text-sm group-hover:translate-x-2 transition-transform">
                اسْتِعْرَاضُ الكِتَابِ <ChevronRight size={16} />
              </div>
            </div>
          ))}
        </div>
      ) : isReading ? (
        <div className="bg-white rounded-[3rem] shadow-2xl border-4 border-emerald-600 overflow-hidden animate-in slide-in-from-bottom duration-500 min-h-[600px]">
          <div className="bg-slate-900 p-6 flex justify-between items-center text-white sticky top-0 z-50">
            <button onClick={() => setIsReading(false)} className="flex items-center gap-2 font-black font-serif-arabic text-emerald-400 hover:text-emerald-300">
              <ArrowLeft size={20} /> العَوْدَةُ لِتَفَاصِيلِ الكِتَابِ
            </button>
            <h3 className="text-xl font-black font-serif-arabic">{selectedBook.title}</h3>
          </div>
          <div className="p-10 md:p-20 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] bg-amber-50/20">
            <div className="max-w-4xl mx-auto space-y-12">
               <div className="text-center space-y-4 mb-20 border-b-2 border-emerald-100 pb-12">
                  <h1 className="text-5xl md:text-6xl font-black text-slate-900 font-serif-arabic leading-tight">{selectedBook.title}</h1>
                  <p className="text-3xl text-emerald-800 font-serif-arabic font-bold italic">{selectedBook.author}</p>
               </div>
               <div className="text-xl md:text-2xl text-slate-900 font-serif-arabic leading-[3] text-justify whitespace-pre-wrap selection:bg-emerald-200">
                  {selectedBook.content}
               </div>
               <div className="pt-20 text-center text-slate-400 font-serif-arabic italic border-t border-slate-100">
                  تَمَّتِ المَادَّةُ المَنْقُولَةُ بِحَمْدِ اللهِ
               </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in duration-500">
          <div className="p-8 md:p-16 space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <button onClick={() => setSelectedBook(null)} className="p-4 bg-slate-50 rounded-2xl text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-2 font-black font-serif-arabic">
                <ArrowLeft size={24} /> العَوْدَةُ لِلْمَكْتَبَةِ
              </button>
              <div className="flex gap-4">
                <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full font-black text-sm border border-emerald-100 uppercase tracking-tighter">PDF جَاهِزٌ</span>
                <span className="px-4 py-2 bg-amber-50 text-amber-700 rounded-full font-black text-sm border border-amber-100 uppercase tracking-tighter">مُحَقَّقٌ</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              <div className="lg:col-span-4 space-y-8">
                 <div className="aspect-[3/4] bg-slate-100 rounded-[2.5rem] shadow-inner flex flex-col items-center justify-center p-12 text-center space-y-6 border-4 border-white border-dashed ring-8 ring-slate-50">
                    <Book size={80} className="text-slate-300" />
                    <p className="text-slate-400 font-serif-arabic font-bold italic">غِلَافُ الكِتَابِ غَيْرُ مُتَوَفِّرٍ حَالِيًّا</p>
                 </div>
                 <div className="space-y-4">
                    <button 
                      onClick={() => { setIsReading(true); window.scrollTo(0,0); }} 
                      className="w-full py-5 bg-emerald-600 text-white font-black rounded-3xl shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 text-xl font-serif-arabic shadow-emerald-200"
                    >
                      <Book size={24} /> ابْدَأِ القِرَاءَةَ الآنَ
                    </button>
                 </div>
              </div>

              <div className="lg:col-span-8 space-y-8">
                <div className="space-y-4">
                  <h3 className="text-5xl font-black text-slate-900 font-serif-arabic leading-tight">{selectedBook.title}</h3>
                  <p className="text-2xl text-emerald-700 font-serif-arabic font-bold italic border-b-4 border-emerald-100 pb-4 inline-block">{selectedBook.author}</p>
                </div>

                <div className="prose prose-slate prose-xl max-w-none">
                  <h4 className="text-2xl font-black text-slate-900 font-serif-arabic mb-4">نُبْذَةٌ عَنِ الكِتَابِ:</h4>
                  <p className="text-slate-700 font-serif-arabic leading-loose text-2xl italic">
                    {selectedBook.description}
                  </p>
                </div>

                <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-6">
                  <h4 className="text-xl font-black text-slate-900 font-serif-arabic flex items-center gap-3">
                    <Star className="text-amber-500" /> أَهَمِّيَّةُ الكِتَابِ فِي Mَدْهَبِ:
                  </h4>
                  <p className="text-slate-600 font-serif-arabic text-lg leading-relaxed font-bold">
                    هَذَا الكِتَابُ يُعَدُّ رُكْنًا مَكِينًا مِنْ أَرْكَانِ المَكْتَبَةِ المَالِكِيَّةِ، حَيْثُ جَمَعَ فِيهِ مُصَنِّفُهُ بَيْنَ الدِّقَّةِ فِي النَّقْلِ وَالبَرَاعَةِ فِي الِاسْتِدْلَالِ، مِمَّا جَعَلَهُ مَقْصِدًا لِطُلَّابِ العِلْمِ وَالعُلَمَاءِ عَلَى مَرِّ العُصُورِ.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
