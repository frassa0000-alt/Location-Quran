import React, { useState, useEffect } from 'react';
import { Check, RotateCcw, Volume2, VolumeX, Sparkles, Sunrise, Sunset, Moon, Sun, BookOpen, Heart } from 'lucide-react';
import { DHIKR_CATEGORIES, ADHKAR_DATA, DhikrItem } from '../data/adhkar';
import { playTasbeehClickSound, playSuccessChime, triggerVibration } from '../utils/audio';
import { AdhkarAudioPlayer } from './AdhkarAudioPlayer';

export const AdhkarSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<DhikrItem['category']>('morning');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
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

  const currentItems = ADHKAR_DATA.filter((item) => item.category === selectedCategory);

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
      currentItems.forEach((item) => {
        updated[item.id] = item.count;
      });
      return updated;
    });
  };

  const completedCount = currentItems.filter((item) => (counts[item.id] ?? item.count) === 0).length;
  const progressPercent = Math.round((completedCount / currentItems.length) * 100);

  const currentCategoryObj = DHIKR_CATEGORIES.find((c) => c.id === selectedCategory);
  const activeCategoryTitle = currentCategoryObj?.title || 'الأذكار';

  const getCategoryIcon = (id: DhikrItem['category']) => {
    switch (id) {
      case 'morning': return <Sunrise className="w-4 h-4 text-amber-300" />;
      case 'evening': return <Sunset className="w-4 h-4 text-amber-300" />;
      case 'sleep': return <Moon className="w-4 h-4 text-amber-300" />;
      case 'wake': return <Sun className="w-4 h-4 text-amber-300" />;
      case 'prayer': return <BookOpen className="w-4 h-4 text-amber-300" />;
      case 'quranic': return <Sparkles className="w-4 h-4 text-amber-300" />;
      case 'prophetic': return <Heart className="w-4 h-4 text-amber-300" />;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Editorial Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c241c] via-[#123126] to-[#0a1814] text-[#EAEFEA] p-6 sm:p-8 border border-[#214336] shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold block mb-1">
              ألا بذكر الله تطمئن القلوب
            </span>
            <h1 className="text-2xl sm:text-4xl font-amiri font-bold text-amber-200">
              أذكار المسلم وحصنه الحصين
            </h1>
            <p className="text-[#B5CBBF] text-xs sm:text-sm mt-1">
              أذكار الصباح والمساء، أذكار النوم والاستيقاظ، والأدعية النبوية والقرآنية مع عداد تفاعلي مريح.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Sound toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-[#162D24] border border-[#274E40] text-amber-200 hover:bg-[#1E3B30] transition-colors"
              title="تفعيل أو كتم صوت النقر"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? 'صوت النقر مفعّل' : 'صوت صامت'}</span>
            </button>
          </div>
        </div>

        {/* Category Progress Bar */}
        <div className="mt-6 pt-4 border-t border-[#1C362F] flex items-center justify-between text-xs text-[#8FA89E]">
          <span>إنجاز الأذكار الحالية: {completedCount} من {currentItems.length}</span>
          <div className="flex items-center gap-2">
            <div className="w-28 sm:w-44 h-2 bg-[#101D19] rounded-full overflow-hidden border border-[#1C362F]">
              <div
                className="h-full bg-amber-400 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono tabular-nums font-bold text-amber-300">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        {DHIKR_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm whitespace-nowrap transition-colors border ${
                isActive
                  ? 'bg-[#18352C] text-amber-300 border-[#295244] font-bold shadow-xs'
                  : 'bg-[#142520] text-[#8FA89E] border-[#213C33] hover:text-[#EAEFEA] hover:bg-[#1A312B]'
              }`}
            >
              {getCategoryIcon(cat.id)}
              <span>{cat.title}</span>
            </button>
          );
        })}
      </div>

      {/* Sheikh Audio Recitation Player (ميزة الاستماع لقراءة الشيخ للأذكار) */}
      <AdhkarAudioPlayer
        selectedCategory={selectedCategory}
        categoryTitle={activeCategoryTitle}
      />

      {/* Reset Category Action */}
      <div className="flex justify-end">
        <button
          onClick={handleResetCategory}
          className="flex items-center gap-1.5 text-xs text-[#8FA89E] hover:text-amber-300 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>إعادة تصفير عداد هذه المجموعة</span>
        </button>
      </div>

      {/* Dhikr Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {currentItems.map((item) => {
          const remaining = counts[item.id] ?? item.count;
          const isDone = remaining === 0;

          return (
            <div
              key={item.id}
              onClick={() => handleIncrement(item)}
              className={`group p-5 sm:p-6 rounded-2xl border transition-all duration-200 cursor-pointer select-none text-right relative overflow-hidden ${
                isDone
                  ? 'bg-[#122A22] border-emerald-500/60 shadow-md ring-1 ring-emerald-500/20'
                  : 'bg-[#142520] hover:bg-[#182F28] border-[#213C33] hover:border-amber-500/40 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-start justify-between gap-4">
                {/* Right: Text and Fadl */}
                <div className="space-y-3 flex-1">
                  <p className="font-amiri text-lg sm:text-xl text-[#F3F6F3] leading-relaxed font-bold">
                    {item.text}
                  </p>

                  <div className="text-xs text-[#8FA89E] space-y-1 font-cairo">
                    <p className="text-amber-300/90 font-medium">
                      الفضل: {item.fadl}
                    </p>
                    {item.source && (
                      <p className="text-[#6D877D] text-[11px]">
                        المصدر: {item.source}
                      </p>
                    )}
                  </div>
                </div>

                {/* Left: Counter Control Button */}
                <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-3 shrink-0">
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center font-bold transition-all transform active:scale-90 ${
                      isDone
                        ? 'bg-emerald-500 text-stone-950 shadow-md'
                        : 'bg-[#1A332B] text-amber-300 border border-[#274B3F]'
                    }`}
                  >
                    {isDone ? (
                      <>
                        <Check className="w-6 h-6 mb-0.5" />
                        <span className="text-[10px] font-sans">تم</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl sm:text-2xl font-mono tabular-nums leading-none">
                          {remaining}
                        </span>
                        <span className="text-[10px] font-cairo text-[#8FA89E] mt-0.5">
                          من {item.count}
                        </span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={(e) => handleResetItem(item, e)}
                    className="p-1.5 text-[#6D877D] hover:text-amber-300 rounded-lg hover:bg-[#1A332B] transition-colors"
                    title="إعادة ضبط هذا الذكر"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
