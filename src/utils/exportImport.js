/**
 * Export and import learning progress as JSON.
 */

import { STORAGE_KEYS } from '../services/storageService';

/**
 * Export all progress data as a JSON blob for download.
 */
export function exportProgress() {
  const data = {};
  Object.values(STORAGE_KEYS).forEach(key => {
    const val = localStorage.getItem(key);
    if (val !== null) data[key] = val;
  });
  
  const blob = new Blob([JSON.stringify({
    version: 1,
    exportedAt: new Date().toISOString(),
    data
  }, null, 2)], { type: 'application/json' });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `english-mastery-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import progress from a previously exported JSON file.
 * @param {File} file
 * @returns {Promise<{success: boolean, message: string}>}
 */
export function importProgress(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.version || !parsed.data) {
          resolve({ success: false, message: 'Format file tidak valid.' });
          return;
        }
        // Restore all keys
        Object.entries(parsed.data).forEach(([key, val]) => {
          localStorage.setItem(key, val);
        });
        resolve({ success: true, message: 'Progress berhasil diimpor. Halaman akan dimuat ulang.' });
      } catch {
        resolve({ success: false, message: 'File backup rusak atau tidak dapat dibaca.' });
      }
    };
    reader.onerror = () => resolve({ success: false, message: 'Gagal membaca file.' });
    reader.readAsText(file);
  });
}
