import { Ayah, BUNDLED_SURAHS } from '../data/surahs';

// Utility regex to strip prefixed Basmala from verse 1 for surahs 2..114 (except 9 At-Tawbah which has none)
// Matches all Uthmani variations in Al-Quran Cloud (such as with shaddah on ba, etc.)
export function stripPrefixBasmala(text: string, surahNumber: number): string {
  const normalized = text.replace(/^\uFEFF/, '').trim();
  if (surahNumber === 1 || surahNumber === 9) {
    return normalized;
  }
  const basmalaRegex = /^[\uFEFF\s]*ب[\u0651\u0650]*س[\u0652]*م[\u0650]*\s+[\u0671\u0627]لل[\u0651]*[\u064E]*ه[\u0650]*\s+[\u0671\u0627]لر[\u0651]*[\u064E]*ح[\u0652]*م[\u064E]*[\u0670]*ن[\u0650]*\s+[\u0671\u0627]لر[\u0651]*[\u064E]*ح[\u0650]*ي[\u0650]*م[\u0650]*\s*/u;
  const stripped = normalized.replace(basmalaRegex, '').trim();
  return stripped.length > 0 ? stripped : normalized;
}

// In-memory cache for fast switching
const surahCache: Record<number, Ayah[]> = { ...BUNDLED_SURAHS };

