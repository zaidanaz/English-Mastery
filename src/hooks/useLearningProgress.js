/**
 * useLearningProgress hook - provides derived learning stats for components.
 */

import { useMemo } from 'react';
import { useLearning } from '../context/LearningContext';
import { computeStatistics, computeCategoryStats } from '../services/statisticsService';

export function useLearningProgress(totalVocab = 3000) {
  const { wordStates, attemptLog, dailyActivity, profile } = useLearning();
  
  const stats = useMemo(() => {
    return computeStatistics({ wordStates, attemptLog, dailyActivity, profile, totalVocab });
  }, [wordStates, attemptLog, dailyActivity, profile, totalVocab]);
  
  return stats;
}

export function useCategoryProgress(categoryWords) {
  const { wordStates } = useLearning();
  
  return useMemo(() => {
    return computeCategoryStats(categoryWords, wordStates);
  }, [categoryWords, wordStates]);
}
