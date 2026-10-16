import json, re

with open('scripts/wiktionary_raw.json', 'r', encoding='utf-8') as f:
    raw = json.load(f)

pattern = re.compile(r'^([a-zA-Z\s\-]+?)\s*\{([a-z]+)\}\s*(?:\((.*?)\))?\s*(?:\((.*?)\))?$')
entries = {}

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
            
            meanings = []
            for item in [id_lemma] + [s.strip() for s in syns.split(',') if s.strip()]:
                item = item.lower().strip()
                if not item or len(item) < 2 or item.startswith('ke-'): continue
                meanings.append(item)
            
            if len(en) >= 2 and re.match(r'^[a-z\s\-]+$', en) and meanings:
                if en not in entries:
                    entries[en] = {'pos': pos, 'meanings': list(set(meanings)), 'desc': desc}
                else:
                    for m_item in meanings:
                        if m_item not in entries[en]['meanings']:
                            entries[en]['meanings'].append(m_item)

print('Total entries available:', len(entries))

# Test keyword matching for categorization
cat1_keywords = ['food', 'cook', 'kitchen', 'home', 'house', 'body', 'cloth', 'wear', 'health', 'sick', 'family', 'eat', 'drink', 'sleep', 'fruit', 'vegetable', 'animal', 'room', 'bed', 'clean', 'wash']
cat2_keywords = ['work', 'study', 'school', 'office', 'job', 'business', 'money', 'compu', 'tech', 'science', 'math', 'manage', 'industry', 'law', 'econom', 'teach', 'learn', 'degree', 'exam']
cat3_keywords = ['travel', 'hotel', 'plane', 'train', 'car', 'road', 'trip', 'visit', 'city', 'country', 'tour', 'talk', 'social', 'meet', 'friend', 'speak', 'guest', 'ticket', 'station', 'restaur']

c1, c2, c3, c4 = [], [], [], []
for w, info in entries.items():
    text = (w + ' ' + info['desc'] + ' ' + ' '.join(info['meanings'])).lower()
    if any(k in text for k in cat1_keywords):
        c1.append(w)
    elif any(k in text for k in cat2_keywords):
        c2.append(w)
    elif any(k in text for k in cat3_keywords):
        c3.append(w)
    else:
        c4.append(w)

print(f"Initial split: Cat1={len(c1)}, Cat2={len(c2)}, Cat3={len(c3)}, Cat4={len(c4)}")
