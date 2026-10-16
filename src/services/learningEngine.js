/**
 * Learning Engine - orchestrates session flow, shuffle, review queue, and word progression.
 * Supports category and CEFR level filtering.
 */

import { WORD_STATUS } from './storageService';
import { getTodayString } from '../utils/dateUtils';

/**
 * Create a shuffled copy of an array using Fisher-Yates.
 */
export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Build a learning session queue from words and word states.
 * 
 * @param {object[]} words - vocabulary entries
 * @param {object} wordStates - { [wordId]: state }
 * @param {object} options
 * @param {string} options.mode - 'sequential' | 'random'
 * @param {string} options.filter - 'all' | 'new' | 'review'
 * @param {string|string[]} options.cefrFilter - 'all' or CEFR level code(s) (e.g. 'A1' or ['A1', 'A2'])
 * @returns {object[]} ordered word queue
 */
export function buildSessionQueue(words, wordStates, { mode = 'random', filter = 'all', cefrFilter = 'all' } = {}) {
  let filtered = words;
  
  // Filter by CEFR Level if specified
  if (cefrFilter && cefrFilter !== 'all') {
    const allowed = Array.isArray(cefrFilter) ? cefrFilter : [cefrFilter];
    filtered = filtered.filter(w => allowed.includes(w.cefrLevel));
  }
  
  if (filter === 'new') {
    filtered = filtered.filter(w => !wordStates[w.id] || wordStates[w.id].status === WORD_STATUS.NEW);
  } else if (filter === 'review') {
    filtered = filtered.filter(w => wordStates[w.id]?.status === WORD_STATUS.LEARNING);
  }
  
  if (filter === 'all') {
    const newWords = filtered.filter(w => !wordStates[w.id] || wordStates[w.id].status === WORD_STATUS.NEW);
    const learningWords = filtered.filter(w => wordStates[w.id]?.status === WORD_STATUS.LEARNING);
    const masteredWords = filtered.filter(w => wordStates[w.id]?.status === WORD_STATUS.MASTERED);
    
    const orderedNew = mode === 'random' ? shuffle(newWords) : newWords;
    const orderedLearning = mode === 'random' ? shuffle(learningWords) : learningWords;
    const orderedMastered = mode === 'random' ? shuffle(masteredWords) : masteredWords;
    
    return [...orderedLearning, ...orderedNew, ...orderedMastered];
  }
  
  return mode === 'random' ? shuffle(filtered) : filtered;
}

/**
 * Get words needing review across categories and CEFR levels.
 */
export function getReviewQueue(allWords, wordStates, { categoryFilter = 'all', difficultyFilter = 'all', cefrFilter = 'all', sortBy = 'recent' } = {}) {
  let words = allWords.filter(w => wordStates[w.id]?.status === WORD_STATUS.LEARNING);
  
  if (categoryFilter !== 'all') {
    words = words.filter(w => w.category === categoryFilter);
  }
  if (difficultyFilter !== 'all') {
    words = words.filter(w => w.difficulty === difficultyFilter);
  }
  if (cefrFilter !== 'all') {
    const allowed = Array.isArray(cefrFilter) ? cefrFilter : [cefrFilter];
    words = words.filter(w => allowed.includes(w.cefrLevel));
  }
  
  if (sortBy === 'recent') {
    words.sort((a, b) => {
      const aTime = wordStates[a.id]?.lastAttempt || '';
      const bTime = wordStates[b.id]?.lastAttempt || '';
      return bTime.localeCompare(aTime);
    });
  } else if (sortBy === 'incorrect') {
    words.sort((a, b) => (wordStates[b.id]?.incorrectCount || 0) - (wordStates[a.id]?.incorrectCount || 0));
  }
  
  return words;
}

/**
 * Generate a unique session ID.
 */
export function generateSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Build an attempt log entry.
 */
export function buildAttemptEntry({ wordId, category, isCorrect, isNew, contributedToMastery, sessionId }) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    wordId,
    category,
    isCorrect,
    isNew,
    contributedToMastery: !!contributedToMastery,
    date: getTodayString(),
    timestamp: new Date().toISOString(),
    sessionId,
  };
}

/**
 * Update daily activity record with a new attempt.
 */
export function updateDailyActivity(dailyActivity, date, attempt) {
  const existing = dailyActivity[date] || {
    correct: 0,
    incorrect: 0,
    uniqueWords: [],
    newWords: 0,
    masteredWords: 0,
  };
  
  const uniqueWords = Array.isArray(existing.uniqueWords) ? [...existing.uniqueWords] : [];
  if (!uniqueWords.includes(attempt.wordId)) {
    uniqueWords.push(attempt.wordId);
  }
  
  return {
    ...dailyActivity,
    [date]: {
      correct: existing.correct + (attempt.isCorrect ? 1 : 0),
      incorrect: existing.incorrect + (attempt.isCorrect ? 0 : 1),
      uniqueWords,
      newWords: existing.newWords + (attempt.isNew ? 1 : 0),
      masteredWords: existing.masteredWords + (attempt.contributedToMastery ? 1 : 0),
    },
  };
}
