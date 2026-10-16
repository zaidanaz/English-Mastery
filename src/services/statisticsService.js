/**
 * Statistics calculation service.
 * All calculations derive from actual stored data.
 */

import { getTodayString, calculateStreak, calculateLongestStreak, getPastNDays } from '../utils/dateUtils.js';
import { WORD_STATUS } from './storageService.js';

/**
 * Compute overall statistics from raw data stores.
 */
export function computeStatistics({ wordStates, attemptLog, dailyActivity, profile, totalVocab = 3000 }) {
  const today = getTodayString();
  
  // Word counts
  const allWordIds = Object.keys(wordStates);
  const masteredCount = allWordIds.filter(id => wordStates[id].status === WORD_STATUS.MASTERED).length;
  const learningCount = allWordIds.filter(id => wordStates[id].status === WORD_STATUS.LEARNING).length;
  const studiedCount = allWordIds.length; // any word that has a state recorded
  const newCount = totalVocab - studiedCount;
  
  // Attempt totals
  const correctAttempts = attemptLog.filter(e => e.isCorrect).length;
  const incorrectAttempts = attemptLog.filter(e => !e.isCorrect).length;
  const totalAttempts = correctAttempts + incorrectAttempts;
  const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;
  
  // Active dates (dates with at least 1 attempt)
  const activeDates = new Set(Object.keys(dailyActivity).filter(d => {
    const a = dailyActivity[d];
    return (a.correct || 0) + (a.incorrect || 0) > 0;
  }));
  
  // Streak
  const currentStreak = calculateStreak(activeDates);
  const longestStreak = calculateLongestStreak(activeDates);
  const totalActiveDays = activeDates.size;
  
  // Today's stats
  const todayActivity = dailyActivity[today] || {};
  const todayCorrect = todayActivity.correct || 0;
  const todayIncorrect = todayActivity.incorrect || 0;
  const todayWordsStudied = todayActivity.uniqueWords
    ? (Array.isArray(todayActivity.uniqueWords) ? todayActivity.uniqueWords.length : todayActivity.uniqueWords)
    : 0;
  const todayNewWords = todayActivity.newWords || 0;
  const todayMastered = todayActivity.masteredWords || 0;
  
  // Daily goal
  const dailyGoal = profile?.dailyGoal || 10;
  const dailyGoalProgress = Math.min(todayWordsStudied / dailyGoal, 1);
  const dailyGoalMet = todayWordsStudied >= dailyGoal;
  
  // Daily average
  const avgWordsPerDay = totalActiveDays > 0
    ? Math.round(studiedCount / totalActiveDays)
    : 0;
  
  // Overall mastery %
  const masteryPercent = totalVocab > 0 ? (masteredCount / totalVocab) * 100 : 0;
  
  // Weekly activity (last 7 days)
  const weeklyDates = getPastNDays(7);
  const weeklyActivity = weeklyDates.map(d => ({
    date: d,
    attempts: dailyActivity[d]?.correct + dailyActivity[d]?.incorrect || 0,
    correct: dailyActivity[d]?.correct || 0,
    wordsStudied: dailyActivity[d]?.uniqueWords
      ? (Array.isArray(dailyActivity[d].uniqueWords) ? dailyActivity[d].uniqueWords.length : dailyActivity[d].uniqueWords)
      : 0,
    goalMet: (dailyActivity[d]?.uniqueWords?.length || 0) >= dailyGoal,
  }));
  
  return {
    totalVocab,
    studiedCount,
    masteredCount,
    learningCount,
    newCount,
    correctAttempts,
    incorrectAttempts,
    totalAttempts,
    accuracy: Math.round(accuracy * 10) / 10,
    currentStreak,
    longestStreak,
    totalActiveDays,
    todayCorrect,
    todayIncorrect,
    todayWordsStudied,
    todayNewWords,
    todayMastered,
    dailyGoal,
    dailyGoalProgress,
    dailyGoalMet,
    avgWordsPerDay,
    masteryPercent: Math.round(masteryPercent * 10) / 10,
    weeklyActivity,
    activeDates,
  };
}

/**
 * Compute per-category statistics.
 */
export function computeCategoryStats(categoryWords, wordStates) {
  const total = categoryWords.length;
  const mastered = categoryWords.filter(w => wordStates[w.id]?.status === WORD_STATUS.MASTERED).length;
  const learning = categoryWords.filter(w => wordStates[w.id]?.status === WORD_STATUS.LEARNING).length;
  const studied = categoryWords.filter(w => wordStates[w.id]).length;
  const remaining = total - mastered;
  const progressPercent = total > 0 ? (mastered / total) * 100 : 0;
  
  return { total, mastered, learning, studied, remaining, progressPercent };
}

/**
 * Compute per-CEFR level statistics.
 */
export function computeLevelStats(levelWords, wordStates) {
  const total = levelWords.length;
  const mastered = levelWords.filter(w => wordStates[w.id]?.status === WORD_STATUS.MASTERED).length;
  const learning = levelWords.filter(w => wordStates[w.id]?.status === WORD_STATUS.LEARNING).length;
  const studied = levelWords.filter(w => wordStates[w.id]).length;
  const remaining = total - mastered;
  const progressPercent = total > 0 ? (mastered / total) * 100 : 0;
  
  return { total, mastered, learning, studied, remaining, progressPercent };
}
