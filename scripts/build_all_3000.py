"""
Complete 3,000 Vocabulary Builder for English Mastery.
Constructs:
  - src/data/vocabulary/daily-life.json (750 entries)
  - src/data/vocabulary/work-study.json (750 entries)
  - src/data/vocabulary/travel-social.json (750 entries)
  - src/data/vocabulary/advanced.json (750 entries)
"""

import json
import os
import re
import sys
import time
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor

sys.stdout.reconfigure(encoding='utf-8')

# --- Translation Helper with Retry ---
CACHE_FILE = 'scripts/translation_cache.json'
translation_cache = {}
if os.path.exists(CACHE_FILE):
    try:
        with open(CACHE_FILE, 'r', encoding='utf-8') as f:
            translation_cache = json.load(f)
        print(f"Loaded {len(translation_cache)} cached translations.")
    except Exception:
        translation_cache = {}

def save_cache():
    try:
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(translation_cache, f, ensure_ascii=False)
    except Exception:
        pass

def translate_text(text):
    text_clean = text.strip()
    if not text_clean:
        return ""
    if text_clean in translation_cache:
        return translation_cache[text_clean]
    
    url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=' + urllib.parse.quote(text_clean)
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=8) as resp:
                res = json.loads(resp.read().decode('utf-8'))
                translated = ''.join([part[0] for part in res[0]]).strip()
                translation_cache[text_clean] = translated
                return translated
        except Exception:
            time.sleep(0.5 * (attempt + 1))
    
    translation_cache[text_clean] = text_clean
    return text_clean

def normalize_pos(raw_pos):
    raw = (raw_pos or 'noun').lower().strip()
    if 'verb' in raw or raw in ('v', 'vi', 'vt'):
        return 'verb'
    if 'adj' in raw or raw in ('a',):
        return 'adjective'
    if 'adv' in raw or raw in ('r',):
        return 'adverb'
    if 'noun' in raw or raw in ('n', 's'):
        return 'noun'
    if 'prep' in raw:
        return 'preposition'
    if 'conj' in raw:
        return 'conjunction'
    if 'phras' in raw:
        return 'phrasal verb'
    if 'idiom' in raw or 'expr' in raw:
        return 'expression'
    return 'noun'

def normalize_cefr(cefr, default_diff='intermediate'):
    c = (cefr or '').lower().strip()
    if c in ('a1', 'a2'):
        return 'beginner'
    if c in ('b1', 'b2'):
        return 'intermediate'
    if c in ('c1', 'c2'):
        return 'advanced'
    return default_diff

def make_sentence_if_needed(word, pos, orig_example):
    ex = (orig_example or '').strip()
    # Check if example is a full sentence (ends with punctuation, has > 3 words)
    if ex and len(ex.split()) >= 4 and ex[-1] in ('.', '!', '?') and word.lower() in ex.lower():
        return ex
    
    # Generate natural sentence
    w = word.strip()
    if pos == 'verb':
        return f"They decided to {w} the project carefully."
    elif pos == 'noun':
        return f"This {w} is essential for our daily progress."
    elif pos == 'adjective':
        return f"The new design looks very {w} and effective."
    elif pos == 'adverb':
        return f"He performed his duties {w} throughout the day."
    else:
        return f"Understanding the word {w} helps improve your English."

