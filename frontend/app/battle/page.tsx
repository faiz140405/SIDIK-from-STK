// Location: frontend/app/battle/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ArrowLeft, Swords, Search, FileText, ArrowRight, Zap, AlertCircle } from "lucide-react";
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
  { id: 'clustering', label: 'Clustering (K-Means)' }, // Clustering mungkin tidak relevan dengan query, tapi kita biarkan opsi ini
];

// Komponen Highlight Sederhana
const HighlightText = ({ text, highlight }: { text: string, highlight: string }) => {
  if (!highlight || !highlight.trim()) return <span className="text-gray-500">{text}</span>;
  const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <span className="text-gray-500">
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-yellow-200 text-yellow-900 font-bold px-0.5 rounded">{part}</span>
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

  // Fungsi Fetch untuk satu metode
  const fetchResult = async (method: string, q: string) => {
    try {
      let res;
      if (method === 'clustering') {
        res = await api.get('/clustering');
        res.data.sort((a: any, b: any) => (a.cluster || 0) - (b.cluster || 0));
      } else {
        res = await api.post(`/search/${method}`, { query: q });
      }
      return res.data;
    } catch (error) {
      console.error(error);
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
      // Jalankan 2 Request Secara Paralel (Battle!)
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
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-sm border border-gray-100 transition-all group">
             <ArrowLeft size={20} className="text-gray-500 group-hover:text-indigo-600" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
              <Swords className="text-red-500" /> Battle Mode
            </h1>
            <p className="text-gray-500 text-sm mt-1">Bandingkan efektivitas dua algoritma sekaligus.</p>
          </div>
        </div>

        {/* CONTROLS CARD */}
        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-indigo-100/50 border border-white mb-8 sticky top-4 z-50">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            
            {/* Input Query */}
            <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input 
                    type="text" 
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    placeholder="Masukkan kata kunci untuk diadu..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleBattle()}
                />
            </div>

            {/* Selectors */}
            <div className="flex items-center gap-2 w-full lg:w-auto justify-center bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                <select 
                    value={methodA} 
                    onChange={(e) => setMethodA(e.target.value)}
                    className="bg-white text-indigo-700 font-bold py-2 px-4 rounded-lg outline-none cursor-pointer border border-gray-200 text-sm hover:bg-indigo-50 transition-colors w-full lg:w-48 appearance-none text-center"
                >
                    {METHODS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
                
                <div className="bg-red-100 text-red-600 p-1.5 rounded-full font-black text-xs px-3">VS</div>

                <select 
                    value={methodB} 
                    onChange={(e) => setMethodB(e.target.value)}
                    className="bg-white text-rose-700 font-bold py-2 px-4 rounded-lg outline-none cursor-pointer border border-gray-200 text-sm hover:bg-rose-50 transition-colors w-full lg:w-48 appearance-none text-center"
                >
                    {METHODS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
            </div>

            {/* Button */}
            <button 
                onClick={handleBattle}
                disabled={loading}
                className="w-full lg:w-auto bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
            >
                {loading ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"/> : <><Zap size={18} fill="currentColor"/> FIGHT!</>}
            </button>
          </div>
        </div>

        {/* BATTLE ARENA (SPLIT VIEW) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            
            {/* VS Divider (Desktop Only) */}
            <div className="hidden md:flex absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 -ml-px justify-center z-0">
                <div className="sticky top-40 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 border-4 border-[#F8F9FE]">VS</div>
            </div>

            {/* KOLOM KIRI (METHOD A) */}
            <div className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl text-center sticky top-28 z-40 backdrop-blur-md bg-opacity-90">
                    <h3 className="font-bold text-indigo-700 uppercase tracking-wider text-sm">Player 1</h3>
                    <p className="font-extrabold text-gray-800 text-lg">{METHODS.find(m => m.id === methodA)?.label}</p>
                    <p className="text-xs text-indigo-400 font-bold mt-1">{resultsA.length} Hasil Ditemukan</p>
                </div>

                {hasSearched && resultsA.length === 0 && (
                    <div className="text-center py-10 opacity-50"><AlertCircle className="mx-auto mb-2"/>Tidak ada hasil</div>
                )}

                {resultsA.map((item, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-indigo-200 group">
                        <div className="flex justify-between mb-2">
                            <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded">#{item.id}</span>
                            {item.score !== undefined && <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Score: {item.score.toFixed(3)}</span>}
                        </div>
                        <p className="text-sm font-medium text-gray-700 leading-relaxed line-clamp-3">
                            <HighlightText text={item.text} highlight={query} />
                        </p>
                    </div>
                ))}
            </div>

            {/* KOLOM KANAN (METHOD B) */}
            <div className="space-y-4">
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-center sticky top-28 z-40 backdrop-blur-md bg-opacity-90">
                    <h3 className="font-bold text-rose-700 uppercase tracking-wider text-sm">Player 2</h3>
                    <p className="font-extrabold text-gray-800 text-lg">{METHODS.find(m => m.id === methodB)?.label}</p>
                    <p className="text-xs text-rose-400 font-bold mt-1">{resultsB.length} Hasil Ditemukan</p>
                </div>

                {hasSearched && resultsB.length === 0 && (
                    <div className="text-center py-10 opacity-50"><AlertCircle className="mx-auto mb-2"/>Tidak ada hasil</div>
                )}

                {resultsB.map((item, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-rose-200 group">
                        <div className="flex justify-between mb-2">
                            <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded">#{item.id}</span>
                            {item.score !== undefined && <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded">Score: {item.score.toFixed(3)}</span>}
                        </div>
                        <p className="text-sm font-medium text-gray-700 leading-relaxed line-clamp-3">
                            <HighlightText text={item.text} highlight={query} />
                        </p>
                    </div>
                ))}
            </div>

        </div>
      </div>
    </div>
  );
}