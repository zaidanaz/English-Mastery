import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Volume2, ArrowLeft, Play, Sparkles
} from 'lucide-react';
import { useVocabulary } from '../hooks/useVocabulary';
import { useLearning } from '../context/LearningContext';
import Flashcard from '../components/Flashcard';
import { CefrBadge, PosBadge, LoadingState } from '../components/SharedComponents';

const ALL_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function FlashcardsPage() {
  const [searchParams] = useSearchParams();
  const { allWords, byLevel, isLoading } = useVocabulary();
  const { wordStates } = useLearning();

  // Filters state
  const levelParam = searchParams.get('level');
  const [selectedLevels, setSelectedLevels] = useState(() => {
    if (levelParam && ALL_LEVELS.includes(levelParam)) {
      return [levelParam];
    }
    return [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSessionWords, setActiveSessionWords] = useState(null);
  const [studyMode, setStudyMode] = useState('flip');
  const [sessionId, setSessionId] = useState(() => `study-${Date.now()}`);

  const handleToggleLevel = (lvl) => {
    setSelectedLevels(prev => {
      let next;
      if (prev.includes(lvl)) {
        next = prev.filter(l => l !== lvl);
      } else {
        next = [...prev, lvl];
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedLevels([]);
  };

  const filteredWords = useMemo(() => {
    let list = allWords;

    if (selectedLevels.length > 0) {
      list = list.filter(w => selectedLevels.includes(w.cefrLevel));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(w =>
        w.word.toLowerCase().includes(q) ||
        (w.translationId && w.translationId.toLowerCase().includes(q)) ||
        (w.primaryMeaning && w.primaryMeaning.toLowerCase().includes(q))
      );
    }

    return list;
  }, [allWords, selectedLevels, searchQuery]);

  const handleStartStudy = (mode = 'flip') => {
    if (filteredWords.length === 0) return;
    setStudyMode(mode);
    setSessionId(`study-${Date.now()}`);
    setActiveSessionWords(filteredWords);
  };

  const handlePronounce = (word, e) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(word.replace(/\s*\(.*?\)/, ''));
      utt.lang = 'en-US';
      utt.rate = 0.88;
      window.speechSynthesis.speak(utt);
    }
  };

  if (isLoading) {
    return <div className="page-container"><LoadingState message="Memuat kosakata CEFR & Oxford 3000..." /></div>;
  }

  if (activeSessionWords) {
    return (
      <div className="page-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button
            className="btn btn-ghost"
            onClick={() => setActiveSessionWords(null)}
            style={{ borderRadius: 9999, padding: '8px 14px', fontWeight: 700 }}
          >
            <ArrowLeft size={18} /> Kembali ke Daftar
          </button>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
              {selectedLevels.length === 1 ? `Sesi Level ${selectedLevels[0]}` : 'Sesi Latihan Kosakata'}
            </h2>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              {activeSessionWords.length} kata terpilih
            </div>
          </div>
        </div>

        <Flashcard
          words={activeSessionWords}
          categoryId={selectedLevels[0] || 'all'}
          sessionId={sessionId}
          initialMode={studyMode}
          onComplete={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page Title */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: 4, color: '#18181B' }}>
          Flashcards & Vocabulary
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
          Pilih tingkat kemahiran CEFR untuk memulai sesi belajar mandiri
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="reference-search-box" style={{ marginBottom: 16 }}>
        <Search size={18} color="var(--color-text-muted)" className="search-icon" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari kata bahasa Inggris atau arti Indonesia..."
          className="search-input"
        />
        {searchQuery && (
          <button
            className="search-clear-btn"
            onClick={() => setSearchQuery('')}
          >
            ✕
          </button>
        )}
      </div>

      {/* CEFR Level Filter Pills */}
      <div className="cefr-filter-section" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)' }}>
            Filter Level CEFR:
          </div>
          {selectedLevels.length > 0 && (
            <button
              onClick={handleSelectAll}
              style={{ fontSize: 12, color: '#5B4DFF', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer' }}
            >
              Reset (Pilih Semua)
            </button>
          )}
        </div>

        <div className="cefr-pills-container" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className={`cefr-filter-pill ${selectedLevels.length === 0 ? 'active' : ''}`}
            onClick={handleSelectAll}
          >
            Semua Level ({allWords.length})
          </button>

          {ALL_LEVELS.map(lvl => {
            const count = (byLevel[lvl] || []).length;
            const isSelected = selectedLevels.includes(lvl);
            return (
              <button
                key={lvl}
                className={`cefr-filter-pill level-${lvl.toLowerCase()} ${isSelected ? 'active' : ''}`}
                onClick={() => handleToggleLevel(lvl)}
              >
                <span className="cefr-dot" />
                <span>{lvl}</span>
                <span className="pill-count">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Banner to Start Flashcard Study */}
      <div
        className="card reference-study-banner"
        style={{
          background: 'linear-gradient(135deg, #18181B 0%, #27272A 100%)',
          color: '#FFFFFF',
          borderRadius: 24,
          padding: '20px 24px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
            <Sparkles size={16} color="#FBBF24" />
            <span style={{ fontSize: 12, fontWeight: 800, color: '#FBBF24', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Siap Memulai Belajar
            </span>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            {filteredWords.length} Kosakata Terpilih
          </h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4, margin: 0 }}>
            {selectedLevels.length === 0 ? 'Mencakup seluruh level A1 - C2' : `Level aktif: ${selectedLevels.join(', ')}`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-primary"
            style={{
              background: '#FFFFFF',
              color: '#18181B',
              borderColor: '#FFFFFF',
              borderRadius: 9999,
              padding: '12px 20px',
              fontWeight: 800,
            }}
            onClick={() => handleStartStudy('flip')}
          >
            <Play size={16} /> Mode Balik Kartu
          </button>
          <button
            className="btn btn-outline"
            style={{
              borderColor: 'rgba(255,255,255,0.3)',
              color: '#FFFFFF',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 9999,
              padding: '12px 18px',
              fontWeight: 700,
            }}
            onClick={() => handleStartStudy('quiz')}
          >
            Uji Ingatan
          </button>
        </div>
      </div>

      {/* Vocabulary Items List Preview */}
      <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#18181B' }}>
          Daftar Kosakata ({filteredWords.length})
        </h2>
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
          Klik untuk membuka kartu flashcard
        </span>
      </div>

      <div className="reference-vocab-list">
        {filteredWords.slice(0, 100).map((item) => {
          const state = wordStates[item.id];
          const isMastered = state?.status === 'mastered';
          const isLearning = state?.status === 'learning';

          return (
            <div
              key={item.id}
              className="reference-vocab-item"
              onClick={() => {
                setActiveSessionWords([item]);
                setStudyMode('flip');
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  className="btn-circular-audio-sm"
                  onClick={(e) => handlePronounce(item.word, e)}
                  title="Dengarkan pengucapan"
                >
                  <Volume2 size={15} />
                </button>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#18181B' }}>
                      {item.word}
                    </span>
                    <CefrBadge level={item.cefrLevel} showLabel={false} size="sm" />
                    <PosBadge pos={item.partOfSpeech} />
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                    {item.translationId || item.primaryMeaning}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {isMastered && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#10B981', background: '#E8F5E9', padding: '2px 8px', borderRadius: 9999 }}>
                    Dikuasai
                  </span>
                )}
                {isLearning && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', background: '#FEF3C7', padding: '2px 8px', borderRadius: 9999 }}>
                    Belajar
                  </span>
                )}
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                  p.{item.page || 1}
                </span>
              </div>
            </div>
          );
        })}

        {filteredWords.length > 100 && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)', fontSize: 13 }}>
            Menampilkan 100 dari {filteredWords.length} kata. Gunakan tombol "Mode Balik Kartu" di atas untuk mempelajari semuanya!
          </div>
        )}
      </div>
    </div>
  );
}
