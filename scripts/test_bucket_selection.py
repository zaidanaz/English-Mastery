import json, re

with open('scripts/oxford_3000.json', 'r', encoding='utf-8') as f:
    ox3 = json.load(f)
with open('scripts/oxford_5000.json', 'r', encoding='utf-8') as f:
    ox5 = json.load(f)

# Combine and normalize
combined = {}
for entry in list(ox3.values()) + list(ox5.values()):
    w = entry.get('word', '').strip().lower()
    # clean word: only letters and hyphens, len >= 2
    if len(w) >= 2 and re.match(r'^[a-z\-]+$', w) and w not in combined:
        combined[w] = entry

print('Available unique words:', len(combined))

# Curate category seed words and priorities
cat1_seeds = [
    'food', 'cook', 'kitchen', 'eat', 'drink', 'fruit', 'vegetable', 'meat', 'bread', 'rice', 'meal',
    'breakfast', 'lunch', 'dinner', 'snack', 'water', 'tea', 'coffee', 'sugar', 'salt', 'milk', 'egg',
    'home', 'house', 'room', 'bed', 'sleep', 'door', 'window', 'floor', 'wall', 'roof', 'garden',
    'bath', 'wash', 'clean', 'soap', 'towel', 'teeth', 'tooth', 'shampoo', 'hair', 'comb', 'brush',
    'body', 'head', 'eye', 'ear', 'nose', 'mouth', 'hand', 'foot', 'arm', 'leg', 'face', 'skin', 'bone',
    'health', 'sick', 'ill', 'doctor', 'medicine', 'hospital', 'pain', 'fever', 'cough', 'cold',
    'cloth', 'wear', 'shirt', 'pant', 'dress', 'shoe', 'coat', 'hat', 'jacket', 'sock', 'skirt',
    'family', 'mother', 'father', 'parent', 'child', 'son', 'daughter', 'brother', 'sister', 'baby',
    'weather', 'rain', 'sun', 'cold', 'hot', 'warm', 'wind', 'snow', 'cloud', 'sky', 'storm',
    'routine', 'wake', 'morning', 'night', 'evening', 'daily', 'everyday', 'habit', 'nap', 'rest'
]

cat2_seeds = [
    'work', 'job', 'office', 'career', 'profession', 'employ', 'boss', 'colleague', 'staff', 'worker',
    'study', 'school', 'learn', 'teach', 'teacher', 'student', 'class', 'lesson', 'exam', 'test', 'grade',
    'university', 'college', 'degree', 'academic', 'lecture', 'course', 'professor', 'faculty', 'campus',
    'computer', 'software', 'hardware', 'data', 'program', 'internet', 'digital', 'screen', 'tech',
    'business', 'company', 'market', 'trade', 'sale', 'sell', 'buy', 'money', 'price', 'cost', 'pay',
    'manage', 'manager', 'lead', 'leader', 'organize', 'plan', 'project', 'task', 'goal', 'target',
    'skill', 'ability', 'train', 'develop', 'produce', 'product', 'industry', 'factory', 'build',
    'science', 'research', 'experiment', 'laboratory', 'theory', 'method', 'analysis', 'analyze',
    'finance', 'bank', 'fund', 'budget', 'invest', 'profit', 'economy', 'economic', 'tax', 'account',
    'contract', 'salary', 'wage', 'income', 'meeting', 'presentation', 'email', 'file', 'report',
    'document', 'schedule', 'deadline', 'client', 'performance', 'standard', 'strategy', 'decision'
]

cat3_seeds = [
    'travel', 'trip', 'journey', 'tour', 'tourist', 'tourism', 'holiday', 'vacation', 'visit', 'visitor',
    'airport', 'plane', 'flight', 'airline', 'ticket', 'passenger', 'baggage', 'luggage', 'passport',
    'hotel', 'room', 'stay', 'reservation', 'reception', 'guest', 'suite', 'resort',
    'train', 'bus', 'car', 'vehicle', 'drive', 'road', 'street', 'station', 'route', 'traffic', 'ride',
    'direction', 'map', 'city', 'town', 'country', 'place', 'location', 'north', 'south', 'east', 'west',
    'restaurant', 'cafe', 'bar', 'menu', 'order', 'serve', 'service', 'dish', 'delicious', 'taste',
    'social', 'meet', 'friend', 'people', 'person', 'talk', 'speak', 'conversation', 'chat', 'discuss',
    'party', 'celebrate', 'event', 'culture', 'custom', 'museum', 'art', 'music', 'sport', 'game',
    'polite', 'please', 'thank', 'sorry', 'welcome', 'greet', 'invite', 'agree', 'disagree', 'opinion',
    'island', 'beach', 'mountain', 'lake', 'river', 'scenery', 'guide', 'souvenir', 'arrive', 'depart'
]

