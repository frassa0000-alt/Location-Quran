import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Bell,
  BellOff,
  Radio,
  Sliders,
  CheckCircle2,
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
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendPrayerNotification,
} from '../utils/notificationService';

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
  // Collapsible settings controlled by the up/down arrow
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<string>('default');

  useEffect(() => {
    const unsub = subscribeAdhanState((playing) => {
      setIsPlaying(playing);
    });
    return unsub;
  }, []);

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  useEffect(() => {
    setPermissionState(getNotificationPermission());
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

  const handleRequestNotification = async () => {
    setNotificationMsg(null);
    try {
      const perm = await requestNotificationPermission();
      setPermissionState(perm);
      if (perm === 'granted') {
        setNotificationMsg('تم تفعيل الإشعارات بنجاح!');
        // Send a confirmation notification
        await sendPrayerNotification(
          'تفعيل الإشعارات',
          'تم تفعيل الإشعارات بنجاح لمواقيت الصلاة ورفع الأذان 🕌'
        );
      } else if (perm === 'denied') {
        setNotificationMsg('تم رفض الإذن من المتصفح. يمكنك تفعيل الإشعارات من إعدادات الموقع بالمتصفح.');
      }
    } catch {
      setNotificationMsg('حدث خطأ أثناء تفعيل الإشعارات.');
    }
  };

  const handleTestNotification = async () => {
    setNotificationMsg('تم إرسال إشعار تجريبي...');
    await sendPrayerNotification(
      'تفعيل الإشعارات',
      `الله أكبر، إشعار موعد صلاة ${nextPrayerName || 'القادمة'} 🕌`
    );
  };

  const selectedVoice =
    ADHAN_VOICES.find((v) => v.id === settings.voiceId) || ADHAN_VOICES[0];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d2a20] via-[#143d2f] to-[#0d2a20] border-2 border-amber-500/40 p-4 sm:p-5 shadow-2xl text-[#EAEFEA] transition-all duration-300">
      {/* Subtle Background Glow */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Banner Row */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Side / Info: Adhan Status & Countdown */}
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 flex items-center justify-center shrink-0 shadow-lg ring-2 ring-amber-400/30">
            <Radio className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
          </div>

          <div className="space-y-0.5 text-right flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-[#16382c] px-2 py-0.5 rounded-md border border-[#275342]">
                ميزة الأذان الصوتي 🕌
              </span>
              {isPlaying && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 animate-pulse bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  الأذان يُرفع الآن
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-amiri font-bold text-amber-100 leading-tight">
              {selectedVoice.location} ({selectedVoice.name})
            </h3>

            {nextPrayerName && (
              <p className="text-xs text-[#9EB9AD] font-cairo">
                الأذان القادم: <span className="text-amber-300 font-bold">{nextPrayerName}</span> ({nextPrayerTime})
                {typeof secondsRemaining === 'number' && secondsRemaining > 0 && (
                  <span className="text-[#84A597] mr-1.5">
                    — متبقي{' '}
                    <span className="font-mono text-amber-200">
                      {Math.floor(secondsRemaining / 3600)}س {Math.floor((secondsRemaining % 3600) / 60)}د
                    </span>
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Right Side / Controls: Play, Sound, and Settings Arrow Toggle */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap sm:flex-nowrap">
          {/* Main Play/Stop Button */}
          <button
            onClick={handleTogglePlay}
            className={`inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md cursor-pointer ${
              isPlaying
                ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-900/40 ring-2 ring-red-400/50'
                : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 shadow-amber-950/30'
            }`}
            title={isPlaying ? 'إيقاف الأذان' : 'استماع للأذان'}
          >
            {isPlaying ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>إيقاف الأذان</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>سماع الأذان الآن</span>
              </>
            )}
          </button>

          {/* Quick Auto-Adhan Alert Bell */}
          <button
            onClick={() => handleUpdateSettings({ autoPlayAdhan: !settings.autoPlayAdhan })}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              settings.autoPlayAdhan
                ? 'bg-[#183a2d] text-amber-300 border-[#2b5946] hover:bg-[#1f4838]'
                : 'bg-[#12241d] text-[#718f82] border-[#1d382c] hover:text-[#9bb5a9]'
            }`}
            title={settings.autoPlayAdhan ? 'التنبيه التلقائي مفعل' : 'التنبيه التلقائي معطل'}
          >
            {settings.autoPlayAdhan ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>

          {/* Quick تفعيل الإشعارات Button if not granted */}
          {permissionState !== 'granted' && (
            <button
              onClick={handleRequestNotification}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
              title="تفعيل الإشعارات"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>تفعيل الإشعارات</span>
            </button>
          )}

          {/* Arrow Collapsible Settings Toggle Button (السهم الذي يرتفع وينزل) */}
          <button
            onClick={() => setIsSettingsOpen((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer font-cairo text-xs font-bold shadow-sm ${
              isSettingsOpen
                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-amber-500/20'
                : 'bg-[#142e23] hover:bg-[#1b3d2f] text-amber-200 border-[#234839]'
            }`}
            title={isSettingsOpen ? 'إغلاق وطي إعدادات الأذان' : 'فتح وتوسيع إعدادات الأذان'}
            aria-expanded={isSettingsOpen}
          >
            <Sliders className="w-4 h-4" />
            <span>الإعدادات</span>
            {isSettingsOpen ? (
              <ChevronUp className="w-4 h-4 animate-bounce" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {audioError && (
        <div className="mt-3 p-2 text-xs bg-red-950/80 border border-red-500/40 text-red-200 rounded-lg text-right">
          {audioError}
        </div>
      )}

      {/* Collapsible Adhan Settings Accordion Panel (سهم التوسيع والطي) */}
      {isSettingsOpen && (
        <div className="mt-4 pt-4 border-t border-[#234b3c] space-y-4 animate-in fade-in duration-200 text-right">
          {/* Header of settings panel with close chevron */}
          <div className="flex items-center justify-between pb-2 border-b border-[#1c3a2f]">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h4 className="font-amiri text-lg font-bold text-amber-200">
                إعدادات الأذان والمؤذن
              </h4>
            </div>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="inline-flex items-center gap-1 text-xs text-amber-300 hover:text-amber-100 bg-[#142d22] px-2.5 py-1 rounded-lg border border-[#234839] hover:bg-[#1b3d2f] transition-all cursor-pointer"
            >
              <span>طي الإعدادات</span>
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          {/* تفعيل الإشعارات */}
          <div className="p-3.5 bg-[#173126] border border-[#2d5c49] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 text-right w-full sm:w-auto">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 shrink-0 border border-amber-500/20">
                <Bell className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-200 text-sm">تفعيل الإشعارات</span>
                  {permissionState === 'granted' && (
                    <span className="bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      مفعلة
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
              {permissionState === 'granted' ? (
                <button
                  type="button"
                  onClick={handleTestNotification}
                  className="px-3.5 py-1.5 rounded-lg bg-[#204737] hover:bg-[#2b5e49] text-amber-200 font-bold text-xs border border-[#346d55] transition-all cursor-pointer"
                >
                  تجربة الإشعار
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestNotification}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs shadow-md transition-all shrink-0 w-full sm:w-auto cursor-pointer"
                >
                  تفعيل الإشعارات
                </button>
              )}
            </div>
          </div>

          {notificationMsg && (
            <div
              className={`p-2 rounded-lg text-xs text-right border ${
                permissionState === 'granted'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-200'
              }`}
            >
              {notificationMsg}
            </div>
          )}

          {/* Auto Play Adhan Switch */}
          <div className="p-3 bg-[#13261f] rounded-xl border border-[#214336]">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="space-y-0.5 text-right">
                <span className="font-bold text-sm text-amber-100 block">
                  رفع الأذان تلقائياً عند حلول موعد الصلاة
                </span>
                <span className="text-xs text-[#82a193]">
                  يقوم الموقع بتشغيل صوت الأذان فور دخول وقت الصلاة المحددة
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoPlayAdhan}
                onChange={(e) => handleUpdateSettings({ autoPlayAdhan: e.target.checked })}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer mr-3"
              />
            </label>
          </div>

          {/* Voice Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#9bb7ab] block">
              اختر صوت الأذان المفضل (المؤذن):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ADHAN_VOICES.map((voice) => {
                const isSelected = settings.voiceId === voice.id;
                return (
                  <div
                    key={voice.id}
                    onClick={() => handleUpdateSettings({ voiceId: voice.id })}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-[#18392d] border-amber-500/80 text-amber-200 ring-1 ring-amber-500/40 shadow-sm'
                        : 'bg-[#13261f] border-[#214336] text-[#9bb7ab] hover:bg-[#162f26]'
                    }`}
                  >
                    <div>
                      <span className="font-amiri font-bold text-base block text-[#EAEFEA]">
                        {voice.name}
                      </span>
                      <span className="text-xs text-[#8aa99c]">{voice.location}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Volume Control Slider */}
          <div className="p-3 bg-[#13261f] rounded-xl border border-[#214336] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#9bb7ab] flex items-center gap-1.5">
                {settings.volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                <span>مستوى صوت الأذان:</span>
              </span>
              <span className="font-mono text-amber-300 font-bold">
                {Math.round(settings.volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.volume}
              onChange={(e) => handleUpdateSettings({ volume: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Enabled Prayers Checklist */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#9bb7ab] block">
              الصلوات المفعّل لها الأذان التلقائي:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
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
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-xs'
                        : 'bg-[#13261f] border-[#214336] text-[#718f82]'
                    }`}
                  >
                    {item.label} {isChecked ? '✓' : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Accordion Close Arrow Button (سهم الإغلاق لطي اللوحة للأعلى) */}
          <div className="pt-2 flex justify-center border-t border-[#1c3a2f]">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-full bg-[#142e22] hover:bg-[#1a3a2c] text-xs font-bold text-amber-300 border border-[#244c3c] hover:border-amber-400/50 transition-all cursor-pointer shadow-sm group"
            >
              <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              <span>طي وإغلاق الإعدادات ⌃</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
