import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isConfigured } = useAuth();

  const from = location.state?.from?.pathname || '/profile';
  const successRedirectMessage = location.state?.message;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(successRedirectMessage || null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setError('Harap masukkan email dan kata sandi.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      if (err.message?.includes('Invalid login credentials')) {
        setError('Email atau kata sandi tidak sesuai.');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Email belum dikonfirmasi. Periksa kotak masuk/spam email Anda.');
      } else {
        setError(err.message || 'Terjadi kesalahan saat masuk. Coba lagi nanti.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 480, margin: '0 auto', paddingTop: 20 }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            background: 'var(--color-primary-subtle)',
            color: 'var(--color-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
            fontSize: 28
          }}>
            🎓
          </div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Masuk Akun
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: 4 }}>
            Sinkronkan progres kosakata Oxford 3000 & CEFR Anda di semua perangkat
          </p>
        </div>

        <div className="card" style={{ padding: '28px 24px' }}>
          {!isConfigured && (
            <div style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              color: '#B45309',
              padding: '12px 14px',
              borderRadius: 12,
              fontSize: 13,
              marginBottom: 18,
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong>Konfigurasi Cloudflare / Local:</strong> Supabase URL dan Key belum diatur di environment variable.
              </div>
            </div>
          )}

          {successMessage && (
            <div style={{
              background: 'var(--color-success-light)',
              color: 'var(--color-success-dark)',
              padding: '12px 14px',
              borderRadius: 12,
              fontSize: 13,
              marginBottom: 18,
              fontWeight: 600
            }}>
              {successMessage}
            </div>
          )}

          {error && (
            <div style={{
              background: 'var(--color-danger-light)',
              color: 'var(--color-danger-dark)',
              padding: '12px 14px',
              borderRadius: 12,
              fontSize: 13,
              marginBottom: 18,
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 6 }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="input-field"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={loading}
                  style={{ paddingLeft: 42 }}
                  required
                />
                <Mail
                  size={18}
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Kata Sandi
                </label>
                <Link
                  to="/forgot-password"
                  style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}
                >
                  Lupa sandi?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                  style={{ paddingLeft: 42, paddingRight: 42 }}
                  required
                />
                <Lock
                  size={18}
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 4
                  }}
                  title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              style={{ marginTop: 14, borderRadius: 9999, fontWeight: 700 }}
            >
              {loading ? (
                <span>Memproses Masuk...</span>
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--color-border-subtle)' }}>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
              Belum punya akun?{' '}
              <Link to="/register" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/" style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 600 }}>
            ← Kembali ke Beranda (Lanjut Belajar Offline)
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
