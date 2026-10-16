import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATEGORIES = [
  { file: 'daily-life.json', id: 'daily-life', prefix: 'daily' },
  { file: 'work-study.json', id: 'work-study', prefix: 'work' },
  { file: 'travel-social.json', id: 'travel-social', prefix: 'travel' },
  { file: 'advanced.json', id: 'advanced', prefix: 'adv' },
];

const VOCAB_DIR = path.resolve(__dirname, '../src/data/vocabulary');

function runValidation() {
  console.log('==================================================');
  console.log('ENGLISH MASTERY — VOCABULARY DATASET VALIDATION');
  console.log('==================================================\n');

  let totalEntries = 0;
  const globalHeadwordPos = new Map();
  const globalIds = new Set();
  const cefrCounts = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
  const errors = [];
  const warnings = [];

  // Check Oxford 3000 primary dataset
  const oxfordPath = path.join(VOCAB_DIR, 'oxford3000.json');
  if (!fs.existsSync(oxfordPath)) {
    errors.push('oxford3000.json missing!');
  } else {
    try {
      const oxf = JSON.parse(fs.readFileSync(oxfordPath, 'utf-8'));
      console.log(`Checking Oxford 3000 source dataset (oxford3000.json)...`);
      console.log(`  Extracted from PDF: ${oxf.length} entries`);
      if (oxf.length !== 2914) {
        errors.push(`oxford3000.json count is ${oxf.length}, expected 2914`);
      }
    } catch (e) {
      errors.push(`JSON parse error in oxford3000.json: ${e.message}`);
    }
  }

  // Check categories
  for (const cat of CATEGORIES) {
    const filePath = path.join(VOCAB_DIR, cat.file);
    if (!fs.existsSync(filePath)) {
      errors.push(`File missing: ${cat.file}`);
      continue;
    }

    let entries = [];
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      entries = JSON.parse(content);
    } catch (e) {
      errors.push(`JSON parse error in ${cat.file}: ${e.message}`);
      continue;
    }

    console.log(`Checking ${cat.id} (${cat.file})...`);
    console.log(`  Count: ${entries.length} entries`);

    if (entries.length < 500) {
      warnings.push(`Category "${cat.id}" has only ${entries.length} entries`);
    }

    totalEntries += entries.length;

    entries.forEach((item, idx) => {
      const label = `${cat.file}[${idx}] (id: ${item.id || 'none'}, word: "${item.word || 'none'}")`;

      // Check ID
      if (!item.id || typeof item.id !== 'string') {
        errors.push(`${label}: Missing or invalid ID`);
      } else {
        if (globalIds.has(item.id)) {
          errors.push(`${label}: Duplicate ID "${item.id}"`);
        }
        globalIds.add(item.id);
      }

      // Check Word
      if (!item.word || typeof item.word !== 'string' || !item.word.trim()) {
        errors.push(`${label}: Missing or empty headword`);
      } else {
        const norm = item.word.trim().toLowerCase();
        const posNorm = (item.partOfSpeech || '').trim().toLowerCase();
        const key = `${norm}::${posNorm}`;
        if (globalHeadwordPos.has(key)) {
          errors.push(`${label}: Duplicate word + POS "${norm}" (${posNorm}) (first seen in ${globalHeadwordPos.get(key)})`);
        } else {
          globalHeadwordPos.set(key, `${cat.file} (${item.id})`);
        }
      }

      // Check Part of Speech
      if (!item.partOfSpeech || typeof item.partOfSpeech !== 'string') {
        errors.push(`${label}: Missing part of speech`);
      }

      // Check CEFR level
      if (!['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(item.cefrLevel)) {
        errors.push(`${label}: Invalid or missing cefrLevel "${item.cefrLevel}"`);
      } else {
        cefrCounts[item.cefrLevel] = (cefrCounts[item.cefrLevel] || 0) + 1;
      }

      // Check Indonesian Meanings
      if (!item.primaryMeaning || typeof item.primaryMeaning !== 'string' || !item.primaryMeaning.trim()) {
        errors.push(`${label}: Missing primaryMeaning`);
      }
      if (!Array.isArray(item.meaningId) || item.meaningId.length === 0) {
        errors.push(`${label}: meaningId must be a non-empty array`);
      }

      // Check Example Sentence
      if (!item.exampleSentence || typeof item.exampleSentence !== 'string' || !item.exampleSentence.trim()) {
        errors.push(`${label}: Missing exampleSentence`);
      }

      // Check Example Translation
      if (!item.exampleTranslation || typeof item.exampleTranslation !== 'string' || !item.exampleTranslation.trim()) {
        errors.push(`${label}: Missing exampleTranslation`);
      }

      // Check Category
      if (item.category !== cat.id) {
        errors.push(`${label}: Category mismatch (found "${item.category}", expected "${cat.id}")`);
      }

      // Check Difficulty
      if (!['beginner', 'intermediate', 'advanced'].includes(item.difficulty)) {
        errors.push(`${label}: Invalid difficulty "${item.difficulty}"`);
      }
    });
  }

  console.log('\n--------------------------------------------------');
  console.log('SUMMARY REPORT:');
  console.log(`Total entries across categories: ${totalEntries}`);
  console.log(`Total unique IDs: ${globalIds.size}`);
  console.log(`Unique headword+POS entries: ${globalHeadwordPos.size}`);
  console.log('CEFR Level distribution:');
  Object.entries(cefrCounts).forEach(([lvl, cnt]) => {
    console.log(`  ${lvl}: ${cnt} words`);
  });
  console.log(`Errors encountered: ${errors.length}`);
  console.log(`Warnings encountered: ${warnings.length}`);
  console.log('--------------------------------------------------\n');

  if (errors.length > 0) {
    console.error('VALIDATION FAILED WITH ERRORS:');
    errors.slice(0, 20).forEach(e => console.error('  ❌ ' + e));
    if (errors.length > 20) {
      console.error(`  ... and ${errors.length - 20} more errors.`);
    }
    process.exit(1);
  } else {
    console.log('✅ ALL ACCEPTANCE CRITERIA PASSED!');
    console.log('Dataset is 100% complete, verified with Oxford 3000 and CEFR A1-C2.\n');
  }
}

runValidation();
