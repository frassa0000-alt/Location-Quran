import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Bookmark,
  Copy,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Volume2,
  Check,
  BadgeCheck,
  ArrowDownCircle,
  ArrowDown,
  Settings,
  X,
  Sliders,
  Search,
  Repeat,
  Layers,
  Languages,
  Globe,
} from 'lucide-react';
import { SURAHS_LIST, SurahMeta, Ayah, BASMALA } from '../data/surahs';
import { RECITERS, Reciter, getSurahAudioUrl, getAyahAudioUrl } from '../data/reciters';
import { QURAN_TRANSLATIONS, QuranTranslationEdition, getTranslationEdition } from '../data/translations';
import { fetchSurahVerses, fetchSurahTranslation } from '../services/quranApi';

interface QuranReaderProps {
  surahNumber: number;
  initialAyah?: number;
  onNavigateSurah: (number: number) => void;
  fontSize: number;
  setFontSize?: (size: number | ((prev: number) => number)) => void;
  fontFamily: 'amiri' | 'scheherazade' | 'cairo';
  onSaveBookmark: (surahNumber: number, ayahNumber: number, surahName: string) => void;
  currentBookmark?: { surahNumber: number; ayahNumber: number } | null;
  defaultReciterId?: string;
  playbackSpeedDefault?: number;
  autoAdvanceAyah?: boolean;
  ayahRepeatCount?: number;
  textToneColor?: string;
  goldToneColor?: string;
  showTafsirUnderAyah?: boolean;
  initialTranslationEdition?: string;
  onUpdateTranslationEdition?: (editionId: string) => void;
}

