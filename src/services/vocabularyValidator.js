/**
 * Vocabulary dataset validator.
 * Validates entries at startup and reports errors.
 */

import { normalizeHeadword } from '../utils/normalization';

const REQUIRED_CATEGORIES = ['daily-life', 'work-study', 'travel-social', 'advanced'];
const VALID_CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/**
 * Validate a single vocabulary entry.
 * @returns {string[]} array of error messages (empty = valid)
 */
export function validateEntry(entry, index) {
  const errors = [];
  const label = `Entry[${index}] (id: ${entry?.id ?? 'undefined'})`;
  
  if (!entry.id || typeof entry.id !== 'string') errors.push(`${label}: missing or invalid id`);
  if (!entry.word || typeof entry.word !== 'string') errors.push(`${label}: missing word`);
  if (!entry.partOfSpeech) errors.push(`${label}: missing partOfSpeech`);
  if (!entry.primaryMeaning || typeof entry.primaryMeaning !== 'string' || entry.primaryMeaning.trim() === '')
    errors.push(`${label}: missing primaryMeaning`);
  if (!Array.isArray(entry.meaningId) || entry.meaningId.length === 0)
    errors.push(`${label}: meaningId must be a non-empty array`);
  if (!entry.exampleSentence || entry.exampleSentence.trim() === '')
    errors.push(`${label}: missing exampleSentence`);
  if (!entry.exampleTranslation || entry.exampleTranslation.trim() === '')
    errors.push(`${label}: missing exampleTranslation`);
  if (!REQUIRED_CATEGORIES.includes(entry.category))
    errors.push(`${label}: invalid category "${entry.category}"`);
  if (!['beginner', 'intermediate', 'advanced'].includes(entry.difficulty))
    errors.push(`${label}: invalid difficulty "${entry.difficulty}"`);
  if (entry.cefrLevel && !VALID_CEFR_LEVELS.includes(entry.cefrLevel))
    errors.push(`${label}: invalid cefrLevel "${entry.cefrLevel}"`);
  
  return errors;
}

/**
 * Validate the full vocabulary dataset.
 * @param {object[]} allEntries - combined from all categories
 * @returns {{ isValid: boolean, errors: string[], warnings: string[], summary: object }}
 */
export function validateDataset(allEntries) {
  const errors = [];
  const warnings = [];
  
  // Per-entry validation
  allEntries.forEach((entry, i) => {
    errors.push(...validateEntry(entry, i));
  });
  
  // Total count check
  if (allEntries.length < 2500) {
    errors.push(`Total entries: ${allEntries.length} (expected at least 2500)`);
  }
  
  // Per-category counts
  const categoryCounts = {};
  REQUIRED_CATEGORIES.forEach(cat => { categoryCounts[cat] = 0; });
  allEntries.forEach(e => {
    if (REQUIRED_CATEGORIES.includes(e.category)) categoryCounts[e.category]++;
  });
  
  // CEFR counts
  const cefrCounts = {};
  VALID_CEFR_LEVELS.forEach(lvl => { cefrCounts[lvl] = 0; });
  allEntries.forEach(e => {
    if (VALID_CEFR_LEVELS.includes(e.cefrLevel)) cefrCounts[e.cefrLevel]++;
  });
  
  // Duplicate IDs
  const idSet = new Set();
  allEntries.forEach(entry => {
    if (entry.id) {
      if (idSet.has(entry.id)) errors.push(`Duplicate ID: ${entry.id}`);
      else idSet.add(entry.id);
    }
  });
  
  const summary = {
    total: allEntries.length,
    categoryCounts,
    cefrCounts,
    entryErrors: errors.filter(e => e.startsWith('Entry[')).length,
  };
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary,
  };
}
