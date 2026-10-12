import React, { useState, useEffect, useMemo } from 'react';
import {
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Sunrise,
  Sunset,
  Moon,
  Sun,
  BookOpen,
  Heart,
  Search,
  Copy,
  Share2,
  CheckCheck,
} from 'lucide-react';
import { DHIKR_CATEGORIES, ADHKAR_DATA, DhikrItem } from '../data/adhkar';
import { playTasbeehClickSound, playSuccessChime, triggerVibration } from '../utils/audio';
import { AdhkarAudioPlayer } from './AdhkarAudioPlayer';

export const AdhkarSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<DhikrItem['category']>('morning');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Track counts per dhikr id: { [dhikrId]: remainingCount }
  const [counts, setCounts] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('adhkar_counts_state');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    const initial: Record<string, number> = {};
    ADHKAR_DATA.forEach((item) => {
      initial[item.id] = item.count;
    });
    return initial;
  });

  // Save counts to local storage
  useEffect(() => {
    try {
      localStorage.setItem('adhkar_counts_state', JSON.stringify(counts));
    } catch {
      // ignore
    }
  }, [counts]);

  // Current category items
  const categoryItems = useMemo(
    () => ADHKAR_DATA.filter((item) => item.category === selectedCategory),
    [selectedCategory]
  );

  // Filtered items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return categoryItems;
    const q = searchQuery.trim().toLowerCase();
    return categoryItems.filter(
      (item) =>
        item.text.toLowerCase().includes(q) ||
        item.fadl.toLowerCase().includes(q) ||
        (item.source && item.source.toLowerCase().includes(q))
    );
  }, [categoryItems, searchQuery]);

  const handleIncrement = (item: DhikrItem) => {
    const currentVal = counts[item.id] ?? item.count;
    if (currentVal <= 0) return;

    const newVal = currentVal - 1;
    setCounts((prev) => ({ ...prev, [item.id]: newVal }));

    if (soundEnabled) {
      playTasbeehClickSound();
    }
    triggerVibration(20);

    // If reached 0, trigger celebration
    if (newVal === 0) {
      if (soundEnabled) {
        setTimeout(playSuccessChime, 100);
      }
      triggerVibration([30, 50, 30]);
    }
  };

  const handleResetItem = (item: DhikrItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setCounts((prev) => ({ ...prev, [item.id]: item.count }));
  };

  const handleResetCategory = () => {
    setCounts((prev) => {
      const updated = { ...prev };
      categoryItems.forEach((item) => {
        updated[item.id] = item.count;
      });
      return updated;
    });
  };

  const handleCopyText = (item: DhikrItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `${item.text}\n\nفضل الذكر: ${item.fadl}${item.source ? `\nالمصدر: ${item.source}` : ''}\n(عدد المرات: ${item.count})`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2000);
      });
    }
  };

  const completedCount = categoryItems.filter((item) => (counts[item.id] ?? item.count) === 0).length;
  const progressPercent = categoryItems.length > 0 ? Math.round((completedCount / categoryItems.length) * 100) : 0;

  const currentCategoryObj = DHIKR_CATEGORIES.find((c) => c.id === selectedCategory);
  const activeCategoryTitle = currentCategoryObj?.title || 'أذكار';

  const getCategoryIcon = (id: DhikrItem['category']) => {
    switch (id) {
      case 'morning':
        return <Sunrise className="w-4 h-4 text-amber-300" />;
      case 'evening':
        return <Sunset className="w-4 h-4 text-amber-300" />;
      case 'sleep':
        return <Moon className="w-4 h-4 text-amber-300" />;
      case 'wake':
        return <Sun className="w-4 h-4 text-amber-300" />;
      case 'prayer':
        return <BookOpen className="w-4 h-4 text-amber-300" />;
      case 'quranic':
        return <Sparkles className="w-4 h-4 text-amber-300" />;
      case 'prophetic':
        return <Heart className="w-4 h-4 text-amber-300" />;
    }
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Refined Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c241c] via-[#123126] to-[#0a1814] text-[#EAEFEA] p-5 sm:p-7 border border-[#214336] shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs uppercase tracking-widest text-amber-300/90 font-medium font-cairo">
                ألا بذكر الله تطمئن القلوب
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-amber-200">
              أذكار
            </h1>
            <p className="text-[#A5C0B3] text-xs sm:text-sm mt-1">
              مجموعات الأذكار المأثورة والأدعية الجامعة مع عداد تفاعلي وتسجيلات صوتية لكبار المشايخ.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Sound toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-[#162D24] border border-[#274E40] text-amber-200 hover:bg-[#1E3B30] transition-colors cursor-pointer"
              title="تفعيل أو كتم صوت النقر"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-stone-400" />}
              <span className="font-cairo">{soundEnabled ? 'صوت النقر' : 'صامت'}</span>
            </button>
          </div>
        </div>

        {/* Category Progress Bar */}
        <div className="mt-5 pt-3.5 border-t border-[#1C362F] flex items-center justify-between text-xs text-[#8FA89E]">
          <div className="flex items-center gap-2">
            <span className="font-cairo">إنجاز {activeCategoryTitle}:</span>
            <span className="font-bold text-amber-200">{completedCount}</span>
            <span className="text-[#6D877D]">من</span>
            <span className="font-bold text-stone-300">{categoryItems.length}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-28 sm:w-44 h-2 bg-[#101D19] rounded-full overflow-hidden border border-[#1C362F]">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono tabular-nums font-bold text-amber-300 text-xs">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Categories Navigation Bar - Beautiful Pill Style */}
      <div className="bg-[#0e211a] border border-[#1b3b2f] p-1.5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 px-0.5">
          {DHIKR_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const catDoneCount = ADHKAR_DATA.filter(
              (item) => item.category === cat.id && (counts[item.id] ?? item.count) === 0
            ).length;
            const catTotal = ADHKAR_DATA.filter((item) => item.category === cat.id).length;
            const isAllDone = catTotal > 0 && catDoneCount === catTotal;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-800 to-[#184635] text-amber-200 font-bold shadow-md border border-amber-400/40 ring-1 ring-amber-400/20'
                    : 'text-[#8FA89E] hover:text-[#EAEFEA] hover:bg-[#142d23] border border-transparent'
                }`}
              >
                <span className="shrink-0">{getCategoryIcon(cat.id)}</span>
                <span className="font-cairo">{cat.title}</span>

                {/* Micro badge indicator */}
                {isAllDone ? (
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
                    ✓
                  </span>
                ) : (
                  <span className="text-[11px] font-mono tabular-nums opacity-60">
                    {catTotal}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sheikh Audio Recitation Player */}
      <AdhkarAudioPlayer
        selectedCategory={selectedCategory}
        categoryTitle={activeCategoryTitle}
      />

      {/* Search and List Header Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Search Input inside current category */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6D877D] pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`ابحث في ${activeCategoryTitle}...`}
            className="w-full bg-[#10231b] border border-[#1f4234] rounded-xl py-2 pr-9 pl-4 text-xs sm:text-sm text-[#EAEFEA] placeholder-[#6D877D] focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors text-right"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8FA89E] hover:text-white px-1.5 py-0.5 rounded hover:bg-[#1A332B]"
            >
              مسح
            </button>
          )}
        </div>

        {/* Counter Stats & Reset Category */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs text-[#8FA89E] font-cairo">
            المعروض: <span className="font-bold text-amber-200">{filteredItems.length}</span> ذكر
          </span>

          <button
            onClick={handleResetCategory}
            className="flex items-center gap-1.5 text-xs text-[#8FA89E] hover:text-amber-300 bg-[#12281f] hover:bg-[#183529] px-3 py-1.5 rounded-xl border border-[#214336] transition-colors cursor-pointer"
            title="إعادة تصفير العداد لهذه المجموعة"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="font-cairo">تصفير العداد</span>
          </button>
        </div>
      </div>

      {/* Dhikr Cards List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 px-4 bg-[#10231b]/60 border border-[#1c3c2f] rounded-2xl">
          <Sparkles className="w-8 h-8 text-amber-300/60 mx-auto mb-2" />
          <p className="text-sm text-stone-300 font-medium">لم يتم العثور على أذكار مطابقة</p>
          <p className="text-xs text-[#6D877D] mt-1">جرب البحث بكلمة أخرى أو اختر تبويباً آخر</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredItems.map((item, index) => {
            const remaining = counts[item.id] ?? item.count;
            const isDone = remaining === 0;
            const progress = ((item.count - remaining) / item.count) * 100;

            return (
              <div
                key={item.id}
                onClick={() => handleIncrement(item)}
                className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 cursor-pointer select-none text-right ${
                  isDone
                    ? 'bg-[#10281f]/90 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20'
                    : 'bg-[#12251e] hover:bg-[#152e25] border-[#214336] hover:border-amber-500/50 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Visual completion progress bar along bottom of card */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0a1813]">
                  <div
                    className={`h-full transition-all duration-200 ${
                      isDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-amber-300'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-start justify-between gap-4">
                  {/* Right side: Dhikr index badge & Dhikr Arabic Content */}
                  <div className="flex-1 space-y-3">
                    {/* Header line of card: index number & source badge */}
                    <div className="flex items-center justify-between gap-2 border-b border-[#1b3a2e]/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#193a2e] text-amber-300 text-xs font-mono font-bold flex items-center justify-center border border-[#265342]">
                          {index + 1}
                        </span>
                        {item.source && (
                          <span className="text-[11px] font-cairo bg-[#162f25] text-amber-300/80 px-2 py-0.5 rounded-md border border-[#24493a]">
                            {item.source}
                          </span>
                        )}
                      </div>

                      {/* Quick Action Buttons: Copy / Reset */}
                      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleCopyText(item, e)}
                          className="p-1.5 text-[#7ea092] hover:text-amber-300 hover:bg-[#1a382d] rounded-lg transition-colors cursor-pointer"
                          title="نسخ الذكر"
                        >
                          {copiedId === item.id ? (
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => handleResetItem(item, e)}
                          className="p-1.5 text-[#7ea092] hover:text-amber-300 hover:bg-[#1a382d] rounded-lg transition-colors cursor-pointer"
                          title="إعادة ضبط هذا الذكر"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Dhikr Arabic Text */}
                    <p className="font-amiri text-lg sm:text-xl text-[#F4F7F4] leading-[2] sm:leading-[2.2] font-semibold tracking-wide">
                      {item.text}
                    </p>

                    {/* Fadl / Virtue Box */}
                    {item.fadl && (
                      <div className="bg-[#0d1d17]/80 rounded-xl p-2.5 border border-[#1b3a2e] text-xs font-cairo text-[#A5C0B3]">
                        <span className="font-bold text-amber-300/90 ml-1">فضل الذكر:</span>
                        <span>{item.fadl}</span>
                      </div>
                    )}
                  </div>

                  {/* Left side: Interactive Counter Button */}
                  <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1a382d]">
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center font-bold transition-all transform active:scale-90 shadow-md ${
                        isDone
                          ? 'bg-emerald-500 text-stone-950 shadow-emerald-950/40'
                          : 'bg-gradient-to-b from-[#1b3a2e] to-[#142e24] text-amber-300 border border-[#2b5947] hover:border-amber-400/60 shadow-black/20'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <Check className="w-6 h-6 stroke-[3]" />
                          <span className="text-[10px] font-cairo font-bold mt-0.5">تم بحمد الله</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl sm:text-2xl font-mono tabular-nums leading-none font-bold">
                            {remaining}
                          </span>
                          <span className="text-[10px] font-cairo text-[#8FA89E] mt-1">
                            من {item.count}
                          </span>
                        </>
                      )}
                    </div>

                    <span className="text-[11px] text-[#7ea092] font-cairo hidden sm:block">
                      {isDone ? 'مكتمل' : 'اضغط للعد'}
                    </span>
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
