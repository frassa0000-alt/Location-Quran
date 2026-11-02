/**
 * Quran Advanced Features Service
 * Khatmah Tracking, Daily/Weekly Reading Statistics, Multi-Bookmarks,
 * Offline Audio Caching via Cache API, and Daily Reading Reminders.
 */

import { SURAHS_LIST } from '../data/surahs';
import { getAyahAudioUrl } from '../data/reciters';

// ============================================================
// 1. Khatmah Progress Tracker
// ============================================================
export interface KhatmahProgress {
  currentPage: number;
  totalPages: number;
  currentJuz: number;
  startDate: number;
  targetDays: number;
  completedKhatmahs: number;
  lastUpdated: number;
}

const KHATMAH_STORAGE_KEY = 'el_quran_khatmah_v1';
const DEFAULT_KHATMAH: KhatmahProgress = {
  currentPage: 1,
  totalPages: 604,
  currentJuz: 1,
  startDate: Date.now(),
  targetDays: 30,
  completedKhatmahs: 0,
  lastUpdated: Date.now(),
};

export function getKhatmahProgress(): KhatmahProgress {
  try {
    const raw = localStorage.getItem(KHATMAH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_KHATMAH, ...parsed };
    }
  } catch {
    // fallback
  }
  return DEFAULT_KHATMAH;
}

export function saveKhatmahProgress(progress: KhatmahProgress): void {
  try {
    localStorage.setItem(KHATMAH_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
}

export function updateKhatmahPage(pageNumber: number): KhatmahProgress {
  const current = getKhatmahProgress();
  const clampedPage = Math.max(1, Math.min(604, pageNumber));
  // Rough estimate: 604 pages / 30 juz ~ 20.13 pages per juz
  const calculatedJuz = Math.min(30, Math.max(1, Math.ceil(clampedPage / 20.13)));

  let completed = current.completedKhatmahs;
  if (clampedPage >= 604 && current.currentPage < 604) {
    completed += 1;
  }

  const updated: KhatmahProgress = {
    ...current,
    currentPage: clampedPage,
    currentJuz: calculatedJuz,
    completedKhatmahs: completed,
    lastUpdated: Date.now(),
  };

  saveKhatmahProgress(updated);
  return updated;
}

export function logKhatmahAdvance(pagesToAdd: number): KhatmahProgress {
  const current = getKhatmahProgress();
  return updateKhatmahPage(current.currentPage + pagesToAdd);
}

export function resetKhatmah(targetDays: number = 30): KhatmahProgress {
  const current = getKhatmahProgress();
  const reset: KhatmahProgress = {
    ...DEFAULT_KHATMAH,
    completedKhatmahs: current.completedKhatmahs,
    targetDays,
    startDate: Date.now(),
    lastUpdated: Date.now(),
  };
  saveKhatmahProgress(reset);
  return reset;
}

export function getRemainingKhatmahDays(progress: KhatmahProgress): number {
  const elapsedDays = Math.max(0, Math.floor((Date.now() - progress.startDate) / (1000 * 60 * 60 * 24)));
  return Math.max(1, progress.targetDays - elapsedDays);
}

export function getRequiredDailyPages(progress: KhatmahProgress): number {
  const remainingPages = Math.max(0, progress.totalPages - progress.currentPage);
  const remainingDays = getRemainingKhatmahDays(progress);
  return Math.max(1, Math.ceil(remainingPages / remainingDays));
}

// ============================================================
// 2. Reading Statistics & Streaks
// ============================================================
export interface DayActivity {
  date: string; // YYYY-MM-DD
  pages: number;
  minutes: number;
}

export interface ReadingStats {
  todayPages: number;
  todayMinutes: number;
  streakDays: number;
  totalPagesAllTime: number;
  totalMinutesAllTime: number;
  weeklyActivity: Array<{ dayName: string; date: string; pages: number; minutes: number }>;
}

const STATS_STORAGE_KEY = 'el_quran_reading_stats_v1';
const STREAK_STORAGE_KEY = 'el_quran_streak_v1';

function getTodayDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export function getReadingStats(): ReadingStats {
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    const activityMap: Record<string, { pages: number; minutes: number }> = raw ? JSON.parse(raw) : {};

    const todayStr = getTodayDateStr();
    const today = activityMap[todayStr] || { pages: 0, minutes: 0 };

    // Calculate Streak
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 60; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(now.getDate() - i);
      const str = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      const entry = activityMap[str];
      if (entry && (entry.pages > 0 || entry.minutes > 0)) {
        streak++;
      } else if (i === 0) {
        // Today might not have activity yet, don't break immediately
        continue;
      } else {
        break;
      }
    }

    // All time totals
    let totalPages = 0;
    let totalMinutes = 0;
    Object.values(activityMap).forEach((val) => {
      totalPages += val.pages || 0;
      totalMinutes += val.minutes || 0;
    });

    // 7-day Weekly activity (from 6 days ago to today)
    const weeklyActivity: Array<{ dayName: string; date: string; pages: number; minutes: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const entry = activityMap[str] || { pages: 0, minutes: 0 };
      weeklyActivity.push({
        dayName: ARABIC_DAYS[d.getDay()],
        date: str,
        pages: entry.pages,
        minutes: entry.minutes,
      });
    }

    return {
      todayPages: today.pages,
      todayMinutes: today.minutes,
      streakDays: Math.max(1, streak),
      totalPagesAllTime: totalPages,
      totalMinutesAllTime: totalMinutes,
      weeklyActivity,
    };
  } catch {
    return {
      todayPages: 0,
      todayMinutes: 0,
      streakDays: 1,
      totalPagesAllTime: 0,
      totalMinutesAllTime: 0,
      weeklyActivity: [],
    };
  }
}

