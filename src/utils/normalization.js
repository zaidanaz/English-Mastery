/**
 * Text normalization utilities for answer validation.
 */

/**
 * Normalize a user's typed answer for comparison.
 * - Trim whitespace
 * - Lowercase
 * - Normalize Unicode (NFC)
 * - Collapse multiple spaces
 * - Remove surrounding punctuation (not internal hyphens)
 */
export function normalizeAnswer(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .trim()
    .toLowerCase()
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .replace(/^[.,!?;:"']+|[.,!?;:"']+$/g, '');
}

/**
 * Normalize a word headword for duplicate detection.
 * More aggressive than answer normalization.
 */
export function normalizeHeadword(word) {
  if (!word || typeof word !== 'string') return '';
  return word
    .trim()
    .toLowerCase()
    .normalize('NFC')
    .replace(/\s+/g, ' ');
}
