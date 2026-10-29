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
} from 'lucide-react';
import {
  POPULAR_CITIES,
  CityCoordinates,
  calculatePrayerTimes,
  getHijriDate,
  PrayerTimesResult,
} from '../utils/prayerCalculations';
import { AdhanPlayerBanner } from './AdhanPlayerBanner';
import { PrayerWeatherCard } from './PrayerWeatherCard';
import {
  loadAdhanSettings,
  playAdhan,
  stopAdhan,
  isAdhanPlaying,
  subscribeAdhanState,
} from '../utils/adhanService';
import { sendPrayerNotification } from '../utils/notificationService';

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

  // Save selected city
  const handleSelectCity = (city: CityCoordinates) => {
    setSelectedCity(city);
    try {
      localStorage.setItem('quran_selected_city_name', city.name);
    } catch {
      // ignore
    }
  };

  // Clock tick every second for real-time countdown & exact precision
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate current city prayer times (certified exact astronomical calculation, 12-hour format)
  const currentPrayerTimes: PrayerTimesResult = useMemo(() => {
    return calculatePrayerTimes(
      selectedCity.lat,
      selectedCity.lng,
      currentTime,
      selectedCity.timezoneString
    );
  }, [selectedCity, currentTime]);

  const hijriDate = getHijriDate(currentTime);

  // Automatic Adhan trigger when prayer time is reached
  const lastTriggeredPrayerRef = useRef<string>('');

  useEffect(() => {
    const settings = loadAdhanSettings();
    if (!settings.autoPlayAdhan) return;

    // Check if secondsRemaining is 0 (or within 1s window)
    const { nextPrayer } = currentPrayerTimes;
    const secondsRemaining = nextPrayer.secondsRemaining;
    if (secondsRemaining <= 1) {
      const prayerKey = nextPrayer.id as keyof typeof settings.enabledPrayers;
      if (settings.enabledPrayers[prayerKey] && lastTriggeredPrayerRef.current !== nextPrayer.id) {
        lastTriggeredPrayerRef.current = nextPrayer.id;
        playAdhan(settings.voiceId, settings.volume).catch(() => {
          // audio autoplay may be blocked until user interacts
        });

        // Browser notification if permitted
        sendPrayerNotification(
          `حان الآن موعد أذان ${nextPrayer.name}`,
          `الله أكبر، حان الآن موعد أذان ${nextPrayer.name} في ${selectedCity.name}`
        ).catch(() => {});
      }
    } else if (secondsRemaining > 10) {
      // Reset trigger lock for next prayer cycle
      if (lastTriggeredPrayerRef.current === nextPrayer.id) {
        lastTriggeredPrayerRef.current = '';
      }
    }
  }, [currentPrayerTimes, selectedCity.name]);

  // Filtered cities list
  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return POPULAR_CITIES;
    const q = searchQuery.trim().toLowerCase();
    return POPULAR_CITIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Quick curated cities for top header chips
  const quickCities = useMemo(() => {
    const topNames = [
      'مكة المكرمة',
      'المدينة المنورة',
      'القدس الشريف',
      'القاهرة',
      'الإسكندرية',
      'الرياض',
      'دبي',
      'عمان',
      'بغداد',
      'الدوحة',
      'الكويت',
    ];
    const list = POPULAR_CITIES.filter((c) => topNames.includes(c.name));
    if (!list.some((c) => c.name === selectedCity.name)) {
      return [selectedCity, ...list];
    }
    return list;
  }, [selectedCity]);

  // Prayer Cards for Selected City
  const prayerCards = [
    { id: 'fajr', name: 'الفجر', time12: currentPrayerTimes.fajr12, icon: Sunrise },
    { id: 'sunrise', name: 'الشروق', time12: currentPrayerTimes.sunrise12, icon: Sun },
    { id: 'dhuhr', name: 'الظهر', time12: currentPrayerTimes.dhuhr12, icon: Sun },
    { id: 'asr', name: 'العصر', time12: currentPrayerTimes.asr12, icon: Sun },
    { id: 'maghrib', name: 'المغرب', time12: currentPrayerTimes.maghrib12, icon: Sunset },
    { id: 'isha', name: 'العشاء', time12: currentPrayerTimes.isha12, icon: Moon },
  ];

  return (
    <div className="space-y-6 pb-16 font-cairo">
      {/* Editorial Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c241c] via-[#123126] to-[#0a1814] text-[#EAEFEA] p-5 sm:p-7 shadow-xl border border-[#214336]">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-amber-300 font-semibold">
              {hijriDate}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-amiri font-bold text-amber-200">
            الصلاة
          </h1>

          <div className="flex items-center gap-2 pt-0.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#142621] text-amber-200 border border-[#234439] font-bold text-xs">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{selectedCity.name}</span>
              {selectedCity.country && (
                <span className="text-[#8EA89D] text-[11px] font-normal">
                  ({selectedCity.country})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick City Selector Chips */}
        <div className="mt-4 pt-3 border-t border-[#1C392F]">
          <span className="text-[11px] text-[#8EA89D] block mb-1.5 font-medium">
            اختيار سريع للمدينة:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickCities.map((city) => {
              const isActive = selectedCity.name === city.name;
              return (
                <button
                  key={city.name}
                  onClick={() => handleSelectCity(city)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-xs ring-1 ring-amber-400'
                      : 'bg-[#142621] text-[#9FB6AC] hover:text-amber-200 hover:bg-[#1A342B] border border-[#213F34]'
                  }`}
                >
                  {city.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Adhan Player Banner: Direct Play, Voice Selection & Notifications */}
      <AdhanPlayerBanner
        nextPrayerName={currentPrayerTimes.nextPrayer.name}
        nextPrayerTime={currentPrayerTimes.nextPrayer.time12}
        secondsRemaining={currentPrayerTimes.nextPrayer.secondsRemaining}
      />

      {/* Live Weather & Prayer Context Card */}
      <PrayerWeatherCard
        city={selectedCity}
        nextPrayer={currentPrayerTimes.nextPrayer}
      />

      {/* 6 Prayer Times Cards for Active City - Compact, simple, smaller text */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#8EA89D] px-1">
          <span className="font-semibold text-[#D6E6DE]">
            صلوات اليوم في {selectedCity.name}:
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
          {prayerCards.map((card) => {
            const isNext = currentPrayerTimes.nextPrayer.id === card.id;
            const Icon = card.icon;

            return (
              <div
                key={card.id}
                className={`py-2.5 px-2 rounded-xl border text-center transition-all ${
                  isNext
                    ? 'bg-[#18322A] border-amber-500/70 shadow-xs ring-1 ring-amber-500/30'
                    : 'bg-[#142520] border-[#213C33]'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Icon className={`w-3.5 h-3.5 ${isNext ? 'text-amber-400' : 'text-[#8EA89D]'}`} />
                  <span className={`text-xs font-semibold ${isNext ? 'text-amber-200' : 'text-[#EAEFEA]'}`}>
                    {card.name}
                  </span>
                </div>

                <div className="font-mono text-xs sm:text-sm font-bold tracking-tight text-amber-300 tabular-nums">
                  {card.time12}
                </div>

                {isNext && (
                  <div className="mt-1">
                    <span className="inline-block text-[10px] text-amber-400 font-medium">
                      القادم
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* All Places / Cities Section - Rendered as pristine, fully responsive Cards (Zero clipping, nothing half-hidden) */}
      <div className="rounded-2xl bg-[#12221D] border border-[#214237] p-4 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1C382F]">
          <div>
            <h2 className="text-base sm:text-lg font-amiri font-bold text-amber-200">
              أوقات الصلاة في المدن والعواصم
            </h2>
            <p className="text-[11px] text-[#8EA89D] mt-0.5">
              مواعيد الصلاة لمختلف المدن مرتبة وواضحة.
            </p>
          </div>

          {/* Simple search filter */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#7A988E] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="ابحث عن مكان (مثل: مكة، القاهرة...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-8.5 pl-3 py-1.5 text-xs rounded-xl bg-[#142621] border border-[#234439] text-[#EAEFEA] placeholder:text-[#7A988E] focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* Responsive Grid of City Cards: 100% visible on any screen, zero hidden columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredCities.map((city) => {
            const times = calculatePrayerTimes(
              city.lat,
              city.lng,
              currentTime,
              city.timezoneString
            );
            const isSelected =
              selectedCity.name === city.name && selectedCity.country === city.country;

            return (
              <div
                key={`${city.name}-${city.country}`}
                onClick={() => handleSelectCity(city)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#18362C] border-amber-500/70 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-[#142520] hover:bg-[#162c24] border-[#203D33]'
                }`}
              >
                {/* City Card Header */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#1C362E]">
                  <div className="flex items-center gap-2">
                    <MapPin
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? 'text-amber-400' : 'text-[#7A988E]'
                      }`}
                    />
                    <div>
                      <h3 className="font-amiri font-bold text-base text-[#EAEFEA] leading-tight">
                        {city.name}
                      </h3>
                      <span className="text-[11px] text-[#8EA89D]">
                        {city.country}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectCity(city);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 font-bold'
                        : 'bg-[#183229] hover:bg-amber-500 hover:text-stone-950 text-amber-300 border border-[#274B3E]'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>محدد</span>
                      </>
                    ) : (
                      <span>عرض</span>
                    )}
                  </button>
                </div>

                {/* 6 Prayer Times in Clean 3x2 Grid (All visible, no truncation, no clipping) */}
                <div className="grid grid-cols-3 gap-2 pt-3">
                  <div className="bg-[#0E1B17] p-2 rounded-lg text-center border border-[#193228]">
                    <span className="block text-[11px] text-[#8EA89D] font-amiri font-bold">
                      الفجر
                    </span>
                    <span className="block text-xs font-mono font-bold text-amber-300 mt-0.5">
                      {times.fajr12}
                    </span>
                  </div>

                  <div className="bg-[#0E1B17] p-2 rounded-lg text-center border border-[#193228]">
                    <span className="block text-[11px] text-[#8EA89D] font-amiri font-bold">
                      الشروق
                    </span>
                    <span className="block text-xs font-mono font-bold text-[#9FB6AC] mt-0.5">
                      {times.sunrise12}
                    </span>
                  </div>

                  <div className="bg-[#0E1B17] p-2 rounded-lg text-center border border-[#193228]">
                    <span className="block text-[11px] text-[#8EA89D] font-amiri font-bold">
                      الظهر
                    </span>
                    <span className="block text-xs font-mono font-bold text-amber-300 mt-0.5">
                      {times.dhuhr12}
                    </span>
                  </div>

                  <div className="bg-[#0E1B17] p-2 rounded-lg text-center border border-[#193228]">
                    <span className="block text-[11px] text-[#8EA89D] font-amiri font-bold">
                      العصر
                    </span>
                    <span className="block text-xs font-mono font-bold text-amber-300 mt-0.5">
                      {times.asr12}
                    </span>
                  </div>

                  <div className="bg-[#0E1B17] p-2 rounded-lg text-center border border-[#193228]">
                    <span className="block text-[11px] text-[#8EA89D] font-amiri font-bold">
                      المغرب
                    </span>
                    <span className="block text-xs font-mono font-bold text-amber-300 mt-0.5">
                      {times.maghrib12}
                    </span>
                  </div>

                  <div className="bg-[#0E1B17] p-2 rounded-lg text-center border border-[#193228]">
                    <span className="block text-[11px] text-[#8EA89D] font-amiri font-bold">
                      العشاء
                    </span>
                    <span className="block text-xs font-mono font-bold text-amber-300 mt-0.5">
                      {times.isha12}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
