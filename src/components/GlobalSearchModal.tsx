import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  BookOpen,
  Volume2,
  Copy,
  Check,
  ChevronRight,
  Filter,
  Sparkles,
  ExternalLink,
  Layers,
  ArrowRight,
  Loader2,
  Navigation,
} from 'lucide-react';
import { SURAHS_LIST, SurahMeta } from '../data/surahs';
import {
  searchQuran,
  parseVerseReference,
  QuranSearchResultItem,
  highlightMatch,
} from '../services/quranSearchService';
import { RECITERS, getAyahAudioUrl } from '../data/reciters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSurah: (surahNumber: number, ayahNumber?: number) => void;
}

type SearchTab = 'text' | 'number';

const FAMOUS_SEARCH_CHIPS = [
  { label: 'آية الكرسي', query: 'الله لا اله الا هو الحي القيوم' },
  { label: 'آية النور', query: 'الله نور السماوات والارض' },
  { label: 'خواتيم البقرة', query: 'امن الرسول بما انزل اليه' },
  { label: 'سورة الكهف (18:1)', query: '18:1' },
  { label: 'سورة يس (36:1)', query: '36:1' },
  { label: 'آيات الصبر', query: 'الصابرين' },
  { label: 'آيات الجنة', query: 'جنات تجري' },
  { label: 'الاستغفار', query: 'استغفروا ربكم' },
];

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectSurah,
}) => {
  const [activeTab, setActiveTab] = useState<SearchTab>('text');
  const [query, setQuery] = useState('');
  const [surahScope, setSurahScope] = useState<number>(0); // 0 = all Quran
  const [results, setResults] = useState<QuranSearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedAyahKey, setCopiedAyahKey] = useState<string | null>(null);

  // Audio preview playback inside search
  const [playingAyahKey, setPlayingAyahKey] = useState<string | null>(null);
  const searchAudioRef = useRef<HTMLAudioElement | null>(null);

  // Direct Number Navigation State
  const [selectedSurahForDirect, setSelectedSurahForDirect] = useState<number>(1);
  const [selectedAyahForDirect, setSelectedAyahForDirect] = useState<number>(1);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
      if (searchAudioRef.current) {
        searchAudioRef.current.pause();
        searchAudioRef.current = null;
      }
      setPlayingAyahKey(null);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Direct reference detection (e.g. "2:255" or "البقرة 255")
  const directRef = query.trim() ? parseVerseReference(query) : null;

  // Search when query or scope changes
  useEffect(() => {
    const q = query.trim();

    if (!q || q.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    setIsSearching(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const { results: matched } = await searchQuran(q, surahScope);
        setResults(matched);
      } catch (err) {
        console.warn('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [query, surahScope]);

  if (!isOpen) return null;

  // Handle direct navigation
  const handleJumpToAyah = (surahNum: number, ayahNum: number = 1) => {
    if (searchAudioRef.current) {
      searchAudioRef.current.pause();
      searchAudioRef.current = null;
    }
    onSelectSurah(surahNum, ayahNum);
    onClose();
  };

  // Copy Ayah to clipboard
  const handleCopyAyah = (surahName: string, ayahNum: number, text: string) => {
    const key = `${surahName}_${ayahNum}`;
    const copyText = `﴿${text}﴾ [سورة ${surahName}: ${ayahNum}]`;
    navigator.clipboard.writeText(copyText);
    setCopiedAyahKey(key);
    setTimeout(() => setCopiedAyahKey(null), 2000);
  };

  // Play Ayah audio preview directly in search
  const handleTogglePlayAyah = (surahNumber: number, ayahNumber: number) => {
    const key = `${surahNumber}_${ayahNumber}`;

    if (playingAyahKey === key && searchAudioRef.current) {
      searchAudioRef.current.pause();
      setPlayingAyahKey(null);
      return;
    }

    if (searchAudioRef.current) {
      searchAudioRef.current.pause();
    }

    const defaultReciter = RECITERS[0];
    const url = getAyahAudioUrl(defaultReciter, surahNumber, ayahNumber);
    const audio = new Audio(url);
    searchAudioRef.current = audio;
    setPlayingAyahKey(key);

    audio.play().catch((err) => {
      console.warn('Playback error:', err);
      setPlayingAyahKey(null);
    });

    audio.onended = () => {
      setPlayingAyahKey(null);
    };
  };

  // Matched Surahs list if searching by surah name
  const matchedSurahs = SURAHS_LIST.filter((s) => {
    if (!query.trim()) return false;
    const q = query.trim().toLowerCase();
    const cleanName = s.name.replace(/[ًٌٍَُِّْ]/g, '');
    return (
      String(s.number) === q ||
      s.name.includes(q) ||
      cleanName.includes(q) ||
      s.englishName.toLowerCase().includes(q)
    );
  }).slice(0, 3);

  const selectedDirectSurahMeta = SURAHS_LIST.find((s) => s.number === selectedSurahForDirect) || SURAHS_LIST[0];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-8 sm:pt-16 px-3 sm:px-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="ios-liquid-glass w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden text-right flex flex-col max-h-[88vh] border border-white/20"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header with Title and Mode Switcher Tabs */}
        <div className="px-4 sm:px-6 py-4 border-b border-white/10 bg-gradient-to-r from-[#0C221A] to-[#0A1713] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shadow-xs">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-amiri font-bold text-lg text-amber-200 leading-tight">
                محرك البحث القرآني المتقدم
              </h2>
              <p className="text-[11px] text-slate-300 font-cairo">
                ابحث بالكلمات، الآيات الكاملة، أو برقم السورة والآية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher Tabs */}
            <div className="inline-flex p-1 rounded-2xl bg-black/40 border border-white/10 text-xs">
              <button
                onClick={() => setActiveTab('text')}
                className={`px-3 py-1 rounded-xl transition-all font-medium ${
                  activeTab === 'text'
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                البحث بالنص والآيات
              </button>
              <button
                onClick={() => setActiveTab('number')}
                className={`px-3 py-1 rounded-xl transition-all font-medium ${
                  activeTab === 'number'
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                برقم السورة والآية
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab 1: Text & Verse Search */}
        {activeTab === 'text' && (
          <>
            {/* Search Input Bar & Surah Scope Filter */}
            <div className="p-3 sm:p-4 border-b border-white/10 bg-white/5 space-y-3">
              <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-black/40 border border-white/15 focus-within:border-amber-400 transition-all">
                <Search className="w-4 h-4 text-amber-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="اكتب كلمة، آية، أو رقماً (مثال: 'الجنة'، 'إن مع العسر يسرا'، أو '2:255')..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 text-xs sm:text-sm bg-transparent border-none focus:outline-none text-slate-100 placeholder:text-slate-400 font-cairo"
                />
                {isSearching && <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />}
                {query && (
                  <button
                    onClick={() => {
                      setQuery('');
                      setResults([]);
                    }}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Scope selector & Suggestions */}
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-300 text-[11px]">نطاق البحث:</span>
                  <select
                    value={surahScope}
                    onChange={(e) => setSurahScope(Number(e.target.value))}
                    className="bg-[#0B1A14] text-amber-200 border border-white/15 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value={0}>كامل القرآن الكريم (114 سورة)</option>
                    {SURAHS_LIST.map((s) => (
                      <option key={s.number} value={s.number}>
                        سورة {s.name} ({s.number})
                      </option>
                    ))}
                  </select>
                </div>

                {results.length > 0 && (
                  <span className="text-[11px] text-amber-300/90 font-medium">
                    تم العثور على {results.length} آية كريمة
                  </span>
                )}
              </div>
            </div>

            {/* Quick Chips Presets */}
            {!query && (
              <div className="px-4 py-2.5 bg-black/20 border-b border-white/5 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
                <span className="text-[10px] text-amber-400/90 font-bold shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  محطات بحث سريعة:
                </span>
                {FAMOUS_SEARCH_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(chip.query)}
                    className="px-2.5 py-1 rounded-full ios-glass-pill text-[11px] text-slate-300 hover:text-amber-200 whitespace-nowrap transition-all border border-white/10"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}

            {/* Direct Reference Card (if parsed like "2:255" or "البقرة 255") */}
            {directRef && (
              <div className="p-3 bg-amber-500/15 border-b border-amber-500/30 flex items-center justify-between flex-wrap gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-400 text-stone-950 font-bold flex items-center justify-center font-mono text-xs">
                    {directRef.ayahNumber}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-200">
                      انتقال مباشر للآية {directRef.ayahNumber} من سورة {directRef.surah.name}
                    </span>
                    <p className="text-[10px] text-slate-300 font-cairo">
                      سورة {directRef.surah.name} ({directRef.surah.englishName}) · الجزء {directRef.surah.juz} · صفحة {directRef.surah.page}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleJumpToAyah(directRef.surah.number, directRef.ayahNumber)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs flex items-center gap-1 shadow-md transition-all"
                >
                  <span>فتح في القارئ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Matched Surahs Quick Jump */}
            {matchedSurahs.length > 0 && query.trim().length >= 2 && !directRef && (
              <div className="p-2.5 bg-black/30 border-b border-white/10 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-slate-400">مطابقة في أسماء السور:</span>
                {matchedSurahs.map((s) => (
                  <button
                    key={s.number}
                    onClick={() => handleJumpToAyah(s.number, 1)}
                    className="px-3 py-1 rounded-xl bg-[#10251E] border border-amber-500/30 text-amber-200 hover:text-white hover:border-amber-400 text-xs flex items-center gap-1.5 transition-all"
                  >
                    <span className="font-mono text-[10px] text-amber-400 font-bold">{s.number}</span>
                    <span className="font-amiri font-bold">سورة {s.name}</span>
                    <span className="text-[10px] text-slate-400">({s.ayahCount} آية)</span>
                  </button>
                ))}
              </div>
            )}

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 divide-y divide-white/5">
              {!query.trim() ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-300">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="font-amiri font-bold text-lg text-amber-200">
                    ابحث في آيات القرآن الكريم
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    يمكنك البحث عن أي كلمة مثل: «الرحمن»، «الجنة»، أو كتابة عبارة كاملة مثل: «ألا بذكر الله تطمئن القلوب»، أو رقم السورة والآية مثل: «2:255».
                  </p>
                </div>
              ) : isSearching ? (
                <div className="py-12 text-center space-y-3">
                  <Loader2 className="w-7 h-7 text-amber-400 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">جارٍ البحث في آيات وسور القرآن الكريم...</p>
                </div>
              ) : results.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <p className="text-sm font-semibold text-slate-300">
                    لم نعثر على آيات مطابقة لـ «{query}»
                  </p>
                  <p className="text-xs text-slate-500">
                    تأكد من صحة الكلمة، أو جرّب البحث بدون تشكيل أو بكلمة أخرى
                  </p>
                </div>
              ) : (
                results.map((res) => {
                  const ayahKey = `${res.surahNumber}_${res.ayahNumber}`;
                  const isPlaying = playingAyahKey === ayahKey;
                  const isCopied = copiedAyahKey === `${res.surahName}_${res.ayahNumber}`;
                  const parts = highlightMatch(res.text, query);

                  return (
                    <div
                      key={res.numberInQuran}
                      className="pt-2.5 first:pt-0 group p-3 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
                    >
                      {/* Top Metadata Header */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center font-mono text-[11px] font-bold border border-amber-400/30">
                            {res.ayahNumber}
                          </span>
                          <div>
                            <span className="font-amiri font-bold text-sm text-amber-200">
                              سورة {res.surahName}
                            </span>
                            <span className="text-[11px] text-slate-400 mr-1.5 font-cairo">
                              الآية {res.ayahNumber} · {res.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5">
                          {/* Audio preview */}
                          <button
                            onClick={() => handleTogglePlayAyah(res.surahNumber, res.ayahNumber)}
                            className={`p-1.5 rounded-xl text-xs flex items-center gap-1 transition-all ${
                              isPlaying
                                ? 'bg-amber-400 text-stone-950 font-bold'
                                : 'ios-glass-pill text-slate-300 hover:text-amber-200'
                            }`}
                            title={isPlaying ? 'إيقاف التلاوة' : 'استماع لتلاوة الآية'}
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] hidden sm:inline">
                              {isPlaying ? 'إيقاف' : 'استماع'}
                            </span>
                          </button>

                          {/* Copy */}
                          <button
                            onClick={() => handleCopyAyah(res.surahName, res.ayahNumber, res.text)}
                            className="p-1.5 rounded-xl ios-glass-pill text-slate-400 hover:text-amber-200 transition-colors"
                            title="نسخ الآية الكريمة"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          {/* Jump to Reader */}
                          <button
                            onClick={() => handleJumpToAyah(res.surahNumber, res.ayahNumber)}
                            className="px-2.5 py-1 rounded-xl bg-amber-400/20 hover:bg-amber-400 text-amber-200 hover:text-stone-950 font-semibold text-[11px] flex items-center gap-1 transition-all border border-amber-400/30"
                            title="فتح الآية الكريمة في القارئ"
                          >
                            <span>فتح</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Verse Text with Highlights */}
                      <p
                        className="font-quran text-base sm:text-lg text-slate-100 leading-loose py-1 select-text"
                        style={{ wordSpacing: '0.18em' }}
                      >
                        {parts ? (
                          <>
                            {parts.before}{' '}
                            <mark className="bg-amber-400/30 text-amber-200 font-bold px-1.5 py-0.5 rounded-md ring-1 ring-amber-400/60">
                              {parts.match}
                            </mark>{' '}
                            {parts.after}
                          </>
                        ) : (
                          res.text
                        )}
                        <span className="inline-flex items-center justify-center min-w-[1.6rem] h-6 px-1.5 mx-1.5 rounded-full border border-amber-500/50 text-amber-400 font-mono text-[10px] tabular-nums select-none align-middle font-bold">
                          {res.ayahNumber}
                        </span>
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Tab 2: Direct Surah & Ayah Number Navigation */}
        {activeTab === 'number' && (
          <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
            <div className="text-center space-y-1">
              <h3 className="font-amiri font-bold text-lg text-amber-200">
                انتقال مباشر برقم السورة ورقم الآية
              </h3>
              <p className="text-xs text-slate-400">
                اختر السورة الكريمة وحدد رقم الآية لتنتقل إليها فوراً في المصحف الشريف
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
              {/* Surah Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-300">السورة الكريمة:</label>
                <select
                  value={selectedSurahForDirect}
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    setSelectedSurahForDirect(num);
                    setSelectedAyahForDirect(1);
                  }}
                  className="w-full bg-[#0B1A14] text-slate-100 border border-white/20 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                >
                  {SURAHS_LIST.map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. سورة {s.name} ({s.ayahCount} آية)
                    </option>
                  ))}
                </select>
              </div>

              {/* Ayah Number Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300">رقم الآية:</label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    (من 1 إلى {selectedDirectSurahMeta.ayahCount})
                  </span>
                </div>
                <input
                  type="number"
                  min={1}
                  max={selectedDirectSurahMeta.ayahCount}
                  value={selectedAyahForDirect}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      setSelectedAyahForDirect(
                        Math.max(1, Math.min(val, selectedDirectSurahMeta.ayahCount))
                      );
                    }
                  }}
                  className="w-full bg-[#0B1A14] text-slate-100 border border-white/20 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-amber-400 font-mono text-center font-bold"
                />
              </div>
            </div>

            {/* Selected Surah Preview Badge */}
            <div className="max-w-xl mx-auto p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-amiri font-bold text-base text-amber-200">
                  سورة {selectedDirectSurahMeta.name} — الآية {selectedAyahForDirect}
                </div>
                <div className="text-[11px] text-slate-400">
                  {selectedDirectSurahMeta.englishName} · الجزء {selectedDirectSurahMeta.juz} · صفحة {selectedDirectSurahMeta.page}
                </div>
              </div>

              <button
                onClick={() => handleJumpToAyah(selectedDirectSurahMeta.number, selectedAyahForDirect)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg transition-all"
              >
                <span>انتقال إلى الآية</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
