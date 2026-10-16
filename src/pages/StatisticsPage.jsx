import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Target, Flame, Star, Calendar, TrendingUp, Award, Layers } from 'lucide-react';
import { useLearning } from '../context/LearningContext';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { useVocabulary } from '../hooks/useVocabulary';
import { computeCategoryStats, computeLevelStats } from '../services/statisticsService';
import LearningCalendar from '../components/LearningCalendar';
import { ProgressBar, LoadingState, CefrBadge } from '../components/SharedComponents';
import { formatDateDisplay } from '../utils/dateUtils';

const ALL_CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const CEFR_CONFIGS = {
  A1: { name: 'Beginner', color: '#10B981', bg: '#E8F5E9' },
  A2: { name: 'Elementary', color: '#F59E0B', bg: '#FEF3C7' },
  B1: { name: 'Intermediate', color: '#6366F1', bg: '#EEF2FF' },
  B2: { name: 'Upper-Intermediate', color: '#EF4444', bg: '#FEE2E2' },
  C1: { name: 'Advanced', color: '#06B6D4', bg: '#ECFEFF' },
  C2: { name: 'Proficiency', color: '#8B5CF6', bg: '#F5F3FF' },
};

const CATEGORIES = ['daily-life', 'work-study', 'travel-social', 'advanced'];
const CATEGORY_LABELS = {
  'daily-life': 'Kehidupan Sehari-hari',
  'work-study': 'Kerja & Pendidikan',
  'travel-social': 'Perjalanan & Sosial',
  'advanced': 'Tingkat Lanjut',
};
const CATEGORY_COLORS = {
  'daily-life': '#F97316',
  'work-study': '#3B82F6',
  'travel-social': '#8B5CF6',
  'advanced': '#10B981',
};

