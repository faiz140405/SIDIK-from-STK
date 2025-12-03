// Location: frontend/app/guide/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Search, MousePointer2, BarChart2, Lightbulb, ArrowRight } from "lucide-react";
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

export default function GuidePage() {
  const router = useRouter();

  return (
    <div className={`min-h-screen bg-[#F8F9FE] p-6 md:p-12 ${poppins.className}`}>
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-12">
          <button 
            onClick={() => router.back()} 
            className="p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-sm border border-gray-100 transition-all group"
          >
             <ArrowLeft size={20} className="text-gray-500 group-hover:text-indigo-600" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Panduan Penggunaan</h1>
            <p className="text-gray-500 text-sm mt-1">Pelajari cara menggunakan Sistem Temu Kembali dalam 3 langkah mudah.</p>
          </div>
        </div>

        {/* STEPS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* STEP 1 */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100/50 border border-white relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
            <div className="absolute top-0 right-0 bg-orange-100 w-24 h-24 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
            
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center font-bold text-xl mb-6 shadow-sm">1</div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-3">Pilih Metode</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Di halaman Home, pilih salah satu dari 6 algoritma pencarian (misal: <b>Vector Space Model</b> atau <b>Regex</b>).
            </p>

            {/* Visualisasi Mini */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex gap-3 opacity-80">
                <div className="flex-1 h-16 bg-white rounded-xl border border-orange-200 shadow-sm flex flex-col items-center justify-center gap-1">
                    <div className="w-6 h-6 bg-orange-100 rounded-full"></div>
                    <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
                </div>
                <div className="flex-1 h-16 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center gap-1 opacity-50">
                    <div className="w-6 h-6 bg-gray-100 rounded-full"></div>
                    <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
                </div>
                <MousePointer2 className="absolute bottom-8 right-8 text-gray-700 fill-gray-700 transform rotate-[-15deg]" size={24} />
            </div>
          </div>

          {/* STEP 2 */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100/50 border border-white relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
            <div className="absolute top-0 right-0 bg-blue-100 w-24 h-24 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
            
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-xl mb-6 shadow-sm">2</div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-3">Input Kata Kunci</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Masukkan query pencarian pada kolom yang tersedia. Gunakan kata yang spesifik agar hasil lebih akurat.
            </p>

            {/* Visualisasi Mini */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-2">
                <Search size={16} className="text-gray-400" />
                <div className="h-2 w-16 bg-gray-300 rounded-full"></div>
                <div className="ml-auto w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                    <ArrowRight size={14} />
                </div>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100/50 border border-white relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
            <div className="absolute top-0 right-0 bg-purple-100 w-24 h-24 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
            
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center font-bold text-xl mb-6 shadow-sm">3</div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-3">Analisis Detail</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Klik kartu hasil pencarian untuk melihat <b>Explainable AI</b>: Grafik frekuensi kata & langkah perhitungan.
            </p>

            {/* Visualisasi Mini */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-center items-end gap-1 h-24">
                <div className="w-4 h-8 bg-purple-200 rounded-t-md"></div>
                <div className="w-4 h-12 bg-purple-400 rounded-t-md"></div>
                <div className="w-4 h-6 bg-purple-300 rounded-t-md"></div>
                <div className="w-4 h-10 bg-purple-500 rounded-t-md shadow-lg shadow-purple-500/30"></div>
                
                <div className="absolute top-28 right-10 bg-white p-1 rounded-full shadow-md">
                    <BarChart2 size={16} className="text-purple-600" />
                </div>
            </div>
          </div>

        </div>

        {/* TIPS SECTION */}
        <div className="mt-12 bg-yellow-50 border border-yellow-100 rounded-3xl p-8 flex flex-col md:flex-row items-start gap-6">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-2xl shrink-0">
                <Lightbulb size={28} />
            </div>
            <div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">Tips Pro</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                    Gunakan fitur <b>Document Clustering</b> untuk melihat pola data tanpa harus mengetik kata kunci. Sistem akan otomatis mengelompokkan dokumen berdasarkan kemiripannya menggunakan algoritma K-Means.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
}