def main():
    print("Loading Oxford and Wiktionary data...")
    with open('scripts/oxford_3000.json', 'r', encoding='utf-8') as f:
        ox3 = json.load(f)
    with open('scripts/oxford_5000.json', 'r', encoding='utf-8') as f:
        ox5 = json.load(f)
    with open('scripts/wiktionary_raw.json', 'r', encoding='utf-8') as f:
        wik_raw = json.load(f)

    # Parse wiktionary synonyms map
    wik_map = {}
    pattern = re.compile(r'^([a-zA-Z\s\-]+?)\s*\{([a-z]+)\}\s*(?:\((.*?)\))?\s*(?:\((.*?)\))?$')
    for row in wik_raw:
        id_lemma = row[0].strip().lower()
        definitions = row[5]
        for d in definitions:
            m = pattern.match(d)
            if m:
                en = m.group(1).strip().lower()
                syns = (m.group(4) or '').strip()
                meanings = []
                if id_lemma and len(id_lemma) > 1 and not id_lemma.startswith('ke-'):
                    meanings.append(id_lemma)
                if syns:
                    for s in syns.split(','):
                        s = s.strip().lower()
                        if s and len(s) > 1 and s not in meanings:
                            meanings.append(s)
                if meanings:
                    if en not in wik_map:
                        wik_map[en] = set()
                    wik_map[en].update(meanings)

    # Combine unique words
    combined = {}
    for entry in list(ox3.values()) + list(ox5.values()):
        w = entry.get('word', '').strip().lower()
        if len(w) >= 2 and re.match(r'^[a-z\-]+$', w) and w not in combined:
            combined[w] = entry

    print(f"Total candidate words: {len(combined)}")

    # Category seeds
    cat1_seeds = ['food', 'cook', 'kitchen', 'eat', 'drink', 'fruit', 'vegetable', 'meat', 'bread', 'rice', 'meal', 'breakfast', 'lunch', 'dinner', 'snack', 'water', 'tea', 'coffee', 'sugar', 'salt', 'milk', 'egg', 'home', 'house', 'room', 'bed', 'sleep', 'door', 'window', 'floor', 'wall', 'roof', 'garden', 'bath', 'wash', 'clean', 'soap', 'towel', 'teeth', 'tooth', 'shampoo', 'hair', 'comb', 'brush', 'body', 'head', 'eye', 'ear', 'nose', 'mouth', 'hand', 'foot', 'arm', 'leg', 'face', 'skin', 'bone', 'health', 'sick', 'ill', 'doctor', 'medicine', 'hospital', 'pain', 'fever', 'cough', 'cold', 'cloth', 'wear', 'shirt', 'pant', 'dress', 'shoe', 'coat', 'hat', 'jacket', 'sock', 'skirt', 'family', 'mother', 'father', 'parent', 'child', 'son', 'daughter', 'brother', 'sister', 'baby', 'weather', 'rain', 'sun', 'cold', 'hot', 'warm', 'wind', 'snow', 'cloud', 'sky', 'storm', 'routine', 'wake', 'morning', 'night', 'evening', 'daily', 'everyday', 'habit', 'nap', 'rest']
    cat2_seeds = ['work', 'job', 'office', 'career', 'profession', 'employ', 'boss', 'colleague', 'staff', 'worker', 'study', 'school', 'learn', 'teach', 'teacher', 'student', 'class', 'lesson', 'exam', 'test', 'grade', 'university', 'college', 'degree', 'academic', 'lecture', 'course', 'professor', 'faculty', 'campus', 'computer', 'software', 'hardware', 'data', 'program', 'internet', 'digital', 'screen', 'tech', 'business', 'company', 'market', 'trade', 'sale', 'sell', 'buy', 'money', 'price', 'cost', 'pay', 'manage', 'manager', 'lead', 'leader', 'organize', 'plan', 'project', 'task', 'goal', 'target', 'skill', 'ability', 'train', 'develop', 'produce', 'product', 'industry', 'factory', 'build', 'science', 'research', 'experiment', 'laboratory', 'theory', 'method', 'analysis', 'analyze', 'finance', 'bank', 'fund', 'budget', 'invest', 'profit', 'economy', 'economic', 'tax', 'account', 'contract', 'salary', 'wage', 'income', 'meeting', 'presentation', 'email', 'file', 'report', 'document', 'schedule', 'deadline', 'client', 'performance', 'standard', 'strategy', 'decision']
    cat3_seeds = ['travel', 'trip', 'journey', 'tour', 'tourist', 'tourism', 'holiday', 'vacation', 'visit', 'visitor', 'airport', 'plane', 'flight', 'airline', 'ticket', 'passenger', 'baggage', 'luggage', 'passport', 'hotel', 'room', 'stay', 'reservation', 'reception', 'guest', 'suite', 'resort', 'train', 'bus', 'car', 'vehicle', 'drive', 'road', 'street', 'station', 'route', 'traffic', 'ride', 'direction', 'map', 'city', 'town', 'country', 'place', 'location', 'north', 'south', 'east', 'west', 'restaurant', 'cafe', 'bar', 'menu', 'order', 'serve', 'service', 'dish', 'delicious', 'taste', 'social', 'meet', 'friend', 'people', 'person', 'talk', 'speak', 'conversation', 'chat', 'discuss', 'party', 'celebrate', 'event', 'culture', 'custom', 'museum', 'art', 'music', 'sport', 'game', 'polite', 'please', 'thank', 'sorry', 'welcome', 'greet', 'invite', 'agree', 'disagree', 'opinion', 'island', 'beach', 'mountain', 'lake', 'river', 'scenery', 'guide', 'souvenir', 'arrive', 'depart']
    cat4_seeds = ['abstract', 'academic', 'accurate', 'advocate', 'alleviate', 'ambiguous', 'anticipate', 'apparent', 'arbitrary', 'articulate', 'aspect', 'assert', 'assumption', 'attitude', 'attribute', 'authentic', 'authority', 'autonomous', 'capacity', 'category', 'cease', 'challenge', 'circumstance', 'cite', 'clarify', 'coherent', 'coincide', 'collapse', 'colleague', 'commence', 'compatible', 'compensate', 'compile', 'complement', 'complex', 'component', 'compound', 'comprehensive', 'comprise', 'conceive', 'concept', 'conclude', 'concurrent', 'conduct', 'confer', 'confine', 'conform', 'consent', 'consequent', 'consist', 'constant', 'constitute', 'constrain', 'construct', 'consult', 'consume', 'contemporary', 'context', 'contract', 'contradict', 'contrary', 'contrast', 'contribute', 'controversy', 'convene', 'converse', 'convert', 'convince', 'corporate', 'correspond', 'create', 'credit', 'criteria', 'crucial', 'culture', 'currency', 'cycle', 'data', 'debate', 'decade', 'decline', 'deduce', 'define', 'definite', 'demonstrate', 'denote', 'deny', 'depress', 'derive', 'design', 'despite', 'detect', 'deviate', 'device', 'devote', 'differentiate', 'dimension', 'diminish', 'discrete', 'discriminate', 'displace', 'display', 'dispose', 'distinct', 'distort', 'distribute', 'diverse', 'document', 'domain', 'domestic', 'dominate', 'draft', 'drama', 'duration', 'dynamic', 'economy', 'edit', 'element', 'eliminate', 'emerge', 'emphasis', 'empirical', 'enable', 'encounter', 'energy', 'enforce', 'enhance', 'enormous', 'ensure', 'entity', 'environment', 'equate', 'equip', 'equivalent', 'erode', 'error', 'establish', 'estate', 'estimate', 'ethic', 'ethnic', 'evaluate', 'eventual', 'evident', 'evolve', 'exceed', 'exclude', 'exhibit', 'expand', 'expert', 'explicit', 'exploit', 'export', 'expose', 'external', 'extract', 'facilitate', 'factor', 'feature', 'federal', 'fee', 'file', 'final', 'finance', 'finite', 'flexible', 'fluctuate', 'focus', 'format', 'formula', 'forthcoming', 'foundation', 'framework', 'function', 'fund', 'fundamental', 'furthermore', 'gender', 'generate', 'generation', 'globe', 'goal', 'grade', 'grant', 'guarantee', 'guideline', 'hence', 'hierarchy', 'highlight', 'hypothesis', 'identical', 'identify', 'ideology', 'ignorance', 'illustrate', 'image', 'immigrate', 'impact', 'implement', 'implicate', 'implicit', 'imply', 'impose', 'incentive', 'incidence', 'incline', 'income', 'incorporate', 'index', 'indicate', 'individual', 'induce', 'inevitable', 'infer', 'infrastructure', 'inherent', 'inhibit', 'initial', 'initiate', 'injure', 'innovate', 'input', 'insert', 'insight', 'insist', 'inspect', 'instance', 'institute', 'instruct', 'integral', 'integrate', 'integrity', 'intelligence', 'intense', 'interact', 'intermediate', 'internal', 'interpret', 'interval', 'intervene', 'intrinsic', 'invest', 'investigate', 'invoke', 'involve', 'isolate', 'issue', 'item', 'job', 'journal', 'justify', 'label', 'labor', 'layer', 'lecture', 'legal', 'legislate', 'levy', 'liberal', 'license', 'likewise', 'link', 'locate', 'logic', 'maintain', 'major', 'manipulate', 'manual', 'margin', 'mature', 'maximize', 'mechanism', 'media', 'mediate', 'medical', 'medium', 'mental', 'method', 'migrate', 'military', 'minimal', 'minimize', 'minimum', 'ministry', 'minor', 'mode', 'modify', 'monitor', 'motive', 'mutual', 'negate', 'network', 'neutral', 'nevertheless', 'nonetheless', 'norm', 'normal', 'notion', 'notwithstanding', 'nuclear', 'objective', 'obtain', 'obvious', 'occupy', 'occur', 'odd', 'offset', 'ongoing', 'option', 'orient', 'outcome', 'output', 'overall', 'overlap', 'overseas', 'panel', 'paradigm', 'paragraph', 'parallel', 'parameter', 'participate', 'partner', 'passive', 'perceive', 'percent', 'period', 'persist', 'perspective', 'phase', 'phenomenon', 'philosophy', 'physical', 'plus', 'policy', 'portion', 'pose', 'positive', 'potential', 'practitioner', 'precede', 'precise', 'predict', 'predominant', 'preliminary', 'presume', 'previous', 'primary', 'prime', 'principal', 'principle', 'prior', 'priority', 'proceed', 'process', 'professional', 'prohibit', 'project', 'promote', 'proportion', 'prospect', 'protocol', 'psychology', 'publication', 'publish', 'purchase', 'pursue', 'qualitative', 'quote', 'radical', 'random', 'range', 'ratio', 'rational', 'react', 'recover', 'refine', 'regime', 'region', 'register', 'regulate', 'reinforce', 'reject', 'relax', 'release', 'relevant', 'reliance', 'reluctant', 'rely', 'remove', 'require', 'research', 'reside', 'resolve', 'resource', 'respond', 'restore', 'restrain', 'restrict', 'retain', 'reveal', 'revenue', 'reverse', 'revise', 'revolution', 'rigid', 'role', 'route', 'scenario', 'schedule', 'scheme', 'scope', 'section', 'sector', 'secure', 'seek', 'select', 'sequence', 'series', 'sex', 'shift', 'significant', 'similar', 'simulate', 'site', 'so-called', 'sole', 'somewhat', 'source', 'specific', 'specify', 'sphere', 'stable', 'statistic', 'status', 'straightforward', 'strategy', 'stress', 'structure', 'style', 'submit', 'subordinate', 'subsequent', 'subsidy', 'substitute', 'successor', 'sufficient', 'sum', 'summary', 'supplement', 'survey', 'survive', 'suspend', 'sustain', 'symbol', 'tape', 'target', 'task', 'team', 'technical', 'technique', 'technology', 'temporary', 'tense', 'terminate', 'text', 'theme', 'theory', 'thereby', 'thesis', 'topic', 'trace', 'traditional', 'transfer', 'transform', 'transit', 'transmit', 'transport', 'trend', 'trigger', 'ultimate', 'undergo', 'underlie', 'undertake', 'uniform', 'unify', 'unique', 'utilize', 'valid', 'vary', 'vehicle', 'version', 'via', 'violate', 'virtual', 'visible', 'vision', 'visual', 'volume', 'voluntary', 'welfare', 'whereas', 'whereby', 'widespread']

    # Rank each word
    scores = {}
    for w, entry in combined.items():
        desc = (entry.get('definition', '') + ' ' + entry.get('example', '')).lower()
        s1 = sum(1 for k in cat1_seeds if k in w or k in desc)
        s2 = sum(1 for k in cat2_seeds if k in w or k in desc)
        s3 = sum(1 for k in cat3_seeds if k in w or k in desc)
        s4 = sum(1 for k in cat4_seeds if k in w or k in desc)
        cefr = entry.get('cefr', '').lower()
        if cefr in ('c1', 'b2'): s4 += 2
        if cefr == 'a1': s1 += 2; s3 += 1
        scores[w] = (s1, s2, s3, s4)

    ranked_c1 = sorted(combined.keys(), key=lambda w: (scores[w][0] - max(scores[w][1], scores[w][2], scores[w][3]), scores[w][0]), reverse=True)
    ranked_c2 = sorted(combined.keys(), key=lambda w: (scores[w][1] - max(scores[w][0], scores[w][2], scores[w][3]), scores[w][1]), reverse=True)
    ranked_c3 = sorted(combined.keys(), key=lambda w: (scores[w][2] - max(scores[w][0], scores[w][1], scores[w][3]), scores[w][2]), reverse=True)
    ranked_c4 = sorted(combined.keys(), key=lambda w: (scores[w][3] - max(scores[w][0], scores[w][1], scores[w][2]), scores[w][3]), reverse=True)

    assigned = set()
    buckets = {'daily-life': [], 'work-study': [], 'travel-social': [], 'advanced': []}

    for w in ranked_c1:
        if len(buckets['daily-life']) < 750 and w not in assigned:
            buckets['daily-life'].append(w); assigned.add(w)
    for w in ranked_c2:
        if len(buckets['work-study']) < 750 and w not in assigned:
            buckets['work-study'].append(w); assigned.add(w)
    for w in ranked_c3:
        if len(buckets['travel-social']) < 750 and w not in assigned:
            buckets['travel-social'].append(w); assigned.add(w)
    for w in ranked_c4:
        if len(buckets['advanced']) < 750 and w not in assigned:
            buckets['advanced'].append(w); assigned.add(w)

    remaining = [w for w in combined.keys() if w not in assigned]
    for b_name in ['daily-life', 'work-study', 'travel-social', 'advanced']:
        while len(buckets[b_name]) < 750 and remaining:
            w = remaining.pop(0)
            buckets[b_name].append(w); assigned.add(w)

    for k, v in buckets.items():
        print(f"Bucket {k}: {len(v)} entries")

    # Now prepare words and sentences to translate
    words_to_translate = []
    sentences_to_translate = []
    metadata = {}

    cat_prefix_map = {
        'daily-life': 'daily',
        'work-study': 'work',
        'travel-social': 'travel',
        'advanced': 'adv'
    }

    cat_tags_map = {
        'daily-life': ['daily', 'essential'],
        'work-study': ['work', 'education'],
        'travel-social': ['travel', 'social'],
        'advanced': ['advanced', 'mastery']
    }

    for cat_name, word_list in buckets.items():
        prefix = cat_prefix_map[cat_name]
        default_diff = 'beginner' if cat_name == 'daily-life' else ('advanced' if cat_name == 'advanced' else 'intermediate')
        
        for idx, w in enumerate(word_list, 1):
            entry = combined[w]
            pos = normalize_pos(entry.get('type', 'noun'))
            diff = normalize_cefr(entry.get('cefr'), default_diff)
            sentence = make_sentence_if_needed(w, pos, entry.get('example', ''))
            
            entry_id = f"{prefix}-{idx:04d}"
            metadata[entry_id] = {
                'id': entry_id,
                'word': w,
                'partOfSpeech': pos,
                'difficulty': diff,
                'exampleSentence': sentence,
                'category': cat_name,
                'tags': cat_tags_map[cat_name]
            }
            words_to_translate.append((entry_id, w))
            sentences_to_translate.append((entry_id, sentence))

    print(f"Translating {len(words_to_translate)} words and {len(sentences_to_translate)} sentences concurrently...")

    # Translate words
    with ThreadPoolExecutor(max_workers=20) as ex:
        word_translations = list(ex.map(lambda pair: (pair[0], translate_text(pair[1])), words_to_translate))

    # Translate sentences
    with ThreadPoolExecutor(max_workers=20) as ex:
        sentence_translations = list(ex.map(lambda pair: (pair[0], translate_text(pair[1])), sentences_to_translate))

    save_cache()
    print("Translations complete. Building final JSON entries...")

    word_trans_map = dict(word_translations)
    sent_trans_map = dict(sentence_translations)

    # Build final entries grouped by category
    final_categories = {'daily-life': [], 'work-study': [], 'travel-social': [], 'advanced': []}

    for entry_id, meta in metadata.items():
        w = meta['word']
        primary = word_trans_map.get(entry_id, '').lower().strip()
        if not primary:
            primary = w
        
        # Build meanings array
        meanings = [primary]
        # Check wiktionary synonyms
        if w in wik_map:
            for syn in wik_map[w]:
                syn_clean = syn.lower().strip()
                if syn_clean and syn_clean not in meanings:
                    meanings.append(syn_clean)
        
        sentence_tr = sent_trans_map.get(entry_id, '').strip()
        if not sentence_tr:
            sentence_tr = meta['exampleSentence']

        entry_obj = {
            "id": meta['id'],
            "word": meta['word'],
            "partOfSpeech": meta['partOfSpeech'],
            "meaningId": meanings,
            "primaryMeaning": primary,
            "difficulty": meta['difficulty'],
            "exampleSentence": meta['exampleSentence'],
            "exampleTranslation": sentence_tr,
            "category": meta['category'],
            "tags": meta['tags']
        }
        final_categories[meta['category']].append(entry_obj)

    os.makedirs('src/data/vocabulary', exist_ok=True)
    filename_map = {
        'daily-life': 'src/data/vocabulary/daily-life.json',
        'work-study': 'src/data/vocabulary/work-study.json',
        'travel-social': 'src/data/vocabulary/travel-social.json',
        'advanced': 'src/data/vocabulary/advanced.json'
    }

    all_headwords = set()
    total_entries = 0

    for cat_name, entries in final_categories.items():
        filepath = filename_map[cat_name]
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(entries, f, ensure_ascii=False, indent=2)
        print(f"Saved {filepath} with {len(entries)} entries.")
        total_entries += len(entries)
        for e in entries:
            all_headwords.add(e['word'].lower())

    print("\n==========================================")
    print(f"GENERATION COMPLETE:")
    print(f"Total entries: {total_entries} (expected 3000)")
    print(f"Unique headwords: {len(all_headwords)} (expected 3000)")
    print("==========================================")

if __name__ == '__main__':
    main()
