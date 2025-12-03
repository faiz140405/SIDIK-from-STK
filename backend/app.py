from flask import Flask, request, jsonify
from flask_cors import CORS # Wajib untuk Next.js/Web
import speech_recognition as sr
from pydub import AudioSegment
import os
import uuid
import time
import re
import numpy as np
from collections import Counter
import difflib

# Machine Learning & NLP Libraries
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans

# Library Sastrawi (Bahasa Indonesia)
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory

# Import Data Dummy dari file data.py
from data import documents 

app = Flask(__name__)

# --- KONFIGURASI CORS (PENTING UNTUK WEB) ---
# Ini mengizinkan akses dari localhost:3000 (Next.js) dan Mobile
CORS(app) 

# ==========================================
# 1. KONFIGURASI FFMPEG (WAJIB DI WINDOWS)
# ==========================================
# Pastikan path ini sesuai dengan instalasi di laptop Anda
FFMPEG_PATH = r"C:\ffmpeg\bin\ffmpeg.exe"
FFPROBE_PATH = r"C:\ffmpeg\bin\ffprobe.exe"

AudioSegment.converter = FFMPEG_PATH
AudioSegment.ffprobe = FFPROBE_PATH

# ==========================================
# 2. KONFIGURASI SASTRAWI (PREPROCESSING)
# ==========================================
stemmer_factory = StemmerFactory()
stemmer = stemmer_factory.create_stemmer()

stopword_factory = StopWordRemoverFactory()
stopword_remover = stopword_factory.create_stop_word_remover()

def preprocess_text(text, use_stemming=False, use_stopword=False):
    """
    Membersihkan teks berdasarkan konfigurasi dari frontend (Switch ON/OFF).
    """
    if not text: return ""
    
    # 1. Lowercase
    processed = text.lower()
    
    # 2. Stopword Removal
    if use_stopword:
        processed = stopword_remover.remove(processed)
    
    # 3. Stemming (Proses paling berat)
    if use_stemming:
        processed = stemmer.stem(processed)
        
    return processed

def safe_delete(path):
    """Menghapus file temporary dengan aman (Anti-Crash di Windows)"""
    try:
        time.sleep(0.1) # Jeda agar file dilepas oleh sistem operasi
        if os.path.exists(path):
            os.remove(path)
    except Exception as e:
        print(f"[WARNING] Gagal hapus {path}: {e}")

def get_correction(query):
    if not query or not documents: return None
    
    # 1. Bangun Vocabulary (Kamus) dari seluruh dokumen
    all_text = " ".join([d['text'] for d in documents]).lower()
    # Ambil semua kata unik (alfanumerik)
    vocab = set(re.findall(r'\w+', all_text))
    
    query_words = query.lower().split()
    corrected_words = []
    has_correction = False
    
    for word in query_words:
        # Jika kata ada di kamus, biarkan. Jika tidak, cari yang mirip.
        if word in vocab:
            corrected_words.append(word)
        else:
            # Cari 1 kata paling mirip dengan kemiripan minimal 60%
            matches = difflib.get_close_matches(word, vocab, n=1, cutoff=0.6)
            if matches:
                corrected_words.append(matches[0])
                has_correction = True
            else:
                corrected_words.append(word) # Kalau tidak ketemu, biarkan
    
    if has_correction:
        return " ".join(corrected_words)
    return None

@app.route('/corpus/stats', methods=['GET'])
def get_corpus_stats():
    if not documents: return jsonify([])
    
    # 1. Gabungkan semua teks
    all_text = " ".join([doc['text'] for doc in documents])
    
    # 2. Preprocess ringan (Hapus stopword saja agar kata umum hilang)
    clean_text = preprocess_text(all_text, use_stemming=False, use_stopword=True)
    
    # 3. Hitung Frekuensi
    words = clean_text.split()
    word_counts = Counter(words)
    
    # 4. Format Data untuk React [{text: 'kata', value: 10}]
    cloud_data = [{"text": word, "value": count} for word, count in word_counts.most_common(50)]
    
    return jsonify(cloud_data)
    
@app.route('/corpus/categories', methods=['GET'])
def get_category_stats():
    if not documents:
        return jsonify({})
    
    stats = {}
    for doc in documents:
        cat = doc.get('category', 'Uncategorized')
        if cat in stats:
            stats[cat] += 1
        else:
            stats[cat] = 1
            
    return jsonify(stats)

@app.route('/documents/bulk', methods=['POST'])
def add_documents_bulk():
    data = request.json # Mengharapkan list: [{text: "...", category: "..."}, ...]
    
    if not data or not isinstance(data, list):
        return jsonify({"error": "Format data harus berupa list/array"}), 400

    added_count = 0
    for item in data:
        # Validasi sederhana per item
        if 'text' in item and item['text'].strip():
            new_id = len(documents) + 1
            new_doc = {
                "id": new_id,
                "text": item['text'],
                "category": item.get('category', 'Umum')
            }
            documents.append(new_doc)
            added_count += 1
    
    return jsonify({
        "message": f"Berhasil menambahkan {added_count} dokumen!",
        "total_docs": len(documents)
    })

