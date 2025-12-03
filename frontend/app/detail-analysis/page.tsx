// Location: frontend/app/detail-analysis/page.tsx
"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ArrowLeft, FileText, Activity, ListChecks, Quote, Download, Loader2 } from "lucide-react";
import { Poppins } from 'next/font/google';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Konfigurasi Font
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

// Register ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function DetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null); // Referensi untuk area yang akan di-print
  
  const doc_id = searchParams.get('doc_id');
  const method = searchParams.get('method');
  const query = searchParams.get('query');
  const score = searchParams.get('score');

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false); // State loading saat download

  useEffect(() => {
    if(!doc_id) return;
    const fetchData = async () => {
      try {
        const res = await api.post('/analyze', {
          doc_id,
          method,
          query
        });
        setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [doc_id, method, query]);

  // --- FUNGSI EXPORT PDF ---
  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    setExporting(true);

    try {
      // 1. Ambil screenshot area konten
      const canvas = await html2canvas(contentRef.current, {
        scale: 2, // Kualitas tinggi
        useCORS: true, // Agar gambar/chart ter-render
        backgroundColor: '#F8F9FE', // Sesuai bg website
      });

      // 2. Konversi ke PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // Lebar A4 (mm)
      const pageHeight = 297; // Tinggi A4 (mm)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Halaman pertama
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Halaman selanjutnya (jika konten panjang)
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // 3. Download File
      pdf.save(`Laporan_Analisis_${method}_Doc${doc_id}.pdf`);

    } catch (error) {
      console.error("Gagal export PDF", error);
      alert("Gagal membuat PDF. Coba lagi.");
    } finally {
      setExporting(false);
    }
  };

  // Konfigurasi Data Chart
  const chartData = {
    labels: data?.chart_data ? Object.keys(data.chart_data) : [],
    datasets: [
      {
        label: 'Frekuensi',
        data: data?.chart_data ? Object.values(data.chart_data) : [],
        backgroundColor: 'rgba(108, 99, 255, 0.8)',
        borderRadius: 8,
        barThickness: 40,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
      x: { grid: { display: false } }
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FE]">
      <div className="relative w-20 h-20">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-100 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-6 text-indigo-600 font-bold animate-pulse font-poppins">Menganalisis Dokumen...</p>
    </div>
  );

  return (
    <div className={`min-h-screen bg-[#F8F9FE] p-4 md:p-8 lg:p-12 ${poppins.className}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* --- TOMBOL NAVIGASI & ACTION --- */}
        <div className="flex justify-between items-center mb-8">
            <button 
            onClick={() => router.back()} 
            className="group flex items-center gap-3 text-gray-500 hover:text-indigo-600 font-semibold transition-all"
            >
            <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                <ArrowLeft size={20} />
            </div>
            Kembali
            </button>

            {/* TOMBOL DOWNLOAD PDF */}
            <button 
                onClick={handleDownloadPDF}
                disabled={exporting}
                className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {exporting ? (
                    <Loader2 size={18} className="animate-spin" />
                ) : (
                    <Download size={18} />
                )}
                {exporting ? 'Memproses PDF...' : 'Download Laporan'}
            </button>
        </div>

        {/* --- AREA YANG AKAN DI-PRINT KE PDF (REF) --- */}
        <div ref={contentRef} className="bg-[#F8F9FE]"> {/* Wrapper bg agar PDF tidak hitam */}
            
            {/* --- HEADER CARD --- */}
            <div className="bg-gradient-to-r from-[#6C63FF] to-[#8E84FF] rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-indigo-200 mb-10 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold mb-4 border border-white/20">
                        <Activity size={14} /> AUDIT REPORT
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight">Detail Analisis</h1>
                    <p className="text-indigo-100 text-lg font-medium opacity-90">
                        Metode: <span className="uppercase tracking-wider font-bold border-b-2 border-indigo-300 pb-0.5">{method?.toString().replace('-', ' ')}</span>
                    </p>
                    </div>

                    {score && (
                    <div className="bg-white/10 backdrop-blur-lg px-8 py-5 rounded-[2rem] border border-white/20 text-center min-w-[140px] shadow-lg">
                        <p className="text-xs text-indigo-100 font-bold uppercase tracking-widest mb-1">Skor Relevansi</p>
                        <p className="text-4xl font-black tracking-tight">{parseFloat(score).toFixed(4)}</p>
                    </div>
                    )}
                </div>
                {/* Dekorasi */}
                <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
                    <Activity size={300} />
                </div>
            </div>

            {/* --- CONTENT GRID --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
                {/* KOLOM KIRI */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* CARD: ISI DOKUMEN */}
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <FileText size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Isi Dokumen</h2>
                    </div>
                    
                    <div className="bg-gray-50/80 p-8 rounded-3xl border border-gray-100 relative">
                        <Quote className="absolute top-4 left-4 text-indigo-200" size={40} />
                        <p className="text-gray-700 text-lg leading-relaxed font-medium relative z-10 pl-4">
                        "{data?.doc_text}"
                        </p>
                    </div>
                    </div>

                    {/* CARD: VISUALISASI CHART */}
                    {data?.chart_data && query && (
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                            <Activity size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Visualisasi Vektor</h2>
                        </div>
                        
                        <div className="h-80 w-full bg-gray-50 rounded-3xl p-4 border border-gray-100">
                        <Bar data={chartData} options={chartOptions} />
                        </div>
                    </div>
                    )}
                </div>

                {/* KOLOM KANAN: STEPS */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-[2rem] shadow-lg shadow-indigo-100/50 border border-gray-100">
                    <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-6">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <ListChecks size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Proses Algoritma</h2>
                    </div>

                    <div className="relative pl-2">
                        {/* Garis Vertikal */}
                        <div className="absolute left-[19px] top-4 bottom-10 w-0.5 bg-gray-200"></div>

                        <div className="space-y-8">
                        {data?.steps?.map((step: string, idx: number) => (
                            <div key={idx} className="relative pl-12 group">
                            {/* Nomor */}
                            <div className="absolute left-0 top-0 w-10 h-10 bg-white border-2 border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm shadow-sm z-10">
                                {idx + 1}
                            </div>
                            
                            {/* Teks */}
                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-gray-600 text-sm font-medium leading-relaxed">
                                {step}
                            </div>
                            </div>
                        ))}
                        </div>
                    </div>

                    </div>
                </div>

            </div>
        </div>
        {/* --- END PRINT AREA --- */}

      </div>
    </div>
  );
}

export default function DetailPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold text-gray-400">Loading Page...</div>}>
      <DetailContent />
    </Suspense>
  );
}