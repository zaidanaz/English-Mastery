import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isConfigured } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Harap isi semua kolom wajib.');
      return;
    }

    if (password.length < 6) {
      setError('Kata sandi harus minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      const data = await register(email.trim(), password, displayName.trim() || 'Pelajar');
      
      // If user session is created immediately (no email confirmation needed)
      if (data.session) {
        navigate('/profile', { replace: true });
      } else {
        // Confirmation email sent
        setSuccess(true);
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.message?.includes('already registered')) {
        setError('Email ini sudah terdaftar. Silakan langsung masuk.');
      } else {
        setError(err.message || 'Terjadi kesalahan saat pendaftaran.');
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
            ✨
          </div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Buat Akun Baru
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: 4 }}>
            Mulai petualangan menguasai 3.000 kata Oxford dengan penyimpanan awan
          </p>
        </div>

        <div className="card" style={{ padding: '28px 24px' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--color-success-light)',
                color: 'var(--color-success-dark)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}>
                <CheckCircle size={36} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: 'var(--color-text-primary)' }}>
                Pendaftaran Berhasil!
              </h3>
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
                Tautan konfirmasi telah dikirim ke <strong>{email}</strong>. Silakan periksa kotak masuk atau spam email Anda untuk mengaktifkan akun.
              </p>
              <Link
                to="/login"
                className="btn btn-primary btn-full"
                style={{ borderRadius: 9999, fontWeight: 700 }}
              >
                Menuju Halaman Masuk
              </Link>
            </div>
          ) : (
            <>
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
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 6 }}>
                    Nama Pengguna (Opsional)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Contoh: Alex"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={loading}
                      style={{ paddingLeft: 42 }}
                      maxLength={30}
                    />
                    <User
                      size={18}
                      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 6 }}>
                    Email <span style={{ color: 'var(--color-danger)' }}>*</span>
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

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 6 }}>
                    Kata Sandi <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input-field"
                      placeholder="Minimal 6 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
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

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 6 }}>
                    Konfirmasi Kata Sandi <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input-field"
                      placeholder="Ulangi kata sandi"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      disabled={loading}
                      style={{ paddingLeft: 42 }}
                      required
                    />
                    <Lock
                      size={18}
                      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full btn-lg"
                  disabled={loading}
                  style={{ borderRadius: 9999, fontWeight: 700 }}
                >
                  {loading ? (
                    <span>Mendaftarkan Akun...</span>
                  ) : (
                    <>
                      <span>Daftar Sekarang</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--color-border-subtle)' }}>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
                  Sudah memiliki akun?{' '}
                  <Link to="/login" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                    Masuk di sini
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/" style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 600 }}>
            ← Kembali ke Beranda
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
