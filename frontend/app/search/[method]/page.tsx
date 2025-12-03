// Location: frontend/app/search/[method]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Search, ArrowLeft, ArrowRight, FileText, Activity, Layers, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Poppins } from 'next/font/google';

// Konfigurasi Font (Agar konsisten dengan Home)
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

// Tipe Data
interface SearchResult {
  id: number;
  text: string;
  category?: string;
  score?: number;
  cluster?: number;
}

// Komponen Highlight
const HighlightText = ({ text, highlight }: { text: string, highlight: string }) => {
  if (!highlight || !highlight.trim()) return <span className="text-gray-600">{text}</span>;
  const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <span className="text-gray-600">
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-yellow-200 text-yellow-900 font-bold px-1 rounded shadow-sm">{part}</span>
        ) : <span key={i}>{part}</span>
      )}
    </span>
  );
};

export default function SearchPage() {
  const params = useParams();
  const method = params.method as string;
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Auto search untuk clustering
  useEffect(() => {
    if (method === 'clustering') handleSearch();
  }, [method]);

  const handleSearch = async () => {
    if (!query.trim() && method !== 'clustering') return;
    setLoading(true);
    setResults([]);

    try {
      let endpoint = `/search/${method}`;
      let response;

      if (method === 'clustering') {
        response = await api.get('/clustering');
        // Sortir agar rapi berdasarkan cluster
        response.data.sort((a: SearchResult, b: SearchResult) => (a.cluster || 0) - (b.cluster || 0));
      } else {
        response = await api.post(endpoint, { query });
      }
      setResults(response.data);
    } catch (error) {
      console.error(error);
      alert("Gagal koneksi ke Backend Flask");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#F8F9FE] p-4 md:p-8 ${poppins.className}`}>
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 mt-4">
          <Link href="/" className="p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-sm border border-gray-100 transition-all active:scale-95 group">
             <ArrowLeft size={20} className="text-gray-500 group-hover:text-indigo-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold text-gray-800 capitalize tracking-tight">
                {method?.replace('-', ' ')}
                </h1>
                {method === 'clustering' && (
                    <span className="bg-pink-100 text-pink-600 text-xs font-bold px-3 py-1 rounded-full border border-pink-200">
                        AUTO GROUPING
                    </span>
                )}
            </div>
            <p className="text-gray-500 font-medium mt-1">
                {method === 'clustering' ? 'Mengelompokkan dokumen tanpa query.' : 'Masukkan kata kunci untuk mulai mencari.'}
            </p>
          </div>
        </div>

        {/* --- SEARCH BAR (STICKY) --- */}
        {method !== 'clustering' && (
          <div className="sticky top-4 z-50 mb-10">
            <div className="bg-white/80 backdrop-blur-xl p-2 rounded-[2rem] shadow-xl shadow-indigo-100/50 border border-white/50 flex items-center gap-2">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 shrink-0">
                <Search size={22} />
                </div>
                <input 
                type="text"
                className="flex-1 bg-transparent outline-none text-lg text-gray-800 placeholder:text-gray-400 font-medium px-2"
                placeholder="Cari dokumen (misal: 'python tutorial')..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                autoFocus
                />
                <button 
                onClick={handleSearch}
                disabled={loading}
                className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shrink-0"
                >
                {loading ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"/> : 'Cari'}
                </button>
            </div>
          </div>
        )}

        {/* --- LOADING INDICATOR --- */}
        {loading && (
          <div className="text-center py-24">
            <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-indigo-600 font-semibold animate-pulse">Sedang menganalisis data...</p>
          </div>
        )}

        {/* --- RESULT GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
          {results.map((item) => (
            <div 
              key={item.id} 
              onClick={() => router.push(`/detail-analysis?doc_id=${item.id}&method=${method}&query=${query}&score=${item.score}`)}
              className={`
                bg-white p-7 rounded-[2rem] border border-transparent 
                shadow-sm hover:shadow-2xl hover:shadow-indigo-100/60 hover:-translate-y-1 
                transition-all duration-300 cursor-pointer group relative overflow-hidden
                ${method === 'clustering' 
                    ? (item.cluster === 0 ? 'hover:border-blue-200' : 'hover:border-orange-200') 
                    : 'hover:border-indigo-200'}
              `}
            >
              {/* Colored Stripe Indicator */}
              <div className={`absolute left-0 top-6 bottom-6 w-1.5 rounded-r-full 
                ${method === 'clustering' 
                    ? (item.cluster === 0 ? 'bg-blue-500' : 'bg-orange-500') 
                    : 'bg-indigo-500'}
              `}></div>

              {/* Header Card */}
              <div className="flex justify-between items-start mb-4 pl-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <FileText size={18} />
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">DOC #{item.id}</span>
                </div>
                {item.category && (
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">
                    {item.category}
                  </span>
                )}
              </div>
              
              {/* Content Preview */}
              <p className="text-lg mb-6 leading-relaxed font-medium line-clamp-3 pl-4 min-h-[5rem]">
                <HighlightText text={item.text} highlight={method === 'clustering' ? '' : query} />
              </p>

              {/* Footer Metrics */}
              <div className="flex items-center gap-3 pl-4 border-t border-gray-50 pt-5 mt-auto">
                {item.score !== undefined && (
                  <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl text-sm font-bold border border-emerald-100">
                    <Activity size={16} /> {item.score.toFixed(3)}
                  </div>
                )}
                
                {item.cluster !== undefined && (
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold border ${
                      item.cluster === 0 
                      ? 'bg-blue-50 text-blue-700 border-blue-100' 
                      : 'bg-orange-50 text-orange-700 border-orange-100'
                  }`}>
                    <Layers size={16} /> Cluster {item.cluster}
                  </div>
                )}

                <div className="ml-auto w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all duration-300 shadow-sm">
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- EMPTY STATE --- */}
        {!loading && results.length === 0 && (method === 'clustering' || query !== "") && (
            <div className="flex flex-col items-center justify-center py-20 opacity-60">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700">Tidak ada dokumen ditemukan.</h3>
              <p className="text-gray-500">Coba gunakan kata kunci lain yang lebih umum.</p>
            </div>
        )}

      </div>
    </div>
  );
}