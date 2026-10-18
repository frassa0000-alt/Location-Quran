import React, { useState, useMemo } from 'react';
import { Search, BookMarked, Play, BookOpen } from 'lucide-react';
import { SURAHS_LIST, SurahMeta, POPULAR_SURAHS } from '../data/surahs';

interface SurahCatalogProps {
  onSelectSurah: (surahNumber: number, startAyah?: number) => void;
  onQuickPlaySurah: (surahNumber: number) => void;
  onOpenFullMushaf?: () => void;
  lastReadBookmark?: { surahNumber: number; ayahNumber: number; surahName: string; timestamp: number } | null;
}

export const SurahCatalog: React.FC<SurahCatalogProps> = ({
  onSelectSurah,
  onQuickPlaySurah,
  onOpenFullMushaf,
  lastReadBookmark,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'meccan' | 'medinan' | 'popular'>('all');
  const [selectedJuz, setSelectedJuz] = useState<number | 'all'>('all');

  const filteredSurahs = useMemo(() => {
    return SURAHS_LIST.filter((surah) => {
      // Filter by type
      if (filterType === 'meccan' && surah.revelationType !== 'Meccan') return false;
      if (filterType === 'medinan' && surah.revelationType !== 'Medinan') return false;
      if (filterType === 'popular' && !POPULAR_SURAHS.includes(surah.number)) return false;

      // Filter by Juz
      if (selectedJuz !== 'all' && surah.juz !== selectedJuz) return false;

      // Filter by Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesNumber = String(surah.number) === query;
        const matchesArabic = surah.name.includes(query) || surah.name.replace(/[ًٌٍَُِّْ]/g, '').includes(query.replace(/[ًٌٍَُِّْ]/g, ''));
        const matchesEnglish = surah.englishName.toLowerCase().includes(query) || surah.englishNameTranslation.toLowerCase().includes(query);
        return matchesNumber || matchesArabic || matchesEnglish;
      }

      return true;
    });
  }, [searchQuery, filterType, selectedJuz]);

  return (
    <div className="space-y-8 pb-12">
      {/* Editorial Sacred Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#071912] via-[#0E291F] to-[#06140E] text-[#EAEFEA] p-7 sm:p-12 shadow-2xl border border-amber-500/30 transition-all">
        {/* Subtle animated background radial light */}
        <div className="absolute top-0 left-0 w-full h-full opacity-15 pointer-events-none bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5 mb-3.5">
            <span className="text-xs uppercase tracking-widest text-amber-300 font-bold block">
              كتاب الله العزيز · نور وهداية للعالمين
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/40 font-bold">
              الإصدار المطور
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-amiri font-bold mb-3.5 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-200">
            القرآن الكريم وترتيل الآيات
          </h1>
          <p className="text-[#AEC7BD] text-sm sm:text-base leading-relaxed mb-7 font-cairo">
            تصفح جميع سور القرآن الكريم الـ ١١٤، استمع بأعذب أصوات كبار القراء، واطلع على التفسير الميسر لكل آية مع حفظ موضع تلاوتك.
          </p>

          {/* Actions: Full Quran Manual Reading & Last Read */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {onOpenFullMushaf && (
              <button
                onClick={onOpenFullMushaf}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                <BookOpen className="w-4 h-4 fill-current" />
                <span>المصحف الشريف</span>
              </button>
            )}

            {lastReadBookmark && (
              <div className="inline-flex items-center gap-3 p-2.5 sm:px-4 sm:py-2 rounded-2xl bg-[#0C1D17]/90 backdrop-blur-md border border-amber-500/35 text-white shadow-lg">
                <BookMarked className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="text-right">
                  <span className="text-[11px] text-[#8ea89d] block leading-tight">آخر موضع:</span>
                  <span className="text-xs font-bold text-[#EAEFEA]">
                    سورة {lastReadBookmark.surahName} · <span className="text-amber-400 font-bold">الآية {lastReadBookmark.ayahNumber}</span>
                  </span>
                </div>
                <button
                  onClick={() => onSelectSurah(lastReadBookmark.surahNumber, lastReadBookmark.ayahNumber)}
                  className="mr-1 px-3 py-1 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl transition-all shadow-xs hover:scale-105 active:scale-95"
                >
                  متابعة
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured Daily Ayah Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#11241D] via-[#152F26] to-[#11241D] border border-amber-500/30 p-5 sm:p-6 shadow-md text-right">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>آية وتدبر</span>
            </div>
            <p className="font-amiri text-lg sm:text-2xl text-amber-100 font-bold leading-relaxed">
              «أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ»
            </p>
            <p className="text-xs text-[#8BA79C]">
              سورة الرعد · الآية ٢٨
            </p>
          </div>
          <button
            onClick={() => onSelectSurah(13, 28)}
            className="px-3.5 py-1.5 rounded-xl bg-[#1A382D] hover:bg-[#224A3B] border border-amber-500/40 text-amber-200 text-xs font-bold transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            تلاوة وتفسير الآية
          </button>
        </div>
      </div>

      {/* Control Strip: Search & Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/70" />
            <input
              type="text"
              placeholder="ابحث باسم السورة، رقمها، أو معناها..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-11 pl-4 py-3 text-sm rounded-2xl bg-[#0D1D18]/90 backdrop-blur-md border border-amber-500/25 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 text-[#EAEFEA] placeholder:text-[#6F8F84] shadow-inner transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#7A988E] hover:text-[#EAEFEA] px-1.5 py-0.5 rounded-md hover:bg-[#1A332A]"
              >
                مسح
              </button>
            )}
          </div>

          {/* Revelation Filter Segmented Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#0A1612]/90 backdrop-blur-md rounded-2xl border border-amber-500/20 shadow-md">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-gradient-to-r from-amber-500/25 via-[#193A2F] to-emerald-600/25 text-amber-300 border border-amber-500/50 shadow-inner font-bold'
                  : 'text-[#8FA89E] hover:text-[#EAEFEA] hover:bg-[#122820]'
              }`}
            >
              الكل (١١٤)
            </button>
            <button
              onClick={() => setFilterType('meccan')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                filterType === 'meccan'
                  ? 'bg-gradient-to-r from-amber-500/25 via-[#193A2F] to-emerald-600/25 text-amber-300 border border-amber-500/50 shadow-inner font-bold'
                  : 'text-[#8FA89E] hover:text-[#EAEFEA] hover:bg-[#122820]'
              }`}
            >
              مكية (٨٦)
            </button>
            <button
              onClick={() => setFilterType('medinan')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                filterType === 'medinan'
                  ? 'bg-gradient-to-r from-amber-500/25 via-[#193A2F] to-emerald-600/25 text-amber-300 border border-amber-500/50 shadow-inner font-bold'
                  : 'text-[#8FA89E] hover:text-[#EAEFEA] hover:bg-[#122820]'
              }`}
            >
              مدنية (٢٨)
            </button>
            <button
              onClick={() => setFilterType('popular')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                filterType === 'popular'
                  ? 'bg-gradient-to-r from-amber-500/25 via-[#193A2F] to-emerald-600/25 text-amber-300 border border-amber-500/50 shadow-inner font-bold'
                  : 'text-[#8FA89E] hover:text-[#EAEFEA] hover:bg-[#122820]'
              }`}
            >
              السور الشائعة
            </button>
          </div>
        </div>

        {/* Quick Juz Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-amber-400/80 shrink-0 font-bold ml-1">
            الأجزاء:
          </span>
          <button
            onClick={() => setSelectedJuz('all')}
            className={`px-3 py-1.5 rounded-xl shrink-0 transition-all font-semibold ${
              selectedJuz === 'all'
                ? 'bg-[#1D3E33] text-amber-300 border border-amber-500/50 shadow-xs'
                : 'bg-[#0E1E19]/80 text-[#8FA89E] hover:text-[#EAEFEA] hover:border-amber-500/30 border border-[#1E3730]'
            }`}
          >
            كل الأجزاء
          </button>
          {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
            <button
              key={juz}
              onClick={() => setSelectedJuz(juz)}
              className={`px-3 py-1.5 rounded-xl shrink-0 transition-all font-semibold ${
                selectedJuz === juz
                  ? 'bg-[#1D3E33] text-amber-300 border border-amber-500/50 shadow-xs'
                  : 'bg-[#0E1E19]/80 text-[#8FA89E] hover:text-[#EAEFEA] hover:border-amber-500/30 border border-[#1E3730]'
              }`}
            >
              الجزء {juz}
            </button>
          ))}
        </div>
      </div>

      {/* Surahs Grid */}
      {filteredSurahs.length === 0 ? (
        <div className="text-center py-16 bg-[#0E1E19]/90 rounded-2xl border border-amber-500/20">
          <p className="text-[#8FA89E] font-medium text-base mb-2">
            لم يتم العثور على سور مطابقة للبحث
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
              setSelectedJuz('all');
            }}
            className="text-xs text-amber-400 font-semibold hover:underline"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSurahs.map((surah) => {
            const isMeccan = surah.revelationType === 'Meccan';
            return (
              <div
                key={surah.number}
                className="group relative bg-gradient-to-b from-[#10241E]/95 via-[#0C1C17]/95 to-[#081511]/95 backdrop-blur-md rounded-2xl p-5 border border-amber-500/20 hover:border-amber-400/60 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/60 flex flex-col justify-between gap-3.5 text-right overflow-hidden"
              >
                {/* Top Subtle Hairline Sheen */}
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent pointer-events-none group-hover:via-amber-300/70 transition-colors" />

                {/* Upper Row: Number Badge, Surah Name & Revelation Type */}
                <div
                  onClick={() => onSelectSurah(surah.number)}
                  className="flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Decorative Number Badge */}
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1A3D31] to-[#0F261E] text-amber-300 group-hover:from-amber-500 group-hover:to-amber-600 group-hover:text-stone-950 flex items-center justify-center font-mono tabular-nums text-sm font-bold transition-all duration-300 shrink-0 border border-amber-500/40 shadow-md group-hover:scale-105">
                      {surah.number}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-amiri text-2xl font-bold text-amber-100 group-hover:text-amber-300 transition-colors leading-snug truncate">
                        سُورَةُ {surah.name}
                      </h3>
                      <p className="text-[11px] text-[#7A988E] font-cairo truncate">
                        {surah.englishName} ({surah.englishNameTranslation})
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] px-2.5 py-1 rounded-xl bg-[#132E24]/90 text-amber-200/90 border border-amber-500/30 shrink-0 font-cairo shadow-2xs">
                    {isMeccan ? 'مكية' : 'مدنية'}
                  </span>
                </div>

                {/* Lower Row: Prominently Visible 'الجزء' & Ayah count on right, Action Buttons on left */}
                <div className="flex items-center justify-between pt-3 border-t border-amber-500/15 gap-2">
                  <div className="flex items-center gap-2 text-xs font-cairo">
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
                      الجزء {surah.juz}
                    </span>
                    <span className="text-[#8FA89E] text-xs">
                      {surah.ayahCount} آية
                    </span>
                  </div>

                  {/* Actions: completely aligned and consistent */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickPlaySurah(surah.number);
                      }}
                      className="w-8 h-8 rounded-xl text-amber-400 hover:text-stone-950 hover:bg-amber-400 border border-amber-500/30 hover:border-amber-300 transition-all flex items-center justify-center shrink-0 shadow-xs active:scale-95"
                      title={`استماع لتلاوة سورة ${surah.name}`}
                      aria-label={`استماع لتلاوة سورة ${surah.name}`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <button
                      onClick={() => onSelectSurah(surah.number)}
                      className="h-8 px-3 rounded-xl text-xs font-bold font-cairo text-amber-200 bg-[#16332A] hover:bg-amber-400 hover:text-stone-950 border border-amber-500/40 transition-all inline-flex items-center justify-center gap-1.5 shrink-0 shadow-xs active:scale-95 min-w-[76px]"
                      title={`قراءة وتفسير سورة ${surah.name}`}
                    >
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span className="leading-none pt-0.5">قراءة</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
