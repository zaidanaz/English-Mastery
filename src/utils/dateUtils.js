/**
 * Date utility functions for learning tracking and streaks.
 * Uses local calendar dates consistently.
 */

/**
 * Get today's date string in YYYY-MM-DD format (local time).
 */
export function getTodayString() {
  const now = new Date();
  return toDateString(now);
}

/**
 * Convert a Date object to YYYY-MM-DD string using local time.
 */
export function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse a YYYY-MM-DD string to a Date object (midnight local time).
 */
export function parseDateString(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Get an array of YYYY-MM-DD strings for all days in a given month.
 */
export function getDaysInMonth(year, month) {
  const days = [];
  const daysCount = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysCount; d++) {
    days.push(`${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }
  return days;
}

/**
 * Calculate the current consecutive learning streak in days.
 * A qualifying day is one that appears in the activeDates set.
 * @param {Set<string>} activeDates - Set of YYYY-MM-DD strings with qualifying activity.
 * @returns {number} current streak length
 */
export function calculateStreak(activeDates) {
  if (!activeDates || activeDates.size === 0) return 0;
  
  const today = getTodayString();
  let streak = 0;
  let current = new Date();
  
  // If today has no activity, check if yesterday had activity (streak might still be alive)
  let checkDate = toDateString(current);
  if (!activeDates.has(checkDate)) {
    // Try yesterday
    current.setDate(current.getDate() - 1);
    checkDate = toDateString(current);
    if (!activeDates.has(checkDate)) return 0;
  }
  
  // Count backwards
  while (activeDates.has(checkDate)) {
    streak++;
    current.setDate(current.getDate() - 1);
    checkDate = toDateString(current);
  }
  
  return streak;
}

/**
 * Calculate longest ever streak from a set of active dates.
 */
export function calculateLongestStreak(activeDates) {
  if (!activeDates || activeDates.size === 0) return 0;
  
  const sorted = Array.from(activeDates).sort();
  if (sorted.length === 0) return 0;
  
  let longest = 1;
  let current = 1;
  
  for (let i = 1; i < sorted.length; i++) {
    const prev = parseDateString(sorted[i - 1]);
    const curr = parseDateString(sorted[i]);
    const diff = (curr - prev) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  
  return longest;
}

/**
 * Get dates for the past N days (including today).
 */
export function getPastNDays(n) {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(toDateString(d));
  }
  return dates;
}

/**
 * Get week label (Mon, Tue, ...) for a YYYY-MM-DD string.
 */
export function getDayLabel(dateStr) {
  const d = parseDateString(dateStr);
  return d.toLocaleDateString('id-ID', { weekday: 'short' });
}

/**
 * Format a date string for display.
 */
export function formatDateDisplay(dateStr) {
  const d = parseDateString(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}
