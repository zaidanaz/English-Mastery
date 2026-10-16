import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Filter, ArrowLeft, Play, RotateCcw, Volume2, CheckCircle2 } from 'lucide-react';
import { useVocabulary } from '../hooks/useVocabulary';
import { useLearning } from '../context/LearningContext';
import { getReviewQueue, generateSessionId } from '../services/learningEngine';
import Flashcard from '../components/Flashcard';
import { LoadingState, EmptyState, CefrBadge, OxfordBadge, PosBadge } from '../components/SharedComponents';

const CEFR_FILTER_LABELS = {
  'all': 'Semua Level CEFR',
  'A1': 'Level A1 (Beginner)',
  'A2': 'Level A2 (Elementary)',
  'B1': 'Level B1 (Intermediate)',
  'B2': 'Level B2 (Upper-Intermediate)',
  'C1': 'Level C1 (Advanced)',
  'C2': 'Level C2 (Proficiency)',
};

const CATEGORY_LABELS = {
  'all': 'Semua Kategori',
  'daily-life': 'Kehidupan Sehari-hari',
  'work-study': 'Kerja & Pendidikan',
  'travel-social': 'Perjalanan & Sosial',
  'advanced': 'Tingkat Lanjut',
};

export default function ReviewPage() {
  const { allWords, isLoading } = useVocabulary();
  const { wordStates } = useLearning();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cefrFilter, setCefrFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [isLearning, setIsLearning] = useState(false);
  const [sessionId] = useState(() => generateSessionId());
  const [studyMode, setStudyMode] = useState('flip');

  const reviewQueue = useMemo(() => {
    return getReviewQueue(allWords, wordStates, { categoryFilter, cefrFilter, sortBy });
  }, [allWords, wordStates, categoryFilter, cefrFilter, sortBy]);

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

  if (isLoading) return <div className="page-container"><LoadingState message="Memuat daftar ulasan..." /></div>;

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: 4, color: '#18181B' }}>
          Ulasan Kosakata
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, fontSize: 14 }}>
          Spaced repetition: ulang kata-kata yang masih perlu pemantapan
        </p>

        {!isLearning ? (
          <>
            {/* Filter Bar */}
            <div className="card" style={{ marginBottom: 20, borderRadius: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Filter size={16} color="#5B4DFF" />
                <strong style={{ fontSize: 14, color: '#18181B' }}>Filter & Urutan Ulasan</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                    Level CEFR
                  </label>
                  <select
                    value={cefrFilter}
                    onChange={e => setCefrFilter(e.target.value)}
                    className="input-field"
                    style={{ fontSize: 13, padding: '8px 12px', borderRadius: 12 }}
                  >
                    {Object.entries(CEFR_FILTER_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                    Kategori Topik
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="input-field"
                    style={{ fontSize: 13, padding: '8px 12px', borderRadius: 12 }}
                  >
                    {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                    Urutan
                  </label>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="input-field"
                    style={{ fontSize: 13, padding: '8px 12px', borderRadius: 12 }}
                  >
                    <option value="recent">Paling Baru Dilatih</option>
                    <option value="incorrect">Paling Sering Salah</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Empty or Review List */}
            {reviewQueue.length === 0 ? (
              <EmptyState
                emoji="🎉"
                title="Tidak Ada Kata yang Perlu Diulas!"
                description="Semua kata yang kamu pelajari sudah dikuasai atau kamu belum memulai sesi belajar. Hebat sekali!"
                action={
                  <a href="/flashcards" className="btn btn-primary" style={{ borderRadius: 9999, fontWeight: 700 }}>
                    Mulai Belajar Kata Baru
                  </a>
                }
              />
            ) : (
              <>
                <div
                  className="card"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                    borderRadius: 20,
                    padding: '16px 20px',
                    background: 'linear-gradient(135deg, #5B4DFF, #4834D4)',
                    color: '#FFFFFF',
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                      {reviewQueue.length} Kata Perlu Pemantapan
                    </h3>
                    <p style={{ fontSize: 12, opacity: 0.85, margin: '4px 0 0 0' }}>
                      Kuasai kata-kata ini dengan 3 kali menjawab benar berturut-turut
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-primary"
                      style={{ background: '#FFFFFF', color: '#18181B', borderRadius: 9999, fontWeight: 800, borderColor: '#FFFFFF' }}
                      onClick={() => { setStudyMode('flip'); setIsLearning(true); }}
                    >
                      <Play size={16} /> Balik Kartu
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.4)', borderRadius: 9999, fontWeight: 700 }}
                      onClick={() => { setStudyMode('quiz'); setIsLearning(true); }}
                    >
                      Kuis
                    </button>
                  </div>
                </div>

                <div className="reference-vocab-list">
                  {reviewQueue.map(w => {
                    const ws = wordStates[w.id];
                    return (
                      <div key={w.id} className="reference-vocab-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <button
                            className="btn-circular-audio-sm"
                            onClick={(e) => handlePronounce(w.word, e)}
                            title="Dengarkan pengucapan"
                          >
                            <Volume2 size={15} />
                          </button>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 16, fontWeight: 800, color: '#18181B' }}>{w.word}</span>
                              <CefrBadge level={w.cefrLevel} showLabel={false} size="sm" />
                              <PosBadge pos={w.partOfSpeech} />
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                              {w.translationId || w.primaryMeaning}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', background: '#FEF3C7', padding: '3px 9px', borderRadius: 9999 }}>
                            {ws?.consecutiveCorrect || 0}/3 Benar
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        ) : (
          <div>
            <div style={{ marginBottom: 16 }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setIsLearning(false)}
                style={{ borderRadius: 9999 }}
              >
                <ArrowLeft size={16} /> Selesai Mengulas
              </button>
            </div>
            <Flashcard
              words={reviewQueue}
              categoryId="review"
              sessionId={sessionId}
              initialMode={studyMode}
              onComplete={() => setIsLearning(false)}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}
