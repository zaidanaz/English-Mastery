import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDaysInMonth, toDateString, parseDateString, formatDateDisplay } from '../utils/dateUtils';

function getActivityLevel(dayData, dailyGoal) {
  if (!dayData) return 'no-data';
  const attempts = (dayData.correct || 0) + (dayData.incorrect || 0);
  const wordsStudied = Array.isArray(dayData.uniqueWords) ? dayData.uniqueWords.length : 0;
  
  if (attempts === 0) return 'no-data';
  if (wordsStudied >= dailyGoal) return 'goal-met';
  if (attempts >= 20) return 'high';
  if (attempts >= 10) return 'moderate';
  if (attempts >= 1) return 'light';
  return 'no-data';
}

const WEEKDAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function LearningCalendar({ dailyActivity, dailyGoal = 10, onSelectDate }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(null);

  const days = getDaysInMonth(viewYear, viewMonth);
  const firstDay = parseDateString(days[0]);
  const startPadding = firstDay.getDay(); // 0=Sun

  const todayStr = toDateString(today);

  const prevMonth = () => {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1); }
    else setViewMonth(m => m + 1);
  };

  const handleDayClick = (dateStr) => {
    const data = dailyActivity[dateStr];
    setSelectedDate(dateStr);
    if (onSelectDate) onSelectDate(dateStr, data);
  };

  const monthLabel = parseDateString(`${viewYear}-${String(viewMonth).padStart(2,'0')}-01`)
    .toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button className="btn btn-ghost btn-sm" onClick={prevMonth} aria-label="Bulan sebelumnya">
          <ChevronLeft size={16} />
        </button>
        <span style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', textTransform: 'capitalize' }}>
          {monthLabel}
        </span>
        <button className="btn btn-ghost btn-sm" onClick={nextMonth} aria-label="Bulan berikutnya">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day labels */}
      <div className="calendar-grid" style={{ marginBottom: 4 }}>
        {WEEKDAY_LABELS.map(d => (
          <div key={d} style={{
            textAlign: 'center',
            fontSize: 10,
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            padding: '4px 0',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="calendar-grid">
        {/* Padding empty cells */}
        {Array.from({ length: startPadding }).map((_, i) => (
          <div key={`pad-${i}`} className="calendar-day empty" />
        ))}
        
        {days.map(dateStr => {
          const data = dailyActivity[dateStr];
          const level = getActivityLevel(data, dailyGoal);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const isFuture = dateStr > todayStr;
          const dayNum = parseInt(dateStr.split('-')[2]);
          
          return (
            <div
              key={dateStr}
              className={`calendar-day ${isFuture ? 'no-data' : level} ${isToday ? 'today' : ''}`}
              style={{
                outline: isSelected ? '2px solid var(--color-primary)' : undefined,
                opacity: isFuture ? 0.3 : 1,
                cursor: isFuture ? 'default' : 'pointer',
              }}
              onClick={() => !isFuture && handleDayClick(dateStr)}
              title={isFuture ? '' : formatDateDisplay(dateStr)}
            >
              {dayNum}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap', fontSize: 10, color: 'var(--color-text-muted)' }}>
        {[
          { cls: 'light', label: 'Sedikit' },
          { cls: 'moderate', label: 'Sedang' },
          { cls: 'high', label: 'Banyak' },
          { cls: 'goal-met', label: 'Target tercapai' },
        ].map(({ cls, label }) => (
          <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div className={`calendar-day ${cls}`} style={{ width: 14, height: 14, borderRadius: 3, cursor: 'default', fontSize: 0 }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
