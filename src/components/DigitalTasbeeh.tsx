import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Vibrate,
  VibrateOff,
  Check,
} from 'lucide-react';
import {
  playTasbeehClickSound,
  playSuccessChime,
  triggerTasbeehHaptic,
  HapticIntensity,
} from '../utils/audio';
import {
  RealisticPhysicalMisbaha,
  BeadThemeKey,
  BEAD_THEMES,
} from './RealisticPhysicalMisbaha';

const TASBEEH_PRESETS = [
  'سُبْحَانَ اللَّهِ',
  'الْحَمْدُ لِلَّهِ',
  'لَا إِلَٰهَ إِلَّا اللَّهُ',
  'اللَّهُ أَكْبَرُ',
  'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
  'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
  'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
  'اللَّهُمَّ صَلِّ عَلَى نَبِيِّنَا مُحَمَّدٍ',
];

// Helper to get formatted date key: YYYY-MM-DD
function getTodayKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const HAPTIC_LABELS: Record<HapticIntensity, { label: string; text: string }> = {
  strong: { label: 'قوي', text: 'اهتزاز قوي' },
  medium: { label: 'متوسط', text: 'اهتزاز معتدل' },
  light: { label: 'خفيف', text: 'اهتزاز ناعم' },
  off: { label: 'معطل', text: 'بدون اهتزاز' },
};

