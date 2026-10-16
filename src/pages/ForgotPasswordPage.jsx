import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, AlertCircle, CheckCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordPage() {
  const { resetPassword, isConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Harap masukkan alamat email Anda.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSuccess(true);
    } catch (err) {
      console.error('Password reset request error:', err);
      setError(err.message || 'Gagal mengirim instruksi pemulihan kata sandi.');
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
            <KeyRound size={28} />
          </div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Lupa Kata Sandi
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: 4 }}>
            Masukkan email terdaftar untuk menerima tautan atur ulang kata sandi
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
                Email Terkirim!
              </h3>
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
                Jika akun dengan email <strong>{email}</strong> terdaftar, tautan pemulihan kata sandi telah dikirimkan.
              </p>
              <Link
                to="/login"
                className="btn btn-primary btn-full"
                style={{ borderRadius: 9999, fontWeight: 700 }}
              >
                Kembali ke Halaman Masuk
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
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 6 }}>
                    Email Akun
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

                <button
                  type="submit"
                  className="btn btn-primary btn-full btn-lg"
                  disabled={loading}
                  style={{ borderRadius: 9999, fontWeight: 700 }}
                >
                  {loading ? 'Mengirim Tautan...' : (
                    <>
                      <span>Kirim Tautan Pemulihan</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--color-border-subtle)' }}>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
                  Ingat kata sandi Anda?{' '}
                  <Link to="/login" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                    Masuk kembali
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
