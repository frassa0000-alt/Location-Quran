import { SURAHS_LIST, SurahMeta, BUNDLED_SURAHS, Ayah } from '../data/surahs';

/**
 * Arabic text normalization for flexible Quranic search
 * Strips all tashkeel, tanween, sukūn, shaddah, tatweel, and normalizes alefs, taa marbuta, and yaa.
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    // Strip diacritics / harakat / tashkeel
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Normalize alef variants (أ, إ, آ, ٱ -> ا)
    .replace(/[إأآٱ]/g, 'ا')
    // Normalize alif maqsura (ى -> ي)
    .replace(/ى/g, 'ي')
    // Normalize taa marbuta (ة -> ه)
    .replace(/ة/g, 'ه')
    // Remove tatweel / kashida (ـ)
    .replace(/\u0640/g, '')
    // Remove special Quranic pause marks, signs & annotations
    .replace(/[\u0610-\u061A\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '')
    .trim()
    .toLowerCase();
}

export interface DirectVerseReference {
  isDirectReference: true;
  surah: SurahMeta;
  ayahNumber: number;
}

/**
 * Parse inputs like:
 * - "2:255" or "2 255"
 * - "البقرة 255" or "سورة البقرة 255" or "البقرة:255"
 * - "الكهف 10" or "سورة الكهف آية 10"
 */
export function parseVerseReference(input: string): DirectVerseReference | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Pattern 1: Number:Number or Number Number (e.g. "2:255", "2/255", "2-255", "2 255")
  const numPairMatch = trimmed.match(/^(\d{1,3})[:\s\/\-_](\d{1,3})$/);
  if (numPairMatch) {
    const surahNum = parseInt(numPairMatch[1], 10);
    const ayahNum = parseInt(numPairMatch[2], 10);
    const surah = SURAHS_LIST.find((s) => s.number === surahNum);
    if (surah && ayahNum >= 1 && ayahNum <= surah.ayahCount) {
      return { isDirectReference: true, surah, ayahNumber: ayahNum };
    }
  }

  // Pattern 2: Arabic text with Surah Name + Ayah Number
  // e.g. "البقرة 255", "سورة الكهف 10", "الفاتحة 5"
  const cleanInput = normalizeArabic(trimmed.replace(/^سوره?\s+/i, ''));
  const matchWithNum = cleanInput.match(/^([^\d]+?)\s*[:،,-]?\s*(\d{1,3})$/);
  if (matchWithNum) {
    const rawSurahName = matchWithNum[1].replace(/^(سوره?|ايه?|اية)\s+/g, '').trim();
    const ayahNum = parseInt(matchWithNum[2], 10);

    const surah = SURAHS_LIST.find((s) => {
      const normSurah = normalizeArabic(s.name);
      return normSurah === rawSurahName || normSurah.includes(rawSurahName) || rawSurahName.includes(normSurah);
    });

    if (surah && ayahNum >= 1 && ayahNum <= surah.ayahCount) {
      return { isDirectReference: true, surah, ayahNumber: ayahNum };
    }
  }

  return null;
}

export interface QuranSearchResultItem {
  numberInQuran: number;
  surahNumber: number;
  surahName: string;
  surahEnglishName: string;
  ayahNumber: number;
  text: string;
  juz?: number;
  page?: number;
  revelationType?: 'Meccan' | 'Medinan';
}

// In-memory query cache for instant responses
const searchCache = new Map<string, QuranSearchResultItem[]>();

/**
 * Search the Quran for specific words or full verses.
 * @param query search text
 * @param surahScope 0 for all Quran, or 1..114 for a specific Surah
 */
