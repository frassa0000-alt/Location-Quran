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
  CheckCheck,
  Sliders,
  Type,
} from 'lucide-react';
import { DHIKR_CATEGORIES, ADHKAR_DATA, DhikrItem } from '../data/adhkar';
import { playTasbeehClickSound, playSuccessChime, triggerVibration } from '../utils/audio';
import { AdhkarAudioPlayer } from './AdhkarAudioPlayer';

export const AdhkarSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<DhikrItem['category']>('morning');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'huge'>('normal');

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

  const getTextSizeClass = () => {
    switch (fontSizeLevel) {
      case 'huge':
        return 'text-2xl sm:text-3xl leading-[2.4] sm:leading-[2.6]';
      case 'large':
        return 'text-xl sm:text-2xl leading-[2.2] sm:leading-[2.4]';
      default:
        return 'text-lg sm:text-xl leading-[2] sm:leading-[2.2]';
    }
  };

  return (
    <div className="space-y-6 pb-20 select-none font-cairo">
      {/* ============================================================ */}
      {/* 1. Header: Clean, Simple, Elegant (بسيط وهادئ جداً) */}
      {/* ============================================================ */}
      <div className="rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-[#0c1a14] via-[#0f231b] to-[#091510] border border-amber-400/25 shadow-xl text-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs uppercase tracking-widest text-amber-300/90 font-semibold font-cairo">
                أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-200">
              أذكار المسلم
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-0.5 font-cairo">
              أذكار مأثورة مع عداد تفاعلي بسيط وصوت تسبيح مريح للأعصاب
            </p>
          </div>

          {/* Quick Settings: Sound & Font Size */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Font Size Toggle */}
            <button
              onClick={() => {
                if (fontSizeLevel === 'normal') setFontSizeLevel('large');
                else if (fontSizeLevel === 'large') setFontSizeLevel('huge');
                else setFontSizeLevel('normal');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-all active:scale-95"
              title="تغيير حجم الخط"
            >
              <Type className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {fontSizeLevel === 'normal' ? 'خط عادي' : fontSizeLevel === 'large' ? 'خط كبير' : 'خط كبير جداً'}
              </span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-all active:scale-95"
              title="تفعيل أو كتم صوت النقر"
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{soundEnabled ? 'صوت' : 'صامت'}</span>
            </button>
          </div>
        </div>

        {/* Minimal Progress Bar */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span>إنجاز {activeCategoryTitle}:</span>
            <span className="font-bold text-amber-300 font-mono text-sm">{completedCount}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400 font-mono">{categoryItems.length} ذكراً</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-24 sm:w-48 h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-300 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono font-bold text-amber-300 text-xs">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. Category Selector Pills (تصنيفات واضحة وبسيطة) */}
      {/* ============================================================ */}
      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shadow-xs ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-bold shadow-md shadow-amber-950/30 scale-105 border border-white/30'
                    : 'bg-[#0f1f18]/80 hover:bg-[#152e24] text-slate-300 hover:text-white border border-white/10'
                }`}
              >
                <span>{getCategoryIcon(cat.id)}</span>
                <span>{cat.title}</span>

                {/* Badge Indicator */}
                {isAllDone ? (
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-stone-950 font-bold flex items-center justify-center text-[10px]">
                    ✓
                  </span>
                ) : (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${isActive ? 'bg-black/20 text-stone-950 font-bold' : 'bg-white/10 text-slate-400'}`}>
                    {catTotal}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sheikh Audio Recitation Player (Optional Listener) */}
      <AdhkarAudioPlayer
        selectedCategory={selectedCategory}
        categoryTitle={activeCategoryTitle}
      />

      {/* ============================================================ */}
      {/* 3. Search & Reset Controls Bar */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`ابحث في ${activeCategoryTitle}...`}
            className="w-full pr-10 pl-4 py-2.5 text-xs sm:text-sm rounded-2xl ios-liquid-glass focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/40 text-slate-100 placeholder:text-slate-400 transition-all text-right"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded-lg hover:bg-white/10"
            >
              مسح
            </button>
          )}
        </div>

        {/* Counter Stats & Reset Category */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs text-slate-400 font-cairo">
            المعروض: <strong className="text-amber-300 font-mono">{filteredItems.length}</strong> ذكر
          </span>

          <button
            onClick={handleResetCategory}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-amber-300 bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-2xl border border-white/10 transition-all cursor-pointer active:scale-95"
            title="إعادة تصفير العداد لهذه المجموعة"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>تصفير العداد</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. Beautiful & Very Simple Dhikr Cards (بطاقات الأذكار الجديدة) */}
      {/* ============================================================ */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 px-4 ios-liquid-glass rounded-3xl space-y-2">
          <Sparkles className="w-8 h-8 text-amber-300/60 mx-auto mb-2" />
          <p className="text-base text-slate-200 font-bold">لم يتم العثور على أذكار مطابقة</p>
          <p className="text-xs text-slate-400">جرب البحث بكلمة أخرى أو اختر تبويباً آخر</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item, index) => {
            const remaining = counts[item.id] ?? item.count;
            const isDone = remaining === 0;
            const progress = ((item.count - remaining) / item.count) * 100;

            return (
              <div
                key={item.id}
                onClick={() => handleIncrement(item)}
                className={`group relative overflow-hidden rounded-3xl p-5 sm:p-6 transition-all duration-300 cursor-pointer select-none text-right border ${
                  isDone
                    ? 'bg-gradient-to-br from-[#0c2016]/90 via-[#0e271b] to-[#071710] border-emerald-500/50 shadow-md ring-1 ring-emerald-400/20'
                    : 'bg-[#0b1612]/80 hover:bg-[#0f1f19] border-white/10 hover:border-amber-400/50 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                }`}
              >
                {/* Thin Completion Progress Rim along top of card */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-black/40">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isDone ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-400 to-amber-300'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-start justify-between gap-5">
                  
                  {/* Right: Content Body */}
                  <div className="flex-1 space-y-3.5">
                    {/* Header line of card: index number, source badge, copy & reset */}
                    <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-white/10 text-amber-300 text-xs font-mono font-bold flex items-center justify-center border border-white/10 shadow-xs">
                          {index + 1}
                        </span>
                        {item.source && (
                          <span className="text-xs font-cairo bg-white/5 text-amber-300/90 px-2.5 py-0.5 rounded-lg border border-white/10">
                            {item.source}
                          </span>
                        )}
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleCopyText(item, e)}
                          className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-white/10 rounded-xl transition-colors"
                          title="نسخ الذكر"
                        >
                          {copiedId === item.id ? (
                            <CheckCheck className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={(e) => handleResetItem(item, e)}
                          className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-white/10 rounded-xl transition-colors"
                          title="إعادة ضبط هذا الذكر"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Dhikr Arabic Sacred Text */}
                    <p className={`font-amiri font-bold text-slate-100 group-hover:text-amber-100 transition-colors tracking-wide ${getTextSizeClass()}`}>
                      {item.text}
                    </p>

                    {/* Fadl / Virtue Box */}
                    {item.fadl && (
                      <div className="bg-black/30 rounded-2xl p-3 border border-white/5 text-xs font-cairo text-slate-300 leading-relaxed">
                        <strong className="text-amber-300 ml-1">فضل الذكر:</strong>
                        <span>{item.fadl}</span>
                      </div>
                    )}
                  </div>

                  {/* Left: Large, Delightful Circular Counter Button (زر العداد البارز) */}
                  <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleIncrement(item);
                      }}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex flex-col items-center justify-center font-bold transition-all transform active:scale-90 shadow-xl ${
                        isDone
                          ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-stone-950 shadow-emerald-950/50 scale-105 border-2 border-white/40'
                          : 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-400 text-stone-950 shadow-amber-950/40 border-2 border-white/40'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <Check className="w-7 h-7 stroke-[3]" />
                          <span className="text-[10px] font-bold mt-0.5 leading-none">مكتمل</span>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl sm:text-3xl font-mono tabular-nums leading-none font-black">
                            {remaining}
                          </span>
                          <span className="text-[10px] font-bold opacity-80 mt-1 leading-none">
                            من {item.count}
                          </span>
                        </>
                      )}
                    </button>

                    <span className="text-[11px] font-bold text-slate-400 hidden sm:block">
                      {isDone ? 'تم بحمد الله' : 'انقر للعد'}
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
