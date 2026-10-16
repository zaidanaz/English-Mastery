/**
 * Answer validation service.
 * Validates learner's Indonesian answer against accepted meanings.
 */

import { normalizeAnswer } from '../utils/normalization.js';

/**
 * Check if a user's answer is correct for a given vocabulary entry.
 * @param {string} userInput - raw typed answer
 * @param {object} vocabEntry - { meaningId: string[], primaryMeaning: string }
 * @returns {{ isCorrect: boolean, normalizedInput: string, matchedMeaning: string|null }}
 */
export function validateAnswer(userInput, vocabEntry) {
  if (!userInput || userInput.trim() === '') {
    return { isCorrect: false, normalizedInput: '', matchedMeaning: null };
  }
  
  const normalizedInput = normalizeAnswer(userInput);
  
  // Build set of accepted meanings (normalized)
  const acceptedMeanings = Array.isArray(vocabEntry.meaningId)
    ? vocabEntry.meaningId
    : [vocabEntry.primaryMeaning];
  
  for (const meaning of acceptedMeanings) {
    const normalizedMeaning = normalizeAnswer(meaning);
    if (normalizedInput === normalizedMeaning) {
      return { isCorrect: true, normalizedInput, matchedMeaning: meaning };
    }
  }
  
  return { isCorrect: false, normalizedInput, matchedMeaning: null };
}

/**
 * Get a hint for the current word.
 * Returns first N characters of the primary meaning + underscores.
 * @param {string} primaryMeaning
 * @param {number} level - 0 = first char, 1 = first 3 chars
 */
export function getHint(primaryMeaning, level = 0) {
  if (!primaryMeaning) return '';
  const revealed = level === 0 ? 1 : Math.min(3, Math.floor(primaryMeaning.length / 2));
  const shown = primaryMeaning.slice(0, revealed);
  const hidden = '_'.repeat(Math.max(0, primaryMeaning.length - revealed));
  return shown + hidden;
}
