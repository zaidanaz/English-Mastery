import assert from 'assert';
import { normalizeAnswer, normalizeHeadword } from '../src/utils/normalization.js';
import { validateAnswer } from '../src/services/answerValidator.js';
import { computeNewWordState, WORD_STATUS, MASTERY_THRESHOLD } from '../src/services/storageService.js';
import { calculateStreak, calculateLongestStreak, getTodayString, toDateString } from '../src/utils/dateUtils.js';
import { computeStatistics } from '../src/services/statisticsService.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ ${name}: ${e.message}`);
    failed++;
  }
}

console.log('==================================================');
console.log('ENGLISH MASTERY — UNIT & INTEGRATION TESTS');
console.log('==================================================\n');

console.log('1. Text Normalization');
test('trims whitespace and converts to lowercase', () => {
  assert.strictEqual(normalizeAnswer('  Makan  '), 'makan');
  assert.strictEqual(normalizeAnswer('MEMELIHARA'), 'memelihara');
});

test('handles surrounding punctuation', () => {
  assert.strictEqual(normalizeAnswer('!memelihara.'), 'memelihara');
  assert.strictEqual(normalizeAnswer('"menjaga"'), 'menjaga');
});

test('collapses multiple whitespace', () => {
  assert.strictEqual(normalizeAnswer('ruang   makan'), 'ruang makan');
});

console.log('\n2. Answer Validation');
const sampleWord = {
  id: 'daily-0001',
  word: 'maintain',
  meaningId: ['memelihara', 'menjaga'],
  primaryMeaning: 'memelihara',
};

test('accepts primary meaning with exact match', () => {
  const res = validateAnswer('memelihara', sampleWord);
  assert.strictEqual(res.isCorrect, true);
  assert.strictEqual(res.matchedMeaning, 'memelihara');
});

test('accepts secondary accepted meaning', () => {
  const res = validateAnswer('menjaga', sampleWord);
  assert.strictEqual(res.isCorrect, true);
  assert.strictEqual(res.matchedMeaning, 'menjaga');
});

test('accepts answers with case or trailing space differences', () => {
  const res = validateAnswer('  MEMELIHARA  ', sampleWord);
  assert.strictEqual(res.isCorrect, true);
});

test('rejects incorrect answers', () => {
  const res = validateAnswer('membuat', sampleWord);
  assert.strictEqual(res.isCorrect, false);
});

test('rejects empty input', () => {
  const res = validateAnswer('', sampleWord);
  assert.strictEqual(res.isCorrect, false);
});

console.log('\n3. Mastery Progression');
test('progresses from NEW to LEARNING on first correct', () => {
  const init = { status: WORD_STATUS.NEW, consecutiveCorrect: 0, totalAttempts: 0 };
  const s1 = computeNewWordState(init, true);
  assert.strictEqual(s1.status, WORD_STATUS.LEARNING);
  assert.strictEqual(s1.consecutiveCorrect, 1);
});

test('reaches MASTERED on 3 consecutive correct answers', () => {
  let state = { status: WORD_STATUS.NEW, consecutiveCorrect: 0, totalAttempts: 0 };
  state = computeNewWordState(state, true); // 1
  state = computeNewWordState(state, true); // 2
  assert.strictEqual(state.status, WORD_STATUS.LEARNING);
  state = computeNewWordState(state, true); // 3
  assert.strictEqual(state.status, WORD_STATUS.MASTERED);
  assert.strictEqual(state.consecutiveCorrect, 3);
});

test('resets consecutive correct counter on incorrect attempt', () => {
  let state = { status: WORD_STATUS.LEARNING, consecutiveCorrect: 2, totalAttempts: 2 };
  state = computeNewWordState(state, false);
  assert.strictEqual(state.status, WORD_STATUS.LEARNING);
  assert.strictEqual(state.consecutiveCorrect, 0);
  assert.strictEqual(state.incorrectCount, 1);
});

console.log('\n4. Date Handling & Streaks');
test('calculates streak correctly for consecutive days', () => {
  const today = new Date();
  const d0 = toDateString(today);
  const yest = new Date(today);
  yest.setDate(yest.getDate() - 1);
  const d1 = toDateString(yest);
  const dayBef = new Date(today);
  dayBef.setDate(dayBef.getDate() - 2);
  const d2 = toDateString(dayBef);

  const activeDates = new Set([d0, d1, d2]);
  assert.strictEqual(calculateStreak(activeDates), 3);
});

test('calculates longest streak accurately', () => {
  const dates = new Set(['2026-01-01', '2026-01-02', '2026-01-03', '2026-01-05']);
  assert.strictEqual(calculateLongestStreak(dates), 3);
});

console.log('\n5. Statistics Calculation');
test('computes accuracy as correct / (correct + incorrect)', () => {
  const stats = computeStatistics({
    wordStates: { 'w1': { status: WORD_STATUS.MASTERED }, 'w2': { status: WORD_STATUS.LEARNING } },
    attemptLog: [
      { isCorrect: true },
      { isCorrect: true },
      { isCorrect: false },
    ],
    dailyActivity: {},
    profile: { dailyGoal: 10 },
    totalVocab: 3000
  });

  assert.strictEqual(stats.correctAttempts, 2);
  assert.strictEqual(stats.incorrectAttempts, 1);
  assert.strictEqual(stats.totalAttempts, 3);
  assert.strictEqual(stats.accuracy, 66.7);
  assert.strictEqual(stats.masteredCount, 1);
  assert.strictEqual(stats.learningCount, 1);
});

console.log('\n--------------------------------------------------');
console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('--------------------------------------------------\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL UNIT TESTS PASSED SUCCESSFULLY!\n');
}
