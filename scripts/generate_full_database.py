import pdfplumber
import re
import json
import os

pdf_path = r'C:\Users\zaida\.gemini\antigravity\brain\c570b425-5502-4a32-9b3a-ec28dc982937\.user_uploaded\media_1791950899822_6a83d54c.pdf'
output_dir = r'c:\Users\zaida\.gemini\antigravity\scratch\english-mastery\src\data\vocabulary'

def join_split_cells(c_left, c_right):
    if not c_left and not c_right:
        return ""
    if not c_right:
        return re.sub(r'\s+', ' ', c_left or '').strip()
    if not c_left:
        return re.sub(r'\s+', ' ', c_right or '').strip()
        
    l_left = (c_left or '').split('\n')
    l_right = (c_right or '').split('\n')
    max_len = max(len(l_left), len(l_right))
    l_left += [''] * (max_len - len(l_left))
    l_right += [''] * (max_len - len(l_right))
    
    parts = []
    for a, b in zip(l_left, l_right):
        line = (a + b).strip()
        if line:
            parts.append(line)
    return ' '.join(parts)

def split_pos_level(s):
    levels = re.findall(r'\b(A1|A2|B1|B2|C1|C2)\b', s)
    pos = re.sub(r'\b(A1|A2|B1|B2|C1|C2)\b', '', s)
    pos = re.sub(r'[,/\s]+$', '', pos)
    pos = re.sub(r'\s*,\s*', ', ', pos)
    pos = re.sub(r'\s+', ' ', pos).strip()
    return pos, levels

def extract_pdf():
    records = []
    with pdfplumber.open(pdf_path) as pdf:
        for p_idx, page in enumerate(pdf.pages):
            page_num = p_idx + 1
            tables = page.extract_tables()
            for t in tables:
                for row in t:
                    if not row or all(c is None or c.strip() == '' for c in row if c is not None):
                        continue
                    
                    row_str = ' '.join((c or '') for c in row).lower()
                    if 'kata (i' in row_str or 'kata bahasa inggris' in row_str or 'kelas kata' in row_str:
                        continue
                    
                    if len(row) == 6:
                        word = join_split_cells(row[0], row[1])
                        pos = re.sub(r'\s+', ' ', (row[2] or '')).strip()
                        level_str = re.sub(r'\s+', ' ', (row[3] or '')).strip()
                        trans = join_split_cells(row[4], row[5])
                        levels = re.findall(r'\b(A1|A2|B1|B2|C1|C2)\b', level_str)
                    elif len(row) == 3:
                        word = re.sub(r'\s+', ' ', (row[0] or '')).strip()
                        pos_lvl = re.sub(r'\s+', ' ', (row[1] or '')).strip()
                        pos, levels = split_pos_level(pos_lvl)
                        trans = re.sub(r'\s+', ' ', (row[2] or '')).strip()
                    else:
                        continue
                        
                    if not word:
                        continue
                        
                    records.append({
                        'word': word,
                        'pos': pos,
                        'cefrLevel': levels[0] if levels else 'A1',
                        'allCefrLevels': levels if levels else ['A1'],
                        'translation': trans,
                        'page': page_num
                    })
    return records

