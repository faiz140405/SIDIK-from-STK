# 🔍 SIDIK (Sistem Dokumen & Informasi Kembali)

![React Native](https://img.shields.io/badge/Mobile-React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/Web-Next.js_14-black?style=for-the-badge&logo=next.js&logoColor=white)
![Flask](https://img.shields.io/badge/Backend-Python_Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Style-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

> **Platform Pencarian Cerdas Multi-Platform (Web & Mobile)**
> Aplikasi ini mendemonstrasikan implementasi 6 algoritma *Information Retrieval* (IR) dengan fitur *Explainable AI*, visualisasi data, dan pemrosesan bahasa alami (NLP) Bahasa Indonesia.

---

## ✨ Fitur Utama

### 🧠 6 Metode Pencarian Inti
Aplikasi ini mendukung perbandingan langsung antar algoritma:
1.  **Vector Space Model (VSM):** Ranking dokumen menggunakan pembobotan **TF-IDF** & **Cosine Similarity**.
2.  **Regex Search:** Pencarian pola karakter presisi (cocok untuk kode, email, tanggal).
3.  **Boolean Retrieval:** Pencarian eksak menggunakan logika operator himpunan (**AND/OR**).
4.  **Document Clustering:** Pengelompokan dokumen otomatis menggunakan **K-Means** (*Unsupervised Learning*).
5.  **Probabilistic (BIM):** Estimasi peluang relevansi dokumen menggunakan *Binary Independence Model*.
6.  **Relevance Feedback:** Ekspansi query otomatis (Query Expansion) berdasarkan hasil awal.

### 🚀 Fitur Canggih
* **🎙️ Voice Search:** Cari dokumen hanya dengan suara (Integrasi Google Speech API & FFmpeg).
* **🔍 Explainable IR:** Transparansi total! Klik hasil pencarian untuk melihat langkah *audit log* (Tokenisasi -> Filtering -> Scoring).
* **📊 Visualisasi Data:**
    * **Bar Chart:** Frekuensi kata kunci dalam dokumen (Web & Mobile).
    * **Pie Chart:** Statistik distribusi kategori dokumen (Web Dashboard).
* **⚔️ Battle Mode (Web Only):** Bandingkan hasil dua algoritma berbeda secara berdampingan (*Split View*) dalam satu layar.
* **⚙️ Preprocessing Control:** Toggle ON/OFF untuk **Stemming (Sastrawi)** dan **Stopword Removal** secara real-time.
* **📂 Manajemen Data:**
    * Input Manual Dokumen.
    * **Bulk Upload:** Import ratusan dokumen sekaligus via file CSV.
* **📄 Export Laporan:** Unduh hasil analisis pencarian menjadi file **PDF**.

---

## 🛠️ Teknologi yang Digunakan

### 📱 Frontend (Mobile)
* **Framework:** React Native (Expo Router)
* **Audio:** `expo-av`
* **Storage:** `AsyncStorage` (Riwayat Pencarian)

### 💻 Frontend (Web)
* **Framework:** Next.js 14 (App Router)
* **Styling:** Tailwind CSS, Lucide Icons
* **Utils:** `html2canvas`, `jspdf` (Export PDF), `papaparse` (CSV Parser)

### 🐍 Backend (Server)
* **Core:** Python Flask
* **Machine Learning:** Scikit-Learn (TF-IDF, K-Means), NumPy
* **NLP:** NLTK, Sastrawi (Stemmer Bahasa Indonesia)
* **Audio Processing:** Pydub, SpeechRecognition

---

## ⚙️ Panduan Instalasi

Ikuti langkah ini untuk menjalankan proyek di komputer lokal (Localhost).

### Prasyarat
1.  **Node.js** (v18+)
2.  **Python** (v3.9+)
3.  **FFmpeg** (Wajib untuk fitur Voice Search di Windows).
    * Download di [ffmpeg.org](https://ffmpeg.org/download.html).
    * Tambahkan folder `bin` ke Environment Variable Path.

### 1. Clone Repository
```bash
git clone [https://github.com/faiz140405/SIDIK-from-STK.git](https://github.com/faiz140405/SIDIK-from-STK.git)
cd NAMA_REPO
2. Setup Backend (Python Flask)
Terminal 1:

Bash

cd backend

# Buat Virtual Environment
python -m venv venv

# Aktifkan Venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install Dependencies
pip install -r requirements.txt

# Jalankan Server
python app.py
✅ Server akan berjalan di http://0.0.0.0:5000

3. Setup Frontend (Web & Mobile)
Terminal 2:

Bash

cd frontend

# Install Dependencies
npm install

# Jalankan (Pilih salah satu)
npm run dev      # Untuk Web (Next.js) -> Buka http://localhost:3000
npx expo start   # Untuk Mobile (Expo) -> Scan QR di HP
⚠️ Konfigurasi IP Address (PENTING!)
Agar Aplikasi Mobile di HP bisa terhubung ke Backend di Laptop, Anda harus mengatur IP Address.

Cek IP Laptop: ipconfig (Windows) atau ifconfig (Mac).

Buka file frontend/lib/api.ts (Web) dan frontend/app/search/[method].tsx (Mobile).

Sesuaikan variabel API_URL:

TypeScript

// Untuk WEB (frontend/lib/api.ts)
export const API_URL = '[http://127.0.0.1:5000](http://127.0.0.1:5000)'; 

// Untuk MOBILE (Di dalam file-file app/...)
const API_URL = '[http://192.168.1.](http://192.168.1.)XX:5000'; // Ganti XX dengan IP Laptop Anda
📂 Struktur Folder Monorepo
Plaintext

/
├── backend/                  # 🧠 Server Python Flask
│   ├── app.py                # Main Controller, API Routes, & Logic
│   ├── data.py               # In-Memory Database (Corpus Dokumen)
│   └── requirements.txt      # Daftar Pustaka Python
│
└── frontend/                 # 🎨 UI (Next.js & React Native)
    ├── app/                  # App Router
    │   ├── (tabs)/           # Mobile Tabs (Home, Features, Guide)
    │   ├── search/           # Halaman Pencarian Dinamis
    │   ├── detail-analysis/  # Halaman Explainable AI
    │   ├── battle/           # Halaman Perbandingan (Web)
    │   └── ...
    ├── components/           # Reusable Components (Charts, ThemeToggle)
    └── lib/                  # API Configuration
👨‍💻 Author
Faiz Nizar Nu'aim Mahasiswa Teknik Informatika

Universitas Teknokrat Indonesia

Dibuat dengan ❤️ untuk Tugas Mata Kuliah Sistem Temu Kembali