import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Award, AlertTriangle } from 'lucide-react';

/**
 * Animated progress bar.
 */
export function ProgressBar({ value, max = 100, color, height = 8, className = '' }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div
      className={`progress-bar-track ${className}`}
      style={{ height, borderRadius: 9999, background: 'rgba(0, 0, 0, 0.08)', overflow: 'hidden' }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          height: '100%',
          borderRadius: 9999,
          background: color || 'var(--color-primary)',
          minWidth: pct > 0 ? '4px' : '0px',
        }}
      />
    </div>
  );
}

/**
 * Stat display card.
 */
export function StatCard({ value, label, icon, color, suffix = '' }) {
  return (
    <div className="stat-card">
      {icon && (
        <div style={{ color: color || 'var(--color-primary)', marginBottom: 8, fontSize: 20 }}>
          {icon}
        </div>
      )}
      <div className="stat-value" style={{ color: color }}>
        {value}{suffix}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

/**
 * CEFR Level Badge (A1 to C2).
 */
export const CEFR_CONFIG = {
  A1: { label: 'A1 · Beginner', name: 'Beginner', bg: '#E8F5E9', color: '#1B5E20', border: '#C8E6C9' },
  A2: { label: 'A2 · Elementary', name: 'Elementary', bg: '#FFF8E1', color: '#B78103', border: '#FFE082' },
  B1: { label: 'B1 · Intermediate', name: 'Intermediate', bg: '#EEF2FF', color: '#3730A3', border: '#C7D2FE' },
  B2: { label: 'B2 · Upper-Int', name: 'Upper-Intermediate', bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' },
  C1: { label: 'C1 · Advanced', name: 'Advanced', bg: '#ECFEFF', color: '#155E75', border: '#A5F3FC' },
  C2: { label: 'C2 · Proficiency', name: 'Proficiency', bg: '#F5F3FF', color: '#5B21B6', border: '#DDD6FE' },
};

export function CefrBadge({ level = 'A1', showLabel = true, size = 'md' }) {
  const conf = CEFR_CONFIG[level] || CEFR_CONFIG.A1;
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <span
      className={`cefr-badge cefr-${level.toLowerCase()}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: conf.bg,
        color: conf.color,
        border: `1px solid ${conf.border}`,
        padding: isSm ? '2px 8px' : isLg ? '6px 14px' : '4px 10px',
        borderRadius: 9999,
        fontWeight: 700,
        fontSize: isSm ? 11 : isLg ? 14 : 12,
        letterSpacing: '0.02em',
      }}
    >
      <span style={{ fontWeight: 800 }}>{level}</span>
      {showLabel && <span style={{ opacity: 0.85, fontWeight: 600 }}>· {conf.name}</span>}
    </span>
  );
}

/**
 * Oxford 3000 badge.
 */
export function OxfordBadge({ isOxford = true, verified = true }) {
  if (!isOxford) return null;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: 'rgba(91, 77, 255, 0.08)',
        color: '#5B4DFF',
        border: '1px solid rgba(91, 77, 255, 0.2)',
        padding: '3px 9px',
        borderRadius: 9999,
        fontSize: 11,
        fontWeight: 700,
      }}
      title="Verified Oxford 3000 official vocabulary"
    >
      <Award size={12} />
      <span>Oxford 3000</span>
    </span>
  );
}

/**
 * Difficulty badge.
 */
export function DifficultyBadge({ difficulty }) {
  const labels = { beginner: 'Pemula', intermediate: 'Menengah', advanced: 'Lanjutan' };
  return (
    <span className={`badge difficulty-${difficulty}`}>
      {labels[difficulty] || difficulty}
    </span>
  );
}

/**
 * Part of speech badge.
 */
export function PosBadge({ pos }) {
  return (
    <span
      className="badge badge-pos"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.05)',
        color: 'var(--color-text-secondary)',
        border: '1px solid var(--color-border)',
        padding: '3px 8px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {pos}
    </span>
  );
}

/**
 * Loading state.
 */
export function LoadingState({ message = 'Memuat...' }) {
  return (
    <div className="loading-center">
      <div className="loading-spinner" />
      <p className="text-secondary text-sm">{message}</p>
    </div>
  );
}

/**
 * Empty state.
 */
export function EmptyState({ emoji = '📭', title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{emoji}</div>
      {title && <div className="empty-state-title">{title}</div>}
      {description && <p className="text-secondary text-sm mb-md">{description}</p>}
      {action}
    </div>
  );
}

/**
 * Confirmation Dialog.
 */
export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  onConfirm,
  onCancel,
  dangerous = false,
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="dialog-overlay" onClick={onCancel}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="dialog-box"
          onClick={e => e.stopPropagation()}
        >
          {dangerous && (
            <div style={{ color: 'var(--color-danger)', marginBottom: 12 }}>
              <AlertTriangle size={32} />
            </div>
          )}
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: '#18181B' }}>
            {title}
          </h3>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
            {message}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={onCancel} style={{ borderRadius: 12 }}>
              {cancelLabel}
            </button>
            <button
              className={`btn ${dangerous ? 'btn-danger' : 'btn-primary'}`}
              onClick={onConfirm}
              style={{
                borderRadius: 12,
                background: dangerous ? 'var(--color-danger)' : undefined,
                color: '#FFFFFF',
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
