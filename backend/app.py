from flask import Flask, request, jsonify
from flask_cors import CORS
import speech_recognition as sr
from pydub import AudioSegment
import os
import uuid
import time
import re
import numpy as np
import difflib  # <--- LIBRARY UNTUK CEK TYPO
from collections import Counter

# Machine Learning & NLP Libraries
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans

# Library Sastrawi
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory

# Import Data
from data import documents 

app = Flask(__name__)
CORS(app)

# KONFIGURASI FFMPEG
FFMPEG_PATH = r"C:\ffmpeg\bin\ffmpeg.exe"
FFPROBE_PATH = r"C:\ffmpeg\bin\ffprobe.exe"
AudioSegment.converter = FFMPEG_PATH
AudioSegment.ffprobe = FFPROBE_PATH

# KONFIGURASI SASTRAWI
stemmer_factory = StemmerFactory()
stemmer = stemmer_factory.create_stemmer()
stopword_factory = StopWordRemoverFactory()
stopword_remover = stopword_factory.create_stop_word_remover()

def preprocess_text(text, use_stemming=False, use_stopword=False):
    if not text: return ""
    processed = text.lower()
    if use_stopword: processed = stopword_remover.remove(processed)
    if use_stemming: processed = stemmer.stem(processed)
    return processed

def safe_delete(path):
    try:
        time.sleep(0.1) 
        if os.path.exists(path): os.remove(path)
    except Exception as e: print(f"[WARNING] Gagal hapus {path}: {e}")

# --- HELPER BARU: CEK TYPO ---
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

# ==========================================
# ENDPOINTS (UPDATED RETURN FORMAT)
# ==========================================

@app.route('/voice-search', methods=['POST'])
def voice_search_handler():
    # ... (Logika voice search sama seperti sebelumnya) ...
    if not os.path.exists(FFMPEG_PATH): return jsonify({"error": "FFmpeg Missing"}), 500
    if 'audio' not in request.files: return jsonify({"error": "No audio"}), 400
    
    audio_file = request.files['audio']
    filename = f"rec_{uuid.uuid4().hex[:8]}"
    input_path = os.path.abspath(f"{filename}.m4a")
    wav_path = os.path.abspath(f"{filename}.wav")

    try:
        audio_file.save(input_path)
        if os.path.getsize(input_path) < 100: return jsonify({"error": "Rekaman kosong"}), 400
        sound = AudioSegment.from_file(input_path)
        sound.export(wav_path, format="wav")
        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_path) as source:
            recognizer.adjust_for_ambient_noise(source) 
            text = recognizer.recognize_google(recognizer.record(source), language='id-ID')
        safe_delete(input_path); safe_delete(wav_path)
        return jsonify({"text": text})
    except Exception as e:
        safe_delete(input_path); safe_delete(wav_path)
        return jsonify({"error": str(e)}), 500

# --- SEARCH ENDPOINTS (DIPERBARUI) ---

@app.route('/search/regex', methods=['POST'])
def search_regex():
    query = request.json.get('query', '')
    results = []
    try:
        pattern = re.compile(query, re.IGNORECASE)
        for doc in documents:
            if pattern.search(doc['text']): results.append(doc)
    except: pass
    
    # Return format baru dengan suggestion
    return jsonify({
        "results": results,
        "suggestion": None # Regex biasanya tidak butuh koreksi typo
    })

@app.route('/search/boolean', methods=['POST'])
def search_boolean():
    query = request.json.get('query', '').lower().split()
    results = []
    for doc in documents:
        if any(word in doc['text'].lower() for word in query): results.append(doc)
    
    return jsonify({
        "results": results,
        "suggestion": get_correction(" ".join(query))
    })

