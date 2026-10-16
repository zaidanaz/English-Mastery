import json, re

with open('scripts/oxford_3000.json', 'r', encoding='utf-8') as f:
    ox3 = json.load(f)

with open('scripts/oxford_5000.json', 'r', encoding='utf-8') as f:
    ox5 = json.load(f)

combined = {}
for entry in list(ox3.values()) + list(ox5.values()):
    w = entry.get('word', '').strip().lower()
    if len(w) >= 2 and re.match(r'^[a-z\-]+$', w) and w not in combined:
        combined[w] = entry

print('Available unique headwords:', len(combined))

# Define topic keywords
cat1_kw = [
    'food', 'cook', 'kitchen', 'eat', 'drink', 'fruit', 'vegetable', 'meat', 'bread', 'rice', 'meal',
    'breakfast', 'lunch', 'dinner', 'snack', 'water', 'tea', 'coffee', 'sugar', 'salt', 'milk', 'egg',
    'home', 'house', 'room', 'bed', 'sleep', 'door', 'window', 'floor', 'wall', 'roof', 'garden',
    'bath', 'wash', 'clean', 'soap', 'towel', 'teeth', 'tooth', 'shampoo',
    'body', 'head', 'eye', 'ear', 'nose', 'mouth', 'hand', 'foot', 'arm', 'leg', 'hair', 'face', 'skin',
    'health', 'sick', 'ill', 'doctor', 'medicine', 'hospital', 'pain', 'fever', 'cough', 'cold',
    'cloth', 'wear', 'shirt', 'pant', 'dress', 'shoe', 'coat', 'hat', 'jacket', 'sock', 'skirt',
    'family', 'mother', 'father', 'parent', 'child', 'son', 'daughter', 'brother', 'sister', 'baby',
    'weather', 'rain', 'sun', 'cold', 'hot', 'warm', 'wind', 'snow', 'cloud', 'sky',
    'routine', 'wake', 'morning', 'night', 'evening', 'daily', 'everyday'
]

cat2_kw = [
    'work', 'job', 'office', 'career', 'profession', 'employ', 'boss', 'colleague', 'staff', 'worker',
    'study', 'school', 'learn', 'teach', 'teacher', 'student', 'class', 'lesson', 'exam', 'test', 'grade',
    'university', 'college', 'degree', 'academic', 'lecture', 'course', 'professor', 'faculty', 'campus',
    'computer', 'software', 'hardware', 'data', 'program', 'internet', 'digital', 'screen', 'tech',
    'business', 'company', 'market', 'trade', 'sale', 'sell', 'buy', 'money', 'price', 'cost', 'pay',
    'manage', 'manager', 'lead', 'leader', 'organize', 'plan', 'project', 'task', 'goal', 'target',
    'skill', 'ability', 'train', 'develop', 'produce', 'product', 'industry', 'factory', 'build',
    'science', 'research', 'experiment', 'laboratory', 'theory', 'method', 'analysis', 'analyze',
    'finance', 'bank', 'fund', 'budget', 'invest', 'profit', 'economy', 'economic', 'tax', 'account'
]

cat3_kw = [
    'travel', 'trip', 'journey', 'tour', 'tourist', 'visit', 'visitor', 'holiday', 'vacation',
    'airport', 'plane', 'flight', 'airline', 'ticket', 'passenger', 'baggage', 'luggage', 'passport',
    'hotel', 'room', 'stay', 'reservation', 'reception', 'guest',
    'train', 'bus', 'car', 'vehicle', 'drive', 'road', 'street', 'station', 'route', 'traffic', 'ride',
    'direction', 'map', 'city', 'town', 'country', 'place', 'location', 'north', 'south', 'east', 'west',
    'restaurant', 'cafe', 'bar', 'menu', 'order', 'serve', 'service', 'dish', 'delicious', 'taste',
    'social', 'meet', 'friend', 'people', 'person', 'talk', 'speak', 'conversation', 'chat', 'discuss',
    'party', 'celebrate', 'event', 'culture', 'custom', 'museum', 'art', 'music', 'sport', 'game',
    'polite', 'please', 'thank', 'sorry', 'welcome', 'greet', 'invite', 'agree', 'disagree', 'opinion'
]

# Categorize words
cat1, cat2, cat3, cat4 = [], [], [], []

for w, entry in combined.items():
    desc = (entry.get('definition', '') + ' ' + entry.get('example', '')).lower()
    cefr = entry.get('cefr', '').lower()
    
    # Advanced words: C1 or B2 without obvious daily life overlap
    is_c1 = cefr in ('c1', 'b2')
    
    score1 = sum(1 for k in cat1_kw if k in w or k in desc)
    score2 = sum(1 for k in cat2_kw if k in w or k in desc)
    score3 = sum(1 for k in cat3_kw if k in w or k in desc)
    
    if is_c1 and max(score1, score2, score3) == 0:
        cat4.append(w)
    elif score1 >= score2 and score1 >= score3 and score1 > 0:
        cat1.append(w)
    elif score2 >= score1 and score2 >= score3 and score2 > 0:
        cat2.append(w)
    elif score3 > 0:
        cat3.append(w)
    elif is_c1:
        cat4.append(w)
    else:
        # Distribute remaining based on length/complexity
        if len(w) > 8:
            cat4.append(w)
        else:
            cat1.append(w)

print(f"Counts: Cat1={len(cat1)}, Cat2={len(cat2)}, Cat3={len(cat3)}, Cat4={len(cat4)}")
