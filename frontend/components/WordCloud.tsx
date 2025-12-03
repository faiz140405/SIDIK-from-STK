// Location: frontend/components/WordCloud.tsx
"use client";

import React, { useMemo, useState, useEffect } from 'react';
import ReactWordcloud from 'react-wordcloud';

// Opsi ditaruh di luar agar statis (tidak berubah setiap render)
const staticOptions = {
  colors: ['#6C63FF', '#FF9F43', '#54A0FF', '#FD79A8', '#00B894', '#636E72'],
  enableTooltip: true,
  deterministic: true,
  fontFamily: 'Poppins',
  fontSizes: [20, 60] as [number, number],
  fontStyle: 'normal',
  fontWeight: 'bold',
  padding: 2,
  rotations: 2,
  rotationAngles: [0, 0] as [number, number],
  scale: 'sqrt',
  spiral: 'archimedean',
  transitionDuration: 0, // PENTING: Matikan animasi agar tidak crash di React 19
};

// Callback statis
const staticCallbacks = {
  getWordTooltip: (word: any) => `${word.text} (${word.value})`,
  onWordClick: () => {}, // Kosongkan agar aman
};

export default function WordCloudComponent({ data }: { data: any[] }) {
  const [isMounted, setIsMounted] = useState(false);

  // 1. Pastikan hanya render di browser (Client-Side Only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 2. Membersihkan Data (PENTING)
  const cleanData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    
    return data
      .map(item => ({
        text: String(item.text), // Paksa jadi String
        value: Number(item.value) // Paksa jadi Number
      }))
      .filter(item => item.text && !isNaN(item.value) && item.value > 0) // Hapus data kosong/nol
      .slice(0, 50); // Batasi maksimal 50 kata agar ringan
  }, [data]);

  // 3. Tampilan Loading / Kosong
  if (!isMounted) {
    return <div className="h-[350px] bg-gray-50 rounded-3xl animate-pulse" />;
  }
  
  if (cleanData.length === 0) {
    return (
      <div className="h-[350px] flex flex-col items-center justify-center text-gray-400">
        <p>Data kata belum cukup.</p>
      </div>
    );
  }

  // 4. Render Aman
  return (
    <div style={{ height: 350, width: '100%' }}>
      <ReactWordcloud 
        // KUNCI PERBAIKAN: Gunakan key unik dari data.
        // Ini memaksa React menghancurkan & membuat ulang komponen saat data berubah,
        // sehingga D3 tidak bingung mengupdate node lama (penyebab crash).
        key={JSON.stringify(cleanData)} 
        words={cleanData} 
        options={staticOptions}
        callbacks={staticCallbacks}
      />
    </div>
  );
}