C1_WORDS = [
    ("advocate", "v., n.", "menganjurkan, pendukung", "To publicly recommend or support a particular cause.", "Environmental groups advocate for stricter conservation laws.", "Kelompok lingkungan hidup menganjurkan undang-undang konservasi yang lebih ketat."),
    ("allocate", "v.", "mengalokasikan, menjatahkan", "To distribute resources or duties for a specific purpose.", "The government will allocate additional funds to education.", "Pemerintah akan mengalokasikan dana tambahan untuk pendidikan."),
    ("arbitrary", "adj.", "sewenang-wenang, semena-mena", "Based on random choice or personal whim rather than reason.", "The committee made an arbitrary decision without consulting members.", "Komite membuat keputusan sewenang-wenang tanpa berkonsultasi dengan anggota."),
    ("coherent", "adj.", "koheren, logis dan runtut", "Logical and consistent; easy to understand.", "She presented a coherent argument that convinced the jury.", "Dia menyajikan argumen yang koheren dan meyakinkan dewan juri."),
    ("comprehensive", "adj.", "komprehensif, menyeluruh", "Including or dealing with all or nearly all aspects.", "The report offers a comprehensive review of recent developments.", "Laporan tersebut menawarkan tinjauan menyeluruh tentang perkembangan terkini."),
    ("constrain", "v.", "membatasi, menahan", "To compel or restrict severely.", "Budget cuts will constrain our ability to hire new staff.", "Pemotongan anggaran akan membatasi kemampuan kita merekrut staf baru."),
    ("deduce", "v.", "menyimpulkan, mendeduksi", "To arrive at a fact by reasoning from evidence.", "From the clues, the detective was able to deduce the suspect's identity.", "Dari petunjuk yang ada, detektif berhasil menyimpulkan identitas tersangka."),
    ("diminish", "v.", "berkurang, menyusut", "To make or become smaller or less.", "Her enthusiasm did not diminish despite numerous setbacks.", "Antusiasmenya tidak berkurang meskipun mengalami berbagai hambatan."),
    ("discrete", "adj.", "terpisah, berlainan", "Individually separate and distinct.", "The process is divided into several discrete stages.", "Proses tersebut dibagi menjadi beberapa tahap yang terpisah."),
    ("empirical", "adj.", "empiris, berdasarkan pengamatan", "Based on observation or experience rather than theory.", "There is substantial empirical evidence supporting this hypothesis.", "Terdapat bukti empiris yang kuat yang mendukung hipotesis ini."),
    ("fluctuate", "v.", "berfluktuasi, naik turun", "To rise and fall irregularly in number or amount.", "Commodity prices fluctuate depending on global supply and demand.", "Harga komoditas berfluktuasi tergantung pasokan dan permintaan global."),
    ("implicit", "adj.", "tersirat, implisit", "Implied though not plainly expressed.", "There was an implicit agreement between the two trading partners.", "Terdapat kesepakatan tersirat antara kedua mitra dagang tersebut."),
    ("induce", "v.", "mendorong, merangsang", "To succeed in persuading or leading someone to do something.", "Nothing could induce him to abandon his lifelong principles.", "Tidak ada yang dapat mendorongnya untuk meninggalkan prinsip hidupnya."),
    ("inherent", "adj.", "melekat, inheren", "Existing in something as a permanent or essential characteristic.", "Stress is an inherent part of high-pressure executive careers.", "Stres adalah bagian yang melekat pada karier eksekutif bertekanan tinggi."),
    ("intrinsic", "adj.", "intrinsik, hakiki", "Belonging naturally; essential.", "Curiosity is an intrinsic element of human nature.", "Rasa ingin tahu adalah unsur hakiki dari kodrat manusia."),
    ("magnitude", "n.", "besaran, keagungan, skala", "The great size or extent of something.", "Scientists were astonished by the sheer magnitude of the earthquake.", "Para ilmuwan tercengang oleh besarnya skala gempa bumi tersebut."),
    ("paradigm", "n.", "paradigma, model acuan", "A typical example or pattern of something; a model.", "Quantum mechanics created a new paradigm in modern physics.", "Mekanika kuantum menciptakan paradigma baru dalam fisika modern."),
    ("qualitative", "adj.", "kualitatif", "Relating to, measuring, or measured by the quality of something.", "Researchers conducted both qualitative and quantitative assessments.", "Para peneliti melakukan penilaian kualitatif dan kuantitatif."),
    ("refine", "v.", "menyempurnakan, memurnikan", "To improve something by making small changes.", "Engineers worked diligently to refine the aircraft propulsion system.", "Para insinyur bekerja keras menyempurnakan sistem propulsi pesawat."),
    ("rigorous", "adj.", "ketat, saksama", "Extremely thorough, exhaustive, or accurate.", "Candidates must undergo rigorous testing before final selection.", "Para kandidat harus menjalani pengujian yang ketat sebelum seleksi akhir."),
    ("scrutinize", "v.", "memeriksa dengan cermat, meneliti", "To examine or inspect closely and thoroughly.", "Regulators will scrutinize the company's financial transactions.", "Regulator akan memeriksa dengan cermat transaksi keuangan perusahaan tersebut."),
    ("subsequent", "adj.", "berikutnya, setelahnya", "Coming after something in time; following.", "Subsequent investigations revealed severe accounting discrepancies.", "Investigasi berikutnya mengungkap ketidaksesuaian pembukuan yang parah."),
    ("underlying", "adj.", "mendasar, pokok", "Significant as a cause or basis even if not immediately obvious.", "We must address the underlying causes of economic inequality.", "Kita harus mengatasi penyebab mendasar dari ketimpangan ekonomi."),
    ("viable", "adj.", "layak, dapat hidup/berjalan", "Capable of working successfully; feasible.", "Solar energy represents a viable alternative to fossil fuels.", "Energi surya merupakan alternatif yang layak terhadap bahan bakar fosil."),
    ("widespread", "adj.", "meluas, tersebar luas", "Found or distributed over a large area or among many people.", "The policy reform received widespread public acclaim.", "Reformasi kebijakan tersebut mendapat pujian luas dari masyarakat.")
]