export const DigitalTasbeeh: React.FC = () => {
  const [currentDhikr, setCurrentDhikr] = useState(TASBEEH_PRESETS[0]);
  const [count, setCount] = useState(0);
  const [targetLimit, setTargetLimit] = useState<number>(33);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticIntensity, setHapticIntensity] = useState<HapticIntensity>(() => {
    try {
      const saved = localStorage.getItem('tasbeeh_haptic_intensity') as HapticIntensity;
      if (saved && ['light', 'medium', 'strong', 'off'].includes(saved)) return saved;
    } catch {
      // ignore
    }
    return 'medium';
  });

  const [totalCount, setTotalCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('tasbeeh_lifetime_count');
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [todayCount, setTodayCount] = useState<number>(() => {
    try {
      const todayKey = getTodayKey();
      const saved = localStorage.getItem(`tasbeeh_today_${todayKey}`);
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [beadTheme, setBeadTheme] = useState<BeadThemeKey>(() => {
    try {
      const saved = localStorage.getItem('tasbeeh_bead_theme_v2') as BeadThemeKey;
      if (saved && saved in BEAD_THEMES) return saved;
    } catch {
      // ignore
    }
    return 'amber';
  });

  useEffect(() => {
    try {
      localStorage.setItem('tasbeeh_haptic_intensity', hapticIntensity);
    } catch {
      // ignore
    }
  }, [hapticIntensity]);

  useEffect(() => {
    try {
      localStorage.setItem('tasbeeh_bead_theme_v2', beadTheme);
    } catch {
      // ignore
    }
  }, [beadTheme]);

  // Sync lifetime count
  useEffect(() => {
    try {
      localStorage.setItem('tasbeeh_lifetime_count', String(totalCount));
    } catch {
      // ignore
    }
  }, [totalCount]);

  // Sync today count
  useEffect(() => {
    try {
      const todayKey = getTodayKey();
      localStorage.setItem(`tasbeeh_today_${todayKey}`, String(todayCount));
    } catch {
      // ignore
    }
  }, [todayCount]);

  const cycleHapticIntensity = () => {
    const cycleMap: Record<HapticIntensity, HapticIntensity> = {
      medium: 'strong',
      strong: 'light',
      light: 'off',
      off: 'medium',
    };
    const next = cycleMap[hapticIntensity] || 'medium';
    setHapticIntensity(next);
    if (next !== 'off') {
      triggerTasbeehHaptic('tap', next);
    }
  };

  const handleTap = () => {
    const nextCount = count + 1;
    setCount(nextCount);
    setTotalCount((prev) => prev + 1);
    setTodayCount((prev) => prev + 1);

    if (soundEnabled) {
      playTasbeehClickSound();
    }

    const isMilestone = targetLimit > 0 && nextCount % targetLimit === 0;
    const isSeparator = nextCount % 11 === 0 && !isMilestone;

    if (isMilestone) {
      triggerTasbeehHaptic('milestone', hapticIntensity);
      if (soundEnabled) {
        setTimeout(playSuccessChime, 80);
      }
    } else if (isSeparator) {
      triggerTasbeehHaptic('separator', hapticIntensity);
    } else {
      triggerTasbeehHaptic('tap', hapticIntensity);
    }
  };

  const handleResetCurrent = () => {
    setCount(0);
    if (hapticIntensity !== 'off') {
      triggerTasbeehHaptic('separator', hapticIntensity);
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto space-y-7 pb-20 select-none font-cairo">
      {/* ============================================================ */}
      {/* 1. Top Bar: Clean Title & Controls */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-amber-300 font-bold">
              السبحة الإسلامية الحقيقية
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-200">
            السبحة الإلكترونية
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            حركة خرز حقيقية تنزل وتطلع مع نبضات لمسية حقيقية (Haptic) وصوت نقر الخرز
          </p>
        </div>

        {/* Quick Tools */}
        <div className="flex items-center flex-wrap gap-2 self-end sm:self-auto">
          {/* Target Selector */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold">
            {[
              { val: 33, label: '٣٣' },
              { val: 100, label: '١٠٠' },
              { val: 0, label: 'مفتوح ∞' },
            ].map((t) => (
              <button
                key={t.val}
                onClick={() => setTargetLimit(t.val)}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  targetLimit === t.val
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Haptic Feedback Toggle & Intensity Selector */}
          <button
            onClick={cycleHapticIntensity}
            className={`px-2.5 py-1.5 rounded-2xl border transition-all flex items-center gap-1.5 text-xs cursor-pointer ${
              hapticIntensity !== 'off'
                ? 'bg-amber-400/15 border-amber-400/40 text-amber-300 hover:bg-amber-400/25'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
            title={`نمط الاهتزاز اللمسي: ${HAPTIC_LABELS[hapticIntensity].text} (انقر للتبديل)`}
          >
            {hapticIntensity !== 'off' ? (
              <Vibrate className="w-4 h-4 text-amber-400" />
            ) : (
              <VibrateOff className="w-4 h-4 text-slate-400" />
            )}
            <span className="font-semibold text-[11px]">
              {HAPTIC_LABELS[hapticIntensity].label}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            title={soundEnabled ? 'كتم صوت النقر' : 'تشغيل صوت النقر'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. THE REAL PHYSICAL MISBAHA (تنزل وتطلع) */}
      {/* ============================================================ */}
      <RealisticPhysicalMisbaha
        count={count}
        targetLimit={targetLimit}
        currentDhikr={currentDhikr}
        themeKey={beadTheme}
        onChangeTheme={(th) => setBeadTheme(th)}
        onTapBead={handleTap}
        onReset={handleResetCurrent}
      />

      {/* ============================================================ */}
      {/* 3. SUPER SIMPLE PRESETS MENU (قائمة بسيطة ونظيفة جداً) */}
      {/* ============================================================ */}
      <div className="rounded-3xl p-5 sm:p-6 bg-[#0c1622]/80 border border-white/10 shadow-xl space-y-3 text-right">
        <span className="text-xs font-bold text-amber-300 block">
          اختر صيغة الذكر:
        </span>

        {/* Clean, Simple Presets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {TASBEEH_PRESETS.map((phrase) => {
            const isSelected = currentDhikr === phrase;
            return (
              <button
                key={phrase}
                onClick={() => {
                  setCurrentDhikr(phrase);
                  setCount(0);
                }}
                className={`p-3 rounded-2xl text-right transition-all border flex items-center justify-between gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-md border-amber-300 scale-[1.02]'
                    : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10 hover:border-amber-400/40'
                }`}
              >
                <span className="font-amiri text-sm sm:text-base font-bold leading-relaxed truncate">
                  {phrase}
                </span>
                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-stone-950 text-amber-300 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. Simple Counters Row (تسبيحات اليوم والإجمالي) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="rounded-2xl p-4 bg-[#0b1622]/60 border border-white/10 text-right space-y-1">
          <span className="text-xs text-slate-400 font-bold block">تسبيحات اليوم</span>
          <span className="font-mono text-xl sm:text-2xl font-black text-amber-300 block">
            {todayCount.toLocaleString('ar-EG')}
          </span>
        </div>

        <div className="rounded-2xl p-4 bg-[#0b1622]/60 border border-white/10 text-right space-y-1">
          <span className="text-xs text-slate-400 font-bold block">إجمالي التسبيحات</span>
          <span className="font-mono text-xl sm:text-2xl font-black text-cyan-300 block">
            {totalCount.toLocaleString('ar-EG')}
          </span>
        </div>
      </div>
    </div>
  );
};