# ==========================================
# 3. VOICE SEARCH HANDLER
# ==========================================
@app.route('/voice-search', methods=['POST'])
def voice_search_handler():
    print("\n--- [DEBUG] START VOICE SEARCH ---")

    # Cek ketersediaan FFmpeg
    if not os.path.exists(FFMPEG_PATH):
        print(f"[FATAL ERROR] FFmpeg tidak ditemukan di: {FFMPEG_PATH}")
        return jsonify({"error": "Konfigurasi Server Salah: FFmpeg hilang"}), 500

    if 'audio' not in request.files:
        return jsonify({"error": "No audio file"}), 400
    
    audio_file = request.files['audio']
    filename = f"rec_{uuid.uuid4().hex[:8]}"
    input_path = os.path.abspath(f"{filename}.m4a")
    wav_path = os.path.abspath(f"{filename}.wav")

    try:
        # Simpan file asli dari HP
        audio_file.save(input_path)
        
        # Cek ukuran file
        size = os.path.getsize(input_path)
        if size < 100:
            return jsonify({"error": "Rekaman kosong/corrupt"}), 400

        # Konversi ke WAV
        sound = AudioSegment.from_file(input_path)
        sound.export(wav_path, format="wav")

        # Speech to Text Google
        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_path) as source:
            recognizer.adjust_for_ambient_noise(source) 
            audio_data = recognizer.record(source)
            # Kenali bahasa Indonesia
            text = recognizer.recognize_google(audio_data, language='id-ID')
            print(f"[SUCCESS] Teks terdeteksi: {text}")

        safe_delete(input_path)
        safe_delete(wav_path)

        return jsonify({"text": text})

    except sr.UnknownValueError:
        safe_delete(input_path)
        safe_delete(wav_path)
        return jsonify({"error": "Suara tidak jelas, coba lagi."}), 400
        
    except Exception as e:
        print(f"[CRASH ERROR] {str(e)}")
        safe_delete(input_path)
        safe_delete(wav_path)
        return jsonify({"error": str(e)}), 500

# ==========================================
# 4. FITUR PENCARIAN (6 METODE)
# ==========================================

# 1. REGEX SEARCH
@app.route('/search/regex', methods=['POST'])
def search_regex():
    query = request.json.get('query', '')
    results = []
    try:
        pattern = re.compile(query, re.IGNORECASE)
        for doc in documents:
            if pattern.search(doc['text']):
                results.append(doc)
    except re.error:
        return jsonify({"error": "Invalid Regex Pattern"}), 400
    return jsonify(results)

# 2. BOOLEAN RETRIEVAL
@app.route('/search/boolean', methods=['POST'])
def search_boolean():
    query = request.json.get('query', '').lower().split()
    results = []
    for doc in documents:
        text = doc['text'].lower()
        # Logika OR (Salah satu kata ada -> Tampilkan)
        if any(word in text for word in query): 
            results.append(doc)
    return jsonify(results)

# 3. VECTOR SPACE MODEL (VSM)
@app.route('/search/vsm', methods=['POST'])
def search_vsm():
    data = request.json
    query = data.get('query', '')
    
    # Ambil konfigurasi switch
    use_stemming = data.get('use_stemming', False)
    use_stopword = data.get('use_stopword', False)
    
    # Preprocess Query & Dokumen
    clean_query = preprocess_text(query, use_stemming, use_stopword)
    clean_corpus = []
    for doc in documents:
        clean_corpus.append(preprocess_text(doc['text'], use_stemming, use_stopword))
        
    full_corpus = clean_corpus + [clean_query]
    
    try:
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(full_corpus)
        
        # Hitung Cosine Similarity
        cosine_sim = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1])
        scores = cosine_sim[0]
        ranked_indices = np.argsort(scores)[::-1]
        
        results = []
        for idx in ranked_indices:
            if scores[idx] > 0:
                doc_data = documents[idx].copy()
                doc_data['score'] = float(scores[idx])
                # Kirim teks hasil proses untuk debugging di frontend
                doc_data['processed_text'] = clean_corpus[idx]
                results.append(doc_data)
        return jsonify(results)
    except ValueError:
        return jsonify([])

# 4. RELEVANCE FEEDBACK (SIMULASI)
@app.route('/search/feedback', methods=['POST'])
def relevance_feedback():
    # Menggunakan logika VSM standar untuk demo dasar
    return search_vsm()

# 5. DOCUMENT CLUSTERING
@app.route('/clustering', methods=['GET'])
def clustering():
    if len(documents) < 2: return jsonify(documents)
    
    corpus = [d['text'] for d in documents]
    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(corpus)
    
    # K-Means Clustering
    true_k = 2 if len(documents) >= 2 else 1
    kmeans = KMeans(n_clusters=true_k, random_state=0, n_init=10).fit(X)
    
    clustered_docs = []
    for i, label in enumerate(kmeans.labels_):
        doc = documents[i].copy()
        doc['cluster'] = int(label)
        clustered_docs.append(doc)
        
    return jsonify(clustered_docs)