export async function searchQuran(
  query: string,
  surahScope: number = 0
): Promise<{ results: QuranSearchResultItem[]; totalMatches: number }> {
  const cleanQ = query.trim();
  if (!cleanQ || cleanQ.length < 2) {
    return { results: [], totalMatches: 0 };
  }

  const cacheKey = `${surahScope}_${cleanQ.toLowerCase()}`;
  if (searchCache.has(cacheKey)) {
    const cached = searchCache.get(cacheKey)!;
    return { results: cached, totalMatches: cached.length };
  }

  const scopeParam = surahScope > 0 ? String(surahScope) : 'all';

  // 1. Try online search using Al-Quran Cloud API
  try {
    const res = await fetch(
      `https://api.alquran.cloud/v1/search/${encodeURIComponent(cleanQ)}/${scopeParam}/quran-simple-clean`
    );

    if (res.ok) {
      const data = await res.json();
      if (data.code === 200 && data.data && Array.isArray(data.data.matches)) {
        const matches: QuranSearchResultItem[] = data.data.matches.map((item: any) => {
          const surahMeta = SURAHS_LIST.find((s) => s.number === item.surah.number);
          let cleanText = (item.text || '').replace(/^\uFEFF/, '').trim();

          // Strip prefixed Basmala in simple search if verse 1 of non-Fatiha/Tawbah
          if (item.surah.number !== 1 && item.surah.number !== 9 && item.numberInSurah === 1) {
            cleanText = cleanText.replace(/^بسم الله الرحمن الرحيم\s*/, '').trim();
          }

          return {
            numberInQuran: item.number,
            surahNumber: item.surah.number,
            surahName: surahMeta ? surahMeta.name : item.surah.name,
            surahEnglishName: item.surah.englishName,
            ayahNumber: item.numberInSurah,
            text: cleanText,
            juz: surahMeta?.juz,
            page: surahMeta?.page,
            revelationType: surahMeta?.revelationType || item.surah.revelationType,
          };
        });

        searchCache.set(cacheKey, matches);
        return { results: matches, totalMatches: matches.length };
      }
    }
  } catch (err) {
    console.warn('Network search failed or offline, falling back to local search:', err);
  }

  // 2. Local Fallback Search (Bundled & LocalStorage cached Surahs)
  const localResults = searchLocalQuran(cleanQ, surahScope);
  searchCache.set(cacheKey, localResults);
  return { results: localResults, totalMatches: localResults.length };
}

/**
 * Searches local in-memory bundled surahs & localStorage caches
 */
function searchLocalQuran(query: string, surahScope: number): QuranSearchResultItem[] {
  const normQuery = normalizeArabic(query);
  const results: QuranSearchResultItem[] = [];

  const targetSurahs = surahScope > 0
    ? SURAHS_LIST.filter((s) => s.number === surahScope)
    : SURAHS_LIST;

  for (const surah of targetSurahs) {
    let ayahs: Ayah[] | null = BUNDLED_SURAHS[surah.number] || null;

    if (!ayahs && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`quran_surah_v2_${surah.number}`);
        if (saved) ayahs = JSON.parse(saved);
      } catch {
        // ignore
      }
    }

    if (ayahs && Array.isArray(ayahs)) {
      for (const ayah of ayahs) {
        const normAyahText = normalizeArabic(ayah.text);
        if (normAyahText.includes(normQuery)) {
          results.push({
            numberInQuran: ayah.numberInQuran,
            surahNumber: surah.number,
            surahName: surah.name,
            surahEnglishName: surah.englishName,
            ayahNumber: ayah.number,
            text: ayah.text,
            juz: ayah.juz || surah.juz,
            page: ayah.page || surah.page,
            revelationType: surah.revelationType,
          });
        }
      }
    }
  }

  return results;
}

/**
 * Highlights matches inside the Arabic verse while respecting word boundaries
 */
export function highlightMatch(text: string, query: string): { before: string; match: string; after: string } | null {
  if (!text || !query) return null;

  const normQuery = normalizeArabic(query);
  const words = text.split(/\s+/);
  const normWords = words.map((w) => normalizeArabic(w));

  // Find consecutive words matching query
  const queryWords = normQuery.split(/\s+/).filter(Boolean);
  if (queryWords.length === 0) return null;

  for (let i = 0; i <= normWords.length - queryWords.length; i++) {
    let allMatch = true;
    for (let j = 0; j < queryWords.length; j++) {
      if (!normWords[i + j].includes(queryWords[j])) {
        allMatch = false;
        break;
      }
    }

    if (allMatch) {
      const before = words.slice(0, i).join(' ');
      const match = words.slice(i, i + queryWords.length).join(' ');
      const after = words.slice(i + queryWords.length).join(' ');
      return { before, match, after };
    }
  }

  return null;
}
