import json, re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/wiktionary_raw.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print('Total rows:', len(data))
pattern = re.compile(r'^([a-zA-Z\s\-\'\.]+?)\s*\{([a-z]+)\}\s*(?:\((.*?)\))?\s*(?:\((.*?)\))?$')

clean_entries = {}
for row in data:
    id_lemma = row[0].strip()
    definitions = row[5]
    for d in definitions:
        m = pattern.match(d)
        if m:
            en_word = m.group(1).strip().lower()
            pos_raw = m.group(2).strip()
            desc = (m.group(3) or '').strip()
            syns = (m.group(4) or '').strip()
            
            # Map pos
            pos = 'noun'
            if pos_raw in ('v', 'vi', 'vt'): pos = 'verb'
            elif pos_raw in ('adj', 'a'): pos = 'adjective'
            elif pos_raw in ('adv', 'r'): pos = 'adverb'
            elif pos_raw in ('n', 's'): pos = 'noun'
            elif pos_raw in ('phrase', 'exp'): pos = 'phrase'
            elif pos_raw in ('prep',): pos = 'preposition'
            elif pos_raw in ('conj',): pos = 'conjunction'
            
            # Filter clean indonesian words
            meanings = set()
            if id_lemma and len(id_lemma) > 1 and not id_lemma.startswith('ke-'):
                meanings.add(id_lemma.lower())
            if syns:
                for s in syns.split(','):
                    s = s.strip().lower()
                    if s and len(s) > 1:
                        meanings.add(s)
            
            if len(en_word) > 1 and not re.search(r'\d', en_word) and meanings:
                if en_word not in clean_entries:
                    clean_entries[en_word] = {
                        'pos': pos,
                        'meanings': list(meanings),
                        'desc': desc
                    }
                else:
                    for m_item in meanings:
                        if m_item not in clean_entries[en_word]['meanings']:
                            clean_entries[en_word]['meanings'].append(m_item)

print('Total clean English headwords:', len(clean_entries))
samples = list(clean_entries.items())[:15]
for w, info in samples:
    print(w, '->', info['pos'], info['meanings'][:3], '|', info['desc'])