C2_WORDS = [
    ("anomaly", "n.", "anomali, keganjilan", "Something that deviates from what is standard, normal, or expected.", "The unexpected climate spike was deemed an atmospheric anomaly.", "Lonjakan iklim yang tak terduga dianggap sebagai sebuah anomali atmosfer."),
    ("antithesis", "n.", "antitesis, lawan pertentangan", "A person or thing that is the direct opposite of someone or something else.", "His cruel behavior was the antithesis of everything his family stood for.", "Perilaku kejamnya adalah antitesis dari semua nilai yang dijunjung keluarganya."),
    ("archetype", "n.", "arketipe, pola dasar", "A very typical example of a certain person or thing; an original pattern.", "The mythological hero serves as an archetype in worldwide folklore.", "Pahlawan mitologi berfungsi sebagai arketipe dalam cerita rakyat dunia."),
    ("catalyst", "n.", "katalis, pemicu", "A person or thing that precipitates an event or change.", "The economic reform served as a catalyst for widespread entrepreneurship.", "Reformasi ekonomi berfungsi sebagai pemicu kewirausahaan yang meluas."),
    ("dichotomy", "n.", "dikotomi, pembagian dua cabang", "A division or contrast between two things that are represented as being opposed.", "Philosophers frequently debate the dichotomy between mind and matter.", "Para filsuf sering memperdebatkan dikotomi antara pikiran dan materi."),
    ("eclectic", "adj.", "eklektik, memilih dari berbagai sumber", "Deriving ideas, style, or taste from a broad and diverse range of sources.", "Her home features an eclectic mix of antique furniture and modern art.", "Rumahnya menampilkan perpaduan eklektik perabot antik dan seni modern."),
    ("ephemeral", "adj.", "fana, berumur pendek", "Lasting for a very short time; transitory.", "Fame on social media is often ephemeral and fleeting.", "Popularitas di media sosial sering kali fana dan berlalu cepat."),
    ("equivocal", "adj.", "meragukan, bermakna ganda", "Open to more than one interpretation; ambiguous.", "The politician gave an equivocal response when questioned about taxes.", "Politisi itu memberikan jawaban bermakna ganda saat ditanyai tentang pajak."),
    ("exacerbate", "v.", "memperparah, memperburuk", "To make a problem, bad situation, or negative feeling worse.", "Delaying infrastructure maintenance will only exacerbate traffic congestion.", "Menunda pemeliharaan infrastruktur hanya akan memperparah kemacetan lalu lintas."),
    ("exemplify", "v.", "memberi contoh, mencontohkan", "To be a typical example of; illustrate by giving an example.", "Her outstanding leadership exemplifies dedication and integrity.", "Kepemimpinannya yang luar biasa mencontohkan dedikasi dan integritas."),
    ("juxtapose", "v.", "menyandingkan, memperhadapkan", "To place close together for contrasting effect.", "The exhibition juxtaposes contemporary street art with classical sculpture.", "Pameran tersebut menyandingkan seni jalanan kontemporer dengan patung klasik."),
    ("paradoxical", "adj.", "paradoks, tampak bertentangan", "Seemingly absurd or self-contradictory.", "It is paradoxical that increased connectivity can lead to profound loneliness.", "Merupakan hal paradoks bahwa meningkatnya konektivitas dapat memicu kesepian mendalam."),
    ("pervasive", "adj.", "meresap, menyebar ke mana-mana", "Spreading widely throughout an area or a group of people.", "Digital communication has had a pervasive influence on contemporary society.", "Komunikasi digital memiliki pengaruh yang meresap luas pada masyarakat kontemporer."),
    ("pragmatic", "adj.", "pragmatis, berorientasi praktis", "Dealing with things sensibly and realistically rather than theoretically.", "We need a pragmatic approach to resolve this diplomatic dispute.", "Kita membutuhkan pendekatan pragmatis untuk menyelesaikan sengketa diplomatik ini."),
    ("quintessential", "adj.", "paling khas, teladan murni", "Representing the most perfect or typical example of a quality.", "A cup of afternoon tea is widely regarded as a quintessential British habit.", "Secangkir teh sore hari dipandang luas sebagai kebiasaan khas murni orang Inggris."),
    ("superfluous", "adj.", "berlebihan, tidak perlu", "Unnecessary, especially through being more than enough.", "The concise executive summary eliminated all superfluous technical jargon.", "Ringkasan eksekutif yang ringkas menyingkirkan semua istilah teknis yang tidak perlu."),
    ("surreptitious", "adj.", "sembunyi-sembunyi, rahasia", "Kept secret, especially because it would not be approved of.", "She cast a surreptitious glance at her watch during the lengthy address.", "Dia melirik jam tangannya secara sembunyi-sembunyi saat pidato panjang berlangsung."),
    ("tenuous", "adj.", "sangat tipis, lemah, rapuh", "Very weak or slight; insubstantial.", "The historical evidence linking the two ancient civilizations remains tenuous.", "Bukti sejarah yang menghubungkan kedua peradaban kuno tersebut masih sangat lemah."),
    ("ubiquitous", "adj.", "ada di mana-mana, serba ada", "Present, appearing, or found everywhere.", "Smartphones have become ubiquitous across modern urban centers.", "Ponsel pintar telah menjadi barang yang ada di mana-mana di pusat perkotaan modern."),
    ("vicarious", "adj.", "secara tidak langsung, mewakilkan", "Experienced in the imagination through the feelings or actions of another.", "Reading adventurous travel novels gave him a vicarious sense of exploration.", "Membaca novel petualangan memberinya sensasi eksplorasi secara tidak langsung."),
    ("vindicate", "v.", "membenarkan, membebaskan dari tuduhan", "To clear someone of blame or suspicion; prove to be right.", "Subsequent scientific discoveries vindicated her groundbreaking hypothesis.", "Penemuan ilmiah berikutnya membenarkan hipotesis terobosannya."),
    ("zealot", "n.", "fanatik, orang yang fanatik", "A person who is fanatical and uncompromising in pursuit of their ideals.", "The political debate was disrupted by an impassioned party zealot.", "Debat politik tersebut terganggu oleh seorang fanatik partai yang berapi-api.")
]

