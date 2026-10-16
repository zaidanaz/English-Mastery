/**
 * Supabase Synchronization Service for English Mastery.
 * Handles bidirectional sync between localStorage and Supabase PostgreSQL tables.
 */

import { supabase } from './supabaseClient';

export async function fetchCloudProfile(userId) {
  if (!supabase || !userId) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return {
    displayName: data.display_name || 'Pelajar',
    avatarEmoji: data.avatar_emoji || '🎓',
    dailyGoal: data.daily_goal || 10,
    theme: data.theme || 'light',
  };
}

export async function upsertCloudProfile(userId, profile) {
  if (!supabase || !userId) return false;
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    display_name: profile.displayName,
    avatar_emoji: profile.avatarEmoji,
    daily_goal: profile.dailyGoal,
    theme: profile.theme,
    updated_at: new Date().toISOString(),
  });
  return !error;
}

export async function fetchCloudWordStates(userId) {
  if (!supabase || !userId) return {};
  const { data, error } = await supabase
    .from('user_word_progress')
    .select('*')
    .eq('user_id', userId);

  if (error || !data) return {};

  const wordStates = {};
  data.forEach(item => {
    wordStates[item.word_id] = {
      status: item.status,
      consecutiveCorrect: item.consecutive_correct,
      incorrectCount: item.incorrect_count,
      totalAttempts: item.total_attempts,
      lastAttempt: item.last_attempt,
      lastCorrect: item.last_correct,
    };
  });
  return wordStates;
}

export async function syncWordStatesToCloud(userId, wordStates) {
  if (!supabase || !userId) return false;
  const entries = Object.entries(wordStates || {});
  if (entries.length === 0) return true;

  // Batch upsert to prevent exceeding limits
  const batchSize = 100;
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize).map(([wordId, state]) => ({
      user_id: userId,
      word_id: wordId,
      status: state.status,
      consecutive_correct: state.consecutiveCorrect || 0,
      incorrect_count: state.incorrectCount || 0,
      total_attempts: state.totalAttempts || 0,
      last_attempt: state.lastAttempt,
      last_correct: state.lastCorrect,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('user_word_progress').upsert(batch, {
      onConflict: 'user_id,word_id',
    });
    if (error) {
      console.warn('Sync word states batch error:', error);
    }
  }
  return true;
}

export async function fetchCloudDailyActivity(userId) {
  if (!supabase || !userId) return {};
  const { data, error } = await supabase
    .from('user_daily_activity')
    .select('*')
    .eq('user_id', userId);

  if (error || !data) return {};

  const dailyActivity = {};
  data.forEach(item => {
    dailyActivity[item.activity_date] = {
      totalAttempts: item.total_attempts,
      correct: item.correct,
      incorrect: item.incorrect,
      uniqueWords: item.unique_words_count,
      newWords: item.new_words,
      masteredWords: item.mastered_words,
    };
  });
  return dailyActivity;
}

export async function syncDailyActivityToCloud(userId, dailyActivity) {
  if (!supabase || !userId) return false;
  const entries = Object.entries(dailyActivity || {});
  if (entries.length === 0) return true;

  const rows = entries.map(([date, act]) => ({
    user_id: userId,
    activity_date: date,
    total_attempts: act.totalAttempts || 0,
    correct: act.correct || 0,
    incorrect: act.incorrect || 0,
    unique_words_count: typeof act.uniqueWords === 'number' ? act.uniqueWords : (act.uniqueWords?.size || 0),
    new_words: act.newWords || 0,
    mastered_words: act.masteredWords || 0,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from('user_daily_activity').upsert(rows, {
    onConflict: 'user_id,activity_date',
  });
  return !error;
}