cat4_seeds = [
    'abstract', 'academic', 'accurate', 'advocate', 'alleviate', 'ambiguous', 'anticipate', 'apparent',
    'arbitrary', 'articulate', 'aspect', 'assert', 'assumption', 'attitude', 'attribute', 'authentic',
    'authority', 'autonomous', 'capacity', 'category', 'cease', 'challenge', 'circumstance', 'cite',
    'clarify', 'coherent', 'coincide', 'collapse', 'colleague', 'commence', 'compatible', 'compensate',
    'compile', 'complement', 'complex', 'component', 'compound', 'comprehensive', 'comprise', 'conceive',
    'concept', 'conclude', 'concurrent', 'conduct', 'confer', 'confine', 'conform', 'consent', 'consequent',
    'consist', 'constant', 'constitute', 'constrain', 'construct', 'consult', 'consume', 'contemporary',
    'context', 'contract', 'contradict', 'contrary', 'contrast', 'contribute', 'controversy', 'convene',
    'converse', 'convert', 'convince', 'corporate', 'correspond', 'create', 'credit', 'criteria', 'crucial',
    'culture', 'currency', 'cycle', 'data', 'debate', 'decade', 'decline', 'deduce', 'define', 'definite',
    'demonstrate', 'denote', 'deny', 'depress', 'derive', 'design', 'despite', 'detect', 'deviate', 'device',
    'devote', 'differentiate', 'dimension', 'diminish', 'discrete', 'discriminate', 'displace', 'display',
    'dispose', 'distinct', 'distort', 'distribute', 'diverse', 'document', 'domain', 'domestic', 'dominate',
    'draft', 'drama', 'duration', 'dynamic', 'economy', 'edit', 'element', 'eliminate', 'emerge', 'emphasis',
    'empirical', 'enable', 'encounter', 'energy', 'enforce', 'enhance', 'enormous', 'ensure', 'entity',
    'environment', 'equate', 'equip', 'equivalent', 'erode', 'error', 'establish', 'estate', 'estimate',
    'ethic', 'ethnic', 'evaluate', 'eventual', 'evident', 'evolve', 'exceed', 'exclude', 'exhibit', 'expand',
    'expert', 'explicit', 'exploit', 'export', 'expose', 'external', 'extract', 'facilitate', 'factor',
    'feature', 'federal', 'fee', 'file', 'final', 'finance', 'finite', 'flexible', 'fluctuate', 'focus',
    'format', 'formula', 'forthcoming', 'foundation', 'framework', 'function', 'fund', 'fundamental',
    'furthermore', 'gender', 'generate', 'generation', 'globe', 'goal', 'grade', 'grant', 'guarantee',
    'guideline', 'hence', 'hierarchy', 'highlight', 'hypothesis', 'identical', 'identify', 'ideology',
    'ignorance', 'illustrate', 'image', 'immigrate', 'impact', 'implement', 'implicate', 'implicit', 'imply',
    'impose', 'incentive', 'incidence', 'incline', 'income', 'incorporate', 'index', 'indicate', 'individual',
    'induce', 'inevitable', 'infer', 'infrastructure', 'inherent', 'inhibit', 'initial', 'initiate', 'injure',
    'innovate', 'input', 'insert', 'insight', 'insist', 'inspect', 'instance', 'institute', 'instruct',
    'integral', 'integrate', 'integrity', 'intelligence', 'intense', 'interact', 'intermediate', 'internal',
    'interpret', 'interval', 'intervene', 'intrinsic', 'invest', 'investigate', 'invoke', 'involve', 'isolate',
    'issue', 'item', 'job', 'journal', 'justify', 'label', 'labor', 'layer', 'lecture', 'legal', 'legislate',
    'levy', 'liberal', 'license', 'likewise', 'link', 'locate', 'logic', 'maintain', 'major', 'manipulate',
    'manual', 'margin', 'mature', 'maximize', 'mechanism', 'media', 'mediate', 'medical', 'medium', 'mental',
    'method', 'migrate', 'military', 'minimal', 'minimize', 'minimum', 'ministry', 'minor', 'mode', 'modify',
    'monitor', 'motive', 'mutual', 'negate', 'network', 'neutral', 'nevertheless', 'nonetheless', 'norm',
    'normal', 'notion', 'notwithstanding', 'nuclear', 'objective', 'obtain', 'obvious', 'occupy', 'occur',
    'odd', 'offset', 'ongoing', 'option', 'orient', 'outcome', 'output', 'overall', 'overlap', 'overseas',
    'panel', 'paradigm', 'paragraph', 'parallel', 'parameter', 'participate', 'partner', 'passive', 'perceive',
    'percent', 'period', 'persist', 'perspective', 'phase', 'phenomenon', 'philosophy', 'physical', 'plus',
    'policy', 'portion', 'pose', 'positive', 'potential', 'practitioner', 'precede', 'precise', 'predict',
    'predominant', 'preliminary', 'presume', 'previous', 'primary', 'prime', 'principal', 'principle', 'prior',
    'priority', 'proceed', 'process', 'professional', 'prohibit', 'project', 'promote', 'proportion', 'prospect',
    'protocol', 'psychology', 'publication', 'publish', 'purchase', 'pursue', 'qualitative', 'quote', 'radical',
    'random', 'range', 'ratio', 'rational', 'react', 'recover', 'refine', 'regime', 'region', 'register',
    'regulate', 'reinforce', 'reject', 'relax', 'release', 'relevant', 'reliance', 'reluctant', 'rely', 'remove',
    'require', 'research', 'reside', 'resolve', 'resource', 'respond', 'restore', 'restrain', 'restrict', 'retain',
    'reveal', 'revenue', 'reverse', 'revise', 'revolution', 'rigid', 'role', 'route', 'scenario', 'schedule',
    'scheme', 'scope', 'section', 'sector', 'secure', 'seek', 'select', 'sequence', 'series', 'sex', 'shift',
    'significant', 'similar', 'simulate', 'site', 'so-called', 'sole', 'somewhat', 'source', 'specific', 'specify',
    'sphere', 'stable', 'statistic', 'status', 'straightforward', 'strategy', 'stress', 'structure', 'style',
    'submit', 'subordinate', 'subsequent', 'subsidy', 'substitute', 'successor', 'sufficient', 'sum', 'summary',
    'supplement', 'survey', 'survive', 'suspend', 'sustain', 'symbol', 'tape', 'target', 'task', 'team',
    'technical', 'technique', 'technology', 'temporary', 'tense', 'terminate', 'text', 'theme', 'theory',
    'thereby', 'thesis', 'topic', 'trace', 'traditional', 'transfer', 'transform', 'transit', 'transmit',
    'transport', 'trend', 'trigger', 'ultimate', 'undergo', 'underlie', 'undertake', 'uniform', 'unify',
    'unique', 'utilize', 'valid', 'vary', 'vehicle', 'version', 'via', 'violate', 'virtual', 'visible', 'vision',
    'visual', 'volume', 'voluntary', 'welfare', 'whereas', 'whereby', 'widespread'
]

