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
  ChevronsDown,
} from 'lucide-react';
import { SURAHS_LIST, SurahMeta, Ayah, BASMALA } from '../data/surahs';
import { RECITERS, Reciter, getSurahAudioUrl, getAyahAudioUrl } from '../data/reciters';
import { fetchSurahVerses } from '../services/quranApi';

interface QuranReaderProps {
  surahNumber: number;
  initialAyah?: number;
  onNavigateSurah: (number: number) => void;
  fontSize: number;
  setFontSize?: (size: number | ((prev: number) => number)) => void;
  fontFamily: 'amiri' | 'scheherazade' | 'cairo';
  onSaveBookmark: (surahNumber: number, ayahNumber: number, surahName: string) => void;
  currentBookmark?: { surahNumber: number; ayahNumber: number } | null;
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
}) => {
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reader Mode: 'verses' (verse by verse cards) or 'mushaf' (continuous text)
  const [readerMode, setReaderMode] = useState<'verses' | 'mushaf'>('verses');

  // Selected Verse for Tafsir modal
  const [selectedAyahForTafsir, setSelectedAyahForTafsir] = useState<Ayah | null>(null);

  // Audio State
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(RECITERS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeAyahNumber, setActiveAyahNumber] = useState<number>(initialAyah);
  const [audioPlaybackMode, setAudioPlaybackMode] = useState<'ayah' | 'surah'>('ayah');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [copyFeedback, setCopyFeedback] = useState<number | null>(null);
  const [isAudioBarMinimized, setIsAudioBarMinimized] = useState<boolean>(false);

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
      // Auto advance to next ayah if available
      if (activeAyahNumber < currentSurah.ayahCount) {
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
    setAudioPlaybackMode('ayah');
    setActiveAyahNumber(ayahNum);
    setIsPlaying(true);
    // Smooth scroll into view
    const el = document.getElementById(`ayah-${ayahNum}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleNextAyah = () => {
    if (activeAyahNumber < currentSurah.ayahCount) {
      setActiveAyahNumber((prev) => prev + 1);
    }
  };

  const handlePrevAyah = () => {
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
    <div className={`space-y-6 transition-all duration-300 ${isAudioBarMinimized ? 'pb-14' : 'pb-28'}`}>
      {/* Surah Header & Navigation Bar */}
      <div className="bg-[#142520] rounded-2xl p-6 sm:p-8 border border-[#213C33] shadow-lg text-center relative overflow-hidden">
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

        {/* View Mode Switcher and Direct Zoom Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
          {/* View Mode Switcher */}
          <div className="inline-flex p-1 bg-[#101D19] rounded-xl border border-[#1C362F] text-xs font-medium">
            <button
              onClick={() => setReaderMode('verses')}
              className={`px-3 py-1.5 rounded-lg transition-colors text-center ${
                readerMode === 'verses'
                  ? 'bg-[#1C3A31] text-amber-300 border border-[#2D5447] shadow-xs font-bold'
                  : 'text-[#8FA89E] hover:text-amber-200'
              }`}
            >
              الآيات والتفسير
            </button>
            <button
              onClick={() => setReaderMode('mushaf')}
              className={`px-3 py-1.5 rounded-lg transition-colors text-center ${
                readerMode === 'mushaf'
                  ? 'bg-[#1C3A31] text-amber-300 border border-[#2D5447] shadow-xs font-bold'
                  : 'text-[#8FA89E] hover:text-amber-200'
              }`}
            >
              المصحف المتصل
            </button>
          </div>

          {/* Direct Font Zoom Quick Controls */}
          {setFontSize && (
            <div className="inline-flex items-center gap-1 p-1 bg-[#101D19] rounded-xl border border-[#1C362F]">
              <button
                onClick={handleZoomIn}
                className="px-2 py-1 rounded-lg bg-[#18322A] text-amber-300 hover:bg-[#1F3E34] border border-[#264C3F] text-[10px] sm:text-[11px] font-normal transition-colors shadow-xs"
                title="تكبير حجم الخط (A+)"
              >
                A+ تكبير
              </button>
              <span className="font-mono tabular-nums text-amber-200/90 px-1 font-bold text-[11px]">
                {fontSize}px
              </span>
              <button
                onClick={handleZoomOut}
                className="px-2 py-1 rounded-lg bg-[#18322A] text-amber-300 hover:bg-[#1F3E34] border border-[#264C3F] text-[10px] sm:text-[11px] font-normal transition-colors shadow-xs"
                title="تصغير حجم الخط (A-)"
              >
                A- تصغير
              </button>
            </div>
          )}

          {/* Slow Motion Auto-Scroll Button */}
          <div className="inline-flex items-center gap-1 p-0.5 bg-[#101D19] rounded-xl border border-[#1C362F]">
            <button
              onClick={() => setIsAutoScrolling((prev) => !prev)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shadow-xs ${
                isAutoScrolling
                  ? 'bg-amber-500 text-stone-950 font-bold ring-1 ring-amber-300'
                  : 'bg-[#18322A] text-amber-300 hover:bg-[#204237] border border-[#274E41]'
              }`}
              title="تمرير الصفحة للأسفل تلقائياً ببطء شديد دون استخدام اليد"
            >
              {isAutoScrolling ? (
                <>
                  <Pause className="w-3 h-3 fill-current" />
                  <span>إيقاف</span>
                </>
              ) : (
                <>
                  <ChevronsDown className="w-3 h-3" />
                  <span>تمرير تلقائي</span>
                </>
              )}
            </button>

            {/* Quick Speed Switcher */}
            {isAutoScrolling && (
              <div className="flex items-center gap-0.5 pr-0.5 border-r border-[#1F3D32]">
                <button
                  onClick={() => setScrollSpeed('very-slow')}
                  className={`px-1.5 py-0.5 rounded text-[9px] transition-colors ${
                    scrollSpeed === 'very-slow'
                      ? 'bg-amber-400 text-stone-950 font-bold'
                      : 'text-[#8FA89E] hover:text-amber-200'
                  }`}
                  title="أبطأ سرعة"
                >
                  أبطأ
                </button>
                <button
                  onClick={() => setScrollSpeed('slow')}
                  className={`px-1.5 py-0.5 rounded text-[9px] transition-colors ${
                    scrollSpeed === 'slow'
                      ? 'bg-amber-400 text-stone-950 font-bold'
                      : 'text-[#8FA89E] hover:text-amber-200'
                  }`}
                  title="سرعة مريحة عادية"
                >
                  عادي
                </button>
                <button
                  onClick={() => setScrollSpeed('medium')}
                  className={`px-1.5 py-0.5 rounded text-[9px] transition-colors ${
                    scrollSpeed === 'medium'
                      ? 'bg-amber-400 text-stone-950 font-bold'
                      : 'text-[#8FA89E] hover:text-amber-200'
                  }`}
                  title="أسرع"
                >
                  أسرع
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Basmala Banner (except Surah 9 At-Tawbah) */}
      {surahNumber !== 9 && (
        <div className="py-6 text-center select-none">
          <div className="inline-block relative px-10 py-4 rounded-2xl bg-[#132420] border border-[#244238] shadow-sm">
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
                className={`group p-5 sm:p-6 rounded-2xl border transition-all duration-200 ${
                  isPlayingThisAyah
                    ? 'bg-[#18322A] border-amber-500/80 shadow-lg ring-1 ring-amber-500/30'
                    : 'bg-[#142520] hover:bg-[#182F28] border-[#213C33] hover:border-amber-500/40 shadow-sm'
                }`}
              >
                {/* Verse Header bar */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1C362F] text-xs text-[#8FA89E]">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-stone-950 font-mono font-bold text-xs flex items-center justify-center shadow-xs border border-amber-300">
                      {ayah.number}
                    </span>
                    <span className="font-amiri font-bold text-base text-amber-400 tracking-wide select-none">
                      الآية {ayah.number}
                    </span>
                  </div>

                  {/* Actions for this Ayah */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => playAyahDirectly(ayah.number)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isPlayingThisAyah
                          ? 'bg-amber-500 text-stone-950 font-bold'
                          : 'hover:bg-[#1F3C33] text-amber-300/80 hover:text-amber-300'
                      }`}
                      title="استماع لهذه الآية"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <button
                      onClick={() => setSelectedAyahForTafsir(ayah)}
                      className="p-1.5 rounded-lg hover:bg-[#1F3C33] text-[#8FA89E] hover:text-[#EAEFEA] transition-colors"
                      title="قراءة التفسير الميسر"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleCopyAyah(ayah)}
                      className="p-1.5 rounded-lg hover:bg-[#1F3C33] text-[#8FA89E] hover:text-[#EAEFEA] transition-colors relative"
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
                      className={`p-1.5 rounded-lg transition-colors ${
                        isBookmarked
                          ? 'text-amber-400'
                          : 'hover:bg-[#1F3C33] text-[#8FA89E] hover:text-amber-400'
                      }`}
                      title={isBookmarked ? 'علامة القراءة الحالية' : 'حفظ كعلامة للقراءة'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Arabic Quranic Text - Spacious, clear, uncrowded typography */}
                <p
                  className={`text-right text-[#F7FAF7] select-text transition-all ${getFontFamilyClass()}`}
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: '2.9',
                    wordSpacing: '0.24em',
                    paddingTop: '0.25rem',
                    paddingBottom: '0.5rem',
                  }}
                >
                  {ayah.text}
                  <span className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 mx-2.5 rounded-full border-2 border-amber-500/80 bg-[#1A332B] text-amber-300 font-mono text-xs tabular-nums select-none align-middle font-bold shadow-sm ring-1 ring-amber-400/20">
                    {ayah.number}
                  </span>
                </p>

                {/* Small compact Tafsir under the Ayah with blue verification badge and source */}
                {ayah.tafsir && (
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
        <div className="bg-[#142520] p-6 sm:p-12 rounded-3xl border border-[#213C33] shadow-md">
          <div
            className={`text-justify text-[#F7FAF7] select-text transition-all ${getFontFamilyClass()}`}
            style={{ fontSize: `${fontSize}px`, lineHeight: 3.1, wordSpacing: '0.24em' }}
            dir="rtl"
          >
            {ayahs.map((ayah) => {
              const isPlayingThisAyah = isPlaying && audioPlaybackMode === 'ayah' && activeAyahNumber === ayah.number;
              return (
                <span
                  key={ayah.number}
                  id={`ayah-${ayah.number}`}
                  onClick={() => setSelectedAyahForTafsir(ayah)}
                  className={`cursor-pointer transition-colors px-1 rounded-sm inline ${
                    isPlayingThisAyah
                      ? 'bg-[#1D3C32] text-amber-200 font-semibold ring-1 ring-amber-500/40'
                      : 'hover:bg-[#182E27]'
                  }`}
                  title={`انقر لعرض تفسير الآية ${ayah.number}`}
                >
                  {ayah.text}
                  <span className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 mx-2 rounded-full border-2 border-amber-500/80 bg-[#1A332B] text-amber-300 font-mono text-xs tabular-nums select-none align-middle font-bold shadow-xs">
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
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedAyahForTafsir(null)}
        >
          <div
            className="bg-[#142520] max-w-2xl w-full rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#2A4C40] text-right space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#213B33]">
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

      {/* Floating Bottom Audio Reciter Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#101E1A]/95 backdrop-blur-md border-t border-[#1F3A32] shadow-2xl text-[#EAEFEA] transition-all duration-300">
        <audio
          ref={audioRef}
          src={currentAudioSource}
          onEnded={handleAudioEnded}
          onError={() => {
            console.warn('Audio stream unavailable, toggling pause');
            setIsPlaying(false);
          }}
        />

        {/* Minimized Bar View (Ultra compact, low profile) */}
        {isAudioBarMinimized ? (
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-2 text-right">
            {/* Quick Info & Reciter name */}
            <div className="flex items-center gap-2 truncate">
              <span className="flex h-2 w-2 relative shrink-0">
                {isPlaying && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-amber-400' : 'bg-[#537367]'}`}></span>
              </span>
              <span className="text-xs text-amber-200 font-bold truncate font-cairo">
                {selectedReciter.name}
              </span>
              <span className="text-xs text-[#8FA89E] hidden xs:inline truncate">
                · سورة {currentSurah.name}
                {audioPlaybackMode === 'ayah' && ` (الآية ${activeAyahNumber})`}
              </span>
            </div>

            {/* Quick Actions & Expand Button */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Quick Play/Pause */}
              <button
                onClick={togglePlayPause}
                className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center shadow-md transition-transform active:scale-95"
                title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                )}
              </button>

              {/* Expand Bar Button */}
              <button
                onClick={() => setIsAudioBarMinimized(false)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#172D26] hover:bg-[#203D33] text-amber-300 rounded-lg border border-[#2D5347] transition-colors"
                title="تكبير وتوسيع شريط الصوت وقائمة المشايخ"
              >
                <span>تكبير الشريط</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Full Expanded Bar View */
          <div className="px-4 sm:px-8 py-3">
            {/* Minimize handle bar on top */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1A332B]/80">
              <div className="flex items-center gap-1.5 text-[11px] text-[#8FA89E] font-cairo">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>مشغّل التلاوة القرآنية وأصوات الشيوخ</span>
              </div>
              <button
                onClick={() => setIsAudioBarMinimized(true)}
                className="flex items-center gap-1 px-2 py-0.5 text-xs text-[#8FA89E] hover:text-amber-200 hover:bg-[#162B24] rounded-md transition-colors"
                title="تصغير شريط الصوت لأسفل الشاشة لتوفير المساحة"
              >
                <span>تصغير الشريط لأسفل</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
              {/* Right Zone: Current Reciter & Playing Target */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                <div className="text-right">
                  <span className="text-xs text-[#8FA89E] block font-cairo">
                    {audioPlaybackMode === 'ayah' ? (
                      <>
                        <span className="text-amber-400 font-bold">الآية {activeAyahNumber}</span> من سورة
                      </>
                    ) : (
                      'تلاوة كاملة لـ'
                    )}
                  </span>
                  <span className="text-sm font-bold text-amber-200 font-amiri">
                    سورة {currentSurah.name}
                  </span>
                </div>

                {/* Reciter Selector with enhanced clarity */}
                <select
                  value={selectedReciter.id}
                  onChange={(e) => {
                    const reciter = RECITERS.find((r) => r.id === e.target.value) || RECITERS[0];
                    setSelectedReciter(reciter);
                  }}
                  className="text-xs bg-[#162923] border border-[#27473C] rounded-lg px-2.5 py-1.5 text-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-400 max-w-[200px] truncate"
                  title="اختر القارئ أو الشيخ"
                >
                  {RECITERS.map((r) => (
                    <option key={r.id} value={r.id} className="bg-[#12221D] text-[#EAEFEA]">
                      الشيخ {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Center Zone: Playback Controls */}
              <div className="flex items-center gap-3">
                {/* Prev Ayah */}
                <button
                  onClick={handlePrevAyah}
                  disabled={activeAyahNumber <= 1}
                  className="p-2 text-[#8FA89E] hover:text-amber-300 disabled:opacity-30 transition-colors"
                  title="الآية السابقة"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                {/* Play / Pause Primary Button */}
                <button
                  onClick={togglePlayPause}
                  className="w-11 h-11 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg transition-all active:scale-95 font-bold"
                  aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل التلاوة'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                {/* Next Ayah */}
                <button
                  onClick={handleNextAyah}
                  disabled={activeAyahNumber >= currentSurah.ayahCount}
                  className="p-2 text-[#8FA89E] hover:text-amber-300 disabled:opacity-30 transition-colors"
                  title="الآية التالية"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
              </div>

              {/* Left Zone: Mode & Speed */}
              <div className="flex items-center gap-2">
                {/* Audio mode toggle */}
                <button
                  onClick={() => {
                    const nextMode = audioPlaybackMode === 'ayah' ? 'surah' : 'ayah';
                    setAudioPlaybackMode(nextMode);
                  }}
                  className="px-2.5 py-1 text-xs rounded-md bg-[#162923] text-amber-200 border border-[#27473C] hover:bg-[#1E3930] transition-colors font-medium"
                >
                  {audioPlaybackMode === 'ayah' ? 'وضع آية بآية' : 'تلاوة السورة كاملة'}
                </button>

                {/* Playback speed */}
                <button
                  onClick={() => {
                    const speeds = [1, 1.25, 1.5, 0.75];
                    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                    setPlaybackSpeed(speeds[nextIdx]);
                  }}
                  className="px-2 py-1 text-xs font-mono tabular-nums rounded-md bg-[#162923] text-amber-200 border border-[#27473C]"
                  title="سرعة التلاوة"
                >
                  {playbackSpeed}x
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Auto-Scroll Controls (شريط التحكم العائم المصغر بالتمرير التلقائي) */}
      {isAutoScrolling && (
        <div
          className="fixed bottom-14 sm:bottom-16 left-1/2 -translate-x-1/2 z-50 bg-[#0C1A16]/95 backdrop-blur-md border border-amber-500/40 rounded-full px-2.5 py-1 shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 text-[11px] font-cairo text-[#EAEFEA] select-none"
          dir="rtl"
        >
          {/* Status Indicator */}
          <div className="flex items-center gap-1 pl-1.5 border-l border-[#224438]/80 shrink-0" title="التمرير البطيء يعمل تلقائياً">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-amber-300 hidden sm:inline whitespace-nowrap">
              تمرير بطيء
            </span>
          </div>

          {/* Speed Selector (تبطيء وتسريع) */}
          <div className="flex items-center bg-[#142A23] p-0.5 rounded-full border border-[#23483B]/70 shrink-0">
            <button
              onClick={() => setScrollSpeed('very-slow')}
              className={`px-1.5 py-0.5 rounded-full text-[9px] transition-colors ${
                scrollSpeed === 'very-slow'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                  : 'text-[#8FA89E] hover:text-amber-200'
              }`}
              title="أبطأ (سلو موشن)"
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
              title="مريح (الوضع العادي)"
            >
              مريح
            </button>
            <button
              onClick={() => setScrollSpeed('medium')}
              className={`px-1.5 py-0.5 rounded-full text-[9px] transition-colors ${
                scrollSpeed === 'medium'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                  : 'text-[#8FA89E] hover:text-amber-200'
              }`}
              title="أسرع قليلاً"
            >
              أسرع
            </button>
          </div>

          {/* Pause Button */}
          <button
            onClick={() => setIsAutoScrolling(false)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[10px] transition-all shadow-xs shrink-0"
            title="إيقاف مؤقت للتمرير"
          >
            <Pause className="w-2.5 h-2.5 fill-current" />
            <span>إيقاف</span>
          </button>

          {/* Close */}
          <button
            onClick={() => setIsAutoScrolling(false)}
            className="text-[#8FA89E] hover:text-rose-300 transition-colors p-0.5 text-xs font-bold leading-none shrink-0"
            title="إغلاق الشريط"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