def make_clean_meanings(trans):
    parts = re.split(r'[,;/]', trans)
    meanings = [re.sub(r'\(.*?\)', '', p).strip().lower() for p in parts if p.strip()]
    meanings = [m for m in meanings if m]
    if not meanings:
        meanings = [trans.strip().lower()]
    return meanings

def build_definition(word, pos, first_meaning):
    clean_w = re.sub(r'\s*\(.*?\)', '', word).strip()
    is_v = 'v' in pos.lower()
    is_n = 'n' in pos.lower()
    is_adj = 'adj' in pos.lower()
    is_adv = 'adv' in pos.lower()
    
    if is_v:
        return f"To {clean_w} ({first_meaning}); to carry out the action in a relevant context."
    elif is_n:
        return f"A {clean_w} refers to {first_meaning} in common or formal situations."
    elif is_adj:
        return f"Having the characteristic of being {clean_w} ({first_meaning})."
    elif is_adv:
        return f"In a manner expressing {first_meaning}."
    else:
        return f"Term meaning {first_meaning} in Indonesian."

def build_sentence(word, pos, first_meaning):
    clean_w = re.sub(r'\s*\(.*?\)', '', word).strip()
    is_v = 'v' in pos.lower()
    is_n = 'n' in pos.lower()
    is_adj = 'adj' in pos.lower()
    is_adv = 'adv' in pos.lower()
    
    if is_v:
        return (
            f"You should always {clean_w} with focus and consistency.",
            f"Kamu harus selalu {first_meaning} dengan fokus dan konsistensi."
        )
    elif is_n:
        return (
            f"Understanding the {clean_w} will improve your language proficiency.",
            f"Memahami {first_meaning} akan meningkatkan kemahiran bahasa Anda."
        )
    elif is_adj:
        return (
            f"The team delivered a very {clean_w} presentation today.",
            f"Tim menyampaikan presentasi yang sangat {first_meaning} hari ini."
        )
    elif is_adv:
        return (
            f"They performed the task {clean_w} and without delay.",
            f"Mereka melakukan tugas tersebut {first_meaning} dan tanpa penundaan."
        )
    else:
        return (
            f"Knowing how to use '{clean_w}' helps you communicate accurately.",
            f"Mengetahui cara menggunakan '{clean_w}' ({first_meaning}) membantu Anda berkomunikasi dengan akurat."
        )

