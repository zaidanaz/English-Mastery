"""
High-quality, comprehensive dataset generator for English Mastery.
Generates exactly 3,000 unique, validated vocabulary entries across 4 categories (750 each).
Outputs to:
  src/data/vocabulary/daily-life.json
  src/data/vocabulary/work-study.json
  src/data/vocabulary/travel-social.json
  src/data/vocabulary/advanced.json
"""

import json
import os
import re
import sys

def norm_word(w):
    return re.sub(r'\s+', ' ', w.strip().lower())

def clean_meaning(m):
    return re.sub(r'\s+', ' ', m.strip().lower())

def create_entry(cat_id, seq_num, word, pos, meanings, diff, sentence, translation, tags, cat_name):
    clean_meanings = [clean_meaning(m) for m in meanings if m.strip()]
    if not clean_meanings:
        raise ValueError(f"No meanings for {word}")
    return {
        "id": f"{cat_id}-{seq_num:04d}",
        "word": word.strip(),
        "partOfSpeech": pos.strip(),
        "meaningId": clean_meanings,
        "primaryMeaning": clean_meanings[0],
        "difficulty": diff,
        "exampleSentence": sentence.strip(),
        "exampleTranslation": translation.strip(),
        "category": cat_name,
        "tags": [t.strip().lower() for t in tags]
    }
