// Location: frontend/app/battle/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ArrowLeft, Swords, Search, FileText, Zap, AlertCircle, Trophy, CheckCircle2 } from "lucide-react";
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

// Daftar Metode
const METHODS = [
  { id: 'vsm', label: 'Vector Space Model' },
  { id: 'regex', label: 'Regex Search' },
  { id: 'boolean', label: 'Boolean Retrieval' },
  { id: 'bim', label: 'Probabilistic (BIM)' },
  { id: 'clustering', label: 'Clustering (K-Means)' }, 
];

// Komponen Highlight
const HighlightText = ({ text, highlight }: { text: string, highlight: string }) => {
  if (!highlight || !highlight.trim()) return <span className="text-gray-600">{text}</span>;
  const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <span className="text-gray-600">
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-yellow-200 text-yellow-900 font-bold px-0.5 rounded shadow-sm">{part}</span>
        ) : <span key={i}>{part}</span>
      )}
    </span>
  );
};

export default function BattlePage() {
  const router = useRouter();
  
  const [query, setQuery] = useState("");
  const [methodA, setMethodA] = useState("vsm");
  const [methodB, setMethodB] = useState("boolean");
  
  const [resultsA, setResultsA] = useState<any[]>([]);
  const [resultsB, setResultsB] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchResult = async (method: string, q: string) => {
    try {
      let res;
      if (method === 'clustering') {
        res = await api.get('/clustering');
        const data = Array.isArray(res.data) ? res.data : [];
        return data.sort((a: any, b: any) => (a.cluster || 0) - (b.cluster || 0));
      } else {
        res = await api.post(`/search/${method}`, { query: q });
        if (res.data && Array.isArray(res.data.results)) return res.data.results;
        if (Array.isArray(res.data)) return res.data;
        return [];
      }
    } catch (error) {
      console.error(`Gagal fetch ${method}:`, error);
      return [];
    }
  };

  const handleBattle = async () => {
    if (!query.trim() && methodA !== 'clustering' && methodB !== 'clustering') return;
    
    setLoading(true);
    setHasSearched(true);
    setResultsA([]);
    setResultsB([]);

    try {
      const [resA, resB] = await Promise.all([
        fetchResult(methodA, query),
        fetchResult(methodB, query)
      ]);
      setResultsA(resA);
      setResultsB(resB);
    } catch (error) {
      alert("Terjadi kesalahan saat membandingkan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#F8F9FE] p-4 md:p-8 ${poppins.className}`}>
      <div className="max-w-[1400px] mx-auto"> {/* Container lebih lebar untuk Battle */}
        
        {/* --- HEADER --- */}
        <div className="flex items-center gap-4 mb-8 mt-2">
          <button 
            onClick={() => router.back()} 
            className="p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-sm border border-gray-100 transition-all group active:scale-95"
          >
             <ArrowLeft size={20} className="text-gray-500 group-hover:text-indigo-600" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-rose-100 rounded-lg text-rose-600"><Swords size={24} /></div>
              Battle Mode
            </h1>
            <p className="text-gray-500 text-sm mt-1 font-medium">Bandingkan performa dua algoritma secara head-to-head.</p>
          </div>
        </div>

        {/* --- CONTROLS CARD (STICKY TOP) --- */}
        <div className="sticky top-4 z-50 mb-8">
          <div className="bg-white/90 backdrop-blur-xl p-4 rounded-[2rem] shadow-xl shadow-indigo-100/50 border border-white/50 flex flex-col lg:flex-row gap-4 items-center">
            
            {/* Input Query */}
            <div className="relative flex-1 w-full">
                <div className="absolute left-4 top-3.5 text-gray-400">
                    <Search size={20} />
                </div>
                <input 
                    type="text" 
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-gray-700 placeholder:text-gray-400"
                    placeholder="Masukkan kata kunci untuk diadu..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleBattle()}
                />
            </div>

            {/* Selectors Area */}
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                <select 
                    value={methodA} 
                    onChange={(e) => setMethodA(e.target.value)}
                    className="w-full sm:w-48 bg-white text-indigo-700 font-bold py-2.5 px-4 rounded-lg outline-none cursor-pointer border border-gray-100 text-sm hover:bg-indigo-50 transition-colors text-center shadow-sm appearance-none"
                >
                    {METHODS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
                
                <div className="bg-rose-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-md shadow-rose-200 shrink-0 z-10">VS</div>

                <select 
                    value={methodB} 
                    onChange={(e) => setMethodB(e.target.value)}
                    className="w-full sm:w-48 bg-white text-rose-700 font-bold py-2.5 px-4 rounded-lg outline-none cursor-pointer border border-gray-100 text-sm hover:bg-rose-50 transition-colors text-center shadow-sm appearance-none"
                >
                    {METHODS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
            </div>

            {/* Fight Button */}
            <button 
                onClick={handleBattle}
                disabled={loading}
                className="w-full lg:w-auto bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 shrink-0"
            >
                {loading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"/>
                ) : (
                    <>FIGHT! <Zap size={18} fill="currentColor" className="text-yellow-400"/></>
                )}
            </button>
          </div>
        </div>

        {/* --- BATTLE ARENA --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative min-h-[500px] pb-20">
            
            {/* GARIS PEMISAH TENGAH (Desktop Only) */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-200 via-gray-300 to-transparent -ml-[1px] z-0 rounded-full"></div>

            {/* --- KOLOM KIRI (PLAYER 1) --- */}
            <div className="flex flex-col gap-6 relative z-10">
                {/* Sticky Header Player 1 */}
                <div className="sticky top-32 z-30">
                    <div className="bg-white/95 backdrop-blur-md border-t-4 border-t-indigo-500 border-x border-b border-indigo-100 p-5 rounded-2xl text-center shadow-lg shadow-indigo-100/50">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-3 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm">Player 1</div>
                        <h3 className="font-extrabold text-gray-800 text-lg leading-tight">{METHODS.find(m => m.id === methodA)?.label}</h3>
                        <div className="mt-2 inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold">
                            {hasSearched ? <><CheckCircle2 size={12}/> {resultsA?.length || 0} Hasil</> : "Menunggu..."}
                        </div>
                    </div>
                </div>

                {/* Hasil Player 1 */}
                <div className="space-y-4">
                    {hasSearched && resultsA?.length === 0 && (
                        <div className="bg-white p-8 rounded-[2rem] text-center border border-dashed border-gray-300 opacity-70">
                            <AlertCircle className="mx-auto mb-2 text-gray-400" size={32}/>
                            <p className="text-gray-500 font-medium">Tidak ada hasil ditemukan.</p>
                        </div>
                    )}

                    {resultsA?.map((item, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-transparent hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 group">
                            <div className="flex justify-between mb-3 items-start">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400"><FileText size={14}/></div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">DOC #{item.id}</span>
                                </div>
                                {item.score !== undefined && (
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                                        <Trophy size={10}/> {item.score.toFixed(3)}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm font-medium text-gray-600 leading-relaxed line-clamp-3 group-hover:text-gray-800 transition-colors">
                                <HighlightText text={item.text} highlight={query} />
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- KOLOM KANAN (PLAYER 2) --- */}
            <div className="flex flex-col gap-6 relative z-10">
                {/* Sticky Header Player 2 */}
                <div className="sticky top-32 z-30">
                    <div className="bg-white/95 backdrop-blur-md border-t-4 border-t-rose-500 border-x border-b border-rose-100 p-5 rounded-2xl text-center shadow-lg shadow-rose-100/50">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-500 text-white px-3 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm">Player 2</div>
                        <h3 className="font-extrabold text-gray-800 text-lg leading-tight">{METHODS.find(m => m.id === methodB)?.label}</h3>
                        <div className="mt-2 inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 px-3 py-1 rounded-lg text-xs font-bold">
                            {hasSearched ? <><CheckCircle2 size={12}/> {resultsB?.length || 0} Hasil</> : "Menunggu..."}
                        </div>
                    </div>
                </div>

                {/* Hasil Player 2 */}
                <div className="space-y-4">
                    {hasSearched && resultsB?.length === 0 && (
                        <div className="bg-white p-8 rounded-[2rem] text-center border border-dashed border-gray-300 opacity-70">
                            <AlertCircle className="mx-auto mb-2 text-gray-400" size={32}/>
                            <p className="text-gray-500 font-medium">Tidak ada hasil ditemukan.</p>
                        </div>
                    )}

                    {resultsB?.map((item, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-transparent hover:border-rose-200 hover:shadow-xl hover:shadow-rose-100/50 transition-all duration-300 group">
                            <div className="flex justify-between mb-3 items-start">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400"><FileText size={14}/></div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">DOC #{item.id}</span>
                                </div>
                                {item.score !== undefined && (
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                                        <Trophy size={10}/> {item.score.toFixed(3)}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm font-medium text-gray-600 leading-relaxed line-clamp-3 group-hover:text-gray-800 transition-colors">
                                <HighlightText text={item.text} highlight={query} />
                            </p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}