export function logReadingActivity(pagesToAdd: number, minutesToAdd: number): void {
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    const map: Record<string, { pages: number; minutes: number }> = raw ? JSON.parse(raw) : {};
    const todayStr = getTodayDateStr();

    const existing = map[todayStr] || { pages: 0, minutes: 0 };
    map[todayStr] = {
      pages: Math.max(0, existing.pages + pagesToAdd),
      minutes: Math.max(0, existing.minutes + minutesToAdd),
    };

    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

// ============================================================
// 3. Advanced Multi-Bookmarks System
// ============================================================
export interface QuranBookmark {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  ayahText: string;
  pageNumber?: number;
  juzNumber?: number;
  tag: 'daily' | 'memorization' | 'contemplation' | 'general';
  note?: string;
  timestamp: number;
}

const BOOKMARKS_STORAGE_KEY = 'el_quran_multi_bookmarks_v1';
const LAST_READ_STORAGE_KEY = 'quran_last_read_bookmark';

export function getBookmarks(): QuranBookmark[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveBookmarkItem(item: Omit<QuranBookmark, 'id' | 'timestamp'>): QuranBookmark {
  const all = getBookmarks();
  // Check if identical surah & ayah exists
  const existingIdx = all.findIndex((b) => b.surahNumber === item.surahNumber && b.ayahNumber === item.ayahNumber);

  const newBookmark: QuranBookmark = {
    ...item,
    id: `bm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };

  if (existingIdx >= 0) {
    all[existingIdx] = newBookmark;
  } else {
    all.unshift(newBookmark);
  }

  // Cap at 50 bookmarks max
  const trimmed = all.slice(0, 50);
  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(trimmed));
    // Also sync with primary last read
    localStorage.setItem(LAST_READ_STORAGE_KEY, JSON.stringify({
      surahNumber: newBookmark.surahNumber,
      ayahNumber: newBookmark.ayahNumber,
      surahName: newBookmark.surahName,
      timestamp: newBookmark.timestamp,
    }));
  } catch {
    // ignore
  }

  return newBookmark;
}

export function removeBookmark(id: string): void {
  try {
    const all = getBookmarks().filter((b) => b.id !== id);
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

export function getLastReadBookmark(): { surahNumber: number; ayahNumber: number; surahName: string; timestamp: number } | null {
  try {
    const raw = localStorage.getItem(LAST_READ_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ============================================================
// 4. Offline Audio Cache via Cache API
// ============================================================
const AUDIO_CACHE_NAME = 'quran-audio-cache-v1';

export async function isAudioCacheSupported(): Promise<boolean> {
  return typeof window !== 'undefined' && 'caches' in window;
}

export async function isSurahAudioCached(surahNumber: number, reciterId: string, totalAyahs: number): Promise<boolean> {
  if (!(await isAudioCacheSupported())) return false;
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    // Check first and last ayah as benchmark
    const firstUrl = getAyahAudioUrl(reciterId, surahNumber, 1);
    const lastUrl = getAyahAudioUrl(reciterId, surahNumber, totalAyahs);

    const [firstMatch, lastMatch] = await Promise.all([
      cache.match(firstUrl),
      cache.match(lastUrl),
    ]);

    return Boolean(firstMatch && lastMatch);
  } catch {
    return false;
  }
}

export async function downloadSurahAudio(
  surahNumber: number,
  reciterId: string,
  totalAyahs: number,
  onProgress?: (progressPercent: number) => void
): Promise<boolean> {
  if (!(await isAudioCacheSupported())) return false;
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);

    let completed = 0;
    // Download ayahs in batches of 4 to prevent network throttling
    const batchSize = 4;
    for (let i = 1; i <= totalAyahs; i += batchSize) {
      const batchPromises: Promise<any>[] = [];
      for (let j = i; j < i + batchSize && j <= totalAyahs; j++) {
        const url = getAyahAudioUrl(reciterId, surahNumber, j);
        const p = cache.match(url).then(async (matched) => {
          if (!matched) {
            try {
              const res = await fetch(url, { mode: 'cors' });
              if (res.ok) {
                await cache.put(url, res.clone());
              }
            } catch {
              // ignore single failure
            }
          }
          completed++;
          if (onProgress) {
            onProgress(Math.round((completed / totalAyahs) * 100));
          }
        });
        batchPromises.push(p);
      }
      await Promise.all(batchPromises);
    }

    if (onProgress) onProgress(100);
    return true;
  } catch (err) {
    console.warn('Failed to download surah audio:', err);
    return false;
  }
}

export async function getOfflineAudioUrl(originalUrl: string): Promise<string> {
  if (!(await isAudioCacheSupported())) return originalUrl;
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const matched = await cache.match(originalUrl);
    if (matched) {
      const blob = await matched.blob();
      return URL.createObjectURL(blob);
    }
  } catch {
    // fallback
  }
  return originalUrl;
}

export async function deleteSurahAudioCache(surahNumber: number, reciterId: string, totalAyahs: number): Promise<void> {
  if (!(await isAudioCacheSupported())) return;
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const deletePromises: Promise<any>[] = [];
    for (let j = 1; j <= totalAyahs; j++) {
      const url = getAyahAudioUrl(reciterId, surahNumber, j);
      deletePromises.push(cache.delete(url));
    }
    await Promise.all(deletePromises);
  } catch {
    // ignore
  }
}

// ============================================================
// 5. Daily Reading Reminder
// ============================================================
export interface ReminderSettings {
  enabled: boolean;
  time: string; // HH:mm format, e.g. "08:00"
}

const REMINDER_STORAGE_KEY = 'el_quran_reminder_v1';
const LAST_REMINDER_DATE_KEY = 'el_quran_last_reminder_date';

export function getReminderSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(REMINDER_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { enabled: false, time: '08:00' };
}

export function saveReminderSettings(settings: ReminderSettings): void {
  try {
    localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export async function requestReminderNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch {
    return false;
  }
}

export function checkAndTriggerReminder(): boolean {
  const settings = getReminderSettings();
  if (!settings.enabled) return false;

  const now = new Date();
  const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const todayStr = getTodayDateStr();

  const lastReminderDate = localStorage.getItem(LAST_REMINDER_DATE_KEY);
  if (lastReminderDate === todayStr) {
    return false; // Already reminded today
  }

  // Trigger if within 30 minutes of reminder time
  const [targetH, targetM] = settings.time.split(':').map(Number);
  const currentTotalMin = now.getHours() * 60 + now.getMinutes();
  const targetTotalMin = targetH * 60 + targetM;

  if (Math.abs(currentTotalMin - targetTotalMin) <= 15) {
    localStorage.setItem(LAST_REMINDER_DATE_KEY, todayStr);
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('القرآن الكريم · تذكير بالورد اليومي', {
          body: 'حان الآن وقت وردك اليومي من تلاوة وتدبر القرآن الكريم 📖',
          icon: '/favicon.svg',
        });
      } catch {
        // fallback
      }
    }
    return true;
  }

  return false;
}