export async function fetchSurahVerses(surahNumber: number): Promise<Ayah[]> {
  // Check memory cache first
  if (surahCache[surahNumber]) {
    return surahCache[surahNumber];
  }

  // Check localStorage cache next
  try {
    const saved = localStorage.getItem(`quran_surah_v2_${surahNumber}`);
    if (saved) {
      const parsed = JSON.parse(saved) as Ayah[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        surahCache[surahNumber] = parsed;
        return parsed;
      }
    }
  } catch {
    // Continue to network
  }

  try {
    // Fetch both Uthmani text and Tafsir Al-Muyassar in a single call
    const res = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,ar.muyassar`
    );

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const data = await res.json();
    if (data.code === 200 && Array.isArray(data.data) && data.data.length >= 1) {
      const uthmaniEdition = data.data[0];
      const tafsirEdition = data.data[1];

      const ayahs: Ayah[] = uthmaniEdition.ayahs.map((item: {
        number: number;
        numberInSurah: number;
        text: string;
        juz?: number;
        page?: number;
      }, idx: number) => {
        let cleanText = item.text.replace(/^\uFEFF/, '').trim();
        // In Al-Quran Cloud, Surah 1 verse 1 is Al-Fatiha itself (Basmala is verse 1)
        // In Surah 9 (At-Tawbah), there is no Basmala
        // In other surahs (2-8, 10-114), the API prefixes Basmala to verse 1
        if (surahNumber !== 1 && surahNumber !== 9 && idx === 0) {
          cleanText = stripPrefixBasmala(cleanText, surahNumber);
        }

        const tafsirText = tafsirEdition?.ayahs?.[idx]?.text || 'التفسير غير متوفر حالياً';

        return {
          number: item.numberInSurah,
          numberInQuran: item.number,
          text: cleanText,
          tafsir: tafsirText,
          juz: item.juz,
          page: item.page,
        };
      });

      // Save to caches
      surahCache[surahNumber] = ayahs;
      try {
        localStorage.setItem(`quran_surah_v2_${surahNumber}`, JSON.stringify(ayahs));
      } catch {
        // Storage quota safe ignore
      }

      return ayahs;
    }

    throw new Error('Invalid response structure');
  } catch (err) {
    console.warn(`Failed to fetch surah ${surahNumber} online, using fallback:`, err);
    // If bundled fallback exists
    if (BUNDLED_SURAHS[surahNumber]) {
      return BUNDLED_SURAHS[surahNumber];
    }
    throw err;
  }
}



export interface PageAyah {
  number: number; // in Quran
  numberInSurah: number;
  text: string;
  surahNumber: number;
  surahName: string;
  juz: number;
  page: number;
}

export interface QuranPageData {
  pageNumber: number;
  juzNumber: number;
  surahsOnPage: { number: number; name: string }[];
  ayahs: PageAyah[];
}

const pageCache: Record<number, QuranPageData> = {
  1: {
    pageNumber: 1,
    juzNumber: 1,
    surahsOnPage: [{ number: 1, name: "الفَاتِحَة" }],
    ayahs: [
      { number: 1, numberInSurah: 1, text: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", surahNumber: 1, surahName: "الفَاتِحَة", juz: 1, page: 1 },
      { number: 2, numberInSurah: 2, text: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ", surahNumber: 1, surahName: "الفَاتِحَة", juz: 1, page: 1 },
      { number: 3, numberInSurah: 3, text: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", surahNumber: 1, surahName: "الفَاتِحَة", juz: 1, page: 1 },
      { number: 4, numberInSurah: 4, text: "مَٰلِكِ يَوْمِ ٱلدِّينِ", surahNumber: 1, surahName: "الفَاتِحَة", juz: 1, page: 1 },
      { number: 5, numberInSurah: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", surahNumber: 1, surahName: "الفَاتِحَة", juz: 1, page: 1 },
      { number: 6, numberInSurah: 6, text: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ", surahNumber: 1, surahName: "الفَاتِحَة", juz: 1, page: 1 },
      { number: 7, numberInSurah: 7, text: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ", surahNumber: 1, surahName: "الفَاتِحَة", juz: 1, page: 1 },
    ]
  },
  2: {
    pageNumber: 2,
    juzNumber: 1,
    surahsOnPage: [{ number: 2, name: "البَقَرَة" }],
    ayahs: [
      { number: 8, numberInSurah: 1, text: "الٓمٓ", surahNumber: 2, surahName: "البَقَرَة", juz: 1, page: 2 },
      { number: 9, numberInSurah: 2, text: "ذَٰلِكَ ٱلْكِتَٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًۭى لِّلْمُتَّقِينَ", surahNumber: 2, surahName: "البَقَرَة", juz: 1, page: 2 },
      { number: 10, numberInSurah: 3, text: "ٱلَّذِينَ يُؤْمِنُونَ بِٱلْغَيْبِ وَيُقِيمُونَ ٱلصَّلَوٰةَ وَمِمَّا رَزَقْنَٰهُمْ يُنفِقُونَ", surahNumber: 2, surahName: "البَقَرَة", juz: 1, page: 2 },
      { number: 11, numberInSurah: 4, text: "وَٱلَّذِينَ يُؤْمِنُونَ بِمَآ أُنزِلَ إِلَيْكَ وَمَآ أُنزِلَ مِن قَبْلِكَ وَبِٱلْءَاخِرَةِ هُمْ يُوقِنُونَ", surahNumber: 2, surahName: "البَقَرَة", juz: 1, page: 2 },
      { number: 12, numberInSurah: 5, text: "أُو۟لَٰٓئِكَ عَلَىٰ هُدًۭى مِّن رَّبِّهِمْ ۖ وَأُو۟لَٰٓئِكَ هُمُ ٱلْمُفْلِحُونَ", surahNumber: 2, surahName: "البَقَرَة", juz: 1, page: 2 },
    ]
  }
};

export async function fetchQuranPage(pageNumber: number): Promise<QuranPageData> {
  if (pageCache[pageNumber]) {
    return pageCache[pageNumber];
  }

  try {
    const saved = localStorage.getItem(`quran_page_data_v2_${pageNumber}`);
    if (saved) {
      const parsed = JSON.parse(saved) as QuranPageData;
      if (parsed && parsed.ayahs && parsed.ayahs.length > 0) {
        pageCache[pageNumber] = parsed;
        return parsed;
      }
    }
  } catch {
    // continue
  }

  try {
    const res = await fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/quran-uthmani`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const json = await res.json();
    if (json.code === 200 && json.data && Array.isArray(json.data.ayahs)) {
      const surahsMap = new Map<number, string>();
      let detectedJuz = 1;

      const ayahs: PageAyah[] = json.data.ayahs.map((item: {
        number: number;
        numberInSurah: number;
        text: string;
        juz: number;
        page: number;
        surah: { number: number; name: string };
      }) => {
        surahsMap.set(item.surah.number, item.surah.name);
        if (item.juz) detectedJuz = item.juz;

        let clean = item.text.replace(/^\uFEFF/, '').trim();
        // In Al-Quran Cloud, if verse 1 of a surah (other than 1 and 9) is on this page, strip the prefixed Basmala
        if (item.numberInSurah === 1 && item.surah.number !== 1 && item.surah.number !== 9) {
          clean = stripPrefixBasmala(clean, item.surah.number);
        }

        return {
          number: item.number,
          numberInSurah: item.numberInSurah,
          text: clean,
          surahNumber: item.surah.number,
          surahName: item.surah.name,
          juz: item.juz,
          page: item.page,
        };
      });

      const surahsOnPage = Array.from(surahsMap.entries()).map(([number, name]) => ({ number, name }));
      const result: QuranPageData = {
        pageNumber,
        juzNumber: detectedJuz,
        surahsOnPage,
        ayahs,
      };

      pageCache[pageNumber] = result;
      try {
        localStorage.setItem(`quran_page_data_v2_${pageNumber}`, JSON.stringify(result));
      } catch {
        // storage safe
      }

      return result;
    }

    throw new Error('Invalid page data');
  } catch (err) {
    console.warn(`Failed to fetch page ${pageNumber}:`, err);
    throw err;
  }
}

