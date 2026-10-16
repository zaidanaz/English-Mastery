import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BookOpen, BarChart2, User, RotateCcw, Layers, Compass } from 'lucide-react';
import { useLearningProgress } from '../hooks/useLearningProgress';
import logoImg from '../assets/logo.png';

const NAV_ITEMS = [
  { to: '/', label: 'Beranda', icon: Home, exact: true },
  { to: '/flashcards', label: 'Flashcard', icon: BookOpen },
  { to: '/review', label: 'Ulasan', icon: RotateCcw },
  { to: '/statistics', label: 'Statistik', icon: BarChart2 },
  { to: '/profile', label: 'Profil', icon: User },
];

const CEFR_NAV = [
  { level: 'A1', label: 'Beginner', color: '#10B981', bg: '#E8F5E9' },
  { level: 'A2', label: 'Elementary', color: '#F59E0B', bg: '#FEF3C7' },
  { level: 'B1', label: 'Intermediate', color: '#6366F1', bg: '#EEF2FF' },
  { level: 'B2', label: 'Upper-Int', color: '#EF4444', bg: '#FEE2E2' },
  { level: 'C1', label: 'Advanced', color: '#06B6D4', bg: '#ECFEFF' },
  { level: 'C2', label: 'Proficiency', color: '#8B5CF6', bg: '#F5F3FF' },
];

const CATEGORY_NAV = [
  { to: '/flashcards/daily-life', label: 'Kehidupan Sehari-hari', emoji: '🏠' },
  { to: '/flashcards/work-study', label: 'Kerja & Pendidikan', emoji: '💼' },
  { to: '/flashcards/travel-social', label: 'Perjalanan & Sosial', emoji: '✈️' },
  { to: '/flashcards/advanced', label: 'Tingkat Lanjut', emoji: '🎯' },
];

export function Sidebar() {
  const location = useLocation();
  const isFlashcards = location.pathname.startsWith('/flashcards');
  const stats = useLearningProgress();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <img src={logoImg} alt="English Mastery" className="sidebar-logo-img" />
        </div>
        <div>
          <div className="sidebar-brand-name">English Mastery</div>
          <div className="sidebar-brand-sub">OXFORD 3000 & CEFR</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="nav-section-label">Menu Utama</span>
        {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => {
          const isActive = exact ? location.pathname === to : location.pathname.startsWith(to) && (to !== '/' || location.pathname === '/');
          return (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} className="nav-item-icon" />
              <span>{label}</span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="sidebar-active-indicator"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}

        <span className="nav-section-label" style={{ marginTop: 20 }}>Tingkat CEFR</span>
        <div className="sidebar-cefr-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, padding: '0 8px', marginBottom: 12 }}>
          {CEFR_NAV.map(c => (
            <NavLink
              key={c.level}
              to={`/flashcards?level=${c.level}`}
              className="sidebar-cefr-pill"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 10px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                color: c.color,
                background: 'rgba(255, 255, 255, 0.05)',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color }} />
              {c.level}
            </NavLink>
          ))}
        </div>

        {isFlashcards && (
          <>
            <span className="nav-section-label">Kategori Topik</span>
            {CATEGORY_NAV.map(cat => (
              <NavLink
                key={cat.to}
                to={cat.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span style={{ fontSize: 16 }}>{cat.emoji}</span>
                <span style={{ fontSize: 12 }}>{cat.label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
          <span>Penguasaan Oxford 3000</span>
          <span style={{ fontWeight: 700, color: 'var(--color-primary-light)' }}>{stats.masteryPercent}%</span>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 9999,
          height: 6,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${stats.masteryPercent}%`,
            background: 'linear-gradient(90deg, #5B4DFF, #10B981)',
            borderRadius: 9999,
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }} />
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 6, textAlign: 'center' }}>
          {stats.masteredCount} dari {stats.totalVocab} kosakata terkuasai
        </div>
      </div>
    </aside>
  );
}

/**
 * Liquid Glass Floating Navigation Bar.
 * Inspired by reference image with fluid capsule and organic spring transitions.
 */
export function BottomNav() {
  const location = useLocation();

  return (
    <div className="liquid-glass-dock-wrapper">
      <nav className="liquid-glass-dock" role="navigation" aria-label="Main Navigation">
        {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => {
          const isActive = exact
            ? location.pathname === to
            : location.pathname.startsWith(to) && (to !== '/' || location.pathname === '/');

          return (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={`liquid-dock-item ${isActive ? 'active' : ''}`}
              aria-label={label}
            >
              <div className="liquid-dock-icon-wrapper">
                {isActive && (
                  <motion.div
                    layoutId="liquid-pill-active"
                    className="liquid-pill-badge"
                    transition={{
                      type: 'spring',
                      stiffness: 420,
                      damping: 32,
                      mass: 0.8,
                    }}
                  />
                )}
                <Icon size={20} className="liquid-dock-icon" />
              </div>
              <span className="liquid-dock-label">{label}</span>
              {isActive && (
                <motion.span
                  layoutId="liquid-dot-active"
                  className="liquid-dock-dot"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
