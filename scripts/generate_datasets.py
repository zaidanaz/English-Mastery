"""
Comprehensive 3,000 English-Indonesian Vocabulary Generator.
Creates exactly 4 files of 750 entries each (Total: 3,000 unique headwords).
Schema:
{
  "id": "category-0001",
  "word": "string",
  "partOfSpeech": "string",
  "meaningId": ["string"],
  "primaryMeaning": "string",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "exampleSentence": "string",
  "exampleTranslation": "string",
  "category": "daily-life" | "work-study" | "travel-social" | "advanced",
  "tags": ["string"]
}
"""

import json
import os
import re

# We will create helper data generators for each of the 4 categories.