@app.route('/search/vsm', methods=['POST'])
def search_vsm():
    data = request.json
    query = data.get('query', '')
    use_stem = data.get('use_stemming', False)
    use_stop = data.get('use_stopword', False)
    
    clean_q = preprocess_text(query, use_stem, use_stop)
    clean_corpus = [preprocess_text(d['text'], use_stem, use_stop) for d in documents]
    full = clean_corpus + [clean_q]
    
    results = []
    try:
        vec = TfidfVectorizer()
        tfidf = vec.fit_transform(full)
        sim = cosine_similarity(tfidf[-1], tfidf[:-1])[0]
        indices = np.argsort(sim)[::-1]
        for idx in indices:
            if sim[idx] > 0:
                doc = documents[idx].copy()
                doc['score'] = float(sim[idx])
                doc['processed_text'] = clean_corpus[idx]
                results.append(doc)
    except: pass

    # Cek Typo
    suggestion = get_correction(query)
    # Jika suggestion sama persis dengan query, jangan tampilkan
    if suggestion == query.lower(): suggestion = None

    return jsonify({
        "results": results,
        "suggestion": suggestion
    })

@app.route('/search/feedback', methods=['POST'])
def relevance_feedback():
    # Reuse VSM logic
    return search_vsm()

@app.route('/search/bim', methods=['POST'])
def search_bim():
    query = request.json.get('query', '').split()
    results = []
    for doc in documents:
        score = sum(1 for term in query if term in doc['text'].lower().split())
        if score > 0:
            d = doc.copy(); d['score'] = score
            results.append(d)
    results.sort(key=lambda x: x['score'], reverse=True)
    
    return jsonify({
        "results": results,
        "suggestion": get_correction(" ".join(query))
    })

@app.route('/clustering', methods=['GET'])
def clustering():
    if len(documents) < 2: return jsonify(documents)
    corpus = [d['text'] for d in documents]
    X = TfidfVectorizer().fit_transform(corpus)
    km = KMeans(n_clusters=2, random_state=0, n_init=10).fit(X)
    res = []
    for i, l in enumerate(km.labels_):
        d = documents[i].copy(); d['cluster'] = int(l)
        res.append(d)
    # Clustering tidak butuh suggestion, tapi format harus konsisten (array is ok for GET)
    return jsonify(res) 

# --- OTHER ENDPOINTS ---
@app.route('/corpus/stats', methods=['GET'])
def get_stats():
    if not documents: return jsonify([])
    txt = preprocess_text(" ".join([d['text'] for d in documents]), False, True)
    return jsonify([{"text":w, "value":c} for w,c in Counter(txt.split()).most_common(50)])

@app.route('/corpus/categories', methods=['GET'])
def get_categories():
    return jsonify(Counter([d.get('category', 'Uncategorized') for d in documents]))

@app.route('/documents', methods=['POST'])
def add_doc():
    d = request.json
    if not d or 'text' not in d: return jsonify({"error":"No text"}), 400
    new_d = {"id": len(documents)+1, "text": d['text'], "category": d.get('category','Umum')}
    documents.append(new_d)
    return jsonify({"message":"OK", "doc":new_d})

@app.route('/documents/bulk', methods=['POST'])
def add_bulk():
    data = request.json
    if not data or not isinstance(data, list): return jsonify({"error":"List required"}), 400
    c = 0
    for i in data:
        if 'text' in i:
            documents.append({"id": len(documents)+1, "text": i['text'], "category": i.get('category','Umum')})
            c+=1
    return jsonify({"message": f"Added {c}", "total": len(documents)})

@app.route('/analyze', methods=['POST'])
def analyze():
    # (Kode Analyze sama seperti sebelumnya, tidak ada perubahan logika return)
    # Silakan paste kode analyze terakhir Anda di sini atau gunakan yang di bawah ini (versi singkat)
    d = request.json
    tid = int(d.get('doc_id', -1))
    tdoc = next((x for x in documents if x['id'] == tid), None)
    if not tdoc: return jsonify({"error":"Not Found"}), 404
    
    anl = {"doc_text": tdoc['text'], "method": d.get('method'), "steps": [], "chart_data": {}}
    q = d.get('query','')
    
    # Chart logic
    if q:
        tokens = tdoc['text'].lower().split()
        q_tok = q.lower().split()
        cdata = {t: tokens.count(t) for t in set(q_tok) if t in tokens}
        if not cdata: cdata = {"(No Match)": 0}
        anl['chart_data'] = cdata
    
    anl['steps'].append(f"Analisis untuk metode {d.get('method')}")
    # ... tambahkan step detail jika perlu ...
    return jsonify(anl)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)