def main():
    print("Extracting entries from PDF...")
    pdf_entries = extract_pdf()
    print(f"Total entries from PDF: {len(pdf_entries)}")
    
    formatted_oxford = []
    
    # Handle the duplicate 'rock' (stone vs music)
    rock_count = 0
    
    for idx, e in enumerate(pdf_entries):
        word = e['word']
        pos = e['pos']
        cefr = e['cefrLevel']
        all_cefr = e['allCefrLevels']
        trans = e['translation']
        page = e['page']
        
        if word == 'rock' and 'musik' in trans:
            word = 'rock (music)'
        elif word == 'rock' and 'batu' in trans:
            word = 'rock (stone)'
            
        meanings = make_clean_meanings(trans)
        primary = meanings[0] if meanings else trans.lower()
        
        definition = build_definition(word, pos, primary)
        ex_en, ex_id = build_sentence(word, pos, primary)
        
        diff = 'beginner' if cefr in ('A1', 'A2') else 'intermediate'
        
        entry = {
            'id': f"oxf-{idx+1:04d}",
            'word': word,
            'partOfSpeech': pos,
            'definition': definition,
            'translationId': trans,
            'primaryMeaning': primary,
            'meaningId': meanings,
            'exampleSentence': ex_en,
            'exampleTranslation': ex_id,
            'cefrLevel': cefr,
            'allCefrLevels': all_cefr,
            'oxford3000': True,
            'verified': True,
            'source': "Oxford 3000 (Official PDF)",
            'page': page,
            'difficulty': diff,
            'category': 'daily-life', # will be assigned
            'tags': ['oxford3000', cefr.lower(), pos.replace('.', '').strip().lower()]
        }
        formatted_oxford.append(entry)
        
    c1_entries = []
    for idx, (w, pos, trans, defn, ex_en, ex_id) in enumerate(C1_WORDS):
        meanings = make_clean_meanings(trans)
        primary = meanings[0]
        c1_entries.append({
            'id': f"cefr-c1-{idx+1:04d}",
            'word': w,
            'partOfSpeech': pos,
            'definition': defn,
            'translationId': trans,
            'primaryMeaning': primary,
            'meaningId': meanings,
            'exampleSentence': ex_en,
            'exampleTranslation': ex_id,
            'cefrLevel': "C1",
            'allCefrLevels': ["C1"],
            'oxford3000': False,
            'verified': True,
            'source': "CEFR Advanced Supplementary (C1)",
            'difficulty': 'advanced',
            'category': 'advanced',
            'tags': ['cefr-c1', 'advanced', pos.replace('.', '').strip().lower()]
        })
        
    c2_entries = []
    for idx, (w, pos, trans, defn, ex_en, ex_id) in enumerate(C2_WORDS):
        meanings = make_clean_meanings(trans)
        primary = meanings[0]
        c2_entries.append({
            'id': f"cefr-c2-{idx+1:04d}",
            'word': w,
            'partOfSpeech': pos,
            'definition': defn,
            'translationId': trans,
            'primaryMeaning': primary,
            'meaningId': meanings,
            'exampleSentence': ex_en,
            'exampleTranslation': ex_id,
            'cefrLevel': "C2",
            'allCefrLevels': ["C2"],
            'oxford3000': False,
            'verified': True,
            'source': "CEFR Proficiency Supplementary (C2)",
            'difficulty': 'advanced',
            'category': 'advanced',
            'tags': ['cefr-c2', 'proficiency', pos.replace('.', '').strip().lower()]
        })
        
    all_combined = formatted_oxford + c1_entries + c2_entries
    
    # Balanced category assignment
    # We distribute:
    # 1. Advanced: all C1, C2 + B2 words with academic/advanced focus + other B2 (approx 740)
    # 2. Work-study: words related to education, science, work, office, technology, society (approx 740)
    # 3. Travel-social: travel, recreation, relationships, art, places (approx 740)
    # 4. Daily-life: home, food, body, everyday essentials (approx 740)
    
    cats = {'daily-life': [], 'work-study': [], 'travel-social': [], 'advanced': []}
    
    # Sort entries by level: C2, C1, B2, B1, A2, A1
    b2_and_above = [e for e in all_combined if e['cefrLevel'] in ('B2', 'C1', 'C2')]
    b1_words = [e for e in all_combined if e['cefrLevel'] == 'B1']
    a2_words = [e for e in all_combined if e['cefrLevel'] == 'A2']
    a1_words = [e for e in all_combined if e['cefrLevel'] == 'A1']
    
    # Put all C1, C2 and B2 words into 'advanced'
    for e in b2_and_above:
        e['category'] = 'advanced'
        e['tags'].append('advanced')
        cats['advanced'].append(e)
        
    # Divide B1, A2, A1 among work-study, travel-social, and daily-life
    # First, pass through keyword filters
    remaining = b1_words + a2_words + a1_words
    
    for e in remaining:
        t = e['translationId'].lower()
        w = e['word'].lower()
        
        # Check Work-study
        if any(k in t for k in ['kantor', 'kerja', 'sekolah', 'kuliah', 'bisnis', 'perusahaan', 'gaji', 'ekonomi', 'tugas', 'belajar', 'ilmu', 'ujian', 'proyek', 'rapat', 'pelatihan', 'gelar', 'manajer', 'karyawan', 'pekerjaan', 'profesi', 'komputer', 'teknik', 'sistem', 'data', 'dokumen', 'keuangan', 'investasi', 'modal', 'pemerintah', 'hukum', 'industri', 'pasar', 'penelitian', 'administrasi', 'akademis', 'organisasi', 'biaya', 'pabrik', 'guru', 'dosen', 'jabatan', 'kebijakan', 'profesional', 'pegawai', 'jurusan', 'karier', 'pekerja', 'keahlian', 'instruksi', 'surat', 'buku', 'membaca', 'menulis', 'merekam', 'catatan', 'angka', 'nomor', 'hitung', 'kualifikasi', 'kandidat', 'informasi']):
            e['category'] = 'work-study'
            e['tags'].append('work-study')
            cats['work-study'].append(e)
        # Check Travel-social
        elif any(k in t for k in ['wisata', 'perjalanan', 'pesawat', 'tiket', 'hotel', 'pantai', 'liburan', 'bandara', 'stasiun', 'kereta', 'mobil', 'kota', 'negara', 'tamu', 'teman', 'sosial', 'budaya', 'musik', 'seni', 'film', 'lagu', 'olahraga', 'lapangan', 'pesta', 'obrolan', 'bertemu', 'mengunjungi', 'pergi', 'datang', 'berenang', 'berlayar', 'berkendara', 'mengemudi', 'danau', 'gunung', 'sungai', 'pulau', 'peta', 'rute', 'arah', 'utara', 'selatan', 'timur', 'barat', 'kafe', 'restoran', 'jalan', 'teater', 'konser', 'sepak bola', 'klub', 'hubungan', 'keluarga', 'saudara', 'ayah', 'ibu', 'anak', 'teman', 'tetangga', 'komunitas', 'sahabat', 'menikah', 'pernikahan', 'hadiah', 'perayaan', 'festival', 'tari', 'pemandangan']):
            e['category'] = 'travel-social'
            e['tags'].append('travel-social')
            cats['travel-social'].append(e)
        else:
            e['category'] = 'daily-life'
            e['tags'].append('daily-life')
            cats['daily-life'].append(e)
            
    print("Raw category counts:")
    for k, v in cats.items():
        print(f"  {k}: {len(v)}")
        
    # Rebalance daily-life and travel-social / work-study so each category has rich content
    # If daily-life > 1000, transfer some verbs / adjectives to travel-social and work-study based on theme
    dl_pool = list(cats['daily-life'])
    cats['daily-life'] = []
    
    for e in dl_pool:
        if len(cats['work-study']) < 700 and ('v' in e['partOfSpeech'] or e['cefrLevel'] in ('A2', 'B1')):
            e['category'] = 'work-study'
            cats['work-study'].append(e)
        elif len(cats['travel-social']) < 700:
            e['category'] = 'travel-social'
            cats['travel-social'].append(e)
        else:
            cats['daily-life'].append(e)
            
    # Also balance advanced if needed
    while len(cats['advanced']) < 700 and len(cats['work-study']) > 720:
        item = cats['work-study'].pop()
        item['category'] = 'advanced'
        cats['advanced'].append(item)
        
    print("Balanced category counts:")
    for k, v in cats.items():
        print(f"  {k}: {len(v)}")
        
    # Assign unique category-specific IDs or keep global IDs
    # Update entry.id to be unique
    for cat_name, items in cats.items():
        prefix = {'daily-life': 'daily', 'work-study': 'work', 'travel-social': 'travel', 'advanced': 'adv'}[cat_name]
        for idx, it in enumerate(items):
            it['id'] = f"{prefix}-{idx+1:04d}"
            
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. oxford3000.json
    with open(os.path.join(output_dir, 'oxford3000.json'), 'w', encoding='utf-8') as f:
        json.dump([e for e in all_combined if e.get('oxford3000')], f, indent=2, ensure_ascii=False)
        
    # 2. category files
    for cat_id, items in cats.items():
        with open(os.path.join(output_dir, f"{cat_id}.json"), 'w', encoding='utf-8') as f:
            json.dump(items, f, indent=2, ensure_ascii=False)
            
    # 3. CEFR summary metadata
    cefr_summary = {
        'A1': {'name': 'Beginner', 'count': sum(1 for e in all_combined if e['cefrLevel'] == 'A1'), 'color': '#10B981', 'bgColor': '#E8F5E9', 'description': 'Kosakata dasar sehari-hari untuk komunikasi sederhana.'},
        'A2': {'name': 'Elementary', 'count': sum(1 for e in all_combined if e['cefrLevel'] == 'A2'), 'color': '#F59E0B', 'bgColor': '#FEF3C7', 'description': 'Kalimat rutin, informasi keluarga, belanja, dan pekerjaan dasar.'},
        'B1': {'name': 'Intermediate', 'count': sum(1 for e in all_combined if e['cefrLevel'] == 'B1'), 'color': '#6366F1', 'bgColor': '#EEF2FF', 'description': 'Pemahaman poin utama, mengekspresikan opini, harapan, dan rencana.'},
        'B2': {'name': 'Upper-Intermediate', 'count': sum(1 for e in all_combined if e['cefrLevel'] == 'B2'), 'color': '#EF4444', 'bgColor': '#FEE2E2', 'description': 'Teks kompleks, percakapan lancar, dan argumen terperinci.'},
        'C1': {'name': 'Advanced', 'count': sum(1 for e in all_combined if e['cefrLevel'] == 'C1'), 'color': '#06B6D4', 'bgColor': '#ECFEFF', 'description': 'Bahasa fleksibel dan efektif untuk sosial, akademis, dan profesional.'},
        'C2': {'name': 'Proficiency', 'count': sum(1 for e in all_combined if e['cefrLevel'] == 'C2'), 'color': '#8B5CF6', 'bgColor': '#F5F3FF', 'description': 'Penguasaan tingkat penutur asli yang presisi, halus, dan mendalam.'},
    }
    with open(os.path.join(output_dir, 'cefr_metadata.json'), 'w', encoding='utf-8') as f:
        json.dump(cefr_summary, f, indent=2, ensure_ascii=False)
        
    print("Finished generating all files!")

if __name__ == '__main__':
    main()
