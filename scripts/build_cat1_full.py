"""
Comprehensive Category 1 Generator: Daily Life & Essential English
Target: Exactly 750 entries
Output: src/data/vocabulary/daily-life.json
"""
import json
import os
import re

def main():
    entries = []
    seen = set()

    def add(word, pos, meanings, diff, sentence, translation, tags):
        norm = re.sub(r'\s+', ' ', word.strip().lower())
        if norm in seen:
            return  # skip duplicate
        seen.add(norm)
        clean_meanings = [re.sub(r'\s+', ' ', m.strip().lower()) for m in meanings if m.strip()]
        entries.append({
            "id": f"daily-{len(entries)+1:04d}",
            "word": word.strip(),
            "partOfSpeech": pos.strip(),
            "meaningId": clean_meanings,
            "primaryMeaning": clean_meanings[0],
            "difficulty": diff,
            "exampleSentence": sentence.strip(),
            "exampleTranslation": translation.strip(),
            "category": "daily-life",
            "tags": [t.strip().lower() for t in tags]
        })

    # We will populate until len(entries) == 750
    return entries

if __name__ == "__main__":
    e = main()
    print("Entries count:", len(e))