# 6. PROBABILISTIC (BIM SIMPLIFIED)
@app.route('/search/bim', methods=['POST'])
def search_bim():
    query = request.json.get('query', '').split()
    results = []
    for doc in documents:
        score = 0
        doc_tokens = set(doc['text'].lower().split())
        for term in query:
            if term in doc_tokens: score += 1 
        if score > 0:
            doc_res = doc.copy()
            doc_res['score'] = score
            results.append(doc_res)
    results.sort(key=lambda x: x['score'], reverse=True)
    return jsonify(results)

# ==========================================
# 5. FITUR TAMBAHAN (CRUD & ANALISIS)
# ==========================================

# Tambah Dokumen Baru
@app.route('/documents', methods=['POST'])
def add_document():
    data = request.json
    if not data or 'text' not in data:
        return jsonify({"error": "Data teks tidak boleh kosong"}), 400
    
    new_id = len(documents) + 1
    new_doc = { 
        "id": new_id, 
        "text": data.get('text'), 
        "category": data.get('category', 'Umum') 
    }
    documents.append(new_doc)
    return jsonify({"message": "Dokumen berhasil ditambahkan!", "doc": new_doc})

# Endpoint Analisis Detail (Explainable IR)
@app.route('/analyze', methods=['POST'])
def analyze_result():
    data = request.json
    method = str(data.get('method', '')).lower().strip()
    query = data.get('query', '')
    doc_id = data.get('doc_id')
    
    target_doc = next((d for d in documents if d['id'] == int(doc_id)), None)
    if not target_doc: return jsonify({"error": "Dokumen tidak ditemukan"}), 404

    analysis = {
        "doc_text": target_doc['text'],
        "method": method,
        "steps": [],
        "chart_data": {} # Data untuk Bar Chart
    }

    # --- LOGIKA CHART (UNTUK SEMUA METODE) ---
    if query:
        q_tokens = query.lower().split()
        d_tokens = target_doc['text'].lower().split()
        chart_data = {}
        found_any = False
        
        # Hitung frekuensi kata kunci di dokumen
        for term in set(q_tokens):
            count = d_tokens.count(term)
            if count > 0:
                chart_data[term] = count
                found_any = True
        
        if not found_any:
            chart_data = {"(No Match)": 0}
            
        analysis['chart_data'] = chart_data
    # -----------------------------------------

    try:
        if method == 'regex':
            import re
            analysis['steps'].append(f"1. Pola Regex: '{query}'")
            try:
                pattern = re.compile(query, re.IGNORECASE)
                match = pattern.search(target_doc['text'])
                if match:
                    analysis['steps'].append(f"2. Status: MATCH ditemukan di posisi {match.span()}.")
                    analysis['steps'].append(f"3. Cuplikan: \"...{target_doc['text'][match.start():match.end()]}...\"")
                else:
                    analysis['steps'].append("2. Status: Tidak ada pola yang cocok.")
            except Exception as e:
                analysis['steps'].append(f"Error Regex: {str(e)}")

        elif method == 'vsm':
            q_tokens = query.lower().split()
            d_tokens = target_doc['text'].lower().split()
            analysis['steps'].append(f"1. Tokenisasi Dokumen: {d_tokens[:5]}...")
            analysis['steps'].append(f"2. Tokenisasi Query: {q_tokens}")
            intersection = set(q_tokens).intersection(set(d_tokens))
            analysis['steps'].append(f"3. Overlap Kata: {list(intersection)}")
            analysis['steps'].append("4. Perhitungan: TF-IDF x Cosine Similarity.")

        elif method == 'boolean':
             analysis['steps'].append(f"1. Query: {query}")
             analysis['steps'].append("2. Logika: OR (Mencari salah satu kata).")
             analysis['steps'].append("3. Hasil: Dokumen terpilih karena mengandung kata kunci.")
             
        elif method == 'clustering':
             cluster = target_doc.get('cluster', '?')
             analysis['steps'].append(f"1. Dokumen masuk ke Cluster {cluster}")
             analysis['steps'].append("2. Metode: K-Means Clustering.")

        elif method == 'bim':
             analysis['steps'].append("1. Model Probabilistik Biner.")
             analysis['steps'].append(f"2. Query Terms: {query}")
             analysis['steps'].append("3. Score dihitung berdasarkan kemunculan kata.")

        else:
             analysis['steps'].append(f"Analisis standar untuk {method}.")

    except Exception as e:
        analysis['steps'].append(f"Error analisis: {str(e)}")

    return jsonify(analysis)

if __name__ == '__main__':
    # Jalankan di 0.0.0.0 agar bisa diakses dari perangkat lain (HP)
    app.run(debug=True, host='0.0.0.0', port=5000)