export const QuranReader: React.FC<QuranReaderProps> = ({
  surahNumber,
  initialAyah = 1,
  onNavigateSurah,
  fontSize,
  setFontSize,
  fontFamily,
  onSaveBookmark,
  currentBookmark,
  defaultReciterId,
  playbackSpeedDefault,
  autoAdvanceAyah = true,
  ayahRepeatCount = 1,
  textToneColor = '#F5EFE6',
  goldToneColor = '#F59E0B',
  showTafsirUnderAyah = true,
  initialTranslationEdition,
  onUpdateTranslationEdition,
}) => {
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reader Mode: 'verses' (verse by verse cards) or 'mushaf' (continuous text)
  const [readerMode, setReaderMode] = useState<'verses' | 'mushaf'>('verses');

  // Selected Verse for Tafsir modal
  const [selectedAyahForTafsir, setSelectedAyahForTafsir] = useState<Ayah | null>(null);

  // Translation of Quran Meanings state
  const [translationEdition, setTranslationEdition] = useState<string>(() => {
    if (initialTranslationEdition) return initialTranslationEdition;
    try {
      return localStorage.getItem('quran_reader_translation_edition') || 'none';
    } catch {
      return 'none';
    }
  });

  // Sync if prop changes externally
  useEffect(() => {
    if (initialTranslationEdition !== undefined && initialTranslationEdition !== translationEdition) {
      setTranslationEdition(initialTranslationEdition);
    }
  }, [initialTranslationEdition]);

  const [translationTexts, setTranslationTexts] = useState<Record<number, string>>({});
  const [isTranslationLoading, setIsTranslationLoading] = useState<boolean>(false);
  const [isTranslationMenuOpen, setIsTranslationMenuOpen] = useState<boolean>(false);
  const translationMenuRef = useRef<HTMLDivElement | null>(null);

  // Close translation menu on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        isTranslationMenuOpen &&
        translationMenuRef.current &&
        !translationMenuRef.current.contains(event.target as Node)
      ) {
        setIsTranslationMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isTranslationMenuOpen]);

  // Fetch translation texts when surah or edition changes
  useEffect(() => {
    if (!translationEdition || translationEdition === 'none') {
      setTranslationTexts({});
      setIsTranslationLoading(false);
      return;
    }

    let active = true;
    setIsTranslationLoading(true);

    fetchSurahTranslation(surahNumber, translationEdition)
      .then((res) => {
        if (active) {
          setTranslationTexts(res);
          setIsTranslationLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Error fetching translation:', err);
        if (active) {
          setIsTranslationLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [surahNumber, translationEdition]);

  const handleSelectTranslation = (editionId: string) => {
    setTranslationEdition(editionId);
    setIsTranslationMenuOpen(false);
    try {
      localStorage.setItem('quran_reader_translation_edition', editionId);
    } catch {
      // quota safe
    }
    if (onUpdateTranslationEdition) {
      onUpdateTranslationEdition(editionId);
    }
  };

  const currentTranslationEdition = useMemo(() => {
    return getTranslationEdition(translationEdition);
  }, [translationEdition]);

  // Audio State
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(() => {
    if (defaultReciterId) {
      const match = RECITERS.find((r) => r.id === defaultReciterId);
      if (match) return match;
    }
    return RECITERS[0];
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeAyahNumber, setActiveAyahNumber] = useState<number>(initialAyah);
  const [audioPlaybackMode, setAudioPlaybackMode] = useState<'ayah' | 'surah'>('ayah');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(playbackSpeedDefault || 1);
  const [copyFeedback, setCopyFeedback] = useState<number | null>(null);
  const [isAudioBarMinimized, setIsAudioBarMinimized] = useState<boolean>(false);
  const [currentRepeat, setCurrentRepeat] = useState<number>(1);
  const [localRepeatCount, setLocalRepeatCount] = useState<number>(ayahRepeatCount);
  const [localAutoAdvance, setLocalAutoAdvance] = useState<boolean>(autoAdvanceAyah);
  const [openAudioMenu, setOpenAudioMenu] = useState<'reciter' | 'ayah' | 'options' | null>(null);
  const [reciterSearchQuery, setReciterSearchQuery] = useState<string>('');
  const [ayahGroupPage, setAyahGroupPage] = useState<number>(0);
  const [directAyahInput, setDirectAyahInput] = useState<string>('');
  const audioMenuRef = useRef<HTMLDivElement | null>(null);

  // Sync props when settings change
  useEffect(() => {
    if (ayahRepeatCount) setLocalRepeatCount(ayahRepeatCount);
  }, [ayahRepeatCount]);

  useEffect(() => {
    setLocalAutoAdvance(autoAdvanceAyah);
  }, [autoAdvanceAyah]);

  // Close audio menu on click outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        openAudioMenu &&
        audioMenuRef.current &&
        !audioMenuRef.current.contains(event.target as Node)
      ) {
        setOpenAudioMenu(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [openAudioMenu]);

  const handleOpenAyahMenu = () => {
    if (openAudioMenu === 'ayah') {
      setOpenAudioMenu(null);
    } else {
      setAyahGroupPage(Math.floor((activeAyahNumber - 1) / 40));
      setDirectAyahInput('');
      setOpenAudioMenu('ayah');
    }
  };

  // Auto-scroll state (التمرير التلقائي البطيء - Slow Motion)
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(false);
  const [scrollSpeed, setScrollSpeed] = useState<'very-slow' | 'slow' | 'medium'>('slow');
  const autoScrollRafRef = useRef<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeAyahRef = useRef<HTMLDivElement | null>(null);

  const currentSurah = useMemo<SurahMeta>(() => {
    return SURAHS_LIST.find((s) => s.number === surahNumber) || SURAHS_LIST[0];
  }, [surahNumber]);

  // Smooth Slow-Motion Auto-Scroll Effect
  useEffect(() => {
    if (!isAutoScrolling) {
      if (autoScrollRafRef.current) {
        cancelAnimationFrame(autoScrollRafRef.current);
        autoScrollRafRef.current = null;
      }
      return;
    }

    // Speed in pixels per millisecond
    // very-slow: 0.022 px/ms (~22 px/sec) - serene slow motion
    // slow: 0.045 px/ms (~45 px/sec) - comfortable reading pace
    // medium: 0.080 px/ms (~80 px/sec) - steady continuous pace
    const speedPxPerMs =
      scrollSpeed === 'very-slow' ? 0.022 : scrollSpeed === 'slow' ? 0.045 : 0.08;

    let accumulatedScroll = 0;
    let lastTime = performance.now();

    const step = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      // Stop if reached the very bottom of document
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 15) {
        setIsAutoScrolling(false);
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
  }, [isAutoScrolling, scrollSpeed]);

  // Pause auto-scroll when surah changes
  useEffect(() => {
    setIsAutoScrolling(false);
  }, [surahNumber]);

  // Fetch Verses on Surah change
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetchSurahVerses(surahNumber)
      .then((data) => {
        if (!mounted) return;
        setAyahs(data);
        setLoading(false);
        setActiveAyahNumber(initialAyah || 1);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('Error fetching surah:', err);
        setError('تعذر تحميل آيات السورة الكريمة حالياً. يرجى التحقق من الاتصال بالإنترنت.');
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [surahNumber, initialAyah]);

  // Scroll to active or initial ayah when loaded
  useEffect(() => {
    if (!loading && initialAyah > 1) {
      setTimeout(() => {
        const el = document.getElementById(`ayah-${initialAyah}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [loading, initialAyah]);

  // Audio playback URL calculation
  const currentAudioSource = useMemo(() => {
    if (audioPlaybackMode === 'surah') {
      return getSurahAudioUrl(selectedReciter, surahNumber);
    } else {
      return getAyahAudioUrl(selectedReciter, surahNumber, activeAyahNumber);
    }
  }, [selectedReciter, surahNumber, activeAyahNumber, audioPlaybackMode]);

  // Play audio when source changes and isPlaying is true
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
      if (isPlaying) {
        audioRef.current.play().catch((e) => {
          console.warn('Playback error:', e);
          setIsPlaying(false);
        });
      }
    }
  }, [currentAudioSource, isPlaying, playbackSpeed]);

  // Sync with defaultReciterId prop when settings change
  useEffect(() => {
    if (defaultReciterId) {
      const match = RECITERS.find((r) => r.id === defaultReciterId);
      if (match && match.id !== selectedReciter.id) {
        setSelectedReciter(match);
      }
    }
  }, [defaultReciterId]);

  // Sync with playbackSpeedDefault prop when settings change
  useEffect(() => {
    if (playbackSpeedDefault && playbackSpeedDefault !== playbackSpeed) {
      setPlaybackSpeed(playbackSpeedDefault);
    }
  }, [playbackSpeedDefault]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleAudioEnded = () => {
    if (audioPlaybackMode === 'ayah') {
      // Check repeat count for memorization
      if (localRepeatCount === 999 || currentRepeat < localRepeatCount) {
        setCurrentRepeat((prev) => prev + 1);
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => setIsPlaying(false));
        }
        return;
      }
      setCurrentRepeat(1);

      // Auto advance to next ayah if enabled
      if (localAutoAdvance && activeAyahNumber < currentSurah.ayahCount) {
        setActiveAyahNumber((prev) => prev + 1);
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(false);
    }
  };

  const playAyahDirectly = (ayahNum: number) => {
    setCurrentRepeat(1);
    setAudioPlaybackMode('ayah');
    setActiveAyahNumber(ayahNum);
    setIsPlaying(true);
    // Smooth scroll into view
    const el = document.getElementById(`ayah-${ayahNum}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleNextAyah = () => {
    setCurrentRepeat(1);
    if (activeAyahNumber < currentSurah.ayahCount) {
      setActiveAyahNumber((prev) => prev + 1);
    }
  };

  const handlePrevAyah = () => {
    setCurrentRepeat(1);
    if (activeAyahNumber > 1) {
      setActiveAyahNumber((prev) => prev - 1);
    }
  };

  const handleCopyAyah = (ayah: Ayah) => {
    const textToCopy = `﴿${ayah.text}﴾ [سورة ${currentSurah.name}: الآية ${ayah.number}]`;
    navigator.clipboard.writeText(textToCopy);
    setCopyFeedback(ayah.number);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const handleZoomIn = () => {
    if (setFontSize) {
      setFontSize((prev) => Math.min(44, prev + 2));
    }
  };

  const handleZoomOut = () => {
    if (setFontSize) {
      setFontSize((prev) => Math.max(18, prev - 2));
    }
  };

  const handleCycleZoom = () => {
    if (setFontSize) {
      setFontSize((prev) => (prev >= 38 ? 22 : prev + 4));
    }
  };

  const getFontFamilyClass = () => {
    if (fontFamily === 'amiri') return 'font-quran';
    if (fontFamily === 'scheherazade') return 'font-scheherazade';
    return 'font-cairo';
  };

  return (
    <div className="space-y-6 transition-all duration-300 pb-16">
      {/* Surah Header & Navigation Bar */}
      <div className="bg-[#0D1217] rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md text-center relative overflow-hidden">
        {/* Subtle decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-amber-500 to-teal-600" />

        <div className="flex items-center justify-between gap-2 mb-4">
          {/* Previous Surah button */}
          <button
            onClick={() => onNavigateSurah(Math.max(1, surahNumber - 1))}
            disabled={surahNumber <= 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#8FA89E] hover:text-amber-200 hover:bg-[#1D372F] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            <span>السورة السابقة</span>
          </button>

          {/* Revelation & Juz info (unboxed metadata) */}
          <div className="flex items-center gap-2 text-xs text-[#8FA89E] font-cairo">
            <span>{currentSurah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
            <span aria-hidden="true">·</span>
            <span>{currentSurah.ayahCount} آية</span>
            <span aria-hidden="true">·</span>
            <span>الجزء {currentSurah.juz}</span>
            <span aria-hidden="true">·</span>
            <span>الصفحة {currentSurah.page}</span>
          </div>

          {/* Next Surah button */}
          <button
            onClick={() => onNavigateSurah(Math.min(114, surahNumber + 1))}
            disabled={surahNumber >= 114}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#8FA89E] hover:text-amber-200 hover:bg-[#1D372F] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <span>السورة التالية</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Clickable Surah Title with quick font zoom affordance */}
        <div
          onClick={handleCycleZoom}
          className="cursor-pointer group inline-block select-none py-1"
          title="انقر لتكبير وتغيير حجم الخط مباشرة"
        >
          <h1 className="text-3xl sm:text-5xl font-amiri font-bold text-amber-200 group-hover:text-amber-300 transition-colors mb-2 tracking-wide">
            سُورَةُ {currentSurah.name}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <p className="text-xs text-[#7A988E] font-sans tracking-widest uppercase">
              {currentSurah.englishName} · {currentSurah.englishNameTranslation}
            </p>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#162D24] text-amber-300/80 border border-[#254A3B] group-hover:border-amber-500/50 transition-colors">
              حجم الخط: {fontSize}px (انقر للتكبير)
            </span>
          </div>
        </div>

        {/* View Mode Switcher, Zoom Controls & Translation Button */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
          {/* View Mode Switcher with Liquid Glass Pills */}
          <div className="inline-flex p-1.5 ios-liquid-glass rounded-2xl text-xs font-medium">
            <button
              onClick={() => setReaderMode('verses')}
              className={`px-3.5 py-1.5 rounded-xl transition-all text-center ${
                readerMode === 'verses'
                  ? 'ios-glass-pill-active'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              الآيات والتفسير
            </button>
            <button
              onClick={() => setReaderMode('mushaf')}
              className={`px-3.5 py-1.5 rounded-xl transition-all text-center ${
                readerMode === 'mushaf'
                  ? 'ios-glass-pill-active'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              المصحف المتصل
            </button>
          </div>

          {/* Direct Font Zoom Quick Controls */}
          {setFontSize && (
            <div className="inline-flex items-center gap-1.5 p-1.5 ios-liquid-glass rounded-2xl">
              <button
                onClick={handleZoomIn}
                className="px-2.5 py-1 rounded-xl ios-glass-pill text-amber-300 hover:text-white text-[10px] sm:text-[11px] font-medium transition-all shadow-xs"
                title="تكبير حجم الخط (A+)"
              >
                A+ تكبير
              </button>
              <span className="font-mono tabular-nums text-amber-200/90 px-1 font-bold text-[11px]">
                {fontSize}px
              </span>
              <button
                onClick={handleZoomOut}
                className="px-2.5 py-1 rounded-xl ios-glass-pill text-amber-300 hover:text-white text-[10px] sm:text-[11px] font-medium transition-all shadow-xs"
                title="تصغير حجم الخط (A-)"
              >
                A- تصغير
              </button>
            </div>
          )}

          {/* Auto-Scroll & Speed Controls - خيار التمرير والسرعة في شريط زجاجي عائم */}
          <div className="inline-flex items-center gap-1.5 p-1.5 ios-liquid-glass rounded-2xl max-w-full">
            <button
              onClick={() => setIsAutoScrolling((prev) => !prev)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all shadow-xs ${
                isAutoScrolling
                  ? 'bg-amber-400 text-stone-950 font-bold'
                  : 'ios-glass-pill text-amber-300 hover:text-white'
              }`}
              title="تمرير الصفحة تلقائياً"
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

            {/* Quick Speed Switcher */}
            <div className="flex items-center gap-0.5 bg-black/20 p-0.5 rounded-xl border border-white/10">
              <button
                onClick={() => setScrollSpeed('very-slow')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-colors ${
                  scrollSpeed === 'very-slow'
                    ? 'bg-amber-400 text-stone-950 font-bold'
                    : 'text-slate-300 hover:text-amber-200'
                }`}
                title="أبطأ سرعة (تبطيء)"
              >
                أبطأ
              </button>
              <button
                onClick={() => setScrollSpeed('slow')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-colors ${
                  scrollSpeed === 'slow'
                    ? 'bg-amber-400 text-stone-950 font-bold'
                    : 'text-slate-300 hover:text-amber-200'
                }`}
                title="سرعة عادية"
              >
                عادي
              </button>
              <button
                onClick={() => setScrollSpeed('medium')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-colors ${
                  scrollSpeed === 'medium'
                    ? 'bg-amber-400 text-stone-950 font-bold'
                    : 'text-slate-300 hover:text-amber-200'
                }`}
                title="أسرع (تسريع)"
              >
                أسرع
              </button>
            </div>
          </div>

          {/* Translation of Meanings Language Selector - ترجمة معاني القرآن الكريم بتصميم زجاجي عائم */}
          <div className="relative inline-flex" ref={translationMenuRef}>
            <button
              type="button"
              onClick={() => setIsTranslationMenuOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition-all shadow-xs ${
                translationEdition !== 'none'
                  ? 'ios-glass-pill-active border-amber-400/60 ring-1 ring-amber-400/30'
                  : 'ios-liquid-glass text-slate-300 hover:text-amber-200'
              }`}
              title="اختيار ترجمة معاني القرآن الكريم بلغات متعددة (إنجليزية، فرنسية، أردية...)"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                {translationEdition !== 'none'
                  ? `${currentTranslationEdition.flag} ${currentTranslationEdition.languageNameAr}`
                  : 'ترجمة المعاني'}
              </span>
              <ChevronDown className={`w-3 h-3 opacity-70 transition-transform ${isTranslationMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Translation Selection Popover */}
            {isTranslationMenuOpen && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-72 sm:w-80 ios-liquid-glass rounded-3xl p-3 shadow-2xl ring-1 ring-white/20 z-50 text-right animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2 px-1">
                  <div className="flex items-center gap-1.5">
                    <Languages className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-xs text-amber-200">ترجمة معاني القرآن الكريم</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsTranslationMenuOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 text-xs"
                    title="إغلاق"
                  >
                    ✕
                  </button>
                </div>

                {/* List of languages */}
                <div className="space-y-1 max-h-64 overflow-y-auto pr-0.5 scrollbar-thin">
                  {QURAN_TRANSLATIONS.map((edition) => {
                    const isSelected = translationEdition === edition.id;
                    return (
                      <button
                        key={edition.id}
                        type="button"
                        onClick={() => handleSelectTranslation(edition.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-right transition-all text-xs ${
                          isSelected
                            ? 'ios-glass-pill-active'
                            : 'hover:bg-white/10 text-slate-300 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{edition.flag}</span>
                          <div>
                            <div className="font-semibold text-xs text-amber-100 flex items-center gap-1">
                              <span>{edition.languageNameAr}</span>
                              <span className="text-[10px] text-slate-400 font-normal">({edition.languageNameNative})</span>
                            </div>
                            <div className="text-[10px] text-emerald-400/80 line-clamp-1">{edition.translatorName}</div>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="text-amber-400 text-xs shrink-0 flex items-center gap-0.5 font-bold">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Basmala Banner (except Surah 9 At-Tawbah) with Floating Liquid Glass */}
      {surahNumber !== 9 && (
        <div className="py-6 text-center select-none">
          <div className="inline-block relative px-10 py-4 rounded-3xl ios-liquid-glass shadow-lg">
            <p
              className="font-quran text-2xl sm:text-3xl text-amber-200 font-bold"
              style={{ lineHeight: '2.6', wordSpacing: '0.24em' }}
            >
              {BASMALA}
            </p>
          </div>
        </div>
      )}

      {/* Loading & Error States */}
      {loading ? (
        <div className="py-24 text-center space-y-4">
          <div className="inline-block w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#8FA89E] font-medium">جاري تحميل آيات سورة {currentSurah.name}...</p>
        </div>
      ) : error ? (
        <div className="py-12 px-6 bg-[#261616] border border-[#502323] rounded-xl text-center space-y-3">
          <p className="text-sm text-red-300">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchSurahVerses(surahNumber).then(setAyahs).finally(() => setLoading(false));
            }}
            className="px-4 py-2 text-xs font-semibold bg-red-800 hover:bg-red-700 text-stone-100 rounded-lg transition-colors border border-red-600/50"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : readerMode === 'verses' ? (
        /* Verse by Verse List */
        <div className="space-y-4">
          {ayahs.map((ayah) => {
            const isPlayingThisAyah = isPlaying && audioPlaybackMode === 'ayah' && activeAyahNumber === ayah.number;
            const isBookmarked = currentBookmark?.surahNumber === surahNumber && currentBookmark?.ayahNumber === ayah.number;

            return (
              <div
                key={ayah.number}
                id={`ayah-${ayah.number}`}
                ref={isPlayingThisAyah ? activeAyahRef : null}
                className={`group p-5 sm:p-6 rounded-3xl transition-all duration-300 ${
                  isPlayingThisAyah
                    ? 'ios-liquid-glass border-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50'
                    : 'ios-liquid-glass-card hover:border-amber-400/40 shadow-sm'
                }`}
              >
                {/* Verse Header bar */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-stone-950 font-mono font-bold text-xs flex items-center justify-center shadow-xs border border-white/30">
                      {ayah.number}
                    </span>
                    <span className="font-amiri font-bold text-base text-amber-400 tracking-wide select-none">
                      الآية {ayah.number}
                    </span>
                  </div>

                  {/* Actions for this Ayah */}
                  <div className="flex items-center gap-1.5">
                    {/* زر صوت الآية: كبسولة زجاجية أنيقة */}
                    <button
                      onClick={() => {
                        if (isPlayingThisAyah) {
                          togglePlayPause();
                        } else {
                          playAyahDirectly(ayah.number);
                        }
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                        isPlayingThisAyah
                          ? 'bg-amber-400 text-stone-950 font-bold shadow-xs scale-105'
                          : 'ios-glass-pill text-amber-300 hover:text-white'
                      }`}
                      title={isPlayingThisAyah ? 'إيقاف مؤقت لتلاوة الآية' : 'استماع لتلاوة الآية'}
                    >
                      {isPlayingThisAyah ? (
                        <>
                          <Volume2 className="w-3.5 h-3.5 animate-pulse text-stone-950" />
                          <span className="text-[11px]">يتلو</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span className="text-[11px] hidden sm:inline">صوت</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setSelectedAyahForTafsir(ayah)}
                      className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                      title="قراءة التفسير الميسر"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleCopyAyah(ayah)}
                      className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors relative"
                      title="نسخ نص الآية"
                    >
                      {copyFeedback === ayah.number ? (
                        <Check className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => onSaveBookmark(surahNumber, ayah.number, currentSurah.name)}
                      className={`p-1.5 rounded-xl transition-colors ${
                        isBookmarked
                          ? 'text-amber-400'
                          : 'hover:bg-white/10 text-slate-300 hover:text-amber-400'
                      }`}
                      title={isBookmarked ? 'علامة القراءة الحالية' : 'حفظ كعلامة للقراءة'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Arabic Quranic Text - Spacious, clear, uncrowded typography */}
                <p
                  className={`text-right select-text transition-all ${getFontFamilyClass()}`}
                  style={{
                    color: textToneColor,
                    fontSize: `${fontSize}px`,
                    lineHeight: '2.9',
                    wordSpacing: '0.24em',
                    paddingTop: '0.25rem',
                    paddingBottom: '0.5rem',
                  }}
                >
                  {ayah.text}
                  <span
                    className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 mx-2.5 rounded-full border-2 bg-[#1A332B] font-mono text-xs tabular-nums select-none align-middle font-bold shadow-sm"
                    style={{
                      borderColor: goldToneColor,
                      color: goldToneColor,
                      boxShadow: `0 0 10px ${goldToneColor}25`,
                    }}
                  >
                    {ayah.number}
                  </span>
                </p>

                {/* Meaning Translation Card - ترجمة معاني القرآن الكريم بلغات متعددة */}
                {translationEdition !== 'none' && (
                  <div
                    className={`mt-3 p-3 rounded-2xl bg-[#0B1A14]/90 border border-emerald-500/30 text-slate-200 transition-all ${
                      currentTranslationEdition.direction === 'ltr' ? 'text-left' : 'text-right'
                    }`}
                    dir={currentTranslationEdition.direction}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1.5 mb-2 border-b border-[#163328] text-[11px]">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300">
                        <span className="text-sm">{currentTranslationEdition.flag}</span>
                        <span>{currentTranslationEdition.languageNameNative} ({currentTranslationEdition.languageNameAr})</span>
                      </div>
                      <span className="text-[10px] text-emerald-400/90 font-medium">
                        {currentTranslationEdition.translatorName}
                      </span>
                    </div>

                    {isTranslationLoading && !translationTexts[ayah.number] ? (
                      <div className="space-y-1.5 py-1">
                        <div className="h-3.5 bg-[#142E24] animate-pulse rounded w-11/12" />
                        <div className="h-3.5 bg-[#142E24] animate-pulse rounded w-3/4" />
                      </div>
                    ) : (
                      <p className="text-xs sm:text-[13px] leading-relaxed text-slate-100 select-text font-sans">
                        {translationTexts[ayah.number] || 'الترجمة غير متوفرة لهذه الآية حالياً.'}
                      </p>
                    )}
                  </div>
                )}

                {/* Small compact Tafsir under the Ayah with blue verification badge and source */}
                {showTafsirUnderAyah && ayah.tafsir && (
                  <div className="mt-2.5 pt-2 border-t border-[#1C362E]/70 text-right font-cairo">
                    <div className="flex flex-wrap items-center justify-between gap-1 pb-1 mb-1 border-b border-[#142A23]">
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="font-bold text-amber-300">التفسير:</span>
                        <span className="text-[#84A598]">المصدر: التفسير الميسر (مجمع الملك فهد لطباعة المصحف الشريف)</span>
                      </div>
                      <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-950/80 border border-blue-500/40 text-blue-400 text-[10px] font-bold shrink-0 shadow-xs"
                        title="تفسير موثق ومعتمد من مجمع الملك فهد لطباعة المصحف الشريف"
                      >
                        <BadgeCheck className="w-3 h-3 text-blue-400" />
                        <span>توثيق معتمد</span>
                      </span>
                    </div>
                    <p className="text-[12px] sm:text-xs text-[#D1E3DC] leading-relaxed font-normal select-text">
                      {ayah.tafsir}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Continuous Mushaf Reading View */
        <div className="ios-liquid-glass-card p-6 sm:p-12 rounded-3xl shadow-xl">
          <div
            className={`text-justify select-text transition-all ${getFontFamilyClass()}`}
            style={{
              color: textToneColor,
              fontSize: `${fontSize}px`,
              lineHeight: 3.1,
              wordSpacing: '0.24em',
            }}
            dir="rtl"
          >
            {ayahs.map((ayah) => {
              const isPlayingThisAyah = isPlaying && audioPlaybackMode === 'ayah' && activeAyahNumber === ayah.number;
              return (
                <span
                  key={ayah.number}
                  id={`ayah-${ayah.number}`}
                  onClick={() => setSelectedAyahForTafsir(ayah)}
                  className={`cursor-pointer transition-colors px-1 rounded-lg inline ${
                    isPlayingThisAyah
                      ? 'bg-amber-400/25 text-amber-200 font-semibold ring-1 ring-amber-400/50'
                      : 'hover:bg-white/10'
                  }`}
                  title={`انقر لعرض تفسير الآية ${ayah.number}`}
                >
                  {ayah.text}
                  <span
                    className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 mx-2 rounded-full border-2 bg-black/40 font-mono text-xs tabular-nums select-none align-middle font-bold shadow-xs"
                    style={{
                      borderColor: goldToneColor,
                      color: goldToneColor,
                      boxShadow: `0 0 8px ${goldToneColor}20`,
                    }}
                  >
                    {ayah.number}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Tafsir Modal */}
      {selectedAyahForTafsir && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedAyahForTafsir(null)}
        >
          <div
            className="ios-liquid-glass max-w-2xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl text-right space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-amiri text-xl font-bold text-amber-200">
                تفسير سورة {currentSurah.name} — الآية {selectedAyahForTafsir.number}
              </h3>
              <button
                onClick={() => setSelectedAyahForTafsir(null)}
                className="text-[#8FA89E] hover:text-amber-200 text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            {/* Ayah Sacred Text */}
            <div className="p-4 rounded-xl bg-[#0F1E19] border border-[#1E3A30]">
              <p
                className="font-quran text-xl sm:text-2xl text-amber-200 font-bold text-right py-2 select-text"
                style={{ lineHeight: '2.5' }}
              >
                ﴿{selectedAyahForTafsir.text}﴾
              </p>
            </div>

            {/* Meaning Translation in Modal (if enabled) */}
            {translationEdition !== 'none' && (
              <div
                className={`p-3.5 rounded-xl bg-[#0B1A14] border border-emerald-500/30 text-slate-100 ${
                  currentTranslationEdition.direction === 'ltr' ? 'text-left' : 'text-right'
                }`}
                dir={currentTranslationEdition.direction}
              >
                <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#163328] text-[11px]">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <span>{currentTranslationEdition.flag}</span>
                    <span>ترجمة المعاني ({currentTranslationEdition.languageNameNative})</span>
                  </span>
                  <span className="text-[10px] text-emerald-400/80">
                    {currentTranslationEdition.translatorName}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-sans select-text">
                  {translationTexts[selectedAyahForTafsir.number] || 'الترجمة غير متوفرة لهذه الآية حالياً.'}
                </p>
              </div>
            )}

            {/* Tafsir text */}
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
              <p className="text-[#EAEFEA] text-sm sm:text-base leading-relaxed font-cairo">
                {selectedAyahForTafsir.tafsir || 'لا يتوفر تفسير لهذه الآية حالياً.'}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-[#213B33] flex items-center justify-between">
              <button
                onClick={() => {
                  playAyahDirectly(selectedAyahForTafsir.number);
                  setSelectedAyahForTafsir(null);
                }}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl transition-colors shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>تلاوة الآية</span>
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

      {/* Floating Bottom Audio Reciter Bar - مشغل صوت مصغر، أنيق، خفيف، مع قوائم مرتبة جداً */}
      <div className="fixed bottom-0 left-0 right-0 z-40 transition-all duration-200 pointer-events-none pb-1 sm:pb-2 px-2 sm:px-4" dir="rtl">
        <audio
          ref={audioRef}
          src={currentAudioSource}
          onEnded={handleAudioEnded}
          onError={() => {
            console.warn('Audio stream unavailable, toggling pause');
            setIsPlaying(false);
          }}
        />

        {/* Minimized Ultra-Compact Floating Pill View */}
        {isAudioBarMinimized ? (
          <div className="flex justify-center pointer-events-auto">
            <div className="ios-liquid-glass-dock rounded-full px-3 py-1 shadow-2xl flex items-center gap-2 text-xs text-amber-200 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-1 font-bold text-[11px]">
                <Volume2 className={`w-3.5 h-3.5 text-amber-400 ${isPlaying ? 'animate-pulse' : ''}`} />
                <span className="truncate max-w-[90px]">{selectedReciter.name.split(' ')[0]}</span>
                <span className="text-amber-400 font-mono text-[10px]">({activeAyahNumber})</span>
              </div>

              {/* زر تشغيل / إيقاف سريع */}
              <button
                onClick={togglePlayPause}
                className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center hover:bg-amber-300 active:scale-95 transition-all shadow-xs"
                title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
              >
                {isPlaying ? <Pause className="w-2.5 h-2.5 fill-current" /> : <Play className="w-2.5 h-2.5 fill-current ml-0.5" />}
              </button>

              {/* زر توسيع الشريط */}
              <button
                onClick={() => setIsAudioBarMinimized(false)}
                className="px-2 py-0.5 text-[9px] font-bold rounded-full ios-glass-pill text-amber-300 hover:text-white transition-colors"
                title="توسيع شريط مشغل الصوت"
              >
                توسيع
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-lg mx-auto pointer-events-auto relative" ref={audioMenuRef}>
            {/* Popover 1: قائمة القراء المرتبة والفخمة */}
            {openAudioMenu === 'reciter' && (
              <div className="absolute bottom-full mb-2 inset-x-0 mx-auto ios-liquid-glass rounded-3xl p-3.5 shadow-2xl ring-1 ring-white/20 text-[#EAEFEA] animate-in fade-in zoom-in-95 duration-150 z-50">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-xs sm:text-sm text-amber-200">اختيار القارئ</span>
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                      {RECITERS.length} قراء
                    </span>
                  </div>
                  <button
                    onClick={() => setOpenAudioMenu(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="إغلاق"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Search */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-amber-400/80 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={reciterSearchQuery}
                    onChange={(e) => setReciterSearchQuery(e.target.value)}
                    placeholder="ابحث عن قارئ..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pr-8 pl-3 py-1.5 text-xs text-amber-100 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  {reciterSearchQuery && (
                    <button
                      onClick={() => setReciterSearchQuery('')}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Reciters List */}
                <div className="space-y-1 max-h-56 overflow-y-auto pr-0.5 scrollbar-thin">
                  {RECITERS.filter((r) =>
                    r.name.includes(reciterSearchQuery) ||
                    r.subname.includes(reciterSearchQuery) ||
                    r.style.includes(reciterSearchQuery)
                  ).map((reciter) => {
                    const isSelected = selectedReciter.id === reciter.id;
                    return (
                      <button
                        key={reciter.id}
                        type="button"
                        onClick={() => {
                          setSelectedReciter(reciter);
                          setOpenAudioMenu(null);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-right transition-all text-xs ${
                          isSelected
                            ? 'ios-glass-pill-active font-bold'
                            : 'hover:bg-white/10 text-slate-200 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-amber-400 text-stone-950 font-bold' : 'bg-white/10 text-amber-400'
                          }`}>
                            <Volume2 className="w-3 h-3" />
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-amber-100">{reciter.name}</div>
                            <div className="text-[10px] text-emerald-400/80">{reciter.subname} • {reciter.style}</div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-md font-bold">
                            <Check className="w-3 h-3" />
                            <span>المحدد</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Popover 2: قائمة الآيات المرتبة مع الانتقال السريع */}
            {openAudioMenu === 'ayah' && (
              <div className="absolute bottom-full mb-2 inset-x-0 mx-auto ios-liquid-glass rounded-3xl p-3.5 shadow-2xl ring-1 ring-white/20 text-[#EAEFEA] animate-in fade-in zoom-in-95 duration-150 z-50">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs sm:text-sm text-amber-200">
                      آيات سورة {currentSurah.name}
                    </span>
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                      {currentSurah.ayahCount} آية
                    </span>
                  </div>
                  <button
                    onClick={() => setOpenAudioMenu(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="إغلاق"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Direct Number Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const num = parseInt(directAyahInput, 10);
                    if (!isNaN(num) && num >= 1 && num <= currentSurah.ayahCount) {
                      playAyahDirectly(num);
                      setOpenAudioMenu(null);
                    }
                  }}
                  className="flex items-center gap-1.5 mb-2.5"
                >
                  <input
                    type="number"
                    min={1}
                    max={currentSurah.ayahCount}
                    value={directAyahInput}
                    onChange={(e) => setDirectAyahInput(e.target.value)}
                    placeholder={`اكتب رقم الآية (1 - ${currentSurah.ayahCount})...`}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-amber-100 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-xs transition-all shrink-0"
                  >
                    انتقال
                  </button>
                </form>

                {/* Range Tabs if Ayahs > 40 */}
                {currentSurah.ayahCount > 40 && (
                  <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-2 scrollbar-none border-b border-white/10">
                    {Array.from({ length: Math.ceil(currentSurah.ayahCount / 40) }, (_, i) => {
                      const start = i * 40 + 1;
                      const end = Math.min((i + 1) * 40, currentSurah.ayahCount);
                      const isCurrentGroup = ayahGroupPage === i;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAyahGroupPage(i)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-mono whitespace-nowrap transition-all ${
                            isCurrentGroup
                              ? 'ios-glass-pill-active'
                              : 'ios-glass-pill text-amber-200/80 hover:text-white'
                          }`}
                        >
                          {start} - {end}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Ayahs Grid */}
                <div className="grid grid-cols-7 sm:grid-cols-8 gap-1 sm:gap-1.5 max-h-48 overflow-y-auto pr-0.5 scrollbar-thin">
                  {(() => {
                    const startAyah = currentSurah.ayahCount > 40 ? ayahGroupPage * 40 + 1 : 1;
                    const endAyah = currentSurah.ayahCount > 40
                      ? Math.min((ayahGroupPage + 1) * 40, currentSurah.ayahCount)
                      : currentSurah.ayahCount;
                    const items = [];
                    for (let n = startAyah; n <= endAyah; n++) {
                      const isActive = activeAyahNumber === n;
                      items.push(
                        <button
                          key={n}
                          type="button"
                          onClick={() => {
                            playAyahDirectly(n);
                            setOpenAudioMenu(null);
                          }}
                          className={`h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 ring-2 ring-white/50 shadow-md font-black scale-105'
                              : 'bg-white/5 text-amber-200 hover:bg-white/15 hover:text-white border border-white/10'
                          }`}
                          title={`تلاوة الآية ${n}`}
                        >
                          {n}
                        </button>
                      );
                    }
                    return items;
                  })()}
                </div>
              </div>
            )}

            {/* Popover 3: قائمة خيارات وضبط التلاوة المرتبة */}
            {openAudioMenu === 'options' && (
              <div className="absolute bottom-full mb-2 inset-x-0 mx-auto ios-liquid-glass rounded-3xl p-3.5 shadow-2xl ring-1 ring-white/20 text-[#EAEFEA] animate-in fade-in zoom-in-95 duration-150 z-50">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-xs sm:text-sm text-amber-200">خيارات وضبط التلاوة</span>
                  </div>
                  <button
                    onClick={() => setOpenAudioMenu(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="إغلاق"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Mode */}
                  <div>
                    <label className="text-[11px] font-bold text-amber-300 block mb-1">وضع التلاوة:</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setAudioPlaybackMode('ayah')}
                        className={`py-1.5 px-2 rounded-xl text-center font-bold transition-all ${
                          audioPlaybackMode === 'ayah'
                            ? 'ios-glass-pill-active'
                            : 'ios-glass-pill text-amber-200 hover:text-white'
                        }`}
                      >
                        آية تلو الأخرى
                      </button>
                      <button
                        type="button"
                        onClick={() => setAudioPlaybackMode('surah')}
                        className={`py-1.5 px-2 rounded-xl text-center font-bold transition-all ${
                          audioPlaybackMode === 'surah'
                            ? 'ios-glass-pill-active'
                            : 'ios-glass-pill text-amber-200 hover:text-white'
                        }`}
                      >
                        السورة كاملة
                      </button>
                    </div>
                  </div>

                  {/* Playback Speed */}
                  <div>
                    <label className="text-[11px] font-bold text-amber-300 block mb-1">سرعة التلاوة:</label>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { speed: 0.75, label: '0.75x' },
                        { speed: 1.0, label: '1.0x عادي' },
                        { speed: 1.25, label: '1.25x' },
                        { speed: 1.5, label: '1.5x' },
                      ].map((s) => (
                        <button
                          key={s.speed}
                          type="button"
                          onClick={() => setPlaybackSpeed(s.speed)}
                          className={`py-1 rounded-xl font-mono text-[11px] font-bold transition-all text-center ${
                            playbackSpeed === s.speed
                              ? 'ios-glass-pill-active'
                              : 'ios-glass-pill text-amber-200 hover:text-white'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Verse Repeat Count */}
                  <div>
                    <label className="text-[11px] font-bold text-amber-300 block mb-1">تكرار الآية (للتحفيظ والتدبر):</label>
                    <div className="grid grid-cols-5 gap-1">
                      {[
                        { count: 1, label: '1x' },
                        { count: 2, label: '2x' },
                        { count: 3, label: '3x' },
                        { count: 5, label: '5x' },
                        { count: 999, label: 'مستمر' },
                      ].map((item) => (
                        <button
                          key={item.count}
                          type="button"
                          onClick={() => setLocalRepeatCount(item.count)}
                          className={`py-1 rounded-xl font-mono text-[11px] font-bold transition-all text-center ${
                            localRepeatCount === item.count
                              ? 'ios-glass-pill-active'
                              : 'ios-glass-pill text-amber-200 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Auto Advance */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/10">
                    <span className="text-[11px] text-amber-200">الانتقال التلقائي للآية التالية</span>
                    <button
                      type="button"
                      onClick={() => setLocalAutoAdvance(!localAutoAdvance)}
                      className={`px-3 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                        localAutoAdvance
                          ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 shadow-xs'
                          : 'bg-white/10 text-slate-400 border border-white/10'
                      }`}
                    >
                      {localAutoAdvance ? 'مُفعّل' : 'مُعطّل'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Compact Floating Audio Dock Bar - كبسولة زجاجية عائمة على طراز Apple iOS */}
            <div className="ios-liquid-glass-dock rounded-full px-2.5 sm:px-3.5 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between gap-1 text-xs">
                
                {/* 1. القارئ ورقم الآية بصورة مدمجة ومرتبة */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* زر فتح قائمة القراء */}
                  <button
                    type="button"
                    onClick={() => setOpenAudioMenu(openAudioMenu === 'reciter' ? null : 'reciter')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold transition-all ${
                      openAudioMenu === 'reciter'
                        ? 'ios-glass-pill-active'
                        : 'ios-glass-pill text-amber-300'
                    }`}
                    title="قائمة القراء"
                  >
                    <Volume2 className={`w-3 h-3 ${isPlaying ? 'animate-pulse text-amber-400' : ''}`} />
                    <span className="truncate max-w-[70px] sm:max-w-[90px]">
                      {selectedReciter.name.split(' ')[0]}
                    </span>
                    <ChevronUp className="w-2.5 h-2.5 opacity-70" />
                  </button>

                  {/* زر فتح قائمة الآيات */}
                  <button
                    type="button"
                    onClick={handleOpenAyahMenu}
                    className={`flex items-center gap-0.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold font-mono transition-all ${
                      openAudioMenu === 'ayah'
                        ? 'ios-glass-pill-active'
                        : 'ios-glass-pill text-amber-300'
                    }`}
                    title="اختيار رقم الآية"
                  >
                    <span className="text-[9px] text-amber-400 font-bold select-none">آية</span>
                    <span>{activeAyahNumber}</span>
                    <ChevronUp className="w-2.5 h-2.5 opacity-70" />
                  </button>
                </div>

                {/* 2. أزرار التحكم بالصوت: مدمجة وأنيقة في المنتصف */}
                <div className="flex items-center justify-center gap-1 shrink-0" dir="ltr">
                  {/* الآية السابقة */}
                  <button
                    onClick={handlePrevAyah}
                    disabled={activeAyahNumber <= 1}
                    className="w-6 h-6 rounded-full ios-glass-pill active:scale-95 disabled:opacity-20 text-amber-300 flex items-center justify-center transition-all shadow-xs"
                    title="الآية السابقة"
                    aria-label="الآية السابقة"
                  >
                    <SkipBack className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                  </button>

                  {/* تشغيل / إيقاف مؤقت */}
                  <button
                    onClick={togglePlayPause}
                    className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 flex items-center justify-center shadow-md shadow-amber-950/40 hover:scale-105 active:scale-95 transition-all font-bold border border-white/40"
                    aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                    title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                  >
                    {isPlaying ? (
                      <Pause className="w-3 h-3 fill-current" />
                    ) : (
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    )}
                  </button>

                  {/* الآية التالية */}
                  <button
                    onClick={handleNextAyah}
                    disabled={activeAyahNumber >= currentSurah.ayahCount}
                    className="w-6 h-6 rounded-full ios-glass-pill active:scale-95 disabled:opacity-20 text-amber-300 flex items-center justify-center transition-all shadow-xs"
                    title="الآية التالية"
                    aria-label="الآية التالية"
                  >
                    <SkipForward className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                  </button>
                </div>

                {/* 3. الخيارات المصغرة: السرعة، الضبط، وتصغير الشريط */}
                <div className="flex items-center justify-end gap-1 shrink-0">
                  {/* زر فتح قائمة الخيارات والضبط */}
                  <button
                    type="button"
                    onClick={() => setOpenAudioMenu(openAudioMenu === 'options' ? null : 'options')}
                    className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-full transition-all ${
                      openAudioMenu === 'options'
                        ? 'ios-glass-pill-active'
                        : 'ios-glass-pill text-amber-300'
                    }`}
                    title="خيارات وضبط التلاوة"
                  >
                    <Sliders className="w-3 h-3" />
                    <span className="font-mono">{playbackSpeed}x</span>
                    <ChevronUp className="w-2.5 h-2.5 opacity-70" />
                  </button>

                  {/* زر تصغير شريط الصوت */}
                  <button
                    onClick={() => {
                      setOpenAudioMenu(null);
                      setIsAudioBarMinimized(true);
                    }}
                    className="w-6 h-6 rounded-full ios-glass-pill text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                    title="تصغير شريط الصوت"
                    aria-label="تصغير شريط الصوت"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Auto-Scroll Controls (شريط التحكم العائم المصغر بالتمرير التلقائي) */}
      {isAutoScrolling && (
        <div
          className="fixed bottom-24 sm:bottom-16 left-1/2 -translate-x-1/2 z-50 ios-liquid-glass-dock rounded-full px-3 py-1.5 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 text-[11px] font-cairo text-[#EAEFEA] select-none max-w-[calc(100vw-2rem)] overflow-hidden"
          dir="rtl"
        >
          {/* Status Indicator */}
          <div className="flex items-center gap-1 pl-1.5 border-l border-white/10 shrink-0" title="التمرير البطيء يعمل تلقائياً">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-amber-300 hidden sm:inline whitespace-nowrap">
              تمرير بطيء
            </span>
          </div>

          {/* Speed Selector (تبطيء وتسريع) */}
          <div className="flex items-center bg-black/20 p-0.5 rounded-full border border-white/10 shrink-0">
            <button
              onClick={() => setScrollSpeed('very-slow')}
              className={`px-2 py-0.5 rounded-full text-[9px] transition-colors ${
                scrollSpeed === 'very-slow'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-amber-200'
              }`}
              title="أبطأ (سلو موشن)"
            >
              أبطأ
            </button>
            <button
              onClick={() => setScrollSpeed('slow')}
              className={`px-2 py-0.5 rounded-full text-[9px] transition-colors ${
                scrollSpeed === 'slow'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-amber-200'
              }`}
              title="مريح (الوضع العادي)"
            >
              مريح
            </button>
            <button
              onClick={() => setScrollSpeed('medium')}
              className={`px-2 py-0.5 rounded-full text-[9px] transition-colors ${
                scrollSpeed === 'medium'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-amber-200'
              }`}
              title="أسرع قليلاً"
            >
              أسرع
            </button>
          </div>

          {/* Pause Button */}
          <button
            onClick={() => setIsAutoScrolling(false)}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold text-[10px] transition-all shadow-xs shrink-0"
            title="إيقاف مؤقت للتمرير"
          >
            <Pause className="w-2.5 h-2.5 fill-current" />
            <span>إيقاف</span>
          </button>

          {/* Close */}
          <button
            onClick={() => setIsAutoScrolling(false)}
            className="text-slate-400 hover:text-white transition-colors p-0.5 text-xs font-bold leading-none shrink-0"
            title="إغلاق الشريط"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
