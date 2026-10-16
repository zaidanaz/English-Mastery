import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2, Lightbulb, SkipForward, ChevronRight, ChevronLeft,
  CheckCircle, XCircle, RotateCcw, Shuffle, Eye, Keyboard, HelpCircle
} from 'lucide-react';
import { validateAnswer, getHint } from '../services/answerValidator';
import { useLearning } from '../context/LearningContext';
import { useConfetti, ShakeWrapper } from './ConfettiEffect';
import { ProgressBar, CefrBadge, OxfordBadge, PosBadge } from './SharedComponents';
import { WORD_STATUS, MASTERY_THRESHOLD } from '../services/storageService';

const CORRECT_MESSAGES = [
  'Hebat! Terus semangat! 🎉',
  'Luar biasa! Kamu makin jago! 🌟',
  'Benar! Pertahankan! 💪',
  'Bagus sekali! Kamu berkembang! ✨',
  'Tepat! Satu langkah lebih maju! 🚀',
];

const INCORRECT_MESSAGES = [
  'Hampir! Yuk pelajari lagi. 📚',
  'Belum tepat. Tidak apa-apa, coba lagi! 💡',
  'Perlu latihan lebih. Kamu pasti bisa! 🌱',
  'Jangan menyerah! Ini kesempatan belajar. 🔄',
];

/**
 * Enhanced Flashcard component supporting both 3D Flip/Reveal Mode and Active Recall Quiz Mode.
 */
