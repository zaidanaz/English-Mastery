import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LearningProvider } from './context/LearningContext';
import AppLayout from './components/AppLayout';
import SplashScreen from './components/SplashScreen';
import HomePage from './pages/HomePage';
import FlashcardsPage from './pages/FlashcardsPage';
import CategoryPage from './pages/CategoryPage';
import ReviewPage from './pages/ReviewPage';
import StatisticsPage from './pages/StatisticsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AuthProvider>
      <LearningProvider>
        {showSplash && <SplashScreen onFinished={() => setShowSplash(false)} />}
        {!showSplash && (
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/flashcards" element={<FlashcardsPage />} />
                <Route path="/flashcards/:categoryId" element={<CategoryPage />} />
                <Route path="/flashcards/level/:categoryId" element={<CategoryPage />} />
                <Route path="/review" element={<ReviewPage />} />
                <Route path="/statistics" element={<StatisticsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="*" element={
                  <div className="page-container" style={{ textAlign: 'center', paddingTop: 80 }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
                    <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginBottom: 8 }}>Halaman Tidak Ditemukan</h2>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 20 }}>Halaman yang kamu cari tidak ada.</p>
                    <a href="/" className="btn btn-primary" style={{ borderRadius: 9999 }}>Kembali ke Beranda</a>
                  </div>
                } />
              </Route>
            </Routes>
          </BrowserRouter>
        )}
      </LearningProvider>
    </AuthProvider>
  );
}

export default App;
