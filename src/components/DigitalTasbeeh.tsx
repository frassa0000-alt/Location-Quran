import React, { useState, useEffect, useMemo } from 'react';
import { RotateCcw, Volume2, VolumeX, Plus, Calendar, TrendingUp, Award, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { playTasbeehClickSound, playSuccessChime, triggerVibration } from '../utils/audio';
import { RealisticMisbahaStrand, BeadThemeKey, BEAD_THEMES } from './RealisticMisbahaStrand';

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

// Helper to get formatted date key: YYYY-MM-DD
function getTodayKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface DailyTasbeehRecord {
  date: string; // YYYY-MM-DD
  count: number;
}

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

  // Daily log history { 'YYYY-MM-DD': count }
  const [dailyHistory, setDailyHistory] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('tasbeeh_daily_history_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  const [showChart, setShowChart] = useState(true);
  const [customText, setCustomText] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [beadTheme, setBeadTheme] = useState<BeadThemeKey>(() => {
    try {
      const saved = localStorage.getItem('tasbeeh_bead_theme_v1') as BeadThemeKey;
      if (saved && saved in BEAD_THEMES) return saved;
    } catch {
      // ignore
    }
    return 'amber';
  });

  useEffect(() => {
    try {
      localStorage.setItem('tasbeeh_bead_theme_v1', beadTheme);
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

  // Sync daily history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tasbeeh_daily_history_v1', JSON.stringify(dailyHistory));
    } catch {
      // ignore
    }
  }, [dailyHistory]);

  const todayKey = getTodayKey();
  const todayCount = dailyHistory[todayKey] || 0;

  const handleTap = () => {
    const nextCount = count + 1;
    setCount(nextCount);
    setTotalCount((prev) => prev + 1);

    // Increment today's count in daily history
    setDailyHistory((prev) => {
      const current = prev[todayKey] || 0;
      return {
        ...prev,
        [todayKey]: current + 1,
      };
    });

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

  // Prepare last 7 days data for the chart
  const last7Days = useMemo(() => {
    const days: {
      key: string;
      dayName: string;
      shortDayName: string;
      count: number;
      isToday: boolean;
      formattedDate: string;
    }[] = [];
    const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const shortDays = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;
      const dayIdx = d.getDay();

      days.push({
        key,
        dayName: arabicDays[dayIdx],
        shortDayName: shortDays[dayIdx],
        count: dailyHistory[key] || 0,
        isToday: i === 0,
        formattedDate: `${d.getDate()}/${d.getMonth() + 1}`,
      });
    }
    return days;
  }, [dailyHistory]);

  const maxCountIn7Days = useMemo(() => {
    const max = Math.max(...last7Days.map((d) => d.count), 1);
    return max;
  }, [last7Days]);

  const total7Days = useMemo(() => {
    return last7Days.reduce((acc, curr) => acc + curr.count, 0);
  }, [last7Days]);

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

      {/* Real Interactive Prayer Beads (السبحة الحقيقية التفاعلية) */}
      <div className="pt-2">
        <RealisticMisbahaStrand
          onBeadDrop={handleTap}
          count={count}
          targetLimit={targetLimit}
          currentDhikr={currentDhikr}
          themeKey={beadTheme}
          onChangeTheme={setBeadTheme}
        />
      </div>

      {/* Completed Laps Info if targetLimit is set */}
      {targetLimit > 0 && (
        <div className="flex items-center justify-center gap-2 mt-2 mb-1">
          <div className="px-4 py-1.5 rounded-xl bg-[#142921] border border-[#234b3d] text-xs font-cairo text-amber-300 flex items-center gap-2 shadow-xs">
            <span>الدورات المكتملة ({targetLimit} تسبيحة):</span>
            <span className="font-mono font-bold text-amber-200 text-sm">{completedLaps}</span>
          </div>
        </div>
      )}

      {/* Bottom Counter Metrics & Reset Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
        {/* Today's Count */}
        <div className="p-4 bg-[#142520] rounded-2xl border border-[#213C33] flex items-center justify-between">
          <div className="text-right">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-[#8FA89E] font-cairo">تسبيحات اليوم</span>
            </div>
            <span className="font-mono text-2xl font-bold text-emerald-400 tabular-nums">
              {todayCount}
            </span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#18352b] text-[#90ad9f] border border-[#234b3d]">
            اليوم
          </span>
        </div>

        {/* Reset Current Lap */}
        <div className="p-4 bg-[#142520] rounded-2xl border border-[#213C33] flex items-center justify-between">
          <div className="text-right">
            <span className="text-xs text-[#8FA89E] block font-cairo mb-0.5">العداد الحالي</span>
            <span className="font-mono text-2xl font-bold text-[#EAEFEA] tabular-nums">
              {count}
            </span>
          </div>
          <button
            onClick={handleResetCurrent}
            className="p-2 text-[#8FA89E] hover:text-amber-300 rounded-lg hover:bg-[#1A312B] transition-colors cursor-pointer"
            title="تصفير العداد الحالي"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Lifetime Total Count */}
        <div className="p-4 bg-[#142520] rounded-2xl border border-[#213C33] flex items-center justify-between">
          <div className="text-right">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-[#8FA89E] font-cairo">الإجمالي الكلي</span>
            </div>
            <span className="font-mono text-2xl font-bold text-amber-300 tabular-nums">
              {totalCount}
            </span>
          </div>
          <button
            onClick={handleResetLifetime}
            className="p-2 text-[#8FA89E] hover:text-red-400 rounded-lg hover:bg-[#1A312B] transition-colors cursor-pointer"
            title="تصفير الإجمالي الكلي"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Daily Tasbeeh History & Visual Bar Chart (مرتب ومتناسق بدون أي خروج عن الإطار) */}
      <div className="bg-[#12221D] border border-[#214336] rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-4 overflow-hidden w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#1C382E] pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30 shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div className="text-right min-w-0">
              <h3 className="font-amiri text-base sm:text-lg font-bold text-amber-200 truncate">
                سجل التسبيح اليومي (آخر ٧ أيام)
              </h3>
              <p className="text-[11px] text-[#8EA89D] truncate">
                سجل منظم لعدد تسبيحاتك اليومية
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <span className="text-xs font-mono font-bold text-amber-300 bg-[#162f26] px-3 py-1 rounded-lg border border-[#22483a]">
              المجموع: {total7Days}
            </span>
            <button
              onClick={() => setShowChart(!showChart)}
              className="p-1.5 text-[#8EA89D] hover:text-amber-200 rounded-lg hover:bg-[#183228] transition-colors cursor-pointer"
              title={showChart ? 'إخفاء الرسم' : 'إظهار الرسم'}
            >
              {showChart ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {showChart && (
          <div className="space-y-4 pt-1 w-full overflow-hidden">
            {/* Visual Bar Chart Grid (7 الأعمدة متناسقة بنظام Grid ومضبوطة داخل البطاقة) */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2.5 w-full items-end h-44 sm:h-48 pt-6 pb-2 px-1 border-b border-[#1A342B]">
              {last7Days.map((day) => {
                const heightPercent = maxCountIn7Days > 0 ? Math.max(8, Math.round((day.count / maxCountIn7Days) * 100)) : 8;
                return (
                  <div key={day.key} className="flex flex-col items-center h-full justify-end group min-w-0">
                    {/* Tooltip / Value on top */}
                    <span
                      className={`text-[10px] sm:text-xs font-mono font-bold mb-1 truncate text-center w-full block transition-all ${
                        day.isToday ? 'text-amber-300' : 'text-[#8EA89D] group-hover:text-amber-200'
                      }`}
                    >
                      {day.count}
                    </span>

                    {/* Bar */}
                    <div className="w-full max-w-[32px] sm:max-w-[42px] mx-auto bg-[#162A23] rounded-t-lg overflow-hidden flex items-end justify-center p-0.5 border border-[#213F33] group-hover:border-amber-400/50 transition-all">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t transition-all duration-300 ${
                          day.isToday
                            ? 'bg-gradient-to-t from-amber-600 via-amber-500 to-amber-300 shadow-md'
                            : day.count > 0
                            ? 'bg-gradient-to-t from-emerald-800 to-emerald-500'
                            : 'bg-emerald-950/40'
                        }`}
                      />
                    </div>

                    {/* Day label */}
                    <span
                      className={`text-[10px] sm:text-xs font-bold mt-1.5 font-cairo text-center truncate w-full block ${
                        day.isToday
                          ? 'text-amber-300 font-extrabold'
                          : 'text-[#7A988D] group-hover:text-[#EAEFEA]'
                      }`}
                    >
                      <span className="sm:hidden">{day.shortDayName}</span>
                      <span className="hidden sm:inline">{day.dayName}</span>
                    </span>
                    <span className="text-[9px] font-mono text-[#5A736A] text-center truncate w-full block">
                      {day.formattedDate}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Motivational Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#8EA89D] pt-1 text-center sm:text-right">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>تسبيحات اليوم: <strong className="text-emerald-300 font-mono text-sm">{todayCount}</strong></span>
              </span>
              <span className="text-[11px] text-[#6E887E]">
                «أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ»
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