export default function Flashcard({
  words = [],
  categoryId,
  sessionId,
  onComplete,
  initialMode = 'flip' // 'flip' | 'quiz'
}) {
  const { recordAttempt, getWordStateById } = useLearning();
  const { triggerConfetti } = useConfetti();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [learningMode, setLearningMode] = useState(initialMode); // 'flip' | 'quiz'
  const [isFlipped, setIsFlipped] = useState(false);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null); // null | 'correct' | 'incorrect'
  const [hintLevel, setHintLevel] = useState(0);
  const [hintText, setHintText] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionIncorrect, setSessionIncorrect] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);
  const [activeWords, setActiveWords] = useState(words);
  const inputRef = useRef(null);

  useEffect(() => {
    setActiveWords(words);
    setCurrentIndex(0);
    setIsFlipped(false);
    setResult(null);
  }, [words]);

  const currentWord = activeWords[currentIndex];
  const totalWords = activeWords.length;
  const isFinished = currentIndex >= totalWords;

  // Focus input when in quiz mode
  useEffect(() => {
    if (learningMode === 'quiz' && !isFinished && inputRef.current && !result) {
      inputRef.current.focus();
    }
  }, [currentIndex, result, isFinished, learningMode]);

  // Audio pronunciation using Web Speech API
  const handleSpeak = useCallback((e) => {
    if (e) e.stopPropagation();
    if ('speechSynthesis' in window && currentWord) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(currentWord.word.replace(/\s*\(.*?\)/, ''));
      utt.lang = 'en-US';
      utt.rate = 0.88;
      window.speechSynthesis.speak(utt);
    }
  }, [currentWord]);

  // Flip card
  const handleToggleFlip = useCallback(() => {
    if (learningMode === 'flip') {
      setIsFlipped(f => !f);
    }
  }, [learningMode]);

  // Next card
  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setAnswer('');
    setResult(null);
    setShowHint(false);
    setHintLevel(0);
    setCurrentIndex(i => {
      const next = i + 1;
      if (next >= totalWords && onComplete) {
        onComplete({ correct: sessionCorrect, incorrect: sessionIncorrect });
      }
      return next;
    });
  }, [totalWords, onComplete, sessionCorrect, sessionIncorrect]);

  // Previous card
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setAnswer('');
      setResult(null);
      setShowHint(false);
      setHintLevel(0);
      setCurrentIndex(i => i - 1);
    }
  }, [currentIndex]);

  // Shuffle current deck
  const handleShuffle = () => {
    const shuffled = [...activeWords];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setActiveWords(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setResult(null);
  };

  // Flip mode mark response: known / need review
  const handleFlipAction = useCallback((isMastered) => {
    if (!currentWord) return;
    const wordState = getWordStateById(currentWord.id);
    const isNew = !wordState || wordState.status === WORD_STATUS.NEW;

    recordAttempt(currentWord.id, currentWord.category || categoryId, isMastered, isNew, sessionId);

    if (isMastered) {
      setSessionCorrect(c => c + 1);
      triggerConfetti();
    } else {
      setSessionIncorrect(c => c + 1);
    }
    handleNext();
  }, [currentWord, categoryId, sessionId, getWordStateById, recordAttempt, triggerConfetti, handleNext]);

  // Quiz mode submit
  const handleSubmitQuiz = useCallback(() => {
    if (!currentWord || !answer.trim() || result) return;

    const { isCorrect } = validateAnswer(answer, currentWord);
    const wordState = getWordStateById(currentWord.id);
    const isNew = !wordState || wordState.status === WORD_STATUS.NEW;

    recordAttempt(currentWord.id, currentWord.category || categoryId, isCorrect, isNew, sessionId);

    if (isCorrect) {
      setResult('correct');
      setSessionCorrect(c => c + 1);
      triggerConfetti();
    } else {
      setResult('incorrect');
      setSessionIncorrect(c => c + 1);
      setShakeKey(k => k + 1);
    }
  }, [currentWord, answer, result, categoryId, sessionId, getWordStateById, recordAttempt, triggerConfetti]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'INPUT' && learningMode === 'quiz') {
        if (e.key === 'Enter') {
          if (result) handleNext();
          else handleSubmitQuiz();
        }
        return;
      }

      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        handleToggleFlip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1' && isFlipped && learningMode === 'flip') {
        handleFlipAction(false);
      } else if (e.key === '2' && isFlipped && learningMode === 'flip') {
        handleFlipAction(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleNext, handlePrev, handleToggleFlip, handleSubmitQuiz, isFlipped, learningMode, result, handleFlipAction]);

  const handleHint = () => {
    if (!currentWord) return;
    const hint = getHint(currentWord.primaryMeaning, hintLevel);
    setHintText(hint);
    setShowHint(true);
    setHintLevel(l => Math.min(l + 1, 2));
  };

  if (isFinished || totalWords === 0) {
    return (
      <div className="flashcard-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card reference-card-featured"
          style={{ textAlign: 'center', padding: '48px 32px' }}
        >
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: 8, color: '#18181B' }}>
            Sesi Belajar Selesai!
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, fontSize: 14 }}>
            Kamu telah mempelajari seluruh {totalWords} kata dalam sesi ini.
          </p>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 28 }}>
            <div className="summary-stat-box" style={{ background: '#E8F5E9', padding: '16px 24px', borderRadius: 16 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#1B5E20' }}>{sessionCorrect}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#2E7D32' }}>Dikuasai / Benar</div>
            </div>
            <div className="summary-stat-box" style={{ background: '#FEE2E2', padding: '16px 24px', borderRadius: 16 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#991B1B' }}>{sessionIncorrect}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#B91C1C' }}>Perlu Latihan</div>
            </div>
          </div>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => {
              setCurrentIndex(0);
              setSessionCorrect(0);
              setSessionIncorrect(0);
              setResult(null);
              setIsFlipped(false);
              setAnswer('');
            }}
          >
            <RotateCcw size={16} /> Ulangi Sesi Ini
          </button>
        </motion.div>
      </div>
    );
  }

  const wordState = getWordStateById(currentWord.id);
  const correctMsg = CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)];
  const incorrectMsg = INCORRECT_MESSAGES[Math.floor(Math.random() * INCORRECT_MESSAGES.length)];

  return (
    <div className="flashcard-container">
      {/* Session Controls & Progress Bar */}
      <div className="flashcard-header-bar" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#18181B' }}>
              {currentIndex + 1} <span style={{ opacity: 0.5, fontWeight: 500 }}>/ {totalWords}</span>
            </span>
            <div className="mode-toggle-pills" style={{ display: 'flex', background: 'rgba(0,0,0,0.06)', borderRadius: 9999, padding: 2 }}>
              <button
                className={`mode-pill ${learningMode === 'flip' ? 'active' : ''}`}
                onClick={() => { setLearningMode('flip'); setIsFlipped(false); }}
                title="Mode Balik Kartu"
              >
                <Eye size={13} />
                <span>Balik</span>
              </button>
              <button
                className={`mode-pill ${learningMode === 'quiz' ? 'active' : ''}`}
                onClick={() => { setLearningMode('quiz'); setIsFlipped(false); }}
                title="Mode Kuis Mengetik"
              >
                <Keyboard size={13} />
                <span>Kuis</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleShuffle}
              title="Acak Urutan Kartu"
              style={{ borderRadius: 9999, padding: '6px 10px', fontSize: 12 }}
            >
              <Shuffle size={14} /> Acak
            </button>
            <div style={{ display: 'flex', gap: 6, fontSize: 12, fontWeight: 700 }}>
              <span style={{ color: '#10B981', background: '#E8F5E9', padding: '2px 8px', borderRadius: 9999 }}>✓ {sessionCorrect}</span>
              <span style={{ color: '#EF4444', background: '#FEE2E2', padding: '2px 8px', borderRadius: 9999 }}>✗ {sessionIncorrect}</span>
            </div>
          </div>
        </div>
        <ProgressBar value={currentIndex + 1} max={totalWords} height={6} />
      </div>

      {/* Main Flashcard Card (Supports 3D Flip & Reference Styling) */}
      <ShakeWrapper trigger={shakeKey}>
        <div
          className={`flashcard-perspective ${learningMode === 'flip' ? 'clickable' : ''}`}
          onClick={handleToggleFlip}
        >
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className={`flashcard-card-surface ${isFlipped ? 'flipped' : ''}`}
          >
            {/* Top Badges Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <CefrBadge level={currentWord.cefrLevel || 'A1'} size="sm" />
                <PosBadge pos={currentWord.partOfSpeech} />
                <OxfordBadge isOxford={currentWord.oxford3000} />
              </div>

              {/* Spaced repetition mastery dots */}
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }} title="Tingkat Penguasaan">
                {Array.from({ length: MASTERY_THRESHOLD }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: i < (wordState?.consecutiveCorrect || 0) ? '#10B981' : 'rgba(0,0,0,0.12)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* English Word with Pronunciation Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '20px 0 16px' }}>
              <h2 className="flashcard-headword" style={{ fontSize: 'clamp(26px, 6vw, 36px)', fontWeight: 800, margin: 0, color: '#18181B' }}>
                {currentWord.word}
              </h2>
              <button
                className="btn-circular-audio"
                onClick={handleSpeak}
                title="Dengarkan pengucapan (US)"
                aria-label="Dengar Pengucapan"
              >
                <Volume2 size={18} />
              </button>
            </div>

            {/* Content for FLIP MODE */}
            {learningMode === 'flip' && (
              <div style={{ width: '100%', marginTop: 8 }}>
                {!isFlipped ? (
                  <div className="flip-prompt-hint" style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-muted)' }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>👆</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Ketuk kartu untuk melihat arti & definisi</div>
                    <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>atau tekan tombol Spasi</div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flashcard-revealed-content"
                  >
                    {/* Indonesian Meaning */}
                    <div className="flashcard-section-box" style={{ background: '#F8FAFC', borderRadius: 16, padding: '14px 18px', marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                        Arti Bahasa Indonesia (KBBI)
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                        {currentWord.translationId || currentWord.primaryMeaning}
                      </div>
                    </div>

                    {/* English Definition */}
                    {currentWord.definition && (
                      <div style={{ marginBottom: 12, fontSize: 13, lineHeight: 1.5, color: '#334155', padding: '0 4px' }}>
                        <span style={{ fontWeight: 700, color: '#1E293B' }}>Definisi: </span>
                        {currentWord.definition}
                      </div>
                    )}

                    {/* Example Sentence & Indonesian Translation */}
                    {currentWord.exampleSentence && (
                      <div className="flashcard-example-box" style={{ background: 'rgba(91, 77, 255, 0.05)', borderLeft: '4px solid #5B4DFF', borderRadius: '0 12px 12px 0', padding: '10px 14px' }}>
                        <div style={{ fontSize: 13, fontStyle: 'italic', color: '#1E1B4B', lineHeight: 1.4 }}>
                          "{currentWord.exampleSentence}"
                        </div>
                        {currentWord.exampleTranslation && (
                          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                            {currentWord.exampleTranslation}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            {/* Content for QUIZ MODE */}
            {learningMode === 'quiz' && result && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`feedback-box ${result}`}
                style={{ width: '100%', marginTop: 12 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  {result === 'correct' ? (
                    <CheckCircle size={18} color="var(--color-success)" />
                  ) : (
                    <XCircle size={18} color="var(--color-danger)" />
                  )}
                  <strong style={{ fontSize: 14, color: result === 'correct' ? '#1B5E20' : '#991B1B' }}>
                    {result === 'correct' ? correctMsg : incorrectMsg}
                  </strong>
                </div>

                <div style={{ textAlign: 'left', fontSize: 13 }}>
                  <div style={{ marginBottom: 4 }}>
                    <strong>Arti:</strong>{' '}
                    <span style={{ fontWeight: 700, color: result === 'correct' ? '#1B5E20' : '#991B1B' }}>
                      {currentWord.translationId || currentWord.primaryMeaning}
                    </span>
                  </div>
                  {currentWord.exampleSentence && (
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontStyle: 'italic', marginTop: 4 }}>
                      "{currentWord.exampleSentence}"
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </ShakeWrapper>

      {/* Action Controls */}
      {learningMode === 'flip' ? (
        <div className="flashcard-actions-wrapper" style={{ marginTop: 20 }}>
          {isFlipped ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                className="btn btn-outline"
                style={{
                  borderColor: '#FCA5A5',
                  color: '#DC2626',
                  background: '#FEF2F2',
                  padding: '14px',
                  borderRadius: 16,
                  fontWeight: 700,
                  fontSize: 14,
                }}
                onClick={() => handleFlipAction(false)}
              >
                <RotateCcw size={16} /> Perlu Review (1)
              </button>
              <button
                className="btn btn-primary"
                style={{
                  background: '#10B981',
                  borderColor: '#10B981',
                  color: '#FFFFFF',
                  padding: '14px',
                  borderRadius: 16,
                  fontWeight: 700,
                  fontSize: 14,
                }}
                onClick={() => handleFlipAction(true)}
              >
                <CheckCircle size={16} /> Sudah Dikuasai (2)
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
              <button
                className="btn btn-outline"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                style={{ borderRadius: 14, padding: '12px 18px', fontWeight: 600 }}
              >
                <ChevronLeft size={18} /> Prev
              </button>
              <button
                className="btn btn-primary"
                onClick={handleToggleFlip}
                style={{ flex: 1, borderRadius: 14, padding: '12px 20px', fontWeight: 700 }}
              >
                Lihat Arti (Spasi)
              </button>
              <button
                className="btn btn-outline"
                onClick={handleNext}
                style={{ borderRadius: 14, padding: '12px 18px', fontWeight: 600 }}
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* QUIZ MODE INPUT CONTROLS */
        <div className="quiz-input-wrapper" style={{ marginTop: 16 }}>
          <label htmlFor="quiz-answer" style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
            Ketik arti kata dalam Bahasa Indonesia:
          </label>
          <input
            id="quiz-answer"
            ref={inputRef}
            className={`input-field ${result ? result : ''}`}
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Contoh: mencapai, meninggalkan, ..."
            disabled={!!result}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            style={{ fontSize: 16, marginBottom: 12, borderRadius: 14 }}
          />

          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: '#FEF3C7',
                  color: '#92400E',
                  borderRadius: 10,
                  padding: '8px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 10,
                  fontFamily: 'monospace',
                }}
              >
                💡 Petunjuk: {hintText}
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: 'flex', gap: 8 }}>
            {!result ? (
              <>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, borderRadius: 14, fontWeight: 700 }}
                  onClick={handleSubmitQuiz}
                  disabled={!answer.trim()}
                >
                  <CheckCircle size={16} /> Periksa Jawaban
                </button>
                <button className="btn btn-outline" onClick={handleHint} title="Bantuan petunjuk" style={{ borderRadius: 14 }}>
                  <Lightbulb size={16} />
                </button>
                <button className="btn btn-outline" onClick={handleNext} title="Lewati kata ini" style={{ borderRadius: 14 }}>
                  <SkipForward size={16} />
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary btn-lg"
                style={{ flex: 1, borderRadius: 14, fontWeight: 700 }}
                onClick={handleNext}
                autoFocus
              >
                Kata Berikutnya <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
