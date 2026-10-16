import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Target, Zap, TrendingUp, Calendar, ArrowRight,
  Star, Flame, ArrowUpRight, Award, ChevronRight
} from 'lucide-react';
import { useLearning } from '../context/LearningContext';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { useVocabulary } from '../hooks/useVocabulary';
import { computeCategoryStats, computeLevelStats } from '../services/statisticsService';
import { ProgressBar, LoadingState, CefrBadge, OxfordBadge } from '../components/SharedComponents';
import { getPastNDays, getDayLabel } from '../utils/dateUtils';

const CEFR_CARDS = [
  {
    level: 'A1',
    title: 'A1 · Beginner',
    stageLabel: 'Level 1',
    description: 'Kosakata dasar sehari-hari untuk komunikasi sederhana.',
    bg: '#5B4DFF',
    textColor: '#FFFFFF',
    btnBg: '#FFFFFF',
    btnColor: '#5B4DFF',
    badgeBg: 'rgba(255,255,255,0.2)',
    badgeColor: '#FFFFFF',
  },
  {
    level: 'A2',
    title: 'A2 · Elementary',
    stageLabel: 'Level 2',
    description: 'Kalimat rutin, informasi keluarga, belanja, dan pekerjaan dasar.',
    bg: '#FFA726',
    textColor: '#18181B',
    btnBg: '#18181B',
    btnColor: '#FFFFFF',
    badgeBg: 'rgba(0,0,0,0.1)',
    badgeColor: '#18181B',
  },
  {
    level: 'B1',
    title: 'B1 · Intermediate',
    stageLabel: 'Level 3',
    description: 'Pemahaman poin utama, mengekspresikan opini, harapan, dan rencana.',
    bg: '#1E1E24',
    textColor: '#FFFFFF',
    btnBg: '#FFFFFF',
    btnColor: '#1E1E24',
    badgeBg: 'rgba(255,255,255,0.15)',
    badgeColor: '#FFFFFF',
  },
  {
    level: 'B2',
    title: 'B2 · Upper-Intermediate',
    stageLabel: 'Level 4',
    description: 'Teks kompleks, percakapan lancar, dan argumen terperinci.',
    bg: '#CFE8A9',
    textColor: '#18181B',
    btnBg: '#18181B',
    btnColor: '#FFFFFF',
    badgeBg: 'rgba(0,0,0,0.1)',
    badgeColor: '#18181B',
  },
  {
    level: 'C1',
    title: 'C1 · Advanced',
    stageLabel: 'Level 5',
    description: 'Bahasa fleksibel dan efektif untuk sosial, akademis, dan profesional.',
    bg: '#FF6B6B',
    textColor: '#FFFFFF',
    btnBg: '#FFFFFF',
    btnColor: '#FF6B6B',
    badgeBg: 'rgba(255,255,255,0.2)',
    badgeColor: '#FFFFFF',
  },
  {
    level: 'C2',
    title: 'C2 · Proficiency',
    stageLabel: 'Level 6',
    description: 'Penguasaan tingkat penutur asli yang presisi, halus, dan mendalam.',
    bg: '#8B5CF6',
    textColor: '#FFFFFF',
    btnBg: '#FFFFFF',
    btnColor: '#8B5CF6',
    badgeBg: 'rgba(255,255,255,0.2)',
    badgeColor: '#FFFFFF',
  },
];

