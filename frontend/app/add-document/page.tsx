// Location: frontend/app/add-document/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ArrowLeft, Save, FileText, Tag, PenTool, AlertCircle, CheckCircle2 } from "lucide-react";
import { Poppins } from 'next/font/google';

// Konfigurasi Font
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export default function AddDocumentPage() {
  const router = useRouter();
  
  const [text, setText] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setStatus('idle');

    try {
      await api.post('/documents', {
        text: text,
        category: category || 'Umum'
      });
      
      setStatus('success');
      // Reset form atau redirect setelah delay sebentar
      setTimeout(() => {
        router.push('/'); // Kembali ke Home
      }, 1500);
      
    } catch (error) {
      console.error(error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#F8F9FE] p-6 md:p-12 ${poppins.className}`}>
      <div className="max-w-5xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()} 
            className="p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-sm border border-gray-100 transition-all group"
          >
             <ArrowLeft size={20} className="text-gray-500 group-hover:text-indigo-600" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Input Data</h1>
            <p className="text-gray-500 text-sm mt-1">Tambahkan dokumen baru ke dalam korpus pencarian.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LEFT COLUMN: FORM --- */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-white">
              
              {/* Alert Status */}
              {status === 'success' && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-pulse">
                  <CheckCircle2 size={20} />
                  <span className="font-bold">Berhasil!</span> Dokumen telah disimpan. Mengalihkan...
                </div>
              )}
              {status === 'error' && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <AlertCircle size={20} />
                  <span className="font-bold">Gagal!</span> Terjadi kesalahan koneksi server.
                </div>
              )}

              {/* Input Kategori */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Kategori Dokumen</label>
                <div className="relative group">
                  <div className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    <Tag size={20} />
                  </div>
                  <input 
                    type="text"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-gray-700 font-medium placeholder:text-gray-400"
                    placeholder="Contoh: Teknologi, Kuliner, Berita..."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
              </div>

              {/* Input Teks Area */}
              <div className="mb-8">
                <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Isi Konten</label>
                <div className="relative group">
                  <div className="absolute left-4 top-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    <FileText size={20} />
                  </div>
                  <textarea 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-gray-700 font-medium placeholder:text-gray-400 min-h-[250px] resize-none leading-relaxed"
                    placeholder="Ketik atau tempel teks dokumen di sini..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
              </div>

              {/* Tombol Submit */}
              <button 
                type="submit"
                disabled={loading || !text.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={20} /> Simpan Dokumen
                  </>
                )}
              </button>
            </form>
          </div>

          {/* --- RIGHT COLUMN: TIPS / SIDEBAR --- */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Info Card */}
            <div className="bg-indigo-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
                        <PenTool size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Tips Penulisan</h3>
                    <p className="text-indigo-200 text-sm leading-relaxed mb-4">
                        Pastikan dokumen mengandung kata kunci yang relevan agar mudah ditemukan oleh algoritma VSM maupun Boolean.
                    </p>
                    <div className="h-1 w-12 bg-indigo-500 rounded-full"></div>
                </div>
                {/* Decoration */}
                <div className="absolute -right-6 -bottom-6 opacity-10">
                    <FileText size={150} />
                </div>
            </div>

            {/* Stats Preview (Static Demo) */}
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <AlertCircle size={16} className="text-orange-500"/> Catatan
                </h4>
                <ul className="space-y-3">
                    <li className="text-sm text-gray-500 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mt-1.5 shrink-0"></span>
                        Data disimpan sementara di memori server (hilang jika restart).
                    </li>
                    <li className="text-sm text-gray-500 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mt-1.5 shrink-0"></span>
                        Preprocessing (Stemming) akan otomatis dilakukan saat pencarian.
                    </li>
                </ul>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}