# Calculate scores
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

# Sort words for each category by their respective score
ranked_c1 = sorted(combined.keys(), key=lambda w: (scores[w][0] - max(scores[w][1], scores[w][2], scores[w][3]), scores[w][0]), reverse=True)
ranked_c2 = sorted(combined.keys(), key=lambda w: (scores[w][1] - max(scores[w][0], scores[w][2], scores[w][3]), scores[w][1]), reverse=True)
ranked_c3 = sorted(combined.keys(), key=lambda w: (scores[w][2] - max(scores[w][0], scores[w][1], scores[w][3]), scores[w][2]), reverse=True)
ranked_c4 = sorted(combined.keys(), key=lambda w: (scores[w][3] - max(scores[w][0], scores[w][1], scores[w][2]), scores[w][3]), reverse=True)

# Select exactly 750 without overlap
assigned = set()
c1, c2, c3, c4 = [], [], [], []

for w in ranked_c1:
    if len(c1) < 750 and w not in assigned:
        c1.append(w); assigned.add(w)

for w in ranked_c2:
    if len(c2) < 750 and w not in assigned:
        c2.append(w); assigned.add(w)

for w in ranked_c3:
    if len(c3) < 750 and w not in assigned:
        c3.append(w); assigned.add(w)

for w in ranked_c4:
    if len(c4) < 750 and w not in assigned:
        c4.append(w); assigned.add(w)

# Fill any remaining to reach 750
remaining = [w for w in combined.keys() if w not in assigned]
for bucket in [c1, c2, c3, c4]:
    while len(bucket) < 750 and remaining:
        w = remaining.pop(0)
        bucket.append(w)
        assigned.add(w)

print(f"Final allocation: Cat1={len(c1)}, Cat2={len(c2)}, Cat3={len(c3)}, Cat4={len(c4)}")
print(f"Total allocated: {len(assigned)} (unique words)")
print("Cat1 samples:", c1[:5])
print("Cat2 samples:", c2[:5])
print("Cat3 samples:", c3[:5])
print("Cat4 samples:", c4[:5])
