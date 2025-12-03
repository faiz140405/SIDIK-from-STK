"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Search, Share2, Binary, RefreshCw, BarChart3, Calculator, ArrowRight, Plus, FileText, BookOpen, Swords, PieChart as PieIcon } from "lucide-react";
import { Poppins } from 'next/font/google';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Registrasi ChartJS
ChartJS.register(ArcElement, Tooltip, Legend);

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

export default function Home() {
  const [stats, setStats] = useState<any>(null);

  // Fetch Data Statistik saat load
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/corpus/categories');
        setStats(res.data);
      } catch (e) {
        console.error("Gagal load stats", e);
      }
    };
    fetchStats();
  }, []);

  // Konfigurasi Data Pie Chart
  const chartData = {
    labels: stats ? Object.keys(stats) : [],
    datasets: [
      {
        data: stats ? Object.values(stats) : [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)', // Merah
          'rgba(54, 162, 235, 0.8)', // Biru
          'rgba(255, 206, 86, 0.8)', // Kuning
          'rgba(75, 192, 192, 0.8)', // Hijau
          'rgba(153, 102, 255, 0.8)', // Ungu
          'rgba(255, 159, 64, 0.8)', // Orange
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const methods = [
    { 
      id: 'vsm', 
      title: 'Vector Space Model', 
      desc: 'Ranking dengan TF-IDF & Cosine Similarity', 
      icon: Share2, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50', 
      border: 'hover:border-orange-200',
      shadow: 'hover:shadow-orange-100'
    },
    { 
      id: 'regex', 
      title: 'Regex Search', 
      desc: 'Pencarian pola teks presisi (Email, Tgl)', 
      icon: Search, 
      color: 'text-red-600', 
      bg: 'bg-red-50', 
      border: 'hover:border-red-200',
      shadow: 'hover:shadow-red-100'
    },
    { 
      id: 'boolean', 
      title: 'Boolean Retrieval', 
      desc: 'Logika himpunan eksak (AND/OR/NOT)', 
      icon: Binary, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50', 
      border: 'hover:border-blue-200',
      shadow: 'hover:shadow-blue-100'
    },
    { 
      id: 'clustering', 
      title: 'Document Clustering', 
      desc: 'Pengelompokan dokumen otomatis (K-Means)', 
      icon: BarChart3, 
      color: 'text-pink-600', 
      bg: 'bg-pink-50', 
      border: 'hover:border-pink-200',
      shadow: 'hover:shadow-pink-100'
    },
    { 
      id: 'bim', 
      title: 'Probabilistic (BIM)', 
      desc: 'Estimasi peluang relevansi biner', 
      icon: Calculator, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50', 
      border: 'hover:border-purple-200',
      shadow: 'hover:shadow-purple-100'
    },
    { 
      id: 'feedback', 
      title: 'Relevance Feedback', 
      desc: 'Query Expansion otomatis dari input user', 
      icon: RefreshCw, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50', 
      border: 'hover:border-emerald-200',
      shadow: 'hover:shadow-emerald-100'
    },
  ];

  return (
    <main className={`min-h-screen bg-[#F8F9FE] p-6 md:p-10 ${poppins.className}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">
              Hello, Sabrina! 👋
            </h2>
            <p className="text-gray-500 font-medium mt-1">
              Selamat datang di dashboard Sistem Temu Kembali.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 pr-4 rounded-full shadow-sm border border-gray-100">
             <div className="w-10 h-10 rounded-full bg-indigo-100 overflow-hidden border-2 border-indigo-50">
               <img src="https://ui-avatars.com/api/?name=Sabrina&background=6C63FF&color=fff" alt="Profile" />
             </div>
             <div className="hidden md:block">
                <p className="text-sm font-bold text-gray-700">Sabrina</p>
                <p className="text-xs text-gray-400">Admin</p>
             </div>
          </div>
        </header>

        {/* --- HERO CARD --- */}
        <div className="relative bg-gradient-to-r from-[#6C63FF] to-[#8075FF] rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-indigo-200 mb-12 overflow-hidden group">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold mb-5 tracking-wide uppercase">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              AI Search Engine
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              SIDIK <br/> <span className="text-2xl md:text-3xl font-medium opacity-90">Sistem Temu Kembali Informasi</span>
            </h1>
            <p className="text-indigo-100 text-lg mb-8 font-medium leading-relaxed opacity-90 max-w-lg">
              Platform IR lengkap dengan 6 metode pencarian, visualisasi data, dan analisis transparan.
            </p>
            
            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap gap-3">
              <Link href="/add-document">
                <button className="bg-white text-indigo-600 px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-50 transition-all shadow-lg shadow-indigo-900/10 active:scale-95 text-sm md:text-base">
                  <Plus size={20} /> Manual Input
                </button>
              </Link>
              <Link href="/bulk-upload">
                <button className="bg-indigo-500/30 text-white border border-white/20 px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-white/20 transition-all text-sm md:text-base backdrop-blur-sm">
                  <FileText size={20} /> Import CSV
                </button>
              </Link>
              <Link href="/battle">
                <button className="bg-rose-500 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-rose-600 transition-all shadow-lg shadow-rose-900/20 active:scale-95 text-sm md:text-base">
                  <div className="rotate-90 md:rotate-0"><Swords size={20} /></div> Battle
                </button>
              </Link>
              <Link href="/guide">
                <button className="px-5 py-3 rounded-2xl font-bold flex items-center gap-2 text-white border border-white/30 hover:bg-white/10 transition-all text-sm md:text-base">
                  <BookOpen size={20} /> Pelajari
                </button>
              </Link>
            </div>
          </div>
          
          {/* Dekorasi Background */}
          <div className="absolute right-[-20px] bottom-[-40px] opacity-20 transform rotate-12 group-hover:rotate-0 group-hover:scale-105 transition-all duration-700">
            <Search size={320} />
          </div>
          <div className="absolute top-10 right-20 w-32 h-32 bg-purple-400 rounded-full blur-[80px] opacity-40 animate-pulse"></div>
        </div>

        {/* --- STATISTIK KORPUS (PIE CHART) --- */}
        {stats && Object.keys(stats).length > 0 && (
          <div className="mb-12 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-10">
             <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold mb-3 uppercase tracking-wide">
                   <PieIcon size={14} /> Database Insight
                </div>
                <h3 className="text-2xl font-extrabold text-gray-800 mb-3">Distribusi Dokumen</h3>
                <p className="text-gray-500 leading-relaxed mb-6">
                   Berikut adalah sebaran jumlah dokumen berdasarkan kategori yang ada di dalam database (Korpus).
                </p>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                      <p className="text-3xl font-black text-indigo-600">{Object.values(stats).reduce((a:any, b:any) => a + b, 0) as number}</p>
                      <p className="text-xs text-gray-400 font-bold uppercase mt-1">Total Dokumen</p>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                      <p className="text-3xl font-black text-pink-500">{Object.keys(stats).length}</p>
                      <p className="text-xs text-gray-400 font-bold uppercase mt-1">Kategori</p>
                   </div>
                </div>
             </div>
             <div className="w-64 h-64 relative">
                <Pie data={chartData} />
             </div>
          </div>
        )}

        {/* --- GRID MENU --- */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-8">
            <h3 className="text-2xl font-bold text-gray-800">Metode Populer</h3>
            <span className="text-sm text-indigo-600 font-bold cursor-pointer hover:underline">
              Lihat Semua
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {methods.map((m) => (
              <Link key={m.id} href={`/search/${m.id}`}>
                <div className={`
                  bg-white p-7 rounded-[2rem] h-full flex flex-col justify-between
                  border border-transparent ${m.border} 
                  shadow-sm ${m.shadow} hover:shadow-xl transition-all duration-300 
                  cursor-pointer group relative overflow-hidden
                `}>
                  <div className={`absolute top-0 right-0 w-32 h-32 ${m.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity -mr-10 -mt-10 pointer-events-none`}></div>
                  <div>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${m.bg} ${m.color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                      <m.icon size={30} strokeWidth={2.5} />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">{m.title}</h4>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed">{m.desc}</p>
                  </div>
                  <div className="mt-8 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-widest group-hover:text-gray-400 transition-colors">Start</span>
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}