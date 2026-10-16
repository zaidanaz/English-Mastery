/**
 * useVocabulary hook - loads and provides vocabulary data.
 * Supports categories and CEFR levels (A1 to C2), with Oxford 3000 as primary verified source.
 */

import { useState, useEffect, useMemo } from 'react';
import { validateDataset } from '../services/vocabularyValidator';
import cefrMetadataJson from '../data/vocabulary/cefr_metadata.json';

const CATEGORY_IDS = ['daily-life', 'work-study', 'travel-social', 'advanced'];
const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

let _cachedAllWords = null;
let _cachedByCategory = null;
let _cachedByLevel = null;
let _cachedOxford3000 = null;

async function loadAllVocabulary() {
  if (_cachedAllWords) {
    return {
      allWords: _cachedAllWords,
      byCategory: _cachedByCategory,
      byLevel: _cachedByLevel,
      oxford3000: _cachedOxford3000,
    };
  }
  
  const [dailyLife, workStudy, travelSocial, advanced, oxford3000] = await Promise.all([
    import('../data/vocabulary/daily-life.json'),
    import('../data/vocabulary/work-study.json'),
    import('../data/vocabulary/travel-social.json'),
    import('../data/vocabulary/advanced.json'),
    import('../data/vocabulary/oxford3000.json'),
  ]);
  
  const byCategory = {
    'daily-life': dailyLife.default,
    'work-study': workStudy.default,
    'travel-social': travelSocial.default,
    'advanced': advanced.default,
  };
  
  const allWords = Object.values(byCategory).flat();
  const oxfWords = oxford3000.default || [];
  
  const byLevel = {
    A1: [],
    A2: [],
    B1: [],
    B2: [],
    C1: [],
    C2: [],
  };
  
  allWords.forEach(entry => {
    if (byLevel[entry.cefrLevel]) {
      byLevel[entry.cefrLevel].push(entry);
    }
  });
  
  // Validate in dev mode
  if (import.meta.env.DEV) {
    const result = validateDataset(allWords);
    if (!result.isValid) {
      console.error('Vocabulary validation FAILED:', result.errors);
    }
  }
  
  _cachedAllWords = allWords;
  _cachedByCategory = byCategory;
  _cachedByLevel = byLevel;
  _cachedOxford3000 = oxfWords;
  
  return { allWords, byCategory, byLevel, oxford3000: oxfWords };
}

/**
 * Hook that loads all vocabulary data with category and CEFR level indexes.
 */
export function useVocabulary() {
  const [state, setState] = useState({
    allWords: [],
    byCategory: {},
    byLevel: { A1: [], A2: [], B1: [], B2: [], C1: [], C2: [] },
    oxford3000: [],
    cefrMetadata: cefrMetadataJson,
    isLoading: true,
    error: null,
  });
  
  useEffect(() => {
    loadAllVocabulary()
      .then(({ allWords, byCategory, byLevel, oxford3000 }) => {
        setState({
          allWords,
          byCategory,
          byLevel,
          oxford3000,
          cefrMetadata: cefrMetadataJson,
          isLoading: false,
          error: null,
        });
      })
      .catch(err => {
        console.error('Failed to load vocabulary:', err);
        setState(s => ({ ...s, isLoading: false, error: 'Gagal memuat data kosakata.' }));
      });
  }, []);
  
  return state;
}

/**
 * Hook that loads vocabulary for a single category.
 */
export function useCategoryVocabulary(categoryId) {
  const { byCategory, isLoading, error } = useVocabulary();
  const words = useMemo(() => byCategory[categoryId] || [], [byCategory, categoryId]);
  return { words, isLoading, error };
}

/**
 * Hook that loads vocabulary for a single CEFR level (A1 - C2).
 */
export function useLevelVocabulary(level) {
  const { byLevel, isLoading, error } = useVocabulary();
  const words = useMemo(() => (byLevel && byLevel[level]) || [], [byLevel, level]);
  return { words, isLoading, error };
}

export { CEFR_LEVELS, CATEGORY_IDS };