const CATEGORIES = [
  { id: 'daily-life', title: 'Kehidupan Sehari-hari', emoji: '🏠', color: '#F97316', bg: '#FFF7ED' },
  { id: 'work-study', title: 'Kerja & Pendidikan', emoji: '💼', color: '#3B82F6', bg: '#EFF6FF' },
  { id: 'travel-social', title: 'Perjalanan & Sosial', emoji: '✈️', color: '#8B5CF6', bg: '#F5F3FF' },
  { id: 'advanced', title: 'Tingkat Lanjut', emoji: '🎯', color: '#10B981', bg: '#ECFDF5' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { profile, dailyActivity, wordStates, session } = useLearning();
  const { byCategory, byLevel, oxford3000, cefrMetadata, isLoading } = useVocabulary();
  const stats = useLearningProgress();

  const [activeTab, setActiveTab] = useState('cefr'); // 'cefr' | 'category'

  const handleStartLevel = (level) => {
    navigate(`/flashcards?level=${level}`);
  };

  const handleStartCategory = (catId) => {
    navigate(`/flashcards/${catId}`);
  };

  if (isLoading) {
    return <div className="page-container"><LoadingState message="Memuat kosakata Oxford 3000 & CEFR..." /></div>;
  }

  return (
    <div className="page-container reference-home-container">
      {/* Top Header: User Profile Avatar, Name, Search & Filter Pill */}
      <div className="reference-header">
        <div className="reference-user-info">
          <div className="reference-avatar">
            {profile?.avatarEmoji || '🎓'}
          </div>
          <div>
            <h3 className="reference-user-name">
              {profile?.displayName || 'Pelajar Hebat'}
            </h3>
            <div className="reference-user-sub">
              <span className="reference-badge-pill">Oxford 3000™</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginLeft: 6 }}>
                🔥 Streak {stats.currentStreak} Hari
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter removed — accessible via Flashcard page */}
      </div>

      {/* Main Display Title */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="reference-hero-section"
      >
        <h1 className="reference-big-title">
          EXPLORE<br />VOCABULARY
        </h1>
        <p className="reference-sub-desc">
          2.914 kata resmi Oxford 3000 & klasifikasi CEFR A1 sampai C2 dengan terjemahan standar KBBI.
        </p>
      </motion.div>

      {/* Quick Resume Card */}
      <div className="card reference-quick-resume" style={{ marginBottom: 24, padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5B4DFF', marginBottom: 2 }}>
              Target Belajar Harian
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#18181B' }}>
              {stats.todayWordsStudied} / {stats.dailyGoal} kata hari ini · {stats.masteredCount} dikuasai
            </div>
          </div>
          <button
            className="btn btn-primary btn-sm"
            style={{ borderRadius: 9999, padding: '8px 18px', fontWeight: 700, background: '#18181B', borderColor: '#18181B' }}
            onClick={() => navigate('/flashcards')}
          >
            Mulai Belajar Sekarang <ArrowRight size={14} />
          </button>
        </div>
        <div style={{ marginTop: 12 }}>
          <ProgressBar value={stats.todayWordsStudied} max={stats.dailyGoal} color="#5B4DFF" height={6} />
        </div>
      </div>

      {/* View Switcher Tabs: CEFR Levels vs Categories */}
      <div className="reference-section-tabs" style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button
          className={`reference-tab-btn ${activeTab === 'cefr' ? 'active' : ''}`}
          onClick={() => setActiveTab('cefr')}
        >
          Tingkat Kemahiran (CEFR A1 - C2)
        </button>
        <button
          className={`reference-tab-btn ${activeTab === 'category' ? 'active' : ''}`}
          onClick={() => setActiveTab('category')}
        >
          Kategori Topik
        </button>
      </div>

      {/* Tab 1: CEFR Level Cards (Styled after reference image) */}
      {activeTab === 'cefr' && (
        <div className="reference-card-stack">
          {CEFR_CARDS.map((card, idx) => {
            const levelWords = byLevel[card.level] || [];
            const levelStats = computeLevelStats(levelWords, wordStates);

            return (
              <motion.div
                key={card.level}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="reference-level-card"
                style={{
                  background: card.bg,
                  color: card.textColor,
                  borderRadius: 24,
                  padding: '24px',
                  marginBottom: 16,
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onClick={() => handleStartLevel(card.level)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <span
                      style={{
                        background: card.badgeBg,
                        color: card.badgeColor,
                        padding: '4px 10px',
                        borderRadius: 9999,
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {card.stageLabel}
                    </span>
                    <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 8, marginBottom: 4, color: card.textColor }}>
                      {card.title}
                    </h2>
                    <p style={{ fontSize: 13, opacity: 0.9, maxWidth: '85%', lineHeight: 1.4, color: card.textColor }}>
                      {card.description}
                    </p>
                  </div>

                  <button
                    className="reference-card-arrow-btn"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: card.btnBg,
                      color: card.btnColor,
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                    title={`Pelajari ${card.level}`}
                  >
                    <ArrowUpRight size={22} />
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: `1px solid ${card.badgeBg}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.95 }}>
                    {levelWords.length} Kosakata Terverifikasi
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800 }}>
                    {levelStats.mastered} dikuasai ({Math.round(levelStats.progressPercent)}%)
                  </div>
                </div>

                <div style={{ marginTop: 8 }}>
                  <div style={{ height: 6, background: card.badgeBg, borderRadius: 9999, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${levelStats.progressPercent}%`,
                        background: card.btnBg,
                        borderRadius: 9999,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Category Cards */}
      {activeTab === 'category' && (
        <div className="reference-card-stack">
          {CATEGORIES.map((cat, idx) => {
            const catWords = byCategory[cat.id] || [];
            const catStats = computeCategoryStats(catWords, wordStates);

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card reference-category-item"
                style={{
                  borderRadius: 24,
                  padding: '20px 24px',
                  marginBottom: 16,
                  cursor: 'pointer',
                  border: '1px solid var(--color-border)',
                }}
                onClick={() => handleStartCategory(cat.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 16, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                      {cat.emoji}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 2 }}>{cat.title}</h3>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                        {catWords.length} kosakata · {catStats.mastered} dikuasai
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={20} color="var(--color-text-muted)" />
                </div>
                <div style={{ marginTop: 14 }}>
                  <ProgressBar value={catStats.mastered} max={catWords.length} color={cat.color} height={6} />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
