import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, RotateCcw, Star, Filter, Shuffle, List, Award, Play } from 'lucide-react';
import { useVocabulary } from '../hooks/useVocabulary';
import { useLearning } from '../context/LearningContext';
import { buildSessionQueue, generateSessionId } from '../services/learningEngine';
import { computeCategoryStats, computeLevelStats } from '../services/statisticsService';
import Flashcard from '../components/Flashcard';
import { ProgressBar, LoadingState, EmptyState, CefrBadge, PosBadge } from '../components/SharedComponents';
import { CATEGORY_CONFIG, CATEGORY_TITLES } from '../components/CategoryCard';
import { WORD_STATUS } from '../services/storageService';

const FILTER_OPTIONS = [
  { value: 'all', label: 'Semua Kata' },
  { value: 'new', label: 'Kata Baru' },
  { value: 'review', label: 'Perlu Ulasan' },
];

const MODE_OPTIONS = [
  { value: 'random', label: 'Acak', icon: Shuffle },
  { value: 'sequential', label: 'Berurutan', icon: List },
];

const CEFR_CONFIGS = {
  A1: { title: 'Level A1 · Beginner', emoji: '🌱', color: '#10B981', bg: '#E8F5E9', desc: 'Kosakata dasar sehari-hari untuk komunikasi sederhana' },
  A2: { title: 'Level A2 · Elementary', emoji: '🌿', color: '#F59E0B', bg: '#FEF3C7', desc: 'Kalimat rutin, informasi keluarga, belanja, dan pekerjaan dasar' },
  B1: { title: 'Level B1 · Intermediate', emoji: '🚀', color: '#6366F1', bg: '#EEF2FF', desc: 'Pemahaman poin utama, mengekspresikan opini, harapan, dan rencana' },
  B2: { title: 'Level B2 · Upper-Intermediate', emoji: '⚡', color: '#EF4444', bg: '#FEE2E2', desc: 'Teks kompleks, percakapan lancar, dan argumen terperinci' },
  C1: { title: 'Level C1 · Advanced', emoji: '💎', color: '#06B6D4', bg: '#ECFEFF', desc: 'Bahasa fleksibel dan efektif untuk sosial, akademis, dan profesional' },
  C2: { title: 'Level C2 · Proficiency', emoji: '👑', color: '#8B5CF6', bg: '#F5F3FF', desc: 'Penguasaan tingkat penutur asli yang presisi, halus, dan mendalam' },
};

