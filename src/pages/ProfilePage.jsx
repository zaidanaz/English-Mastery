import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Target, Moon, Sun, Download, Upload, Trash2, Save,
  LogIn, LogOut, Cloud, CloudOff, RefreshCw, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { useLearning } from '../context/LearningContext';
import { useAuth } from '../context/AuthContext';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { ConfirmationDialog, ProgressBar } from '../components/SharedComponents';
import { exportProgress, importProgress } from '../utils/exportImport';

const GOAL_OPTIONS = [
  { value: 5, label: '5 kata / hari (Santai)' },
  { value: 10, label: '10 kata / hari (Standar) ⭐' },
  { value: 20, label: '20 kata / hari (Aktif)' },
  { value: 30, label: '30 kata / hari (Intensif)' },
];

const AVATAR_OPTIONS = ['🎓', '🦁', '🚀', '🌟', '🔥', '💎', '🦊', '🐉'];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, updateProfile, resetProgress, isSyncing, lastSyncedAt } = useLearning();
  const { user, isAuthenticated, logout, isConfigured } = useAuth();
  const stats = useLearningProgress();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [importMessage, setImportMessage] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [localName, setLocalName] = useState(profile?.displayName || '');
  const [localGoal, setLocalGoal] = useState(profile?.dailyGoal || 10);
  const [localAvatar, setLocalAvatar] = useState(profile?.avatarEmoji || '🎓');
  const [localTheme, setLocalTheme] = useState(profile?.theme || 'light');

  useEffect(() => {
    if (profile) {
      setLocalName(profile.displayName || '');
      setLocalGoal(profile.dailyGoal || 10);
      setLocalAvatar(profile.avatarEmoji || '🎓');
      setLocalTheme(profile.theme || 'light');
    }
  }, [profile]);

  const handleSave = () => {
    updateProfile({
      displayName: localName || 'Pelajar',
      dailyGoal: localGoal,
      avatarEmoji: localAvatar,
      theme: localTheme,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    resetProgress();
    setShowResetConfirm(false);
    window.location.reload();
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutConfirm(false);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await importProgress(file);
    setImportMessage(result.message);
    if (result.success) {
      setTimeout(() => window.location.reload(), 1500);
    }
    e.target.value = '';
  };

  const startDate = profile?.startDate
    ? new Date(profile.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-';

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: 4 }}>Profil & Pengaturan</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 20 }}>Kelola identitas, target harian, dan sinkronisasi akun</p>

        {/* ─── Supabase Account & Cloud Sync Status Card ─── */}
        <div className="card" style={{ marginBottom: 20, borderLeft: isAuthenticated ? '4px solid #10B981' : '4px solid #6C63FF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {isAuthenticated ? (
                  <>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#10B981', background: '#D1FAE5', padding: '3px 10px', borderRadius: 9999 }}>
                      <Cloud size={14} /> Terhubung ke Supabase Cloud
                    </span>
                    {isSyncing && (
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <RefreshCw size={12} className="spinning" /> Menyinkronkan...
                      </span>
                    )}
                  </>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', background: 'var(--color-surface-2)', padding: '3px 10px', borderRadius: 9999 }}>
                    <CloudOff size={14} /> Mode Lokal (Offline)
                  </span>
                )}
              </div>
              <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, marginTop: 4, marginBottom: 2 }}>
                {isAuthenticated ? user.email : 'Akun Tamu (Belajar Offline)'}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
                {isAuthenticated
                  ? (lastSyncedAt ? `Terakhir disinkronkan: ${new Date(lastSyncedAt).toLocaleTimeString('id-ID')}` : 'Progres Anda otomatis tersimpan di cloud.')
                  : 'Masuk akun untuk menyimpan dan menyinkronkan progres antar perangkat.'}
              </p>
            </div>

            <div>
              {isAuthenticated ? (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowLogoutConfirm(true)}
                  style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger-light)', borderRadius: 9999, fontWeight: 700 }}
                >
                  <LogOut size={14} /> Keluar
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link
                    to="/login"
                    className="btn btn-primary btn-sm"
                    style={{ borderRadius: 9999, fontWeight: 700 }}
                  >
                    <LogIn size={14} /> Masuk Akun
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-outline btn-sm"
                    style={{ borderRadius: 9999, fontWeight: 700 }}
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Avatar & Name ─── */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: 16 }}>Identitas Belajar</h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', fontSize: 36,
              background: 'var(--color-primary-subtle)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              border: '3px solid var(--color-primary)',
            }}>
              {localAvatar}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                Nama Tampilan
              </label>
              <input
                className="input-field"
                type="text"
                value={localName}
                onChange={e => setLocalName(e.target.value)}
                placeholder="Masukkan namamu..."
                maxLength={30}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>
              Pilih Avatar
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {AVATAR_OPTIONS.map(av => (
                <button
                  key={av}
                  onClick={() => setLocalAvatar(av)}
                  style={{
                    width: 44, height: 44, borderRadius: 10, fontSize: 22,
                    border: av === localAvatar ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
                    background: av === localAvatar ? 'var(--color-primary-subtle)' : 'var(--color-surface-2)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Daily Goal ─── */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
            <Target size={18} color="var(--color-primary)" /> Target Harian
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {GOAL_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setLocalGoal(opt.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                  borderRadius: 10, border: opt.value === localGoal ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                  background: opt.value === localGoal ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                  cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                  color: 'var(--color-text-primary)', fontSize: 14, fontWeight: 500,
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  border: `2px solid ${opt.value === localGoal ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: opt.value === localGoal ? 'var(--color-primary)' : 'transparent',
                  flexShrink: 0,
                }} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Theme ─── */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: 16 }}>Tampilan Tema</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { value: 'light', label: 'Terang', icon: Sun },
              { value: 'dark', label: 'Gelap', icon: Moon },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setLocalTheme(value)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '10px 16px', borderRadius: 10, fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
                  border: value === localTheme ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                  background: value === localTheme ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                  color: value === localTheme ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <button
          className="btn btn-primary btn-full btn-lg"
          onClick={handleSave}
          style={{ marginBottom: 20, borderRadius: 9999, fontWeight: 700 }}
        >
          {isSaved ? '✅ Pengaturan Tersimpan!' : <><Save size={16} /> Simpan Pengaturan</>}
        </button>

        {/* Stats summary */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: 12 }}>Statistik Singkat</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Mulai Belajar', value: startDate },
              { label: 'Hari Aktif', value: `${stats.totalActiveDays} hari` },
              { label: 'Streak Terpanjang', value: `${stats.longestStreak} hari` },
              { label: 'Total Percobaan', value: stats.totalAttempts },
              { label: 'Akurasi', value: `${stats.accuracy}%` },
              { label: 'Kata Dikuasai', value: stats.masteredCount },
            ].map(s => (
              <div key={s.label} style={{ padding: '10px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Data management */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: 16 }}>Cadangan & Manajemen Data</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn btn-outline btn-full" onClick={exportProgress} style={{ justifyContent: 'flex-start', borderRadius: 12 }}>
              <Download size={16} /> Ekspor Data Belajar (JSON)
            </button>
            <label className="btn btn-outline btn-full" style={{ cursor: 'pointer', justifyContent: 'flex-start', borderRadius: 12 }}>
              <Upload size={16} /> Impor Data Belajar
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            </label>
            {importMessage && (
              <p style={{ fontSize: 13, color: 'var(--color-success)', marginTop: 4 }}>{importMessage}</p>
            )}
            <button
              className="btn btn-full"
              onClick={() => setShowResetConfirm(true)}
              style={{
                justifyContent: 'flex-start', color: 'var(--color-danger)',
                border: '1.5px solid var(--color-danger-light)',
                background: 'var(--color-danger-light)',
                borderRadius: 12,
              }}
            >
              <Trash2 size={16} /> Reset Semua Progress
            </button>
          </div>
        </div>
      </motion.div>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={showResetConfirm}
        title="Reset Semua Progress?"
        message="Tindakan ini akan menghapus seluruh data belajar yang tersimpan, termasuk kata yang dikuasai dan statistik. Ini tidak dapat dibatalkan."
        confirmLabel="Ya, Reset Semua"
        cancelLabel="Batal"
        onConfirm={handleReset}
        onCancel={() => setShowResetConfirm(false)}
        dangerous
      />

      <ConfirmationDialog
        isOpen={showLogoutConfirm}
        title="Keluar dari Akun?"
        message="Data lokal Anda akan tetap aman di perangkat ini. Anda dapat masuk kembali kapan saja untuk menyinkronkan data dengan Cloudflare & Supabase."
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}
