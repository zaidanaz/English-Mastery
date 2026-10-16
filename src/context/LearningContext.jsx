/**
 * Global learning state context.
 * Manages all learning data and provides update functions to children.
 * Seamlessly synchronizes with Supabase when user is authenticated,
 * while maintaining 100% offline LocalStorage capability.
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import {
  loadProfile, saveProfile,
  loadWordStates, saveWordStates,
  loadAttemptLog, appendAttemptLog,
  loadDailyActivity, saveDailyActivity,
  loadSession, saveSession,
  checkAndMigrateSchema,
  computeNewWordState, getWordState,
  resetAllProgress,
  WORD_STATUS, MASTERY_THRESHOLD,
} from '../services/storageService';
import { updateDailyActivity, buildAttemptEntry } from '../services/learningEngine';
import { getTodayString } from '../utils/dateUtils';
import { useAuth } from './AuthContext';
import {
  fetchCloudProfile, upsertCloudProfile,
  fetchCloudWordStates, syncWordStatesToCloud,
  fetchCloudDailyActivity, syncDailyActivityToCloud
} from '../services/cloudSyncService';

const LearningContext = createContext(null);

const initialState = {
  profile: null,
  wordStates: {},
  attemptLog: [],
  dailyActivity: {},
  session: {},
  isLoaded: false,
  isSyncing: false,
  lastSyncedAt: null,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_ALL':
      return { ...state, ...action.payload, isLoaded: true };
    
    case 'MERGE_CLOUD_DATA':
      return {
        ...state,
        profile: { ...state.profile, ...action.payload.profile },
        wordStates: { ...state.wordStates, ...action.payload.wordStates },
        dailyActivity: { ...state.dailyActivity, ...action.payload.dailyActivity },
        lastSyncedAt: new Date().toISOString(),
        isSyncing: false,
      };

    case 'SET_SYNCING':
      return { ...state, isSyncing: action.payload };

    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };
    
    case 'RECORD_ATTEMPT': {
      const { wordId, category, isCorrect, isNew, sessionId } = action.payload;
      const currentState = getWordState(wordId, state.wordStates);
      const newWordState = computeNewWordState(currentState, isCorrect);
      const contributedToMastery = isCorrect && newWordState.status === WORD_STATUS.MASTERED && currentState.status !== WORD_STATUS.MASTERED;
      
      const today = getTodayString();
      const newDailyActivity = updateDailyActivity(state.dailyActivity, today, {
        wordId, isCorrect, isNew, contributedToMastery,
      });
      
      const attemptEntry = buildAttemptEntry({
        wordId, category, isCorrect, isNew, contributedToMastery, sessionId,
      });
      
      return {
        ...state,
        wordStates: { ...state.wordStates, [wordId]: newWordState },
        dailyActivity: newDailyActivity,
        attemptLog: [...state.attemptLog, attemptEntry],
      };
    }
    
    case 'UPDATE_SESSION':
      return { ...state, session: { ...state.session, ...action.payload } };
    
    case 'RESET_ALL':
      return { ...initialState, isLoaded: true, profile: action.payload.profile };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    default:
      return state;
  }
}

export function LearningProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user } = useAuth();
  const pendingPersist = useRef(null);
  const cloudSyncTimeout = useRef(null);
  
  // 1. Initial LocalStorage load on mount
  useEffect(() => {
    try {
      checkAndMigrateSchema();
      dispatch({
        type: 'LOAD_ALL',
        payload: {
          profile: loadProfile(),
          wordStates: loadWordStates(),
          attemptLog: loadAttemptLog(),
          dailyActivity: loadDailyActivity(),
          session: loadSession(),
        },
      });
    } catch (e) {
      console.error('Failed to load learning data:', e);
      dispatch({ type: 'SET_ERROR', payload: 'Gagal memuat data belajar. Mencoba dengan data baru.' });
      dispatch({
        type: 'LOAD_ALL',
        payload: { profile: loadProfile(), wordStates: {}, attemptLog: [], dailyActivity: {}, session: {} }
      });
    }
  }, []);

  // 2. Cloud Sync when user logs in
  useEffect(() => {
    if (!user || !state.isLoaded) return;

    let isMounted = true;
    async function syncWithCloud() {
      dispatch({ type: 'SET_SYNCING', payload: true });
      try {
        const [cloudProfile, cloudWordStates, cloudDailyActivity] = await Promise.all([
          fetchCloudProfile(user.id),
          fetchCloudWordStates(user.id),
          fetchCloudDailyActivity(user.id),
        ]);

        if (!isMounted) return;

        // Smart merge: Local + Cloud
        const mergedProfile = { ...state.profile, ...(cloudProfile || {}) };
        const mergedWordStates = { ...cloudWordStates, ...state.wordStates };
        const mergedDailyActivity = { ...cloudDailyActivity, ...state.dailyActivity };

        dispatch({
          type: 'MERGE_CLOUD_DATA',
          payload: {
            profile: mergedProfile,
            wordStates: mergedWordStates,
            dailyActivity: mergedDailyActivity,
          },
        });

        // Also push the merged state to cloud once so cloud has any offline progress
        await Promise.all([
          upsertCloudProfile(user.id, mergedProfile),
          syncWordStatesToCloud(user.id, mergedWordStates),
          syncDailyActivityToCloud(user.id, mergedDailyActivity),
        ]);
      } catch (err) {
        console.warn('Initial cloud sync error:', err);
      } finally {
        if (isMounted) dispatch({ type: 'SET_SYNCING', payload: false });
      }
    }

    syncWithCloud();
    return () => { isMounted = false; };
  }, [user?.id]);
  
  // 3. Persist to LocalStorage on state changes (debounced)
  useEffect(() => {
    if (!state.isLoaded) return;
    if (pendingPersist.current) clearTimeout(pendingPersist.current);
    pendingPersist.current = setTimeout(() => {
      try {
        if (state.profile) saveProfile(state.profile);
        saveWordStates(state.wordStates);
        saveDailyActivity(state.dailyActivity);
        saveSession(state.session);
      } catch (e) {
        console.error('Failed to persist data locally:', e);
      }
    }, 500);
    return () => clearTimeout(pendingPersist.current);
  }, [state.profile, state.wordStates, state.dailyActivity, state.session, state.isLoaded]);

  // 4. Background Sync to Supabase when user is logged in (debounced)
  useEffect(() => {
    if (!user || !state.isLoaded) return;

    if (cloudSyncTimeout.current) clearTimeout(cloudSyncTimeout.current);
    cloudSyncTimeout.current = setTimeout(async () => {
      try {
        if (state.profile) await upsertCloudProfile(user.id, state.profile);
        await syncWordStatesToCloud(user.id, state.wordStates);
        await syncDailyActivityToCloud(user.id, state.dailyActivity);
      } catch (e) {
        console.warn('Background Supabase sync error:', e);
      }
    }, 2000);

    return () => clearTimeout(cloudSyncTimeout.current);
  }, [user?.id, state.profile, state.wordStates, state.dailyActivity, state.isLoaded]);
  
  // Persist attempt log immediately
  const lastAttemptRef = useRef(null);
  useEffect(() => {
    if (!state.isLoaded || state.attemptLog.length === 0) return;
    const last = state.attemptLog[state.attemptLog.length - 1];
    if (lastAttemptRef.current !== last?.id) {
      lastAttemptRef.current = last?.id;
      try { appendAttemptLog(last); } catch {}
    }
  }, [state.attemptLog, state.isLoaded]);
  
  // ─── Actions ────────────────────────────────────────────────────────────────
  
  const updateProfile = useCallback((data) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: data });
  }, []);
  
  const recordAttempt = useCallback((wordId, category, isCorrect, isNew, sessionId) => {
    dispatch({ type: 'RECORD_ATTEMPT', payload: { wordId, category, isCorrect, isNew, sessionId } });
  }, []);
  
  const updateSession = useCallback((data) => {
    dispatch({ type: 'UPDATE_SESSION', payload: data });
  }, []);
  
  const resetProgress = useCallback(() => {
    if (pendingPersist.current) {
      clearTimeout(pendingPersist.current);
      pendingPersist.current = null;
    }
    resetAllProgress();
    const freshProfile = loadProfile();
    dispatch({ type: 'RESET_ALL', payload: { profile: freshProfile } });
  }, []);
  
  const getWordStateById = useCallback((wordId) => {
    return getWordState(wordId, state.wordStates);
  }, [state.wordStates]);
  
  const value = {
    ...state,
    updateProfile,
    recordAttempt,
    updateSession,
    resetProgress,
    getWordStateById,
    WORD_STATUS,
    MASTERY_THRESHOLD,
  };
  
  return (
    <LearningContext.Provider value={value}>
      {children}
    </LearningContext.Provider>
  );
}

export function useLearning() {
  const ctx = useContext(LearningContext);
  if (!ctx) throw new Error('useLearning must be used within LearningProvider');
  return ctx;
}
