import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Clock } from 'lucide-react';
import { ProgressBar } from './SharedComponents';

const CATEGORY_CONFIG = {
  'daily-life': {
    emoji: '🏠',
    color: 'var(--color-cat-daily)',
    bgColor: 'var(--color-cat-daily-light)',
    route: '/flashcards/daily-life',
    description: 'Kosakata sehari-hari, rumah, makanan, dan kebutuhan dasar',
  },
  'work-study': {
    emoji: '💼',
    color: 'var(--color-cat-work)',
    bgColor: 'var(--color-cat-work-light)',
    route: '/flashcards/work-study',
    description: 'Bisnis, pendidikan, teknologi, dan dunia kerja profesional',
  },
  'travel-social': {
    emoji: '✈️',
    color: 'var(--color-cat-travel)',
    bgColor: 'var(--color-cat-travel-light)',
    route: '/flashcards/travel-social',
    description: 'Perjalanan, percakapan sosial, dan komunikasi sehari-hari',
  },
  'advanced': {
    emoji: '🎯',
    color: 'var(--color-cat-advanced)',
    bgColor: 'var(--color-cat-advanced-light)',
    route: '/flashcards/advanced',
    description: 'Kosakata lanjutan, akademik, dan ekspresi kompleks',
  },
};

const CATEGORY_TITLES = {
  'daily-life': 'Kehidupan Sehari-hari',
  'work-study': 'Kerja & Pendidikan',
  'travel-social': 'Perjalanan & Sosial',
  'advanced': 'Tingkat Lanjut',
};

export default function CategoryCard({ categoryId, stats, compact = false }) {
  const navigate = useNavigate();
  const config = CATEGORY_CONFIG[categoryId] || {};
  const title = CATEGORY_TITLES[categoryId] || categoryId;
  const { total = 750, mastered = 0, learning = 0, remaining = 750 } = stats || {};
  const progressPct = total > 0 ? (mastered / total) * 100 : 0;
  const hasStarted = mastered > 0 || learning > 0;

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.12)' }}
      transition={{ duration: 0.2 }}
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-subtle)',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-card)',
      }}
      onClick={() => navigate(config.route)}
    >
      {/* Header strip */}
      <div style={{
        background: config.bgColor,
        padding: compact ? '12px 16px' : '20px 20px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}>
        <div style={{
          width: compact ? 40 : 52,
          height: compact ? 40 : 52,
          background: 'white',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: compact ? 22 : 28,
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          {config.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: compact ? 'var(--font-size-sm)' : 'var(--font-size-md)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: 4,
          }}>
            {title}
          </h3>
          {!compact && (
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
              {config.description}
            </p>
          )}
        </div>
      </div>

      {/* Stats body */}
      <div style={{ padding: compact ? '12px 16px' : '16px 20px' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: config.color }}>{mastered}</div>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 500 }}>Dikuasai</div>
          </div>
          <div style={{ width: 1, background: 'var(--color-border)' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-warning)' }}>{learning}</div>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 500 }}>Dipelajari</div>
          </div>
          <div style={{ width: 1, background: 'var(--color-border)' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-secondary)' }}>{total}</div>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 500 }}>Total</div>
          </div>
        </div>

        <ProgressBar
          value={mastered}
          max={total}
          color={config.color}
          height={6}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
            {Math.round(progressPct)}% selesai
          </span>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: config.color,
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '5px 10px',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
            onClick={(e) => { e.stopPropagation(); navigate(config.route); }}
          >
            {hasStarted ? 'Lanjutkan' : 'Mulai'}
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export { CATEGORY_CONFIG, CATEGORY_TITLES };
