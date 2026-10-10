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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c241c] via-[#123126] to-[#0a1814] text-[#EAEFEA] p-6 sm:p-10 shadow-xl border border-[#214336]">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 max-w-3xl">
          <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold block mb-2">
            كتاب الله العزيز · نور وهداية للعالمين
          </span>
          <h1 className="text-3xl sm:text-5xl font-amiri font-bold mb-3 tracking-wide text-amber-200">
            القرآن الكريم وترتيل الآيات
          </h1>
          <p className="text-[#b5cbbf] text-sm sm:text-base leading-relaxed mb-6 font-cairo">
            تصفح جميع سور القرآن الكريم الـ ١١٤، استمع بأعذب أصوات كبار القراء، واطلع على التفسير الميسر لكل آية مع حفظ موضع تلاوتك.
          </p>

          {/* Actions: Full Quran Manual Reading & Last Read */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {onOpenFullMushaf && (
              <button
                onClick={onOpenFullMushaf}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs sm:text-sm shadow-lg transition-all active:scale-95"
              >
                <BookOpen className="w-4 h-4 fill-current" />
                <span>المصحف الشريف</span>
              </button>
            )}

            {lastReadBookmark && (
              <div className="inline-flex items-center gap-2.5 p-2 sm:px-3 sm:py-2 rounded-xl bg-[#142921]/90 backdrop-blur-md border border-[#2a5041] text-white shadow-md">
                <BookMarked className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="text-right">
                  <span className="text-[11px] text-[#8ea89d] block leading-tight">آخر موضع:</span>
                  <span className="text-xs font-bold text-[#EAEFEA]">
                    سورة {lastReadBookmark.surahName} · <span className="text-amber-400 font-bold">الآية {lastReadBookmark.ayahNumber}</span>
                  </span>
                </div>
                <button
                  onClick={() => onSelectSurah(lastReadBookmark.surahNumber, lastReadBookmark.ayahNumber)}
                  className="mr-1 px-2.5 py-1 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg transition-colors shadow-xs"
                >
                  متابعة
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Control Strip: Search & Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A988E]" />
            <input
              type="text"
              placeholder="ابحث باسم السورة، رقمها، أو معناها..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 text-sm rounded-xl bg-[#132420] border border-[#223E36] focus:outline-none focus:ring-2 focus:ring-amber-500/60 text-[#EAEFEA] placeholder:text-[#7A988E]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#7A988E] hover:text-[#EAEFEA] px-1"
              >
                مسح
              </button>
            )}
          </div>

          {/* Revelation Filter Segmented Buttons */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-[#101D19] rounded-xl border border-[#1C362F]">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-[#1C3A31] text-amber-300 border border-[#2D5447] shadow-xs font-bold'
                  : 'text-[#8FA89E] hover:text-[#EAEFEA]'
              }`}
            >
              الكل (١١٤)
            </button>
            <button
              onClick={() => setFilterType('meccan')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                filterType === 'meccan'
                  ? 'bg-[#1C3A31] text-amber-300 border border-[#2D5447] shadow-xs font-bold'
                  : 'text-[#8FA89E] hover:text-[#EAEFEA]'
              }`}
            >
              مكية (٨٦)
            </button>
            <button
              onClick={() => setFilterType('medinan')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                filterType === 'medinan'
                  ? 'bg-[#1C3A31] text-amber-300 border border-[#2D5447] shadow-xs font-bold'
                  : 'text-[#8FA89E] hover:text-[#EAEFEA]'
              }`}
            >
              مدنية (٢٨)
            </button>
            <button
              onClick={() => setFilterType('popular')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                filterType === 'popular'
                  ? 'bg-[#1C3A31] text-amber-300 border border-[#2D5447] shadow-xs font-bold'
                  : 'text-[#8FA89E] hover:text-[#EAEFEA]'
              }`}
            >
              السور الشائعة
            </button>
          </div>
        </div>

        {/* Quick Juz Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-[#7A988E] shrink-0 font-medium ml-1">
            الأجزاء:
          </span>
          <button
            onClick={() => setSelectedJuz('all')}
            className={`px-2.5 py-1 rounded-md shrink-0 transition-colors ${
              selectedJuz === 'all'
                ? 'bg-[#1C3A31] text-amber-300 font-semibold border border-[#2D5447]'
                : 'bg-[#132420] text-[#8FA89E] hover:text-[#EAEFEA] border border-[#1E3730]'
            }`}
          >
            كل الأجزاء
          </button>
          {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
            <button
              key={juz}
              onClick={() => setSelectedJuz(juz)}
              className={`px-2.5 py-1 rounded-md shrink-0 transition-colors ${
                selectedJuz === juz
                  ? 'bg-[#1C3A31] text-amber-300 font-semibold border border-[#2D5447]'
                  : 'bg-[#132420] text-[#8FA89E] hover:text-[#EAEFEA] border border-[#1E3730]'
              }`}
            >
              الجزء {juz}
            </button>
          ))}
        </div>
      </div>

      {/* Surahs Grid */}
      {filteredSurahs.length === 0 ? (
        <div className="text-center py-16 bg-[#132420] rounded-2xl border border-[#213B33]">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredSurahs.map((surah) => {
            const isMeccan = surah.revelationType === 'Meccan';
            return (
              <div
                key={surah.number}
                className="group relative bg-[#142520] hover:bg-[#1A312B] rounded-2xl p-4 border border-[#213C33] hover:border-amber-500/50 transition-all duration-200 hover:shadow-lg flex flex-col justify-between gap-3 text-right"
              >
                {/* Upper Row: Number Badge, Surah Name & Revelation Type */}
                <div
                  onClick={() => onSelectSurah(surah.number)}
                  className="flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Decorative Number Badge */}
                    <div className="w-10 h-10 rounded-xl bg-[#1B322B] text-amber-300 group-hover:bg-amber-500 group-hover:text-stone-950 flex items-center justify-center font-mono tabular-nums text-sm font-bold transition-colors shrink-0 border border-[#294B40] shadow-xs">
                      {surah.number}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-amiri text-xl sm:text-[22px] font-bold text-amber-200 group-hover:text-amber-300 transition-colors leading-snug truncate">
                        سُورَةُ {surah.name}
                      </h3>
                      <p className="text-[11px] text-[#7A988E] font-cairo truncate">
                        {surah.englishName} ({surah.englishNameTranslation})
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#193229] text-[#A3BCB2] border border-[#234539] shrink-0 font-cairo">
                    {isMeccan ? 'مكية' : 'مدنية'}
                  </span>
                </div>

                {/* Lower Row: Prominently Visible 'الجزء' & Ayah count on right, Action Buttons on left */}
                <div className="flex items-center justify-between pt-2.5 border-t border-[#1C362E] gap-2">
                  <div className="flex items-center gap-2 text-xs font-cairo">
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
                      الجزء {surah.juz}
                    </span>
                    <span className="text-[#8FA89E]">
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
                      className="w-8 h-8 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-[#1E3B30] border border-transparent hover:border-[#274E40] transition-colors flex items-center justify-center shrink-0"
                      title={`استماع لتلاوة سورة ${surah.name}`}
                      aria-label={`استماع لتلاوة سورة ${surah.name}`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <button
                      onClick={() => onSelectSurah(surah.number)}
                      className="h-8 px-2.5 rounded-lg text-xs font-semibold font-cairo text-amber-200 bg-[#1A342B] hover:bg-[#224438] hover:text-amber-100 border border-[#274E40] transition-colors inline-flex items-center justify-center gap-1.5 shrink-0 min-w-[76px]"
                      title={`قراءة وتفسير سورة ${surah.name}`}
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
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
