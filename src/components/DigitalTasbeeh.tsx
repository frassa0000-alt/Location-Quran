import React, { useState, useEffect } from 'react';
import { RotateCcw, Volume2, VolumeX, Plus } from 'lucide-react';
import { playTasbeehClickSound, playSuccessChime, triggerVibration } from '../utils/audio';

const TASBEEH_PRESETS = [
  'سُبْحَانَ اللَّهِ',
  'الْحَمْدُ لِلَّهِ',
  'لَا إِلَٰهَ إِلَّا اللَّهُ',
  'اللَّهُ أَكْبَرُ',
  'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
  'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
  'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
  'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
  'لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
];

export const DigitalTasbeeh: React.FC = () => {
  const [currentDhikr, setCurrentDhikr] = useState(TASBEEH_PRESETS[0]);
  const [count, setCount] = useState(0);
  const [targetLimit, setTargetLimit] = useState<number>(33);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [totalCount, setTotalCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('tasbeeh_lifetime_count');
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [customText, setCustomText] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Sync lifetime count
  useEffect(() => {
    try {
      localStorage.setItem('tasbeeh_lifetime_count', String(totalCount));
    } catch {
      // ignore
    }
  }, [totalCount]);

  const handleTap = () => {
    const nextCount = count + 1;
    setCount(nextCount);
    setTotalCount((prev) => prev + 1);

    if (soundEnabled) {
      playTasbeehClickSound();
    }
    if (vibrationEnabled) {
      triggerVibration(25);
    }

    // Target reached (e.g. 33 or 100)
    if (targetLimit > 0 && nextCount % targetLimit === 0) {
      if (soundEnabled) {
        setTimeout(playSuccessChime, 80);
      }
      if (vibrationEnabled) {
        triggerVibration([50, 70, 50]);
      }
    }
  };

  const handleResetCurrent = () => {
    setCount(0);
  };

  const handleResetLifetime = () => {
    if (window.confirm('هل أنت متأكد من تصفير إجمالي التسبيحات الكلي؟')) {
      setTotalCount(0);
      setCount(0);
    }
  };

  const cycleProgress = targetLimit > 0 ? (count % targetLimit) / targetLimit : 0;
  const completedLaps = targetLimit > 0 ? Math.floor(count / targetLimit) : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold">
          السبحة الإلكترونية التفاعلية
        </span>
        <h1 className="text-3xl sm:text-4xl font-amiri font-bold text-amber-200">
          رطّب لسانك بذكر الله
        </h1>
        <p className="text-xs sm:text-sm text-[#8FA89E] font-cairo">
          انقر في أي مكان في الدائرة للتسبيح، مع عدّاد دقيق وإحصاءات كاملة.
        </p>
      </div>

      {/* Preset Phrases Scrollable Bar */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-[#8FA89E] block text-right">
          اختر صيغة الذكر:
        </label>
        <div className="flex flex-wrap items-center gap-2 pb-1">
          {TASBEEH_PRESETS.map((phrase) => {
            const isSelected = currentDhikr === phrase;
            return (
              <button
                key={phrase}
                onClick={() => {
                  setCurrentDhikr(phrase);
                  setCount(0);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-amiri font-semibold whitespace-nowrap transition-colors border ${
                  isSelected
                    ? 'bg-[#18352C] text-amber-300 border-[#295244] shadow-xs'
                    : 'bg-[#142520] text-[#8FA89E] border-[#213C33] hover:text-[#EAEFEA] hover:bg-[#1A312B]'
                }`}
              >
                {phrase}
              </button>
            );
          })}
          <button
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="px-3 py-2 rounded-xl text-xs bg-[#142520] text-amber-200 border border-[#213C33] hover:bg-[#1A312B] transition-colors whitespace-nowrap flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ذكر مخصص</span>
          </button>
        </div>

        {showCustomInput && (
          <div className="flex gap-2 p-3 bg-[#101D19] rounded-xl border border-[#1C362F]">
            <input
              type="text"
              placeholder="اكتب الذكر المخصص هنا..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="flex-1 px-3 py-1.5 text-sm bg-[#142520] text-[#EAEFEA] rounded-lg border border-[#234237] text-right focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              onClick={() => {
                if (customText.trim()) {
                  setCurrentDhikr(customText.trim());
                  setShowCustomInput(false);
                  setCount(0);
                }
              }}
              className="px-4 py-1.5 text-xs font-semibold bg-amber-500 text-stone-950 rounded-lg hover:bg-amber-400"
            >
              تعيين
            </button>
          </div>
        )}
      </div>

      {/* Target Limit Selector & Preferences */}
      <div className="flex items-center justify-between p-3.5 bg-[#142520] rounded-2xl border border-[#213C33] text-xs">
        {/* Cycle Target */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#8FA89E]">الدورة:</span>
          {[33, 99, 100, 0].map((lim) => (
            <button
              key={lim}
              onClick={() => setTargetLimit(lim)}
              className={`px-2.5 py-1 rounded-md font-mono tabular-nums transition-colors ${
                targetLimit === lim
                  ? 'bg-[#1C3A31] text-amber-300 font-bold border border-[#295244]'
                  : 'bg-[#101D19] text-[#8FA89E] hover:text-[#EAEFEA]'
              }`}
            >
              {lim === 0 ? 'مفتوح' : lim}
            </button>
          ))}
        </div>

        {/* Audio / Haptic controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg border transition-colors ${
              soundEnabled
                ? 'bg-[#18352C] text-amber-300 border-[#295244]'
                : 'bg-[#101D19] text-[#6D877D] border-[#1C362F]'
            }`}
            title="صوت النقر"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Interactive Tasbeeh Circular Button */}
      <div className="flex flex-col items-center justify-center pt-4">
        <button
          onClick={handleTap}
          className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-br from-[#0c241c] via-[#123126] to-[#0a1814] text-[#EAEFEA] shadow-2xl p-6 flex flex-col items-center justify-center cursor-pointer select-none active:scale-95 transition-all duration-150 border-4 border-amber-400/50 hover:border-amber-300 group"
          aria-label="تسبيح"
        >
          {/* Subtle Circular Progress Indicator */}
          {targetLimit > 0 && (
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="46"
                className="stroke-[#1A382E] fill-none"
                strokeWidth="2.5"
              />
              <circle
                cx="50"
                cy="50"
                r="46"
                className="stroke-amber-400 fill-none transition-all duration-150"
                strokeWidth="2.5"
                strokeDasharray="289"
                strokeDashoffset={289 - 289 * cycleProgress}
                strokeLinecap="round"
              />
            </svg>
          )}

          {/* Current Dhikr Name */}
          <span className="font-amiri text-lg sm:text-xl font-bold text-amber-200 text-center px-4 line-clamp-2 mb-2 leading-relaxed">
            {currentDhikr}
          </span>

          {/* Big Counter Value */}
          <span className="font-mono text-5xl sm:text-6xl font-bold text-amber-100 tracking-wider tabular-nums">
            {count}
          </span>

          {/* Completed Laps Info */}
          {targetLimit > 0 && (
            <span className="text-xs text-amber-300 font-cairo mt-2">
              الدورات المكتملة: {completedLaps}
            </span>
          )}

          <span className="text-[11px] text-[#7A988E] mt-1 uppercase tracking-wider group-active:text-amber-300">
            انقر للتسبيح
          </span>
        </button>
      </div>

      {/* Bottom Counter Metrics & Reset Actions */}
      <div className="grid grid-cols-2 gap-3 pt-4">
        {/* Reset Current Lap */}
        <div className="p-4 bg-[#142520] rounded-2xl border border-[#213C33] flex items-center justify-between">
          <div className="text-right">
            <span className="text-xs text-[#8FA89E] block font-cairo">العداد الحالي</span>
            <span className="font-mono text-xl font-bold text-[#EAEFEA] tabular-nums">
              {count}
            </span>
          </div>
          <button
            onClick={handleResetCurrent}
            className="p-2 text-[#8FA89E] hover:text-amber-300 rounded-lg hover:bg-[#1A312B] transition-colors"
            title="تصفير العداد الحالي"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Lifetime Total Count */}
        <div className="p-4 bg-[#142520] rounded-2xl border border-[#213C33] flex items-center justify-between">
          <div className="text-right">
            <span className="text-xs text-[#8FA89E] block font-cairo">الإجمالي الكلي</span>
            <span className="font-mono text-xl font-bold text-amber-300 tabular-nums">
              {totalCount}
            </span>
          </div>
          <button
            onClick={handleResetLifetime}
            className="p-2 text-[#8FA89E] hover:text-red-400 rounded-lg hover:bg-[#1A312B] transition-colors"
            title="تصفير الإجمالي الكلي"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