export default function StatisticsPage() {
  const { dailyActivity, wordStates, profile } = useLearning();
  const { byCategory, byLevel, allWords, isLoading } = useVocabulary();
  const stats = useLearningProgress();
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [selectedDateStr, setSelectedDateStr] = useState(null);

  const handleDaySelect = (dateStr, data) => {
    setSelectedDateStr(dateStr);
    setSelectedDayData(data || null);
  };

  const categoryStats = CATEGORIES.reduce((acc, cat) => {
    const words = byCategory[cat] || [];
    acc[cat] = computeCategoryStats(words, wordStates);
    return acc;
  }, {});

  const cefrStats = ALL_CEFR_LEVELS.reduce((acc, lvl) => {
    const words = byLevel[lvl] || [];
    acc[lvl] = computeLevelStats(words, wordStates);
    return acc;
  }, {});

  if (isLoading) return <div className="page-container"><LoadingState message="Memuat statistik kemajuan..." /></div>;

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: 4, color: '#18181B' }}>
          Statistik Kemahiran
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, fontSize: 14 }}>
          Pantau perkembangan kosakata Oxford 3000 & tingkatan CEFR A1 - C2
        </p>

        {/* Key stats */}
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {[
            { icon: '🔥', value: stats.currentStreak, suffix: ' hari', label: 'Streak Saat Ini', color: '#F59E0B' },
            { icon: '📅', value: stats.longestStreak, suffix: ' hari', label: 'Streak Terpanjang', color: '#5B4DFF' },
            { icon: '⭐', value: stats.masteredCount, label: 'Kata Dikuasai', color: '#10B981' },
            { icon: '📚', value: stats.studiedCount, label: 'Kata Dipelajari', color: '#3B82F6' },
            { icon: '✅', value: stats.correctAttempts, label: 'Jawaban Benar', color: '#10B981' },
            { icon: '❌', value: stats.incorrectAttempts, label: 'Jawaban Salah', color: '#EF4444' },
            { icon: '🎯', value: `${stats.accuracy}%`, label: 'Akurasi', color: stats.accuracy >= 70 ? '#10B981' : '#F59E0B' },
            { icon: '📆', value: stats.totalActiveDays, suffix: ' hari', label: 'Hari Aktif', color: '#8B5CF6' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="stat-card"
              style={{ borderRadius: 18 }}
            >
              <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
              <div className="stat-value" style={{ color: s.color, fontSize: 22, fontWeight: 800 }}>
                {s.value}{s.suffix || ''}
              </div>
              <div className="stat-label">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Overall mastery */}
        <div className="card" style={{ marginBottom: 24, borderRadius: 24, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={20} color="#5B4DFF" />
              <strong style={{ fontSize: 16, color: '#18181B' }}>Penguasaan Kosakata Keseluruhan</strong>
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#5B4DFF' }}>
              {stats.masteryPercent}%
            </span>
          </div>
          <ProgressBar value={stats.masteredCount} max={allWords.length} color="#5B4DFF" height={12} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 13, color: 'var(--color-text-secondary)' }}>
            <span><strong>{stats.masteredCount}</strong> dikuasai</span>
            <span><strong>{stats.learningCount}</strong> sedang dipelajari</span>
            <span><strong>{Math.max(0, allWords.length - stats.masteredCount - stats.learningCount)}</strong> belum dimulai</span>
          </div>
        </div>

        {/* CEFR Level Breakdown */}
        <div className="card" style={{ marginBottom: 24, borderRadius: 24, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Layers size={20} color="#18181B" />
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#18181B' }}>
              Progres per Tingkat Kemahiran CEFR
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {ALL_CEFR_LEVELS.map(lvl => {
              const ls = cefrStats[lvl] || { total: 0, mastered: 0, progressPercent: 0 };
              const cfg = CEFR_CONFIGS[lvl];
              return (
                <div key={lvl}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CefrBadge level={lvl} showLabel={false} size="sm" />
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#18181B' }}>{cfg.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                      {ls.mastered} / {ls.total} kata ({Math.round(ls.progressPercent)}%)
                    </span>
                  </div>
                  <ProgressBar value={ls.mastered} max={ls.total} color={cfg.color} height={8} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="card" style={{ marginBottom: 24, borderRadius: 24, padding: '24px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: '#18181B' }}>
            📊 Progres per Kategori Topik
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {CATEGORIES.map(cat => {
              const cs = categoryStats[cat];
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#18181B' }}>{CATEGORY_LABELS[cat]}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      {cs.mastered}/{cs.total} ({Math.round(cs.progressPercent)}%)
                    </span>
                  </div>
                  <ProgressBar value={cs.mastered} max={cs.total} color={CATEGORY_COLORS[cat]} height={8} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Calendar */}
        <div className="card" style={{ marginBottom: 24, borderRadius: 24, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Calendar size={18} color="#5B4DFF" />
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#18181B' }}>Kalender Belajar</h2>
          </div>
          <LearningCalendar
            dailyActivity={dailyActivity}
            dailyGoal={profile?.dailyGoal || 10}
            onSelectDate={handleDaySelect}
          />
        </div>

        {/* Day detail panel */}
        {selectedDateStr && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
            style={{ borderRadius: 24, padding: '24px' }}
          >
            <h3 style={{ fontWeight: 800, marginBottom: 12, color: '#18181B' }}>
              📅 {formatDateDisplay(selectedDateStr)}
            </h3>
            {!selectedDayData || (selectedDayData.correct + selectedDayData.incorrect) === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
                Tidak ada aktivitas belajar pada hari ini.
              </p>
            ) : (
              <div className="stats-grid">
                {[
                  { value: (selectedDayData.correct || 0) + (selectedDayData.incorrect || 0), label: 'Total Percobaan' },
                  { value: selectedDayData.correct || 0, label: 'Jawaban Benar', color: 'var(--color-success)' },
                  { value: selectedDayData.incorrect || 0, label: 'Jawaban Salah', color: 'var(--color-danger)' },
                  { value: Array.isArray(selectedDayData.uniqueWords) ? selectedDayData.uniqueWords.length : 0, label: 'Kata Dipelajari' },
                  { value: selectedDayData.newWords || 0, label: 'Kata Baru' },
                  { value: selectedDayData.masteredWords || 0, label: 'Kata Dikuasai', color: 'var(--color-primary)' },
                ].map(s => (
                  <div key={s.label} className="stat-card" style={{ borderRadius: 16 }}>
                    <div className="stat-value" style={{ color: s.color, fontSize: 22, fontWeight: 800 }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
