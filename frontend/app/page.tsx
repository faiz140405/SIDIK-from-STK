// Location: frontend/app/page.tsx
"use client";

import Link from "next/link";
import { Search, Share2, Binary, RefreshCw, BarChart3, Calculator, ArrowRight, Plus, FileText, Swords, BookOpen, PieChart } from "lucide-react";
import { Poppins } from 'next/font/google';
import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Registrasi ChartJS
ChartJS.register(ArcElement, Tooltip, Legend);

// Font Setup
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

export default function Home() {
  const [stats, setStats] = useState<any>(null);

  // Ambil data statistik
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/corpus/categories');
        setStats(res.data);
      } catch (e) { console.error(e); }
    };
    fetchStats();
  }, []);

  // Konfigurasi Pie Chart
  const chartData = useMemo(() => {
    if (!stats) return null;
    return {
      labels: Object.keys(stats),
      datasets: [
        {
          data: Object.values(stats),
          backgroundColor: [
            '#6C63FF', '#FF9F43', '#54A0FF', '#FF6B6B', '#2ECC71', '#A3CB38'
          ],
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    };
  }, [stats]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { usePointStyle: true, font: { size: 10, family: 'Poppins' } }
      }
    }
  };

  // Menu Metode
  const methods = [
    { id: 'vsm', title: 'Vector Space Model', desc: 'Ranking TF-IDF & Cosine Similarity', icon: Share2, color: 'text-white', bg: 'bg-orange-400' },
    { id: 'regex', title: 'Regex Search', desc: 'Pencarian pola teks presisi', icon: Search, color: 'text-white', bg: 'bg-blue-500' },
    { id: 'boolean', title: 'Boolean Retrieval', desc: 'Logika AND/OR/NOT', icon: Binary, color: 'text-white', bg: 'bg-emerald-500' },
    { id: 'feedback', title: 'Relevance Feedback', desc: 'Ekspansi query otomatis', icon: RefreshCw, color: 'text-white', bg: 'bg-rose-500' },
    { id: 'clustering', title: 'Document Clustering', desc: 'Pengelompokan K-Means', icon: BarChart3, color: 'text-white', bg: 'bg-indigo-500' },
    { id: 'bim', title: 'Probabilistic (BIM)', desc: 'Estimasi peluang relevansi', icon: Calculator, color: 'text-white', bg: 'bg-violet-500' },
  ];

  return (
    <main className={`min-h-screen bg-[#F5F6FA] p-6 md:p-10 ${poppins.className}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Hi, Sabrina! 👋</h2>
            <p className="text-gray-400 text-sm">Welcome back to SIDIK Dashboard.</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-full shadow-sm border border-gray-100">
             <div className="w-10 h-10 rounded-full bg-[#6C63FF] flex items-center justify-center text-white font-bold text-sm border-2 border-white ring-2 ring-[#6C63FF]/20">
               SA
             </div>
             <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-gray-700">Sabrina</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Admin</p>
             </div>
          </div>
        </header>

        {/* --- HERO CARD --- */}
        <div className="relative bg-[#6C63FF] rounded-[40px] p-8 md:p-12 text-white shadow-2xl shadow-indigo-500/30 mb-10 overflow-hidden">
          
          <div className="absolute -right-20 -bottom-40 w-96 h-96 rounded-full border-[30px] border-white/10"></div>
          <div className="absolute -right-10 -bottom-30 w-80 h-80 rounded-full border-[30px] border-white/10"></div>
          <Search className="absolute right-10 bottom-10 text-white/20" size={180} />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold mb-6 tracking-widest uppercase border border-white/20">
              ● AI Search Engine
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">
              SIDIK
            </h1>
            <p className="text-indigo-100 text-lg md:text-xl font-medium mb-8 opacity-90">
              Sistem Temu Kembali Informasi. <br/>
              <span className="text-sm opacity-75 font-normal">Platform IR lengkap dengan 6 metode pencarian & analisis transparan.</span>
            </p>
            
            <div className="flex flex-wrap gap-3">
              <Link href="/add-document">
                <button className="bg-white text-[#6C63FF] px-6 py-3.5 rounded-full font-bold flex items-center gap-2 hover:bg-gray-50 transition-all shadow-lg active:scale-95">
                  <Plus size={20} strokeWidth={3} /> Manual Input
                </button>
              </Link>
              
              <Link href="/bulk-upload">
                <button className="bg-[#857dff] text-white px-6 py-3.5 rounded-full font-bold flex items-center gap-2 hover:bg-[#7a72ff] transition-all shadow-lg active:scale-95 border border-white/20">
                  <FileText size={20} /> Import CSV
                </button>
              </Link>

              <Link href="/battle">
                <button className="bg-[#FF4757] text-white px-6 py-3.5 rounded-full font-bold flex items-center gap-2 hover:bg-[#ff3344] transition-all shadow-lg shadow-red-500/30 active:scale-95">
                  <Swords size={20} /> Battle
                </button>
              </Link>
              
              <Link href="/guide">
                <button className="bg-white/20 text-white px-6 py-3.5 rounded-full font-bold flex items-center gap-2 hover:bg-white/30 transition-all backdrop-blur-md border border-white/30">
                  <BookOpen size={20} /> Pelajari
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* --- STATISTIK & CHART SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            
            {/* WIDGET STATISTIK KIRI */}
            <div className="lg:col-span-2 bg-white rounded-[30px] p-8 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Data Insight</h3>
                        <p className="text-gray-400 text-sm">Statistik database dokumen saat ini</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-xl">
                        <PieChart size={24} className="text-gray-400" />
                    </div>
                </div>

                <div className="flex gap-6 items-end">
                    <div className="flex-1 bg-[#F5F6FA] p-5 rounded-2xl">
                        <p className="text-3xl font-black text-[#6C63FF]">{stats ? Object.values(stats).reduce((a:any,b:any)=>a+b,0) as number : 0}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase mt-1">Total Dokumen</p>
                    </div>
                    <div className="flex-1 bg-[#F5F6FA] p-5 rounded-2xl">
                        <p className="text-3xl font-black text-[#FF9F43]">{stats ? Object.keys(stats).length : 0}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase mt-1">Total Kategori</p>
                    </div>
                </div>
            </div>

             {/* WIDGET CHART KANAN */}
             <div className="bg-white rounded-[30px] p-6 border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Distribusi</h3>
                    <div className="p-1.5 bg-indigo-50 rounded-lg">
                        <PieChart size={18} className="text-indigo-600" />
                    </div>
                </div>

                {/* Area Chart */}
                <div className="flex-1 flex items-center justify-center min-h-[180px]">
                    {chartData ? (
                        <div className="w-full h-full">
                             <Pie data={chartData} options={chartOptions} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-gray-300">
                            <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-indigo-500 rounded-full mb-2"></div>
                            <span className="text-xs">Memuat Data...</span>
                        </div>
                    )}
                </div>
             </div>
        </div>

        {/* --- GRID MENU METODE --- */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-xl font-bold text-gray-800">Pilih Metode</h3>
            <span className="text-sm text-[#6C63FF] font-bold cursor-pointer hover:underline">View All</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {methods.map((m) => (
              <Link key={m.id} href={`/search/${m.id}`}>
                <div className="bg-white p-6 rounded-[30px] border border-transparent hover:border-indigo-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${m.bg} ${m.color} shadow-md`}>
                        <m.icon size={24} strokeWidth={2.5} />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-[#6C63FF] group-hover:text-white transition-colors">
                        <ArrowRight size={14} />
                      </div>
                  </div>
                  
                  <h4 className="text-lg font-bold text-gray-800 mb-1">{m.title}</h4>
                  <p className="text-gray-400 text-xs font-medium leading-relaxed line-clamp-2">{m.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}