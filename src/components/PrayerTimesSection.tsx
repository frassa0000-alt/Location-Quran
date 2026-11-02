import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapPin,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Clock,
  Search,
  Check,
  Volume2,
  VolumeX,
  Compass,
  Sparkles,
  Play,
  Pause,
  Award,
  RotateCcw,
  Bell,
  Heart,
  Navigation,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  POPULAR_CITIES,
  CityCoordinates,
  calculatePrayerTimes,
  calculateQiblaBearing,
  calculateDistanceToKaaba,
  getCompassCardinalName,
  getHijriDate,
  PrayerTimesResult,
} from '../utils/prayerCalculations';
import {
  ADHAN_VOICES,
  AdhanVoice,
  loadAdhanSettings,
  saveAdhanSettings,
  playAdhan,
  stopAdhan,
  isAdhanPlaying,
  subscribeAdhanState,
} from '../utils/adhanService';
import { sendPrayerNotification, requestNotificationPermission } from '../utils/notificationService';

const PRAYER_CHECKLIST_STORAGE_PREFIX = 'quran_prayer_checklist_';

export const PrayerTimesSection: React.FC = () => {
  // Selected City (Default: Makkah Al-Mukarramah, or saved choice)
  const [selectedCity, setSelectedCity] = useState<CityCoordinates>(() => {
    try {
      const saved = localStorage.getItem('quran_selected_city_name');
      if (saved) {
        const found = POPULAR_CITIES.find((c) => c.name === saved);
        if (found) return found;
      }
    } catch {
      // ignore
    }
    return POPULAR_CITIES[0]; // مكة المكرمة
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [isAdhanActive, setIsAdhanActive] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(() => loadAdhanSettings().voiceId);
  const [showDuaAfterAdhan, setShowDuaAfterAdhan] = useState(false);
  const [isAdhanSettingOpen, setIsAdhanSettingOpen] = useState(false);

  // Daily prayer tracker state (stored per date YYYY-MM-DD)
  const todayDateKey = useMemo(() => {
    const d = new Date();
    return `${PRAYER_CHECKLIST_STORAGE_PREFIX}${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const [dailyChecklist, setDailyChecklist] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(todayDateKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      fajr: false,
      dhuhr: false,
      asr: false,
      maghrib: false,
      isha: false,
      duha: false,
      rawatib: false,
      witr: false,
    };
  });

  // Subscribe to adhan service state (is playing)
  useEffect(() => {
    return subscribeAdhanState((playing) => {
      setIsAdhanActive(playing);
    });
  }, []);

  // Clock tick every second for real-time countdown & exact precision
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save selected city
  const handleSelectCity = (city: CityCoordinates) => {
    setSelectedCity(city);
    try {
      localStorage.setItem('quran_selected_city_name', city.name);
    } catch {
      // ignore
    }
  };

  // GPS Geolocation Auto-Detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('خدمة تحديد الموقع الجغرافي غير مدعومة في متصفحك.');
      return;
    }
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Find nearest city or create custom city coordinate
        const customCity: CityCoordinates = {
          name: 'موقعي الحالي',
          country: 'GPS',
          lat: latitude,
          lng: longitude,
          timezone: Math.round(-new Date().getTimezoneOffset() / 60),
          timezoneString: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
        setSelectedCity(customCity);
        setIsGpsLoading(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsGpsLoading(false);
      },
      { timeout: 8000 }
    );
  };

  // Toggle daily prayer in tracker
  const handleTogglePrayerCheck = (id: string) => {
    setDailyChecklist((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(todayDateKey, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Calculate current city prayer times
  const currentPrayerTimes: PrayerTimesResult = useMemo(() => {
    return calculatePrayerTimes(
      selectedCity.lat,
      selectedCity.lng,
      currentTime,
      selectedCity.timezoneString
    );
  }, [selectedCity, currentTime]);

  const hijriDate = getHijriDate(currentTime);
  const qiblaBearing = useMemo(() => calculateQiblaBearing(selectedCity.lat, selectedCity.lng), [selectedCity]);
  const distanceToKaaba = useMemo(() => calculateDistanceToKaaba(selectedCity.lat, selectedCity.lng), [selectedCity]);
  const cardinalDirection = useMemo(() => getCompassCardinalName(qiblaBearing), [qiblaBearing]);

  // Astronomical Night Calculations: Midnight & Last Third
  const nightCalculations = useMemo(() => {
    try {
      // Maghrib to Fajr duration
      const [mH, mM] = currentPrayerTimes.maghrib.split(':').map(Number);
      const [fH, fM] = currentPrayerTimes.fajr.split(':').map(Number);
      
      let maghribMin = mH * 60 + mM;
      let fajrMin = fH * 60 + fM;
      if (fajrMin < maghribMin) {
        fajrMin += 24 * 60; // next day fajr
      }
      const totalNightMinutes = fajrMin - maghribMin;

      // Islamic Midnight = Maghrib + total/2
      const midnightMinutes = (maghribMin + totalNightMinutes / 2) % (24 * 60);
      const midH = Math.floor(midnightMinutes / 60);
      const midM = Math.floor(midnightMinutes % 60);
      const midnight12 = `${midH === 0 ? 12 : midH > 12 ? midH - 12 : midH}:${String(midM).padStart(2, '0')} ${midH >= 12 ? 'م' : 'ص'}`;

      // Last Third = Maghrib + total * 2/3
      const lastThirdMinutes = (maghribMin + (totalNightMinutes * 2) / 3) % (24 * 60);
      const ltH = Math.floor(lastThirdMinutes / 60);
      const ltM = Math.floor(lastThirdMinutes % 60);
      const lastThird12 = `${ltH === 0 ? 12 : ltH > 12 ? ltH - 12 : ltH}:${String(ltM).padStart(2, '0')} ${ltH >= 12 ? 'م' : 'ص'}`;

      // Sahoor & Imsak = 15 min before Fajr
      let sahoorMinutes = (fajrMin - 15) % (24 * 60);
      const sH = Math.floor(sahoorMinutes / 60);
      const sM = Math.floor(sahoorMinutes % 60);
      const sahoor12 = `${sH === 0 ? 12 : sH > 12 ? sH - 12 : sH}:${String(sM).padStart(2, '0')} ${sH >= 12 ? 'م' : 'ص'}`;

      return {
        midnight12,
        lastThird12,
        sahoor12,
      };
    } catch {
      return {
        midnight12: '11:45 م',
        lastThird12: '01:30 ص',
        sahoor12: '04:15 ص',
      };
    }
  }, [currentPrayerTimes]);

  // Sun Celestial Arc Position percentage
  const sunArcPosition = useMemo(() => {
    try {
      const nowH = currentTime.getHours();
      const nowM = currentTime.getMinutes();
      const nowTotalMin = nowH * 60 + nowM;

      const [srH, srM] = currentPrayerTimes.sunrise.split(':').map(Number);
      const [ssH, ssM] = currentPrayerTimes.maghrib.split(':').map(Number);
      const sunriseMin = srH * 60 + srM;
      const sunsetMin = ssH * 60 + ssM;

      if (nowTotalMin >= sunriseMin && nowTotalMin <= sunsetMin) {
        // Daylight phase (0% to 100%)
        const pct = ((nowTotalMin - sunriseMin) / (sunsetMin - sunriseMin)) * 100;
        return { isDay: true, percent: Math.max(0, Math.min(100, Math.round(pct))) };
      } else {
        // Night phase
        return { isDay: false, percent: 50 };
      }
    } catch {
      return { isDay: true, percent: 50 };
    }
  }, [currentTime, currentPrayerTimes]);

  // Filtered cities list
  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return POPULAR_CITIES;
    const q = searchQuery.trim().toLowerCase();
    return POPULAR_CITIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Quick curated cities
  const quickCities = useMemo(() => {
    const topNames = ['مكة المكرمة', 'المدينة المنورة', 'القدس الشريف', 'القاهرة', 'الرياض', 'دبي', 'الكويت'];
    const list = POPULAR_CITIES.filter((c) => topNames.includes(c.name));
    if (!list.some((c) => c.name === selectedCity.name)) {
      return [selectedCity, ...list];
    }
    return list;
  }, [selectedCity]);

  // Main 6 prayer cards
  const prayerCards = [
    { id: 'fajr', name: 'الفجر', time12: currentPrayerTimes.fajr12, icon: Sunrise, desc: 'صلاة الصبح' },
    { id: 'sunrise', name: 'الشروق', time12: currentPrayerTimes.sunrise12, icon: Sun, desc: 'شروق الشمس' },
    { id: 'dhuhr', name: 'الظهر', time12: currentPrayerTimes.dhuhr12, icon: Sun, desc: 'زوال الشمس' },
    { id: 'asr', name: 'العصر', time12: currentPrayerTimes.asr12, icon: Sun, desc: 'ظل الشيء مثليه' },
    { id: 'maghrib', name: 'المغرب', time12: currentPrayerTimes.maghrib12, icon: Sunset, desc: 'غروب القرص' },
    { id: 'isha', name: 'العشاء', time12: currentPrayerTimes.isha12, icon: Moon, desc: 'غيبوبة الشفق' },
  ];

  // Adhan Play Toggle
  const handleToggleAdhan = async () => {
    if (isAdhanPlaying()) {
      stopAdhan();
      setIsAdhanActive(false);
    } else {
      setIsAdhanActive(true);
      await playAdhan(selectedVoiceId, 0.9).catch(() => setIsAdhanActive(false));
    }
  };

  const completedFardCount = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].filter((p) => dailyChecklist[p]).length;

  return (
    <div className="space-y-8 pb-20 select-none font-cairo">
      {/* ============================================================ */}
      {/* 1. Celestial Astronomical Dome: Sun Arc & Next Prayer Heartbeat */}
      {/* ============================================================ */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 shadow-2xl transition-all duration-300 border border-amber-400/30 bg-gradient-to-br from-[#060D1A] via-[#0B172B] to-[#071020] text-slate-100">
        {/* Ambient Radial Lights */}
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Top Bar: Hijri Date, City Pill, & GPS Button */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-2xl bg-amber-400/15 text-amber-300 border border-amber-400/30 font-bold text-xs tracking-wide">
                {hijriDate}
              </span>

              {/* City Selection Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/10 text-slate-200 text-xs font-semibold border border-white/15">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{selectedCity.name}</span>
                {selectedCity.country && (
                  <span className="text-slate-400 font-normal">({selectedCity.country})</span>
                )}
              </div>
            </div>

            {/* GPS Auto-Detect Button */}
            <button
              onClick={handleDetectLocation}
              disabled={isGpsLoading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
              title="تحديد الموقع الجغرافي التلقائي"
            >
              <Navigation className={`w-3.5 h-3.5 text-cyan-400 ${isGpsLoading ? 'animate-spin' : ''}`} />
              <span>{isGpsLoading ? 'جاري التحديد...' : 'موقعي عبر GPS'}</span>
            </button>
          </div>

          {/* Center Stage: Next Prayer Countdown & Sky Arc Visualizer */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center pt-2">
            
            {/* Left Box: Large Countdown Timer to Next Prayer */}
            <div className="space-y-3 text-right">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">
                  الصلاة القادمة
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-amiri font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-200 leading-tight">
                صلاة {currentPrayerTimes.nextPrayer.name}
              </h1>

              <div className="flex items-center gap-3 pt-1">
                <span className="text-sm text-slate-300">موعد الأذان:</span>
                <span className="text-xl sm:text-2xl font-mono font-black text-amber-300">
                  {currentPrayerTimes.nextPrayer.time12}
                </span>
              </div>

              {/* Digital Countdown Timer Display */}
              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-black/40 border border-amber-400/40 shadow-inner mt-2" dir="ltr">
                <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
                <span className="font-mono text-2xl sm:text-3xl font-black text-amber-300 tracking-wider tabular-nums">
                  {currentPrayerTimes.nextPrayer.timeRemainingFormatted}
                </span>
                <span className="text-xs text-slate-400 font-cairo pr-2 border-r border-white/10">متبقي</span>
              </div>

              {/* Action Buttons: Play Adhan & Du'a */}
              <div className="flex flex-wrap items-center gap-2.5 pt-3">
                <button
                  onClick={handleToggleAdhan}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                    isAdhanActive
                      ? 'bg-amber-400 text-stone-950 animate-pulse'
                      : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950'
                  }`}
                >
                  {isAdhanActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isAdhanActive ? 'إيقاف صوت الأذان' : 'استماع لصوت الأذان'}</span>
                </button>

                <button
                  onClick={() => setShowDuaAfterAdhan(!showDuaAfterAdhan)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold border border-white/15 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>دعاء بعد الأذان</span>
                </button>

                <button
                  onClick={() => setIsAdhanSettingOpen(!isAdhanSettingOpen)}
                  className="p-2 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white border border-white/15 transition-all"
                  title="إعدادات وصوت الأذان"
                >
                  <Bell className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>

            {/* Right Box: Interactive Astronomical Sky Arc Visualizer */}
            <div className="p-6 rounded-3xl bg-[#091322]/80 border border-white/15 shadow-xl text-center space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 font-bold text-amber-300">
                  <Sun className="w-3.5 h-3.5" />
                  <span>مسار الشمس والفلك الحي</span>
                </span>
                <span className="font-mono text-cyan-300">
                  {sunArcPosition.isDay ? `النهار: ${sunArcPosition.percent}%` : 'الليل مستمر'}
                </span>
              </div>

              {/* Sky Dome Arc Graphic */}
              <div className="relative w-full h-28 overflow-hidden flex items-end justify-center">
                {/* Semicircle Sky Dome Ring */}
                <div className="w-56 h-56 rounded-full border-2 border-dashed border-amber-400/30 relative flex items-center justify-center">
                  {/* Glowing celestial orb indicating Sun or Moon */}
                  <div
                    className="absolute w-6 h-6 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.9)] flex items-center justify-center transition-all duration-1000"
                    style={{
                      left: `${sunArcPosition.percent}%`,
                      top: `${Math.sin((sunArcPosition.percent / 100) * Math.PI) * -40 + 50}%`,
                    }}
                  >
                    {sunArcPosition.isDay ? (
                      <Sun className="w-3.5 h-3.5 text-stone-950 animate-spin" style={{ animationDuration: '10s' }} />
                    ) : (
                      <Moon className="w-3.5 h-3.5 text-stone-950" />
                    )}
                  </div>
                </div>

                {/* Horizon Line */}
                <div className="absolute bottom-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
              </div>

              {/* Celestial Markers: Sunrise, Dhuhr, Sunset */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>الشروق: {currentPrayerTimes.sunrise12}</span>
                <span className="text-amber-300 font-bold">الزوال: {currentPrayerTimes.dhuhr12}</span>
                <span>الغروب: {currentPrayerTimes.maghrib12}</span>
              </div>
            </div>

          </div>

          {/* Quick Curated City Selector */}
          <div className="pt-4 border-t border-white/10">
            <span className="text-[11px] font-bold text-slate-400 block mb-2">
              اختيار سريع للمدينة:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickCities.map((city) => {
                const isActive = selectedCity.name === city.name;
                return (
                  <button
                    key={city.name}
                    onClick={() => handleSelectCity(city)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-400 text-stone-950 font-bold shadow-md scale-105'
                        : 'bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10'
                    }`}
                  >
                    {city.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. Prophetic Post-Adhan Supplication Modal / Dropdown */}
      {/* ============================================================ */}
      {showDuaAfterAdhan && (
        <div className="rounded-3xl p-6 bg-gradient-to-br from-[#122238] via-[#0E1A2C] to-[#0A1422] border border-amber-400/40 shadow-xl space-y-3 text-right animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-amiri font-bold text-lg text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>دعاء ما بعد سماع الأذان (سنة مؤكدة)</span>
            </h3>
            <button
              onClick={() => setShowDuaAfterAdhan(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10"
            >
              إغلاق
            </button>
          </div>
          <p className="font-amiri text-lg sm:text-xl font-bold text-slate-100 leading-relaxed border-y border-white/10 py-3">
            «اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ القَائِمَةِ، آتِ مُحَمَّداً الوَسِيلَةَ وَالفَضِيلَةَ، وَابْعَثْهُ مَقَاماً مَحْمُوداً الَّذِي وَعَدْتَهُ، [إِنَّكَ لَا تُخْلِفُ المِيعَادَ]».
          </p>
          <p className="text-xs text-slate-300 font-cairo">
            فضل الدعاء: قال رسول الله ﷺ: «من قال حين يسمع النداء... حلت له شفاعتي يوم القيامة». (صحيح البخاري)
          </p>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. Adhan Voices & Sound Settings Drawer */}
      {/* ============================================================ */}
      {isAdhanSettingOpen && (
        <div className="rounded-3xl p-6 bg-[#0E1726]/90 border border-white/15 shadow-xl space-y-4 text-right animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-amber-300 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>تخصيص مؤذن وتنبيهات الأذان</span>
            </h3>
            <button
              onClick={() => setIsAdhanSettingOpen(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10"
            >
              تم
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {ADHAN_VOICES.map((voice) => (
              <button
                key={voice.id}
                onClick={() => {
                  setSelectedVoiceId(voice.id);
                  saveAdhanSettings({ voiceId: voice.id });
                }}
                className={`p-3 rounded-2xl text-right transition-all border ${
                  selectedVoiceId === voice.id
                    ? 'bg-amber-400/20 border-amber-400 text-amber-200 font-bold'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="text-xs font-bold">{voice.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{voice.location}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. The 6 Prayer Cards: Sleek Liquid Glass Grid */}
      {/* ============================================================ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-300 px-1">
          <span className="font-bold text-amber-300">صلوات اليوم في {selectedCity.name}:</span>
          <span className="font-mono text-slate-400">حساب فلكي معتمد</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {prayerCards.map((card) => {
            const isNext = currentPrayerTimes.nextPrayer.id === card.id;
            const Icon = card.icon;

            return (
              <div
                key={card.id}
                className={`rounded-3xl p-4 sm:p-5 text-center transition-all duration-300 border flex flex-col justify-between gap-2.5 ${
                  isNext
                    ? 'bg-gradient-to-b from-[#18324D] via-[#102235] to-[#0A1724] border-amber-400/90 shadow-[0_10px_25px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/60 scale-[1.03]'
                    : 'bg-[#0A1220]/80 hover:bg-[#0E1A2C] border-white/10 hover:border-amber-400/40 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Icon className={`w-4 h-4 ${isNext ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span className={`text-sm font-bold ${isNext ? 'text-amber-200' : 'text-slate-200'}`}>
                    {card.name}
                  </span>
                </div>

                <div className="font-mono text-base sm:text-lg font-black tracking-tight text-amber-300 tabular-nums">
                  {card.time12}
                </div>

                <div className="text-[10px] text-slate-400 font-cairo">
                  {isNext ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40 animate-pulse">
                      الصلاة القادمة
                    </span>
                  ) : (
                    <span>{card.desc}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. INNOVATION 1: The Night Tahajjud & Last Third Calculator */}
      {/* (حاسبة الثلث الأخير من الليل والتهجد - نادرة وغير متوفرة) */}
      {/* ============================================================ */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#0D1525] via-[#111C30] to-[#080E1B] border border-cyan-400/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Moon className="w-4 h-4 text-cyan-400" />
              <h2 className="text-lg sm:text-xl font-amiri font-bold text-cyan-200">
                حاسبة قيام الليل والثلث الأخير
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              حساب فلكي دقيق لأوقات التنزل الإلهي واستجابة الدعاء بين المغرب وفجر الغد
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] px-3 py-1 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-400/30 font-bold">
              وقت استجابة الدعاء
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
          {/* Box 1: Islamic Midnight */}
          <div className="rounded-2xl p-4 bg-white/5 border border-white/10 text-right space-y-1">
            <span className="text-[11px] text-slate-400 block font-bold">منتصف الليل الشرعي</span>
            <span className="font-mono text-lg font-black text-amber-300 block">{nightCalculations.midnight12}</span>
            <span className="text-[10px] text-slate-400">نهاية وقت صلاة العشاء المختار</span>
          </div>

          {/* Box 2: Last Third of the Night */}
          <div className="rounded-2xl p-4 bg-gradient-to-br from-cyan-950/50 to-blue-900/30 border border-cyan-400/40 text-right space-y-1 shadow-md">
            <span className="text-[11px] text-cyan-300 block font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>بداية الثلث الأخير (التهجد)</span>
            </span>
            <span className="font-mono text-xl font-black text-cyan-200 block">{nightCalculations.lastThird12}</span>
            <span className="text-[10px] text-cyan-300/80">أفضل أوقات القيام والوتر والدعاء</span>
          </div>

          {/* Box 3: Sahoor & Imsak */}
          <div className="rounded-2xl p-4 bg-white/5 border border-white/10 text-right space-y-1">
            <span className="text-[11px] text-slate-400 block font-bold">السحور والإمساك</span>
            <span className="font-mono text-lg font-black text-amber-300 block">{nightCalculations.sahoor12}</span>
            <span className="text-[10px] text-slate-400">١٥ دقيقة قبل أذان الفجر</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 6. INNOVATION 2: Daily Prayer & Sunnah Checklist Tracker */}
      {/* (سجل صلواتي اليومية وسنن الرواتب مع سلسلة الإنجاز) */}
      {/* ============================================================ */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#0E1F18] via-[#10291F] to-[#0A1A14] border border-emerald-500/30 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-emerald-400" />
              <h2 className="text-lg sm:text-xl font-amiri font-bold text-emerald-200">
                سجل صلواتي اليومية وسنن الرواتب
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              تابع أداء صلواتك الخمس والسنن المؤكدة اليوم بخصوصية تامة محفوظة على جهازك
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 px-3.5 py-1.5 rounded-2xl border border-emerald-400/30">
              الفرائض المكتملة: {completedFardCount} من ٥
            </span>
          </div>
        </div>

        {/* 5 Fard Prayers Checkbox Row */}
        <div>
          <span className="text-xs font-bold text-slate-300 block mb-2">الصلوات الخمس المفروضة:</span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              { id: 'fajr', label: 'الفجر' },
              { id: 'dhuhr', label: 'الظهر' },
              { id: 'asr', label: 'العصر' },
              { id: 'maghrib', label: 'المغرب' },
              { id: 'isha', label: 'العشاء' },
            ].map((p) => {
              const isChecked = dailyChecklist[p.id];
              return (
                <button
                  key={p.id}
                  onClick={() => handleTogglePrayerCheck(p.id)}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                    isChecked
                      ? 'bg-emerald-500 text-stone-950 font-bold shadow-md border-emerald-400'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                >
                  <span className="text-xs">{p.label}</span>
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center ${isChecked ? 'bg-stone-950 text-emerald-400 border-stone-950' : 'border-white/20'}`}>
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sunnah & Nawafil Checkbox Row */}
        <div className="pt-2 border-t border-white/10">
          <span className="text-xs font-bold text-slate-400 block mb-2">السنن والنوافل المؤكدة:</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { id: 'duha', label: 'صلاة الضحى (ركعتان فأكثر)' },
              { id: 'rawatib', label: 'سنن الرواتب (١٢ ركعة)' },
              { id: 'witr', label: 'الشفع والوتر / قيام الليل' },
            ].map((s) => {
              const isChecked = dailyChecklist[s.id];
              return (
                <button
                  key={s.id}
                  onClick={() => handleTogglePrayerCheck(s.id)}
                  className={`p-2.5 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                    isChecked
                      ? 'bg-emerald-950/80 text-emerald-200 font-bold border-emerald-400/50 shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                >
                  <span>{s.label}</span>
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${isChecked ? 'bg-emerald-400 text-stone-950 border-emerald-400' : 'border-white/20'}`}>
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {completedFardCount === 5 && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 text-xs text-emerald-200 text-center font-bold flex items-center justify-center gap-2">
            <Heart className="w-4 h-4 text-emerald-400 fill-current" />
            <span>ما شاء الله! أتممت صلواتك الخمس اليوم، تقبل الله طاعاتك وصالح أعمالك 🤲</span>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 7. Qibla Radar & Kaaba Compass Direction Strip */}
      {/* ============================================================ */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-[#0F1827] via-[#121E31] to-[#0A1220] border border-amber-400/25 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center shadow-xs shrink-0">
            <Compass className="w-6 h-6 text-amber-400" />
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-300">اتجاه القبلة من {selectedCity.name}</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 font-bold">
                {qiblaBearing}° {cardinalDirection}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              تبعد الكعبة المشرفة بمكة المكرمة عنك مسافة <strong className="text-amber-200">{distanceToKaaba.toLocaleString('ar-EG')} كم</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            window.location.hash = '#qibla';
            // navigate tab
            const qiblaTab = document.querySelector('button[data-tab="qibla"]') as HTMLElement;
            if (qiblaTab) qiblaTab.click();
          }}
          className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-amber-400 hover:text-stone-950 text-amber-300 text-xs font-bold transition-all border border-white/15 hover:border-amber-400"
        >
          فتح البوصلة التفاعلية
        </button>
      </div>

      {/* ============================================================ */}
      {/* 8. Global Cities Search Dialog */}
      {/* ============================================================ */}
      <div className="space-y-3 pt-2">
        <div className="relative max-w-md">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن مدينتك من بين عواصم ومدن العالم..."
            className="w-full pr-10 pl-4 py-2.5 text-xs sm:text-sm rounded-2xl ios-liquid-glass focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/40 text-slate-100 placeholder:text-slate-400 transition-all text-right"
          />
        </div>

        {searchQuery && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto p-2 rounded-2xl ios-liquid-glass">
            {filteredCities.map((c) => (
              <button
                key={c.name}
                onClick={() => {
                  handleSelectCity(c);
                  setSearchQuery('');
                }}
                className={`p-2 rounded-xl text-right text-xs transition-colors ${
                  selectedCity.name === c.name
                    ? 'bg-amber-400 text-stone-950 font-bold'
                    : 'bg-white/5 hover:bg-white/10 text-slate-200'
                }`}
              >
                <div>{c.name}</div>
                <div className="text-[10px] opacity-70">{c.country}</div>
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
