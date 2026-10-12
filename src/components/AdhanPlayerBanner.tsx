import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Bell,
  BellOff,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ADHAN_VOICES,
  AdhanNotificationSettings,
  loadAdhanSettings,
  saveAdhanSettings,
  playAdhan,
  stopAdhan,
  subscribeAdhanState,
  isAdhanPlaying,
} from '../utils/adhanService';

interface AdhanPlayerBannerProps {
  nextPrayerName?: string;
  nextPrayerTime?: string;
  secondsRemaining?: number;
}

export const AdhanPlayerBanner: React.FC<AdhanPlayerBannerProps> = ({
  nextPrayerName,
  nextPrayerTime,
  secondsRemaining,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(() => isAdhanPlaying());
  const [settings, setSettings] = useState<AdhanNotificationSettings>(() => loadAdhanSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeAdhanState((playing) => {
      setIsPlaying(playing);
    });
    return unsub;
  }, []);

  const handleTogglePlay = async () => {
    setAudioError(null);
    if (isPlaying) {
      stopAdhan();
    } else {
      try {
        await playAdhan(settings.voiceId, settings.volume);
      } catch {
        setAudioError('تعذر تشغيل الصوت، يرجى التفاعل مع الصفحة أو فحص الاتصال.');
      }
    }
  };

  const handleUpdateSettings = (partial: Partial<AdhanNotificationSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    saveAdhanSettings(updated);
  };

  const handleTogglePrayer = (prayerKey: keyof AdhanNotificationSettings['enabledPrayers']) => {
    const updatedPrayers = {
      ...settings.enabledPrayers,
      [prayerKey]: !settings.enabledPrayers[prayerKey],
    };
    handleUpdateSettings({ enabledPrayers: updatedPrayers });
  };

  const selectedVoice =
    ADHAN_VOICES.find((v) => v.id === settings.voiceId) || ADHAN_VOICES[0];

  return (
    <div className="rounded-xl bg-[#0f231b] border border-[#1e4233] p-2.5 sm:p-3 text-[#EAEFEA] transition-all">
      {/* Compact Main Bar */}
      <div className="flex items-center justify-between gap-2.5 flex-wrap sm:flex-nowrap">
        {/* Info / Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              isPlaying
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
            }`}
          >
            {isPlaying ? (
              <Square className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </div>

          <div className="text-right truncate">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-amber-200">
                الأذان الصوتي
              </span>
              {isPlaying && (
                <span className="text-[10px] text-emerald-300 bg-emerald-950/70 border border-emerald-500/30 px-1.5 py-0.2 rounded font-medium animate-pulse">
                  يُرفع الآن
                </span>
              )}
            </div>

            <div className="text-[11px] text-[#8AA89B] truncate">
              {nextPrayerName ? (
                <>
                  القادم: <span className="text-amber-300 font-semibold">{nextPrayerName}</span> ({nextPrayerTime})
                  {typeof secondsRemaining === 'number' && secondsRemaining > 0 && (
                    <span className="text-[#6D8C7F] mr-1">
                      — متبقي {Math.floor(secondsRemaining / 3600)}س {Math.floor((secondsRemaining % 3600) / 60)}د
                    </span>
                  )}
                </>
              ) : (
                <span>{selectedVoice.name}</span>
              )}
            </div>
          </div>
        </div>

        {/* Compact Actions */}
        <div className="flex items-center gap-1.5 mr-auto">
          {/* Main Play/Stop Button */}
          <button
            onClick={handleTogglePlay}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm ${
              isPlaying
                ? 'bg-red-500 hover:bg-red-400 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
            }`}
            title={isPlaying ? 'إيقاف الأذان' : 'سماع الأذان الآن'}
          >
            {isPlaying ? (
              <>
                <Square className="w-3 h-3 fill-current" />
                <span>إيقاف</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>سماع الأذان</span>
              </>
            )}
          </button>

          {/* Quick Auto-Adhan Alert Bell */}
          <button
            onClick={() => handleUpdateSettings({ autoPlayAdhan: !settings.autoPlayAdhan })}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              settings.autoPlayAdhan
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-[#14261f] text-[#69887b] border-[#1f3d30] hover:text-[#9BB8AA]'
            }`}
            title={settings.autoPlayAdhan ? 'التنبيه التلقائي مفعل' : 'التنبيه التلقائي معطل'}
          >
            {settings.autoPlayAdhan ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
          </button>

          {/* Mini Settings Toggle */}
          <button
            onClick={() => setIsSettingsOpen((prev) => !prev)}
            className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              isSettingsOpen
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                : 'bg-[#14261f] hover:bg-[#1a332a] text-[#8AA89B] border-[#1f3d30]'
            }`}
            title="الإعدادات"
            aria-expanded={isSettingsOpen}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">إعدادات</span>
            {isSettingsOpen ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {audioError && (
        <div className="mt-2 p-1.5 text-[11px] bg-red-950/80 border border-red-500/40 text-red-200 rounded-lg text-right">
          {audioError}
        </div>
      )}

      {/* Mini Collapsible Settings - Streamlined & no clutter */}
      {isSettingsOpen && (
        <div className="mt-2.5 pt-2.5 border-t border-[#1a382c] space-y-2.5 text-right text-xs animate-in fade-in duration-150">
          {/* Row 1: Auto play checkbox & volume */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#132820] p-2 rounded-lg border border-[#1e3d30]">
            {/* Auto Play Switch */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.autoPlayAdhan}
                onChange={(e) => handleUpdateSettings({ autoPlayAdhan: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
              <span className="text-[#C2D6CC] text-xs font-medium">
                رفع الأذان تلقائياً عند وقت الصلاة
              </span>
            </label>

            {/* Volume slider */}
            <div className="flex items-center gap-2">
              <span className="text-[#7D9D90] flex items-center gap-1 text-[11px]">
                {settings.volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>الصوت:</span>
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.volume}
                onChange={(e) => handleUpdateSettings({ volume: parseFloat(e.target.value) })}
                className="w-20 accent-amber-500 cursor-pointer h-1.5"
              />
              <span className="font-mono text-amber-300 text-[11px] w-7">
                {Math.round(settings.volume * 100)}%
              </span>
            </div>
          </div>

          {/* Row 2: Enabled Prayers list - compact pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-[#7D9D90] ml-1">الصلوات المفعّلة:</span>
            {[
              { key: 'fajr', label: 'الفجر' },
              { key: 'dhuhr', label: 'الظهر' },
              { key: 'asr', label: 'العصر' },
              { key: 'maghrib', label: 'المغرب' },
              { key: 'isha', label: 'العشاء' },
            ].map((item) => {
              const prayerKey = item.key as keyof AdhanNotificationSettings['enabledPrayers'];
              const isChecked = settings.enabledPrayers[prayerKey];
              return (
                <button
                  key={item.key}
                  onClick={() => handleTogglePrayer(prayerKey)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-200'
                      : 'bg-[#132820] border-[#1e3d30] text-[#69887B]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
