import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/logo.png';

const MOTIVATIONAL_MESSAGES = [
  'Sedikit demi sedikit, kuasai bahasa Inggris.',
  'Setiap kata baru adalah langkah menuju dunia yang lebih luas.',
  'Konsistensi adalah kunci kesuksesan belajar.',
  'Hari ini lebih baik dari kemarin, besok lebih baik dari hari ini.',
];

export default function SplashScreen({ onFinished }) {
  const [progress, setProgress] = React.useState(0);
  const [visible, setVisible] = React.useState(true);
  const message = MOTIVATIONAL_MESSAGES[0];

  React.useEffect(() => {
    // Simulate initialization progress
    const steps = [20, 45, 70, 90, 100];
    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i]);
        i++;
      } else {
        clearInterval(interval);
        // Give a brief moment to see 100%
        setTimeout(() => {
          setVisible(false);
          setTimeout(onFinished, 500);
        }, 300);
      }
    }, 200);

    // Safety: always exit after 3s even if something hangs
    const safetyTimeout = setTimeout(() => {
      clearInterval(interval);
      setVisible(false);
      setTimeout(onFinished, 500);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(safetyTimeout);
    };
  }, [onFinished]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4C1D95 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            gap: '32px',
          }}
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
            style={{ textAlign: 'center' }}
          >
            <div style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(108,99,255,0.5)',
              background: 'rgba(255,255,255,0.1)',
            }}>
              <img
                src={logoImg}
                alt="English Mastery"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 24 }}
              />
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                color: 'white',
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              English Mastery
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.6 }}
              style={{
                color: '#C4B5FD',
                fontSize: 13,
                marginTop: 6,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              3.000 Kata Kosakata Bahasa Inggris
            </motion.p>
          </motion.div>

          {/* Motivational Message */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.8, y: 0 }}
            transition={{ delay: 0.8 }}
            style={{
              color: '#A78BFA',
              fontSize: 14,
              textAlign: 'center',
              maxWidth: 280,
              lineHeight: 1.6,
              fontStyle: 'italic',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            "{message}"
          </motion.p>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 200 }}
            transition={{ delay: 0.5 }}
            style={{ width: 200 }}
          >
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 9999,
              height: 4,
              overflow: 'hidden',
              marginBottom: 8,
            }}>
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #6C63FF, #A78BFA)',
                  borderRadius: 9999,
                }}
              />
            </div>
            <p style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 11,
              textAlign: 'center',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              Memuat data kosakata...
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
