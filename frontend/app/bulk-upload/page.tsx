// Location: frontend/app/bulk-upload/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ArrowLeft, UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { Poppins } from 'next/font/google';
import Papa from "papaparse"; // Library parser CSV

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export default function BulkUploadPage() {
  const router = useRouter();
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Handle File Select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  // Parsing CSV
  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true, // Baris pertama dianggap header (text, category)
      skipEmptyLines: true,
      complete: (results) => {
        // Ambil maksimal 5 data untuk preview
        setPreview(results.data.slice(0, 5));
      },
      error: (error) => {
        alert("Gagal membaca CSV: " + error.message);
      }
    });
  };

  // Upload ke Backend
  const handleUpload = () => {
    if (!file) return;
    setLoading(true);
    setStatus('idle');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          // Kirim seluruh data ke backend
          await api.post('/documents/bulk', results.data);
          setStatus('success');
          setTimeout(() => router.push('/'), 2000);
        } catch (error) {
          console.error(error);
          setStatus('error');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className={`min-h-screen bg-[#F8F9FE] p-6 md:p-12 ${poppins.className}`}>
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-sm border border-gray-100 transition-all group">
             <ArrowLeft size={20} className="text-gray-500 group-hover:text-indigo-600" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Import Masal</h1>
            <p className="text-gray-500 text-sm mt-1">Upload file CSV untuk mengisi database dengan cepat.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: UPLOAD AREA */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-white">
              
              {/* Alert Status */}
              {status === 'success' && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-pulse">
                  <CheckCircle2 size={20} /> <span className="font-bold">Sukses!</span> Data berhasil diimpor.
                </div>
              )}

              {/* Dropzone Style Input */}
              <label className={`
                flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-3xl cursor-pointer bg-gray-50 hover:bg-indigo-50 transition-colors
                ${file ? 'border-indigo-400 bg-indigo-50/50' : 'border-gray-300'}
              `}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  {file ? (
                    <>
                        <FileSpreadsheet className="w-12 h-12 text-indigo-500 mb-3" />
                        <p className="mb-1 text-sm font-bold text-gray-700">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                    </>
                  ) : (
                    <>
                        <UploadCloud className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold text-indigo-600">Klik untuk upload</span> atau drag and drop</p>
                        <p className="text-xs text-gray-400">Format: .CSV (Kolom: text, category)</p>
                    </>
                  )}
                </div>
                <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
              </label>

              {/* Preview Table */}
              {preview.length > 0 && (
                  <div className="mt-6">
                      <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                          <FileText size={16}/> Preview Data (5 Baris Pertama)
                      </h4>
                      <div className="overflow-x-auto border border-gray-200 rounded-xl">
                          <table className="w-full text-sm text-left text-gray-500">
                              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                  <tr>
                                      <th className="px-4 py-3">Category</th>
                                      <th className="px-4 py-3">Text (Content)</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {preview.map((row, idx) => (
                                      <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                                          <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{row.category || '-'}</td>
                                          <td className="px-4 py-3 truncate max-w-xs">{row.text}</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}

              {/* Submit Button */}
              <button 
                onClick={handleUpload}
                disabled={!file || loading}
                className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Mengimpor...' : 'Mulai Import Data'}
              </button>
            </div>
          </div>

          {/* RIGHT: INSTRUCTION */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm sticky top-8">
                <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <AlertCircle size={18} className="text-orange-500"/> Format CSV
                </h4>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                    Pastikan file Excel/CSV Anda memiliki header kolom sebagai berikut:
                </p>
                
                <div className="bg-gray-800 text-gray-200 p-4 rounded-xl text-xs font-mono mb-4">
                    text,category<br/>
                    "Belajar React Native",Teknologi<br/>
                    "Resep Nasi Goreng",Kuliner
                </div>

                <div className="h-1 w-full bg-gray-100 rounded-full mb-4"></div>
                <p className="text-xs text-gray-400">
                    *Kolom category bersifat opsional. Jika kosong akan otomatis menjadi 'Umum'.
                </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}