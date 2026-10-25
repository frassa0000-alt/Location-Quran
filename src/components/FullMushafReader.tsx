import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Bookmark,
  Check,
  Play,
  Pause,
  BookMarked,
  Layers,
  Sparkles,
  ShieldCheck,
  Search,
  BadgeCheck,
  ArrowDown,
} from 'lucide-react';
import { SURAHS_LIST, SurahMeta, BASMALA } from '../data/surahs';
import { fetchQuranPage, fetchAyahTafsir, preloadAdjacentPages, QuranPageData, PageAyah } from '../services/quranApi';
import { RECITERS, Reciter, getAyahAudioUrl } from '../data/reciters';

// 30 Ajza' start pages according to the standard Medina Mushaf (King Fahd Complex)
export const JUZ_LIST = [
  { juz: 1, name: 'الجزء الأول', startAyah: 'الم', startPage: 1 },
  { juz: 2, name: 'الجزء الثاني', startAyah: 'سَيَقُولُ السُّفَهَاءُ', startPage: 22 },
  { juz: 3, name: 'الجزء الثالث', startAyah: 'تِلْكَ الرُّسُلُ', startPage: 42 },
  { juz: 4, name: 'الجزء الرابع', startAyah: 'لَنْ تَنَالُوا الْبِرَّ', startPage: 62 },
  { juz: 5, name: 'الجزء الخامس', startAyah: 'وَالْمُحْصَنَاتُ', startPage: 82 },
  { juz: 6, name: 'الجزء السادس', startAyah: 'لَا يُحِبُّ اللَّهُ', startPage: 102 },
  { juz: 7, name: 'الجزء السابع', startAyah: 'وَإِذَا سَمِعُوا', startPage: 121 },
  { juz: 8, name: 'الجزء الثامن', startAyah: 'وَلَوْ أَنَّنَا نَزَّلْنَا', startPage: 142 },
  { juz: 9, name: 'الجزء التاسع', startAyah: 'قَالَ الْمَلَأُ', startPage: 162 },
  { juz: 10, name: 'الجزء العاشر', startAyah: 'وَاعْلَمُوا أَنَّمَا غَنِمْتُمْ', startPage: 182 },
  { juz: 11, name: 'الجزء الحادي عشر', startAyah: 'يَعْتَذِرُونَ إِلَيْكُمْ', startPage: 201 },
  { juz: 12, name: 'الجزء الثاني عشر', startAyah: 'وَمَا مِنْ دَابَّةٍ', startPage: 222 },
  { juz: 13, name: 'الجزء الثالث عشر', startAyah: 'وَمَا أُبَرِّئُ نَفْسِي', startPage: 242 },
  { juz: 14, name: 'الجزء الرابع عشر', startAyah: 'رُبَمَا يَوَدُّ', startPage: 262 },
  { juz: 15, name: 'الجزء الخامس عشر', startAyah: 'سُبْحَانَ الَّذِي أَسْرَىٰ', startPage: 282 },
  { juz: 16, name: 'الجزء السادس عشر', startAyah: 'قَالَ أَلَمْ أَقُلْ لَكَ', startPage: 302 },
  { juz: 17, name: 'الجزء السابع عشر', startAyah: 'اقْتَرَبَ لِلنَّاسِ حِسَابُهُمْ', startPage: 322 },
  { juz: 18, name: 'الجزء الثامن عشر', startAyah: 'قَدْ أَفْلَحَ الْمُؤْمِنُونَ', startPage: 342 },
  { juz: 19, name: 'الجزء التاسع عشر', startAyah: 'وَقَالَ الَّذِينَ لَا يَرْجُونَ', startPage: 362 },
  { juz: 20, name: 'الجزء العشرون', startAyah: 'أَمَّنْ خَلَقَ', startPage: 382 },
  { juz: 21, name: 'الجزء الحادي والعشرون', startAyah: 'اتْلُ مَا أُوحِيَ إِلَيْكَ', startPage: 402 },
  { juz: 22, name: 'الجزء الثاني والعشرون', startAyah: 'وَمَنْ يَقْنُتْ مِنْكُنَّ', startPage: 422 },
  { juz: 23, name: 'الجزء الثالث والعشرون', startAyah: 'وَمَا أَنْزَلْنَا عَلَىٰ قَوْمِهِ', startPage: 442 },
  { juz: 24, name: 'الجزء الرابع والعشرون', startAyah: 'فَمَنْ أَظْلَمُ مِمَّنْ كَذَبَ', startPage: 462 },
  { juz: 25, name: 'الجزء الخامس والعشرون', startAyah: 'إِلَيْهِ يُرَدُّ عِلْمُ السَّاعَةِ', startPage: 482 },
  { juz: 26, name: 'الجزء السادس والعشرون', startAyah: 'حم · تَنْزِيلُ الْكِتَابِ', startPage: 502 },
  { juz: 27, name: 'الجزء السابع والعشرون', startAyah: 'قَالَ فَمَا خَطْبُكُمْ', startPage: 522 },
  { juz: 28, name: 'الجزء الثامن والعشرون', startAyah: 'قَدْ سَمِعَ اللَّهُ', startPage: 542 },
  { juz: 29, name: 'الجزء التاسع والعشرون', startAyah: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ', startPage: 562 },
  { juz: 30, name: 'الجزء الثلاثون', startAyah: 'عَمَّ يَتَسَاءَلُونَ', startPage: 582 },
];

export interface FullMushafReaderProps {
  onNavigateSurahDetail?: (surahNumber: number) => void;
}

export const FullMushafReader: React.FC<FullMushafReaderProps> = ({ onNavigateSurahDetail }) => {
  // Current page (1 to 604)
  const [currentPage, setCurrentPage] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('mushaf_manual_current_page');
      const num = saved ? Number(saved) : 1;
      return num >= 1 && num <= 604 ? num : 1;
    } catch {
      return 1;
    }
  });

  // Zoom / Font size (px: default 30px, min 18px, max 54px)
  const [zoomSize, setZoomSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('mushaf_zoom_font_size');
      const num = saved ? Number(saved) : 30;
      return num >= 18 && num <= 54 ? num : 30;
    } catch {
      return 30;
    }
  });

  // Reading paper theme: 'emerald' | 'parchment' | 'dark'
  const [paperTheme, setPaperTheme] = useState<'emerald' | 'parchment' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('mushaf_paper_theme');
      return (saved as 'emerald' | 'parchment' | 'dark') || 'emerald';
    } catch {
      return 'emerald';
    }
  });

  // Bookmark / Last Read Page
  const [bookmarkPage, setBookmarkPage] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('mushaf_manual_bookmark_page');
      return saved ? Number(saved) : null;
    } catch {
      return null;
    }
  });
  const [bookmarkSuccess, setBookmarkSuccess] = useState(false);

  // Page data state
  const [pageData, setPageData] = useState<QuranPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Jump modals & dropdowns
  const [showSurahPicker, setShowSurahPicker] = useState(false);
  const [showJuzPicker, setShowJuzPicker] = useState(false);
  const [surahSearchQuery, setSurahSearchQuery] = useState('');
  const [directPageInput, setDirectPageInput] = useState('');

  // Tafsir modal
  const [selectedAyahForTafsir, setSelectedAyahForTafsir] = useState<PageAyah | null>(null);
  const [ayahTafsirText, setAyahTafsirText] = useState<string>('');
  const [loadingTafsir, setLoadingTafsir] = useState<boolean>(false);

  // Audio Playback for current Ayah
  const [selectedReciter] = useState<Reciter>(RECITERS[0]);
  const [playingAyahNumber, setPlayingAyahNumber] = useState<number | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Auto-scroll state (التمرير التلقائي البطيء - Slow Motion)
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(false);
  const [scrollSpeed, setScrollSpeed] = useState<'very-slow' | 'slow' | 'medium'>('slow');
  const autoScrollRafRef = useRef<number | null>(null);

  // Save current page
  useEffect(() => {
    try {
      localStorage.setItem('mushaf_manual_current_page', String(currentPage));
    } catch {
      // storage safe
    }
  }, [currentPage]);

  // Save zoom size
  useEffect(() => {
    try {
      localStorage.setItem('mushaf_zoom_font_size', String(zoomSize));
    } catch {
      // storage safe
    }
  }, [zoomSize]);

  // Save paper theme
  useEffect(() => {
    try {
      localStorage.setItem('mushaf_paper_theme', paperTheme);
    } catch {
      // storage safe
    }
  }, [paperTheme]);

  // Load page data & preload neighbors
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetchQuranPage(currentPage)
      .then((data) => {
        if (!mounted) return;
        setPageData(data);
        setLoading(false);
        // Preload adjacent pages for silky smooth manual page turning
        preloadAdjacentPages(currentPage);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('Error fetching page:', err);
        setError('تعذر تحميل صفحة المصحف حالياً. يرجى التحقق من الاتصال بالإنترنت.');
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [currentPage]);

  // Zoom handlers
  const handleZoomIn = () => {
    setZoomSize((prev) => Math.min(54, prev + 2));
  };

  const handleZoomOut = () => {
    setZoomSize((prev) => Math.max(18, prev - 2));
  };

  const handleZoomReset = () => {
    setZoomSize(30);
  };

  // Page turning handlers (RTL reading)
  const handleNextPage = useCallback(() => {
    if (currentPage < 604) {
      setCurrentPage((p) => p + 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  }, [currentPage]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  }, [currentPage]);

  // Smooth Slow-Motion Auto-Scroll Effect for Full Mushaf
  useEffect(() => {
    if (!isAutoScrolling) {
      if (autoScrollRafRef.current) {
        cancelAnimationFrame(autoScrollRafRef.current);
        autoScrollRafRef.current = null;
      }
      return;
    }

    const speedPxPerMs =
      scrollSpeed === 'very-slow' ? 0.022 : scrollSpeed === 'slow' ? 0.045 : 0.08;

    let accumulatedScroll = 0;
    let lastTime = performance.now();
    let hasTriggeredNextPage = false;

    const step = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      // Check if reached bottom of current page
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 15) {
        if (!hasTriggeredNextPage && currentPage < 604) {
          hasTriggeredNextPage = true;
          setTimeout(() => {
            handleNextPage();
          }, 2000);
        } else if (currentPage >= 604) {
          setIsAutoScrolling(false);
        }
        return;
      }

      accumulatedScroll += delta * speedPxPerMs;
      if (accumulatedScroll >= 1) {
        const toScroll = Math.floor(accumulatedScroll);
        accumulatedScroll -= toScroll;
        window.scrollBy({ top: toScroll, behavior: 'auto' });
      }

      autoScrollRafRef.current = requestAnimationFrame(step);
    };

    lastTime = performance.now();
    autoScrollRafRef.current = requestAnimationFrame(step);

    return () => {
      if (autoScrollRafRef.current) {
        cancelAnimationFrame(autoScrollRafRef.current);
        autoScrollRafRef.current = null;
      }
    };
  }, [isAutoScrolling, scrollSpeed, currentPage, handleNextPage]);

  // Keyboard navigation (Left = Next, Right = Prev, + = Zoom In, - = Zoom Out)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in input, skip
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        handleNextPage();
      } else if (e.key === 'ArrowRight') {
        handlePrevPage();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleZoomReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextPage, handlePrevPage]);

  // Bookmark current page
  const handleSaveBookmark = () => {
    setBookmarkPage(currentPage);
    try {
      localStorage.setItem('mushaf_manual_bookmark_page', String(currentPage));
    } catch {
      // ignore
    }
    setBookmarkSuccess(true);
    setTimeout(() => setBookmarkSuccess(false), 2200);
  };

  // Jump to page from input
  const handleDirectJump = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(directPageInput.trim());
    if (num >= 1 && num <= 604) {
      setCurrentPage(num);
      setDirectPageInput('');
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  // Open Tafsir for Ayah
  const handleOpenTafsir = async (ayah: PageAyah) => {
    setSelectedAyahForTafsir(ayah);
    setLoadingTafsir(true);
    try {
      const text = await fetchAyahTafsir(ayah.number);
      setAyahTafsirText(text);
    } catch {
      setAyahTafsirText('التفسير غير متاح حالياً.');
    } finally {
      setLoadingTafsir(false);
    }
  };

  // Play Ayah Audio
  const handlePlayAyahAudio = (ayah: PageAyah) => {
    if (playingAyahNumber === ayah.number && audioElement) {
      audioElement.pause();
      setPlayingAyahNumber(null);
      return;
    }

    if (audioElement) {
      audioElement.pause();
    }

    const url = getAyahAudioUrl(selectedReciter, ayah.surahNumber, ayah.numberInSurah);
    const audio = new Audio(url);
    setAudioElement(audio);
    setPlayingAyahNumber(ayah.number);

    audio.play().catch((err) => {
      console.warn('Playback error:', err);
      setPlayingAyahNumber(null);
    });

    audio.onended = () => {
      setPlayingAyahNumber(null);
    };
  };

  // Filtered Surahs for quick jump
  const filteredSurahs = useMemo(() => {
    if (!surahSearchQuery.trim()) return SURAHS_LIST;
    const q = surahSearchQuery.trim().toLowerCase();
    return SURAHS_LIST.filter(
      (s) =>
        s.name.includes(q) ||
        s.name.replace(/[ًٌٍَُِّْ]/g, '').includes(q.replace(/[ًٌٍَُِّْ]/g, '')) ||
        String(s.number) === q
    );
  }, [surahSearchQuery]);

  // Current page metadata: Surah names and Juz
  const pageSurahInfo = useMemo(() => {
    if (!pageData || !pageData.surahsOnPage.length) {
      const fallbackSurah = SURAHS_LIST.slice().reverse().find((s) => s.page <= currentPage) || SURAHS_LIST[0];
      return {
        surahNames: fallbackSurah.name,
        juzNumber: fallbackSurah.juz,
      };
    }
    const names = pageData.surahsOnPage.map((s) => s.name).join(' · ');
    return {
      surahNames: names,
      juzNumber: pageData.juzNumber,
    };
  }, [pageData, currentPage]);

  // Calculate zoom percentage (baseline 30px = 100%)
  const zoomPercentage = Math.round((zoomSize / 30) * 100);

  // Theme-specific styles for the Mushaf page container
  const getPageContainerStyle = () => {
    if (paperTheme === 'parchment') {
      return 'bg-[#FBF8EF] text-[#1E1911] border-[#C8B896] shadow-2xl';
    }
    if (paperTheme === 'dark') {
      return 'bg-[#090F0D] text-[#EFEAE2] border-[#20362D] shadow-2xl';
    }
    // Emerald Night
    return 'bg-[#0E1E18] text-[#F3EFE6] border-[#24483B] shadow-2xl';
  };

  const getPageInnerBorder = () => {
    if (paperTheme === 'parchment') {
      return 'border-[#D9CBA9] bg-[#FAF5E6]/40';
    }
    if (paperTheme === 'dark') {
      return 'border-[#223B31] bg-[#0C1512]/60';
    }
    return 'border-[#285343] bg-[#122820]/60';
  };

  const getHeaderTextColor = () => {
    if (paperTheme === 'parchment') {
      return 'text-[#8A6D3B]';
    }
    return 'text-amber-400';
  };

  // Group ayahs by surah start on page to show ornate Surah headers
  const ayahsWithHeadings = useMemo(() => {
    if (!pageData || !pageData.ayahs) return [];
    return pageData.ayahs;
  }, [pageData]);

  // Khatmah progress percentage
  const khatmahProgress = ((currentPage / 604) * 100).toFixed(1);

  return (
    <div className="space-y-6 pb-20 font-cairo" dir="rtl">
      {/* Editorial Header Banner with iOS Liquid Glass */}
      <div className="relative overflow-hidden rounded-3xl ios-liquid-glass text-[#EAEFEA] p-5 sm:p-7 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ios-glass-pill text-amber-300">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                المصحف الشريف كاملاً (٦٠٤ صفحة)
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                رسم مجمع الملك فهد
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-amber-200 tracking-wide">
              القرآن الكريم
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              تصفح المصحف الشريف صفحة بصفحة برسم مجمع الملك فهد، مع خاصية التكبير والتصغير والتقليب اليدوي.
            </p>
          </div>

          {/* Quick Bookmark / Last Read Button */}
          <div className="flex items-center gap-2 shrink-0">
            {bookmarkPage && (
              <button
                onClick={() => {
                  setCurrentPage(bookmarkPage);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold ios-glass-pill text-amber-300 hover:text-white transition-all shadow-sm"
                title="الذهاب إلى علامة القراءة المحفوظة"
              >
                <BookMarked className="w-4 h-4 text-amber-400" />
                <span>الفاصل: ص {bookmarkPage}</span>
              </button>
            )}

            <button
              onClick={handleSaveBookmark}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-md ${
                bookmarkSuccess
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-extrabold border border-white/30'
              }`}
              title="حفظ الصفحة الحالية كعلامة قراءة"
            >
              {bookmarkSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>تم حفظ الفاصل!</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 fill-current" />
                  <span>وضع فاصل القراءة</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Primary Sticky Control Bar: Navigation, Zoom, Jump, Theme, Auto-scroll & Speed */}
      <div className="sticky top-16 z-30 ios-liquid-glass-dock rounded-3xl p-3 shadow-2xl flex flex-col gap-2.5 max-w-full overflow-hidden text-right">
        {/* Tier 1: Page Navigation & Direct Jump Pickers (السابق، الصفحة، التالي، السورة، الجزء) */}
        <div className="flex flex-wrap items-center justify-between gap-2 w-full">
          {/* Navigation: Prev / Page / Next */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl ios-glass-pill text-amber-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors text-xs font-medium"
              title="الصفحة السابقة (سهم يمين)"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              <span>السابق</span>
            </button>

            <div className="flex items-center gap-1 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-[11px] font-bold text-[#EAEFEA]">صفحة</span>
              <span className="text-xs font-mono font-bold text-amber-300 tabular-nums">
                {currentPage}
              </span>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xs font-mono text-slate-400 tabular-nums">٦٠٤</span>
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= 604}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl ios-glass-pill text-amber-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors text-xs font-medium"
              title="الصفحة التالية (سهم يسار)"
            >
              <span>التالي</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Jump Buttons: Surah and Juz */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowSurahPicker(true)}
              className="px-3 py-1.5 rounded-xl ios-glass-pill text-amber-200 hover:text-white text-xs font-semibold transition-colors"
              title="الانتقال إلى سورة محددة"
            >
              السورة ▾
            </button>
            <button
              onClick={() => setShowJuzPicker(true)}
              className="px-3 py-1.5 rounded-xl ios-glass-pill text-amber-200 hover:text-white text-xs font-semibold transition-colors"
              title="الانتقال إلى جزء محدد"
            >
              الجزء ▾
            </button>
          </div>
        </div>

        {/* Tier 2: Reading Tools (Zoom, Theme Switcher, Auto-Scroll & Speed) - محكمة تماماً على قد القائمة */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1C382E]/70 w-full">
          {/* Zoom In & Out */}
          <div className="flex items-center gap-1 bg-[#0B1713] p-1 rounded-xl border border-[#1E3A30]">
            <button
              onClick={handleZoomOut}
              disabled={zoomSize <= 18}
              className="p-1 rounded-lg bg-[#142B23] hover:bg-[#1C3D32] text-amber-300 disabled:opacity-40 disabled:pointer-events-none transition-colors border border-[#22483C]"
              title="تصغير خط المصحف"
              aria-label="تصغير خط المصحف"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <div className="px-1.5 py-0.5 text-center min-w-[2.8rem]" title="حجم الخط الحالي">
              <span className="text-[11px] font-mono font-bold text-amber-200 block leading-tight">
                {zoomPercentage}%
              </span>
            </div>
            <button
              onClick={handleZoomIn}
              disabled={zoomSize >= 54}
              className="p-1 rounded-lg bg-[#142B23] hover:bg-[#1C3D32] text-amber-300 disabled:opacity-40 disabled:pointer-events-none transition-colors border border-[#22483C]"
              title="تكبير خط المصحف"
              aria-label="تكبير خط المصحف"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomReset}
              className="p-1 rounded-lg bg-[#142B23] hover:bg-[#1C3D32] text-[#8FA89E] hover:text-amber-300 transition-colors border border-[#22483C]"
              title="إعادة ضبط الحجم"
              aria-label="إعادة ضبط الحجم"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Paper Theme Switcher */}
          <div className="flex items-center gap-1 bg-[#0B1713] p-1 rounded-xl border border-[#1E3A30]">
            <button
              onClick={() => setPaperTheme('emerald')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                paperTheme === 'emerald'
                  ? 'bg-emerald-800 text-amber-300 ring-1 ring-amber-400'
                  : 'bg-emerald-950/60 text-stone-400'
              }`}
              title="خلفية ليلية زمردية"
            >
              زمرد
            </button>
            <button
              onClick={() => setPaperTheme('parchment')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                paperTheme === 'parchment'
                  ? 'bg-[#FAF5E6] text-stone-900 ring-1 ring-amber-600'
                  : 'bg-[#E5DAC0]/40 text-stone-300'
              }`}
              title="ورق المصحف الأصيل (أبيض دافئ)"
            >
              ورق
            </button>
            <button
              onClick={() => setPaperTheme('dark')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                paperTheme === 'dark'
                  ? 'bg-stone-900 text-amber-300 ring-1 ring-amber-400'
                  : 'bg-black/60 text-stone-400'
              }`}
              title="خلفية ليلية داكنة"
            >
              داكن
            </button>
          </div>

          {/* Auto-Scroll & Speed Controls (التبطيء والتسريع مضبوط تماماً على قد القائمة ولا يخرج بره الشاشة) */}
          <div className="inline-flex items-center gap-1 bg-[#0B1713] p-1 rounded-xl border border-[#1E3A30] max-w-full">
            <button
              onClick={() => setIsAutoScrolling((prev) => !prev)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                isAutoScrolling
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                  : 'bg-[#142B23] hover:bg-[#1C3D32] text-amber-300'
              }`}
              title="تمرير المصحف الشريف تلقائياً"
            >
              {isAutoScrolling ? (
                <>
                  <Pause className="w-2.5 h-2.5 fill-current" />
                  <span>إيقاف</span>
                </>
              ) : (
                <>
                  <ArrowDown className="w-2.5 h-2.5 text-amber-400" />
                  <span>تمرير</span>
                </>
              )}
            </button>

            {/* أزرار السرعة (تبطيء وتسريع) مصغرة ومحكمة على قد القائمة */}
            <div className="flex items-center gap-0.5 bg-[#142B23] p-0.5 rounded-lg border border-[#22483C]">
              <button
                onClick={() => setScrollSpeed('very-slow')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  scrollSpeed === 'very-slow'
                    ? 'bg-amber-400 text-stone-950 font-bold'
                    : 'text-[#8FA89E] hover:text-amber-200'
                }`}
                title="أبطأ سرعة (تبطيء)"
              >
                أبطأ
              </button>
              <button
                onClick={() => setScrollSpeed('slow')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  scrollSpeed === 'slow'
                    ? 'bg-amber-400 text-stone-950 font-bold'
                    : 'text-[#8FA89E] hover:text-amber-200'
                }`}
                title="سرعة عادية"
              >
                عادي
              </button>
              <button
                onClick={() => setScrollSpeed('medium')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  scrollSpeed === 'medium'
                    ? 'bg-amber-400 text-stone-950 font-bold'
                    : 'text-[#8FA89E] hover:text-amber-200'
                }`}
                title="أسرع (تسريع)"
              >
                أسرع
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Page Slider for fast manual scrubbing across 604 pages */}
      <div className="bg-[#0D1B16] p-3 rounded-xl border border-[#1C362F] flex items-center gap-3">
        <span className="text-xs font-bold text-amber-300 shrink-0">
          تصفح سريع:
        </span>
        <input
          type="range"
          min={1}
          max={604}
          value={currentPage}
          onChange={(e) => setCurrentPage(Number(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer h-2 bg-[#173128] rounded-lg"
          aria-label="شريط تصفح صفحات المصحف"
        />
        <form onSubmit={handleDirectJump} className="flex items-center gap-1 shrink-0">
          <input
            type="number"
            min={1}
            max={604}
            placeholder="صفحة"
            value={directPageInput}
            onChange={(e) => setDirectPageInput(e.target.value)}
            className="w-16 px-2 py-1 text-xs text-center rounded-lg bg-[#142A22] border border-[#254D3F] text-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
          />
          <button
            type="submit"
            className="px-2 py-1 text-xs font-bold bg-[#1C3A30] hover:bg-[#244C3F] text-amber-300 rounded-lg border border-[#2B5747]"
          >
            ذهاب
          </button>
        </form>
      </div>

      {/* Main Mushaf Page Display with Authentic Islamic Ornamental Frame */}
      <div className="relative">
        {/* Floating Side Page Turn Buttons for effortless reading */}
        <button
          onClick={handlePrevPage}
          disabled={currentPage <= 1}
          className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-14 rounded-2xl bg-[#10231D]/90 backdrop-blur-md border border-amber-500/40 text-amber-300 items-center justify-center shadow-2xl hover:bg-amber-500 hover:text-stone-950 transition-all disabled:opacity-20 disabled:pointer-events-none group"
          title="الصفحة السابقة (سهم يمين)"
          aria-label="الصفحة السابقة"
        >
          <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>

        <button
          onClick={handleNextPage}
          disabled={currentPage >= 604}
          className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-14 rounded-2xl bg-[#10231D]/90 backdrop-blur-md border border-amber-500/40 text-amber-300 items-center justify-center shadow-2xl hover:bg-amber-500 hover:text-stone-950 transition-all disabled:opacity-20 disabled:pointer-events-none group"
          title="الصفحة التالية (سهم يسار)"
          aria-label="الصفحة التالية"
        >
          <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-28 text-center space-y-4 bg-[#0E1E18] rounded-3xl border border-[#214336]">
            <div className="inline-block w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-amber-200 font-medium">
              جاري فتح صفحة {currentPage} من المصحف الشريف...
            </p>
          </div>
        ) : error ? (
          <div className="py-16 px-6 bg-[#261616] border border-[#502323] rounded-3xl text-center space-y-3">
            <p className="text-sm text-red-300">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                fetchQuranPage(currentPage).then(setPageData).finally(() => setLoading(false));
              }}
              className="px-5 py-2 text-xs font-bold bg-red-800 hover:bg-red-700 text-stone-100 rounded-xl transition-colors border border-red-600/50"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        ) : (
          /* PHYSICAL MUSHAF PAGE - Handcrafted King Fahd Complex Typography */
          <div
            className={`relative mx-auto rounded-3xl p-5 sm:p-10 md:p-14 border-2 transition-all duration-300 ${getPageContainerStyle()}`}
            style={{ maxWidth: '960px' }}
          >
            {/* Outer Islamic Double Border Frame */}
            <div
              className={`p-4 sm:p-7 md:p-9 rounded-2xl border-2 relative ${getPageInnerBorder()}`}
            >
              {/* Corner Arabesque Motifs */}
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-500/60 pointer-events-none" />
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-500/60 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-500/60 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-500/60 pointer-events-none" />

              {/* TOP HEADER: Surah Name (Right), Medina Mushaf Logo (Center), Juz Number (Left) */}
              <div
                className={`flex items-center justify-between pb-4 mb-6 border-b border-amber-500/30 text-xs font-bold ${getHeaderTextColor()}`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-amiri text-base sm:text-lg font-bold">
                    سورة {pageSurahInfo.surahNames}
                  </span>
                </div>

                <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-amiri font-bold">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>مُصْحَفُ المَدِينَةِ النَّبَوِيَّةِ الشَّرِيف</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-amiri text-base sm:text-lg font-bold">
                    الجزء {pageSurahInfo.juzNumber}
                  </span>
                </div>
              </div>

              {/* QURANIC PAGE TEXT CONTENT */}
              <div className="space-y-6">
                {/* For each Ayah on the page: check if it begins a Surah */}
                {ayahsWithHeadings.map((ayah, index) => {
                  const isFirstAyahOfSurah = ayah.numberInSurah === 1;
                  const surahMeta = SURAHS_LIST.find((s) => s.number === ayah.surahNumber);

                  return (
                    <React.Fragment key={ayah.number}>
                      {/* If Verse 1 of any Surah: render ornate Golden Surah Header & Basmala */}
                      {isFirstAyahOfSurah && (
                        <div className="my-6 text-center space-y-4">
                          {/* Ornate Surah Opening Banner Cartouche */}
                          <div className="relative overflow-hidden py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-600/20 via-amber-500/30 to-amber-600/20 border-2 border-amber-500/60 shadow-md">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-amber-300">
                                {surahMeta?.revelationType === 'Meccan' ? 'مَكِّيَّة' : 'مَدَنِيَّة'}
                              </span>
                              <h2 className="font-amiri text-2xl sm:text-3xl font-extrabold text-amber-200 tracking-wide">
                                ﴿ سُورَةُ {surahMeta?.name || ayah.surahName} ﴾
                              </h2>
                              <span className="text-xs font-bold text-amber-300">
                                آيَاتُهَا {surahMeta?.ayahCount}
                              </span>
                            </div>
                          </div>

                          {/* Basmala Banner (except Surah 9 At-Tawbah and Surah 1 Al-Fatihah where verse 1 is already Basmala) */}
                          {ayah.surahNumber !== 9 && ayah.surahNumber !== 1 && (
                            <div className="py-2">
                              <p
                                className="font-quran text-2xl sm:text-3xl text-amber-200 font-bold select-text"
                                style={{
                                  fontSize: `${Math.round(zoomSize * 1.08)}px`,
                                  lineHeight: '2.6',
                                  wordSpacing: '0.24em',
                                }}
                              >
                                {BASMALA}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* Continuous Justified Mushaf Ayahs with traditional verse markers */}
                <div
                  className="font-quran text-justify leading-loose select-text transition-all"
                  style={{
                    fontSize: `${zoomSize}px`,
                    lineHeight: '3.15',
                    wordSpacing: '0.22em',
                  }}
                  dir="rtl"
                >
                  {pageData?.ayahs?.map((ayah) => {
                    const isPlaying = playingAyahNumber === ayah.number;
                    return (
                      <span
                        key={ayah.number}
                        id={`ayah-page-${ayah.number}`}
                        onClick={() => handleOpenTafsir(ayah)}
                        className={`cursor-pointer transition-colors px-1 py-0.5 rounded-md inline group relative ${
                          isPlaying
                            ? 'bg-amber-500/30 ring-2 ring-amber-400 font-bold'
                            : 'hover:bg-amber-500/15'
                        }`}
                        title={`انقر لعرض تفسير الآية ${ayah.numberInSurah} من سورة ${ayah.surahName}`}
                      >
                        {ayah.text}

                        {/* Traditional Islamic Ayah Marker ۝ with gold verse number inside */}
                        <span
                          className="inline-flex items-center justify-center min-w-[2.2rem] h-8 px-2 mx-1.5 rounded-full border-2 border-amber-500/80 bg-amber-950/60 text-amber-300 font-mono text-xs tabular-nums select-none align-middle font-bold shadow-xs ring-1 ring-amber-400/20 group-hover:scale-105 transition-transform"
                          aria-label={`الآية ${ayah.numberInSurah}`}
                        >
                          {ayah.numberInSurah}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* BOTTOM PAGE FOOTER: Page Number centered */}
              <div className="pt-6 mt-8 border-t border-amber-500/30 flex items-center justify-between text-xs font-bold text-amber-400">
                <span className="text-[11px] text-[#8FA89E]">
                  الجزء {pageSurahInfo.juzNumber}
                </span>

                <div className="flex items-center gap-2">
                  <span className="font-amiri text-lg font-bold text-amber-300">
                    — {currentPage} —
                  </span>
                </div>

                <span className="text-[11px] text-[#8FA89E]">
                  ختمة {khatmahProgress}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Manual Page Turn & Quick Actions */}
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1C362F]">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#142B23] hover:bg-[#1C3D32] text-amber-300 text-xs sm:text-sm font-medium border border-[#22483C] disabled:opacity-30 disabled:pointer-events-none transition-all shadow-md"
          >
            <ChevronRight className="w-4 h-4" />
            <span>الصفحة السابقة</span>
          </button>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= 604}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#142B23] hover:bg-[#1C3D32] text-amber-300 text-xs sm:text-sm font-medium border border-[#22483C] disabled:opacity-30 disabled:pointer-events-none transition-all shadow-md"
          >
            <span className="text-xs sm:text-sm">الصفحة التالية</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Zoom Actions directly in bottom bar */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#8FA89E]">حجم الخط:</span>
          <button
            onClick={handleZoomOut}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#142B23] hover:bg-[#1C3D32] text-amber-300 border border-[#22483C] transition-colors"
            title="تصغير (-)"
          >
            <ZoomOut className="w-3 h-3" />
            <span className="text-[10px] sm:text-[11px] font-normal">تصغير</span>
          </button>
          <span className="text-[11px] font-mono font-bold text-amber-200">
            {zoomSize}px
          </span>
          <button
            onClick={handleZoomIn}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#142B23] hover:bg-[#1C3D32] text-amber-300 border border-[#22483C] transition-colors"
            title="تكبير (+)"
          >
            <ZoomIn className="w-3 h-3" />
            <span className="text-[10px] sm:text-[11px] font-normal">تكبير</span>
          </button>
          <button
            onClick={handleZoomReset}
            className="px-1.5 py-1 rounded-lg bg-[#142B23] hover:bg-[#1C3D32] text-[#8FA89E] hover:text-amber-200 text-[10px] border border-[#22483C] transition-colors"
            title="إعادة ضبط (١٠٠٪)"
          >
            ١٠٠٪
          </button>
        </div>
      </div>

      {/* Surah Picker Modal */}
      {showSurahPicker && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowSurahPicker(false)}
        >
          <div
            className="bg-[#101E1A] max-w-xl w-full rounded-2xl p-6 shadow-2xl border border-[#24483B] text-right space-y-4 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#1C362F]">
              <h3 className="font-amiri text-xl font-bold text-amber-200 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>الانتقال السريع إلى سورة (١١٤ سورة)</span>
              </h3>
              <button
                onClick={() => setShowSurahPicker(false)}
                className="text-[#8FA89E] hover:text-amber-200 text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            {/* Search Surah */}
            <div className="relative">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A988E]" />
              <input
                type="text"
                placeholder="ابحث باسم السورة أو رقمها..."
                value={surahSearchQuery}
                onChange={(e) => setSurahSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 text-xs rounded-xl bg-[#0B1512] border border-[#1F3D32] text-[#EAEFEA] focus:outline-none focus:ring-2 focus:ring-amber-500/60"
              />
            </div>

            {/* Surah List Grid */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {filteredSurahs.map((surah) => (
                <button
                  key={surah.number}
                  onClick={() => {
                    setCurrentPage(surah.page);
                    setShowSurahPicker(false);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#162D24] text-right transition-colors border border-transparent hover:border-[#275040]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-mono font-bold flex items-center justify-center border border-amber-500/40">
                      {surah.number}
                    </span>
                    <div>
                      <span className="font-amiri text-base font-bold text-amber-100 block">
                        سورة {surah.name}
                      </span>
                      <span className="text-[10px] text-[#7A988E]">
                        {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} · {surah.ayahCount} آية
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#0C1713] text-amber-300 border border-[#1E3A30]">
                    صفحة {surah.page}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Juz Picker Modal */}
      {showJuzPicker && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowJuzPicker(false)}
        >
          <div
            className="bg-[#101E1A] max-w-xl w-full rounded-2xl p-6 shadow-2xl border border-[#24483B] text-right space-y-4 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#1C362F]">
              <h3 className="font-amiri text-xl font-bold text-amber-200 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>الانتقال إلى أحد أجزاء القرآن الثلاثين</span>
              </h3>
              <button
                onClick={() => setShowJuzPicker(false)}
                className="text-[#8FA89E] hover:text-amber-200 text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            {/* Juz Grid */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {JUZ_LIST.map((item) => (
                <button
                  key={item.juz}
                  onClick={() => {
                    setCurrentPage(item.startPage);
                    setShowJuzPicker(false);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#162D24] text-right transition-colors border border-transparent hover:border-[#275040]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-mono font-bold flex items-center justify-center border border-amber-500/40">
                      {item.juz}
                    </span>
                    <div>
                      <span className="font-amiri text-base font-bold text-amber-100 block">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-[#7A988E]">
                        بداية الجزء: ﴿{item.startAyah}﴾
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#0C1713] text-amber-300 border border-[#1E3A30]">
                    صفحة {item.startPage}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tafsir & Audio Recitation Modal for Selected Ayah */}
      {selectedAyahForTafsir && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedAyahForTafsir(null)}
        >
          <div
            className="bg-[#101E1A] max-w-2xl w-full rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#24483B] text-right space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1C362F]">
              <h3 className="font-amiri text-xl font-bold text-amber-200">
                سورة {selectedAyahForTafsir.surahName} [
                <span className="text-amber-400 font-bold">الآية {selectedAyahForTafsir.numberInSurah}</span>
                ]
              </h3>
              <button
                onClick={() => setSelectedAyahForTafsir(null)}
                className="text-[#8FA89E] hover:text-amber-200 text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            {/* Ayah Sacred Text */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#091511] border border-amber-500/35 shadow-md">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-500/20">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  النص القرآني الكريم
                </span>
                <span className="text-xs text-amber-300 font-mono font-bold bg-amber-950/70 px-2 py-0.5 rounded border border-amber-500/40">
                  الآية {selectedAyahForTafsir.numberInSurah}
                </span>
              </div>
              <p
                className="font-quran text-xl sm:text-2xl text-amber-100 font-bold text-right py-2 select-text"
                style={{ lineHeight: '2.8', wordSpacing: '0.22em' }}
              >
                ﴿{selectedAyahForTafsir.text}﴾
              </p>
            </div>

            {/* Tafsir Al-Muyassar */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1 border-b border-[#1A332B]">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    التفسير الميسر:
                  </span>
                  <span className="text-[11px] text-[#86A699]">
                    المصدر: مجمع الملك فهد لطباعة المصحف الشريف
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-950/80 border border-blue-500/40 text-blue-400 text-[10px] font-bold">
                  <BadgeCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>توثيق معتمد</span>
                </span>
              </div>

              {loadingTafsir ? (
                <div className="py-8 text-center">
                  <div className="inline-block w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-[#8FA89E] mt-2">جاري جلب التفسير الميسر...</p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-[#0B1713] border border-[#1E3A30] text-[#DCEAE3] leading-relaxed text-xs sm:text-sm font-cairo">
                  {ayahTafsirText}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-[#1C362F] flex items-center justify-between">
              {/* Ayah Recitation */}
              <button
                onClick={() => handlePlayAyahAudio(selectedAyahForTafsir)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl transition-colors shadow-xs"
              >
                {playingAyahNumber === selectedAyahForTafsir.number ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>إيقاف التلاوة</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>استماع للآية</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedAyahForTafsir(null)}
                className="px-4 py-2 text-xs font-semibold bg-[#1D3B31] hover:bg-[#254C3F] text-amber-200 rounded-xl transition-colors border border-[#2E5548]"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Auto-Scroll Controls (شريط تحكم مصغر وبسيط جداً بالتمرير التلقائي) */}
      {isAutoScrolling && (
        <div
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-[#0C1A16]/95 backdrop-blur-md border border-amber-500/30 rounded-full px-2 py-0.5 shadow-lg flex items-center gap-1.5 text-[10px] font-cairo text-[#EAEFEA] select-none max-w-[calc(100vw-2rem)] overflow-hidden"
          dir="rtl"
        >
          {/* Status Indicator */}
          <div className="flex items-center gap-1 pl-1 border-l border-[#224438]/70 shrink-0">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span className="text-[9px] font-bold text-amber-300">تمرير</span>
          </div>

          {/* Speed Selector (تبطيء وتسريع مصغر) */}
          <div className="flex items-center bg-[#142A23] p-0.5 rounded-full border border-[#23483B]/60 shrink-0">
            <button
              onClick={() => setScrollSpeed('very-slow')}
              className={`px-1.5 py-0.5 rounded-full text-[9px] transition-colors ${
                scrollSpeed === 'very-slow'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                  : 'text-[#8FA89E] hover:text-amber-200'
              }`}
              title="أبطأ"
            >
              أبطأ
            </button>
            <button
              onClick={() => setScrollSpeed('slow')}
              className={`px-1.5 py-0.5 rounded-full text-[9px] transition-colors ${
                scrollSpeed === 'slow'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                  : 'text-[#8FA89E] hover:text-amber-200'
              }`}
              title="عادي"
            >
              عادي
            </button>
            <button
              onClick={() => setScrollSpeed('medium')}
              className={`px-1.5 py-0.5 rounded-full text-[9px] transition-colors ${
                scrollSpeed === 'medium'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                  : 'text-[#8FA89E] hover:text-amber-200'
              }`}
              title="أسرع"
            >
              أسرع
            </button>
          </div>

          {/* Pause Button */}
          <button
            onClick={() => setIsAutoScrolling(false)}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[9px] transition-all shadow-xs shrink-0"
            title="إيقاف مؤقت للتمرير"
          >
            <Pause className="w-2 h-2 fill-current" />
            <span>إيقاف</span>
          </button>

          {/* Close */}
          <button
            onClick={() => setIsAutoScrolling(false)}
            className="text-[#8FA89E] hover:text-rose-300 transition-colors p-0.5 text-[10px] font-bold leading-none shrink-0"
            title="إغلاق الشريط"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
