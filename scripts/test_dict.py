import json, re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/wiktionary_raw.json', 'r', encoding='utf-8') as f:
    raw = json.load(f)

pattern = re.compile(r'^([a-zA-Z\s\-]+?)\s*\{([a-z]+)\}\s*(?:\((.*?)\))?\s*(?:\((.*?)\))?$')
dict_words = {}

for row in raw:
    id_lemma = row[0].strip()
    definitions = row[5]
    for d in definitions:
        m = pattern.match(d)
        if m:
            en = m.group(1).strip().lower()
            pos = m.group(2).strip()
            desc = (m.group(3) or '').strip()
            syns = (m.group(4) or '').strip()
            
            # clean id lemma
            id_words = []
            if id_lemma and len(id_lemma) > 1 and not id_lemma.startswith('ke-'):
                id_words.append(id_lemma.lower())
            if syns:
                for s in syns.split(','):
                    s = s.strip().lower()
                    if s and len(s) > 1 and s not in id_words:
                        id_words.append(s)
            
            if len(en) >= 2 and re.match(r'^[a-z\s\-]+$', en) and id_words:
                if en not in dict_words:
                    dict_words[en] = {'pos': pos, 'meanings': id_words, 'desc': desc}
                else:
                    for iw in id_words:
                        if iw not in dict_words[en]['meanings']:
                            dict_words[en]['meanings'].append(iw)

print('Loaded dictionary entries:', len(dict_words))

# Check samples of common words
test_words = ['maintain', 'computer', 'airport', 'philosophy', 'kitchen', 'doctor', 'ticket', 'strategy']
for tw in test_words:
    if tw in dict_words:
        print(f"Found {tw}: pos={dict_words[tw]['pos']}, meanings={dict_words[tw]['meanings'][:3]}, desc={dict_words[tw]['desc']}")
    else:
        print(f"Not found: {tw}")
