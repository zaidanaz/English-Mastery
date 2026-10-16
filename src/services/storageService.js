/**
 * LocalStorage persistence service with versioning.
 * All keys are prefixed to avoid collisions.
 */

const PREFIX = 'em_'; // English Mastery
const SCHEMA_VERSION = 1;

export const STORAGE_KEYS = {
  PROFILE: `${PREFIX}profile`,
  WORD_STATES: `${PREFIX}word_states`,
  ATTEMPT_LOG: `${PREFIX}attempt_log`,
  DAILY_ACTIVITY: `${PREFIX}daily_activity`,
  SESSION: `${PREFIX}session`,
  SCHEMA_VERSION: `${PREFIX}schema_version`,
};

// ─── Low-level helpers ────────────────────────────────────────────────────────

function safeGet(key, fallback = null) {
  try {
    const val = localStorage.getItem(key);
    if (val === null) return fallback;
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('Storage write error:', e);
    return false;
  }
}

// ─── Schema version ───────────────────────────────────────────────────────────

export function checkAndMigrateSchema() {
  const storedVersion = safeGet(STORAGE_KEYS.SCHEMA_VERSION, 0);
  if (storedVersion < SCHEMA_VERSION) {
    // Future migrations go here
    safeSet(STORAGE_KEYS.SCHEMA_VERSION, SCHEMA_VERSION);
  }
}

// ─── Profile ──────────────────────────────────────────────────────────────────

const DEFAULT_PROFILE = {
  displayName: 'Pelajar',
  avatarEmoji: '🎓',
  startDate: null,
  dailyGoal: 10,
  theme: 'light',
};

export function loadProfile() {
  const stored = safeGet(STORAGE_KEYS.PROFILE, null);
  if (!stored) {
    const profile = { ...DEFAULT_PROFILE, startDate: new Date().toISOString() };
    safeSet(STORAGE_KEYS.PROFILE, profile);
    return profile;
  }
  return { ...DEFAULT_PROFILE, ...stored };
}

export function saveProfile(profileData) {
  safeSet(STORAGE_KEYS.PROFILE, profileData);
}

// ─── Word States ──────────────────────────────────────────────────────────────
// wordStates: { [wordId]: { status, consecutiveCorrect, lastAttempt, lastCorrect, incorrectCount } }

export const WORD_STATUS = {
  NEW: 'new',
  LEARNING: 'learning',
  MASTERED: 'mastered',
};

export const MASTERY_THRESHOLD = 3; // consecutive correct answers needed

export function loadWordStates() {
  return safeGet(STORAGE_KEYS.WORD_STATES, {});
}

export function saveWordStates(states) {
  safeSet(STORAGE_KEYS.WORD_STATES, states);
}

export function getWordState(wordId, allStates) {
  return allStates[wordId] || {
    status: WORD_STATUS.NEW,
    consecutiveCorrect: 0,
    lastAttempt: null,
    lastCorrect: null,
    incorrectCount: 0,
    totalAttempts: 0,
  };
}

/**
 * Update a word's state after an attempt.
 * Returns the new state object (does NOT mutate allStates).
 */
export function computeNewWordState(currentState, isCorrect) {
  const now = new Date().toISOString();
  
  if (isCorrect) {
    const newConsecutive = (currentState.consecutiveCorrect || 0) + 1;
    const mastered = newConsecutive >= MASTERY_THRESHOLD;
    return {
      ...currentState,
      status: mastered ? WORD_STATUS.MASTERED : WORD_STATUS.LEARNING,
      consecutiveCorrect: newConsecutive,
      lastAttempt: now,
      lastCorrect: now,
      totalAttempts: (currentState.totalAttempts || 0) + 1,
    };
  } else {
    return {
      ...currentState,
      status: WORD_STATUS.LEARNING,
      consecutiveCorrect: 0,
      lastAttempt: now,
      incorrectCount: (currentState.incorrectCount || 0) + 1,
      totalAttempts: (currentState.totalAttempts || 0) + 1,
    };
  }
}

// ─── Attempt Log ──────────────────────────────────────────────────────────────
// Each log entry: { id, wordId, category, isCorrect, isNew, contributedToMastery, date, sessionId }

export function loadAttemptLog() {
  return safeGet(STORAGE_KEYS.ATTEMPT_LOG, []);
}

export function appendAttemptLog(entry) {
  const log = loadAttemptLog();
  log.push(entry);
  // Keep last 50,000 entries to prevent unlimited growth
  if (log.length > 50000) log.splice(0, log.length - 50000);
  safeSet(STORAGE_KEYS.ATTEMPT_LOG, log);
}

// ─── Daily Activity ───────────────────────────────────────────────────────────
// dailyActivity: { [YYYY-MM-DD]: { totalAttempts, correct, incorrect, uniqueWords: Set, newWords, masteredWords } }

export function loadDailyActivity() {
  return safeGet(STORAGE_KEYS.DAILY_ACTIVITY, {});
}

export function saveDailyActivity(activity) {
  safeSet(STORAGE_KEYS.DAILY_ACTIVITY, activity);
}

// ─── Session ──────────────────────────────────────────────────────────────────

const DEFAULT_SESSION = {
  lastCategory: null,
  lastWordIndex: 0,
  sessionId: null,
};

export function loadSession() {
  return { ...DEFAULT_SESSION, ...safeGet(STORAGE_KEYS.SESSION, {}) };
}

export function saveSession(session) {
  safeSet(STORAGE_KEYS.SESSION, session);
}

// ─── Full reset ───────────────────────────────────────────────────────────────

export function resetAllProgress() {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}

// ─── Storage availability check ───────────────────────────────────────────────

export function isStorageAvailable() {
  try {
    const test = '__em_test__';
    localStorage.setItem(test, '1');
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