export default function CategoryPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { byCategory, byLevel, isLoading } = useVocabulary();
  const { wordStates, updateSession } = useLearning();
  
  const [isLearning, setIsLearning] = useState(false);
  const [filter, setFilter] = useState('all');
  const [mode, setMode] = useState('random');
  const [studyMode, setStudyMode] = useState('flip'); // 'flip' | 'quiz'
  const [sessionId] = useState(() => generateSessionId());
  const [sessionQueue, setSessionQueue] = useState(null);
  const [activeTab, setActiveTab] = useState('flashcard');

  // Detect whether categoryId is a CEFR level (e.g. "a1", "b2") or category ("daily-life", etc.)
  const isCefr = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'].includes(categoryId?.toLowerCase());
  const cefrKey = categoryId?.toUpperCase();

  const words = useMemo(() => {
    if (isCefr) {
      return (byLevel && byLevel[cefrKey]) || [];
    }
    return (byCategory && byCategory[categoryId]) || [];
  }, [isCefr, cefrKey, categoryId, byCategory, byLevel]);

  const config = isCefr
    ? (CEFR_CONFIGS[cefrKey] || { title: `Level ${cefrKey}`, emoji: '📚', color: '#5B4DFF', bg: '#EEF0FF' })
    : (CATEGORY_CONFIG[categoryId] || { title: categoryId, emoji: '📖', color: '#5B4DFF', bgColor: '#EEF0FF' });

  const title = isCefr ? config.title : (CATEGORY_TITLES[categoryId] || categoryId);
  const themeColor = config.color || '#5B4DFF';
  const themeBg = config.bg || config.bgColor || '#EEF0FF';

  const stats = useMemo(() => {
    if (isCefr) return computeLevelStats(words, wordStates);
    return computeCategoryStats(words, wordStates);
  }, [words, wordStates, isCefr]);

  const startSession = (chosenMode = 'flip') => {
    const queue = buildSessionQueue(words, wordStates, { mode, filter });
    if (queue.length === 0) return;
    setSessionQueue(queue);
    setStudyMode(chosenMode);
    updateSession({ lastCategory: categoryId });
    setIsLearning(true);
  };

  const handleComplete = () => {
    setIsLearning(false);
    setSessionQueue(null);
  };

  const masteredWords = useMemo(
    () => words.filter(w => wordStates[w.id]?.status === WORD_STATUS.MASTERED),
    [words, wordStates]
  );

  const reviewWords = useMemo(
    () => words.filter(w => wordStates[w.id]?.status === WORD_STATUS.LEARNING),
    [words, wordStates]
  );

  if (isLoading) return <div className="page-container"><LoadingState /></div>;

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <button
          className="reference-circle-btn"
          onClick={() => navigate('/flashcards')}
          style={{ width: 40, height: 40 }}
          title="Kembali"
        >
          <ArrowLeft size={18} />
        </button>
        <div style={{
          width: 52, height: 52, background: themeBg,
          borderRadius: 16, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 26,
        }}>
          {config.emoji}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, margin: 0, color: '#18181B' }}>{title}</h1>
            {isCefr && <CefrBadge level={cefrKey} showLabel={false} size="sm" />}
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
            {stats.total} kata · {stats.mastered} dikuasai ({Math.round(stats.progressPercent)}%)
          </p>
        </div>
      </div>

      {/* Progress card */}
      <div className="card" style={{ marginBottom: 24, borderRadius: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#18181B' }}>Kemajuan Belajar</span>
          <span style={{ fontSize: 14, color: themeColor, fontWeight: 800 }}>
            {Math.round(stats.progressPercent)}%
          </span>
        </div>
        <ProgressBar value={stats.mastered} max={stats.total} color={themeColor} height={8} />
        <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12, color: 'var(--color-text-secondary)' }}>
          <span>🟢 <strong>{stats.mastered}</strong> Dikuasai</span>
          <span>🟡 <strong>{stats.learning}</strong> Sedang Belajar</span>
          <span>⚪ <strong>{stats.remaining}</strong> Belum Dipelajari</span>
        </div>
      </div>

      {/* Learning or Setup View */}
      {isLearning && sessionQueue ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setIsLearning(false)}
              style={{ borderRadius: 9999 }}
            >
              <ArrowLeft size={16} /> Keluar dari Sesi
            </button>
            <span style={{ fontSize: 12, fontWeight: 700, color: themeColor }}>
              Sesi {mode === 'random' ? 'Acak' : 'Berurutan'}
            </span>
          </div>
          <Flashcard
            words={sessionQueue}
            categoryId={categoryId}
            sessionId={sessionId}
            initialMode={studyMode}
            onComplete={handleComplete}
          />
        </div>
      ) : (
        <div>
          {/* Action Card with Filter & Mode settings */}
          <div className="card" style={{ marginBottom: 24, borderRadius: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: '#18181B' }}>Pengaturan Sesi</h2>

            {/* Filter */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                Filter Kosakata:
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {FILTER_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    className={`btn btn-sm ${filter === opt.value ? 'btn-primary' : 'btn-outline'}`}
                    style={{ borderRadius: 9999, fontWeight: 700 }}
                    onClick={() => setFilter(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode: Random vs Sequential */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                Urutan Kartu:
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {MODE_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      className={`btn btn-sm ${mode === opt.value ? 'btn-primary' : 'btn-outline'}`}
                      style={{ borderRadius: 9999, fontWeight: 700 }}
                      onClick={() => setMode(opt.value)}
                    >
                      <Icon size={14} /> {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary btn-lg"
                style={{ flex: 1, borderRadius: 16, fontWeight: 800, background: '#18181B', borderColor: '#18181B' }}
                onClick={() => startSession('flip')}
                disabled={words.length === 0}
              >
                <Play size={18} /> Mulai Sesi Balik Kartu
              </button>
              <button
                className="btn btn-outline btn-lg"
                style={{ borderRadius: 16, fontWeight: 700 }}
                onClick={() => startSession('quiz')}
                disabled={words.length === 0}
              >
                Kuis Ingatan
              </button>
            </div>
          </div>

          {/* Subtabs: Semua Kata / Dikuasai / Perlu Review */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
            <button
              className={`reference-tab-btn ${activeTab === 'flashcard' ? 'active' : ''}`}
              onClick={() => setActiveTab('flashcard')}
            >
              Semua Kata ({words.length})
            </button>
            <button
              className={`reference-tab-btn ${activeTab === 'review' ? 'active' : ''}`}
              onClick={() => setActiveTab('review')}
            >
              Perlu Review ({reviewWords.length})
            </button>
            <button
              className={`reference-tab-btn ${activeTab === 'mastered' ? 'active' : ''}`}
              onClick={() => setActiveTab('mastered')}
            >
              Dikuasai ({masteredWords.length})
            </button>
          </div>

          {/* Words List */}
          <div className="reference-vocab-list">
            {(activeTab === 'mastered' ? masteredWords : activeTab === 'review' ? reviewWords : words)
              .slice(0, 50)
              .map(w => (
                <div key={w.id} className="reference-vocab-item">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#18181B' }}>{w.word}</span>
                      <CefrBadge level={w.cefrLevel} showLabel={false} size="sm" />
                      <PosBadge pos={w.partOfSpeech} />
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                      {w.translationId || w.primaryMeaning}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                    "{w.exampleSentence}"
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
