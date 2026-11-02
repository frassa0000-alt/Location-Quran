import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  Calendar,
  Flame,
  CheckCircle2,
  Clock,
  RotateCcw,
  Plus,
  BookOpen,
  Bell,
  BellRing,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import {
  KhatmahProgress,
  ReadingStats,
  getKhatmahProgress,
  updateKhatmahPage,
  logKhatmahAdvance,
  resetKhatmah,
  getRemainingKhatmahDays,
  getRequiredDailyPages,
  getReadingStats,
  getReminderSettings,
  saveReminderSettings,
  requestReminderNotificationPermission,
} from '../services/quranFeaturesService';

interface KhatmahModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateSurahPage?: (pageNumber: number) => void;
}

export const KhatmahModal: React.FC<KhatmahModalProps> = ({
  isOpen,
  onClose,
  onNavigateSurahPage,
}) => {
  const [progress, setProgress] = useState<KhatmahProgress>(() => getKhatmahProgress());
  const [stats, setStats] = useState<ReadingStats>(() => getReadingStats());
  const [reminder, setReminder] = useState(() => getReminderSettings());
  const [customPageInput, setCustomPageInput] = useState<string>('');
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetDaysInput, setTargetDaysInput] = useState<number>(progress.targetDays || 30);
  const [notificationStatus, setNotificationStatus] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setProgress(getKhatmahProgress());
      setStats(getReadingStats());
      setReminder(getReminderSettings());
      setCustomPageInput(String(progress.currentPage));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const percentage = Math.min(100, Math.round((progress.currentPage / progress.totalPages) * 100));
  const remainingPages = Math.max(0, progress.totalPages - progress.currentPage);
  const remainingDays = getRemainingKhatmahDays(progress);
  const requiredDaily = getRequiredDailyPages(progress);

  const handleAdvance = (pages: number) => {
    const updated = logKhatmahAdvance(pages);
    setProgress(updated);
    setStats(getReadingStats());
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.(15);
    }
  };

  const handleSetCustomPage = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(customPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= 604) {
      const updated = updateKhatmahPage(p);
      setProgress(updated);
      setStats(getReadingStats());
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.(15);
      }
    }
  };

  const handleSaveTargetDays = () => {
    const updated = resetKhatmah(targetDaysInput);
    setProgress(updated);
    setIsEditingTarget(false);
  };

  const handleToggleReminder = async () => {
    const nextState = !reminder.enabled;
    if (nextState) {
      const granted = await requestReminderNotificationPermission();
      if (!granted) {
        setNotificationStatus('تنبيه: يمكنك تفعيل الإشعارات من إعدادات المتصفح.');
      } else {
        setNotificationStatus('تم تفعيل الإشعارات بنجاح!');
      }
    }
    const newSettings = { ...reminder, enabled: nextState };
    setReminder(newSettings);
    saveReminderSettings(newSettings);
    setTimeout(() => setNotificationStatus(''), 4000);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSettings = { ...reminder, time: e.target.value };
    setReminder(newSettings);
    saveReminderSettings(newSettings);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl ios-liquid-glass-dock border border-white/20 shadow-2xl flex flex-col text-slate-100 relative animate-in zoom-in-95 duration-200 scrollbar-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Specular Rim */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-300/60 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="sticky top-0 z-10 px-5 py-4 bg-[#0A1813]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-amiri font-bold text-amber-200 leading-tight">
                متابعة ختم القرآن الكريم
              </h2>
              <p className="text-[11px] text-slate-400 font-sans">
                تتبع وردك اليومي، إحصائيات التلاوة، وجدول الختمة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Main Progress Ring & Summary Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#0F261E] via-[#0B1E17] to-[#081510] border border-emerald-500/30 shadow-lg relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-between">
              {/* Circular Gauge */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-white/10"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-amber-400 transition-all duration-700 ease-out"
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * percentage) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-bold font-mono text-amber-300">{percentage}%</span>
                  <span className="text-[10px] text-slate-300 font-sans">المكتمل</span>
                </div>
              </div>

              {/* Status details */}
              <div className="flex-1 space-y-2 text-center sm:text-right">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-amber-400/20 text-amber-200 font-bold text-xs border border-amber-400/30">
                    الصفحة {progress.currentPage} من ٦٠٤
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-200 font-bold text-xs border border-emerald-500/30">
                    الجزء {progress.currentJuz} من ٣٠
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  متبقي لك <strong className="text-amber-300">{remainingPages}</strong> صفحة لإتمام الختمة الحالية.
                </p>

                <div className="text-[11px] text-slate-400 flex items-center justify-center sm:justify-start gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>متبقي: {remainingDays} يوماً</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    <span>الهدف: {requiredDaily} صفحة/يوم</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick advance buttons */}
            <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-300 font-medium">تسجيل إنجاز سريع:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleAdvance(1)}
                  className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-100 border border-white/15 transition-all hover:scale-105 active:scale-95"
                >
                  +١ صفحة
                </button>
                <button
                  onClick={() => handleAdvance(5)}
                  className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-100 border border-white/15 transition-all hover:scale-105 active:scale-95"
                >
                  +٥ صفحات
                </button>
                <button
                  onClick={() => handleAdvance(20)}
                  className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  +١ جزء كامل
                </button>
              </div>
            </div>
          </div>

          {/* Quick Page Jump & Set Current Page */}
          <form
            onSubmit={handleSetCustomPage}
            className="p-3.5 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-medium">تحديد الصفحة الحالية:</span>
              <input
                type="number"
                min="1"
                max="604"
                value={customPageInput}
                onChange={(e) => setCustomPageInput(e.target.value)}
                className="w-20 px-2 py-1 rounded-xl bg-black/60 border border-white/20 text-center font-mono text-sm text-amber-200 focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs transition-all"
            >
              حفظ الصفحة
            </button>
          </form>

          {/* Reading Statistics & 7-Day Weekly Chart */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>إحصائيات القراءة والنشاط الأسبوعي</span>
              </h3>
              <div className="flex items-center gap-1 text-xs text-orange-300 font-bold">
                <span>{stats.streakDays}</span>
                <span>أيام متتالية 🔥</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className="text-[10px] text-slate-400">صفحات اليوم</div>
                <div className="text-base font-bold font-mono text-amber-300">{stats.todayPages}</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className="text-[10px] text-slate-400">وقت تلاوة اليوم</div>
                <div className="text-base font-bold font-mono text-emerald-300">{stats.todayMinutes} د</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className="text-[10px] text-slate-400">إجمالي الصفحات</div>
                <div className="text-base font-bold font-mono text-slate-200">{stats.totalPagesAllTime}</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className="text-[10px] text-slate-400">إجمالي الختمات</div>
                <div className="text-base font-bold font-mono text-amber-400">{progress.completedKhatmahs}</div>
              </div>
            </div>

            {/* Weekly Activity Bar Chart */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="text-[11px] text-slate-400 font-sans">نشاط آخر ٧ أيام:</div>
              <div className="flex items-end justify-between gap-1.5 h-20 pt-2">
                {stats.weeklyActivity.map((day, idx) => {
                  const maxPages = Math.max(10, ...stats.weeklyActivity.map((d) => d.pages));
                  const heightPercent = Math.min(100, Math.max(12, (day.pages / maxPages) * 100));
                  const isToday = idx === stats.weeklyActivity.length - 1;
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <div className="text-[9px] font-mono text-slate-400">
                        {day.pages > 0 ? day.pages : ''}
                      </div>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[28px] rounded-lg transition-all duration-500 ${
                          isToday
                            ? 'bg-gradient-to-t from-amber-500 to-amber-300 shadow-sm shadow-amber-400/30'
                            : day.pages > 0
                            ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                            : 'bg-white/10'
                        }`}
                      />
                      <span className={`text-[10px] font-sans ${isToday ? 'text-amber-300 font-bold' : 'text-slate-400'}`}>
                        {day.dayName.slice(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Daily Reminder Section */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                {reminder.enabled ? <BellRing className="w-4 h-4 text-amber-400 animate-pulse" /> : <Bell className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">تذكير يومي بموعد القراءة</div>
                <div className="text-[10px] text-slate-400">تنبيه لطيف لتثبيت وردك القرآني يومياً</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="time"
                value={reminder.time}
                onChange={handleTimeChange}
                disabled={!reminder.enabled}
                className="px-2.5 py-1 rounded-xl bg-black/60 border border-white/20 text-xs font-mono text-amber-200 focus:outline-none focus:border-amber-400 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleToggleReminder}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  reminder.enabled
                    ? 'bg-amber-400 text-stone-950 shadow-sm'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {reminder.enabled ? 'مفعل ✓' : 'تفعيل'}
              </button>
            </div>
          </div>

          {notificationStatus && (
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-[11px] text-amber-200 text-center animate-in fade-in">
              {notificationStatus}
            </div>
          )}

          {/* Khatmah Target Days Configuration */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            {isEditingTarget ? (
              <div className="w-full flex items-center justify-between gap-2">
                <span className="text-slate-300">مدة الختمة المستهدفة:</span>
                <div className="flex items-center gap-1.5">
                  {[15, 30, 60, 90].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setTargetDaysInput(d)}
                      className={`px-2 py-0.5 rounded-lg text-xs font-mono transition-all ${
                        targetDaysInput === d
                          ? 'bg-amber-400 text-stone-950 font-bold'
                          : 'bg-white/10 text-slate-300 hover:bg-white/20'
                      }`}
                    >
                      {d} يوم
                    </button>
                  ))}
                  <button
                    onClick={handleSaveTargetDays}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-bold text-xs"
                  >
                    تطبيق
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span>خطة الختمة الحالية: <strong>{progress.targetDays} يوماً</strong></span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingTarget(true)}
                    className="text-amber-300 hover:underline text-[11px]"
                  >
                    تعديل المدة
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('هل ترغب في بدء ختمة جديدة من البداية؟')) {
                        resetKhatmah(progress.targetDays);
                        setProgress(getKhatmahProgress());
                      }
                    }}
                    className="text-slate-400 hover:text-red-400 flex items-center gap-1 text-[11px]"
                    title="بدء ختمة جديدة"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>إعادة ضبط</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