// In-memory cache for ayah tafsir
const tafsirCache: Record<number, string> = {};

export async function fetchAyahTafsir(numberInQuran: number): Promise<string> {
  if (tafsirCache[numberInQuran]) {
    return tafsirCache[numberInQuran];
  }

  try {
    const saved = localStorage.getItem(`quran_ayah_tafsir_${numberInQuran}`);
    if (saved) {
      tafsirCache[numberInQuran] = saved;
      return saved;
    }
  } catch {
    // continue
  }

  try {
    const res = await fetch(`https://api.alquran.cloud/v1/ayah/${numberInQuran}/ar.muyassar`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    if (json.code === 200 && json.data && json.data.text) {
      const text = json.data.text.trim();
      tafsirCache[numberInQuran] = text;
      try {
        localStorage.setItem(`quran_ayah_tafsir_${numberInQuran}`, text);
      } catch {
        // safe
      }
      return text;
    }
  } catch (err) {
    console.warn('Failed to load ayah tafsir:', err);
  }

  return 'التفسير الميسر: التفسير غير متاح حالياً لهذا الموضع دون اتصال بالشبكة.';
}

export function preloadAdjacentPages(currentPage: number): void {
  if (currentPage > 1 && !pageCache[currentPage - 1]) {
    fetchQuranPage(currentPage - 1).catch(() => {});
  }
  if (currentPage < 604 && !pageCache[currentPage + 1]) {
    fetchQuranPage(currentPage + 1).catch(() => {});
  }
}

export function isSurahCachedOffline(surahNumber: number): boolean {
  if (surahCache[surahNumber] || BUNDLED_SURAHS[surahNumber]) {
    return true;
  }
  try {
    const saved = localStorage.getItem(`quran_surah_v2_${surahNumber}`);
    if (saved && saved.length > 20) return true;
  } catch {
    // safe
  }
  return false;
}

export function getCachedSurahNumbers(): Set<number> {
  const cached = new Set<number>();
  try {
    Object.keys(BUNDLED_SURAHS).forEach((num) => cached.add(Number(num)));
    Object.keys(surahCache).forEach((num) => cached.add(Number(num)));

    if (typeof window !== 'undefined') {
      const storage = window.localStorage;
      if (storage) {
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith('quran_surah_v2_')) {
            const surahNum = Number(key.replace('quran_surah_v2_', ''));
            if (!isNaN(surahNum)) {
              cached.add(surahNum);
            }
          }
        }
      }
    }
  } catch {
    // Safe fallback if localStorage is restricted or blocked in iframe
  }

  return cached;
}

