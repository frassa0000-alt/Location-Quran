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
    <div className="space-y-6 pb-12">
      {/* Sleek, Lightweight Header (Fast, Minimalist, No Clutter) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-amber-200">
            فهرس سور القرآن الكريم
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            ١١٤ سورة · ٣٠ جزءاً · تلاوة وتفسير ميسر
          </p>
        </div>

        {/* Top Actions: Full Mushaf & Last Read Bookmark */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenFullMushaf && (
            <button
              onClick={onOpenFullMushaf}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <BookOpen className="w-4 h-4 fill-current" />
              <span>المصحف الشريف</span>
            </button>
          )}

          {lastReadBookmark && (
            <button
              onClick={() => onSelectSurah(lastReadBookmark.surahNumber, lastReadBookmark.ayahNumber)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-200 text-xs transition-all shadow-xs"
              title="متابعة القراءة من آخر موضع"
            >
              <BookMarked className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>آخر موضع: سورة {lastReadBookmark.surahName} (الآية {lastReadBookmark.ayahNumber})</span>
            </button>
          )}
        </div>
      </div>

      {/* Control Strip: Search & Filter Tabs */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث باسم السورة، رقمها، أو معناها..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 text-sm rounded-xl bg-slate-900/90 border border-slate-800 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/40 text-slate-100 placeholder:text-slate-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded-md hover:bg-slate-800"
              >
                مسح
              </button>
            )}
          </div>

          {/* Revelation Filter Segmented Buttons */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-slate-800 text-amber-300 border border-amber-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              الكل (١١٤)
            </button>
            <button
              onClick={() => setFilterType('meccan')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                filterType === 'meccan'
                  ? 'bg-slate-800 text-amber-300 border border-amber-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              مكية (٨٦)
            </button>
            <button
              onClick={() => setFilterType('medinan')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                filterType === 'medinan'
                  ? 'bg-slate-800 text-amber-300 border border-amber-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              مدنية (٢٨)
            </button>
            <button
              onClick={() => setFilterType('popular')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                filterType === 'popular'
                  ? 'bg-slate-800 text-amber-300 border border-amber-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              السور الشائعة
            </button>
          </div>
        </div>

        {/* Quick Juz Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-slate-400 shrink-0 font-medium ml-1">
            الأجزاء:
          </span>
          <button
            onClick={() => setSelectedJuz('all')}
            className={`px-2.5 py-1 rounded-lg shrink-0 transition-all font-medium ${
              selectedJuz === 'all'
                ? 'bg-slate-800 text-amber-300 border border-amber-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            كل الأجزاء
          </button>
          {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
            <button
              key={juz}
              onClick={() => setSelectedJuz(juz)}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-all font-medium ${
                selectedJuz === juz
                  ? 'bg-slate-800 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              الجزء {juz}
            </button>
          ))}
        </div>
      </div>

      {/* Surahs Grid */}
      {filteredSurahs.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
          <p className="text-slate-400 font-medium text-base mb-2">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredSurahs.map((surah) => {
            const isMeccan = surah.revelationType === 'Meccan';
            return (
              <div
                key={surah.number}
                className="group relative bg-[#0D1217] hover:bg-[#121820] rounded-2xl p-4 border border-slate-800/80 hover:border-amber-500/50 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/40 flex flex-col justify-between gap-3 text-right"
              >
                {/* Upper Row: Number Badge, Surah Name & Revelation Type */}
                <div
                  onClick={() => onSelectSurah(surah.number)}
                  className="flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Decorative Number Badge */}
                    <div className="w-10 h-10 rounded-xl bg-slate-800/80 text-amber-300 group-hover:bg-amber-500 group-hover:text-stone-950 flex items-center justify-center font-mono tabular-nums text-sm font-bold transition-colors shrink-0 border border-slate-700/60 shadow-xs">
                      {surah.number}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-amiri text-2xl font-bold text-slate-100 group-hover:text-amber-200 transition-colors leading-snug truncate">
                        سُورَةُ {surah.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-cairo truncate">
                        {surah.englishName} ({surah.englishNameTranslation})
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-800/60 text-slate-300 border border-slate-700/50 shrink-0 font-cairo">
                    {isMeccan ? 'مكية' : 'مدنية'}
                  </span>
                </div>

                {/* Lower Row: Juz, Ayah Count, and Actions */}
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 gap-2">
                  <div className="flex items-center gap-2 text-xs font-cairo">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 font-bold border border-amber-500/25">
                      الجزء {surah.juz}
                    </span>
                    <span className="text-slate-400 text-xs">
                      {surah.ayahCount} آية
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickPlaySurah(surah.number);
                      }}
                      className="w-8 h-8 rounded-lg text-slate-300 hover:text-stone-950 hover:bg-amber-400 border border-slate-800 hover:border-amber-400 transition-all flex items-center justify-center shrink-0 shadow-xs active:scale-95"
                      title={`استماع لتلاوة سورة ${surah.name}`}
                      aria-label={`استماع لتلاوة سورة ${surah.name}`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <button
                      onClick={() => onSelectSurah(surah.number)}
                      className="h-8 px-3 rounded-lg text-xs font-semibold font-cairo text-amber-200 bg-slate-800/90 hover:bg-amber-400 hover:text-stone-950 border border-slate-700 hover:border-amber-400 transition-all inline-flex items-center justify-center gap-1.5 shrink-0 shadow-xs active:scale-95"
                      title={`قراءة وتفسير سورة ${surah.name}`}
                    >
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span className="leading-none pt-0.5 font-bold">قراءة</span>
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
