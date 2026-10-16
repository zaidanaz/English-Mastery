import re

def normalize_headword(word: str) -> str:
    return re.sub(r'\s+', ' ', word.strip().lower())

def make_entry(cat_id, seq_num, word, pos, meanings, difficulty, sentence, translation, tags, category_name):
    primary = meanings[0] if meanings else ""
    return {
        "id": f"{cat_id}-{seq_num:04d}",
        "word": word.strip(),
        "partOfSpeech": pos.strip(),
        "meaningId": [m.strip().lower() for m in meanings],
        "primaryMeaning": primary.strip().lower(),
        "difficulty": difficulty,
        "exampleSentence": sentence.strip(),
        "exampleTranslation": translation.strip(),
        "category": category_name,
        "tags": [t.strip().lower() for t in tags]
    }
