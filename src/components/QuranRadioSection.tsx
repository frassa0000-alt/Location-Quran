import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  Radio,
  Volume2,
  VolumeX,
  MapPin,
  Clock,
  Sparkles,
  Search,
  Star,
  Share2,
  Moon,
  Check,
  RotateCcw,
  Signal,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Disc,
} from 'lucide-react';
import { RADIO_STATIONS, RadioStation } from '../data/radioStations';

// Simulated FM frequencies for aesthetic radio tuner dial
const STATION_FREQUENCIES: Record<string, string> = {
  cairo: '98.2 FM',
  makkah: '100.5 FM',
  makkah_sudais: '94.8 FM',
  abdulbasit_radio: '91.2 FM',
  minshawi_radio: '89.4 FM',
  husary_radio: '95.6 FM',
  alafasy_radio: '102.3 FM',
  maher_radio: '97.1 FM',
  dossari_radio: '104.0 FM',
  ajmi_radio: '93.7 FM',
  tafsir_radio: '106.8 FM',
  adhkar_radio: '88.5 FM',
};

const FAVORITES_STORAGE_KEY = 'quran_radio_favorites_v1';

export const QuranRadioSection: React.FC = () => {
  const [currentStation, setCurrentStation] = useState<RadioStation>(RADIO_STATIONS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'favorites' | 'general' | 'reciter' | 'tafsir'>('all');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['cairo', 'makkah'];
    } catch {
      return ['cairo', 'makkah'];
    }
  });

  // Sleep Timer state
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepSecondsLeft, setSleepSecondsLeft] = useState<number | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Live Local Time in the broadcasting city
  const [cityLocalTime, setCityLocalTime] = useState<string>('');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Update city clock every second according to current station timezone
  useEffect(() => {
    const updateTime = () => {
      try {
        const timeStr = new Intl.DateTimeFormat('ar-EG', {
          timeZone: currentStation.timeZone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }).format(new Date());
        setCityLocalTime(timeStr);
      } catch {
        setCityLocalTime(new Date().toLocaleTimeString('ar-EG'));
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [currentStation]);

  // Volume synchronization
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Sleep Timer Countdown
  useEffect(() => {
    if (sleepSecondsLeft === null || sleepSecondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSleepSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          if (audioRef.current) audioRef.current.pause();
          setIsPlaying(false);
          setSleepTimerMinutes(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sleepSecondsLeft]);

  // MediaSession API integration for background & lockscreen playback
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentStation.name,
        artist: `إذاعة القرآن الكريم · توقيت ${currentStation.city}`,
        album: 'بث حي ومباشر 24/7',
        artwork: [
          { src: '/favicon.svg', sizes: '192x192', type: 'image/svg+xml' },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => togglePlay());
      navigator.mediaSession.setActionHandler('pause', () => togglePlay());
      navigator.mediaSession.setActionHandler('previoustrack', () => handlePrevStation());
      navigator.mediaSession.setActionHandler('nexttrack', () => handleNextStation());
    }
  }, [currentStation, isPlaying]);

  const handleSetSleepTimer = (minutes: number | null) => {
    setSleepTimerMinutes(minutes);
    if (minutes === null) {
      setSleepSecondsLeft(null);
    } else {
      setSleepSecondsLeft(minutes * 60);
    }
  };

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handlePlayStation = (station: RadioStation) => {
    if (currentStation.id === station.id && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setCurrentStation(station);
      setIsLoading(true);
      setStreamError(false);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = station.url;
        audioRef.current
          .play()
          .then(() => {
            setIsLoading(false);
          })
          .catch((err) => {
            console.warn('Radio stream playback error, trying fallback:', err);
            if (station.fallbackUrls && station.fallbackUrls.length > 0 && audioRef.current) {
              audioRef.current.src = station.fallbackUrls[0];
              audioRef.current
                .play()
                .then(() => {
                  setIsLoading(false);
                })
                .catch(() => {
                  setIsLoading(false);
                  setStreamError(true);
                  setIsPlaying(false);
                });
            } else {
              setIsLoading(false);
              setStreamError(true);
              setIsPlaying(false);
            }
          });
      }
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      setStreamError(false);
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(() => {
          setIsPlaying(false);
          setIsLoading(false);
          setStreamError(true);
        });
    }
  };

  const handleNextStation = () => {
    const currentIdx = RADIO_STATIONS.findIndex((s) => s.id === currentStation.id);
    const nextIdx = (currentIdx + 1) % RADIO_STATIONS.length;
    handlePlayStation(RADIO_STATIONS[nextIdx]);
  };

  const handlePrevStation = () => {
    const currentIdx = RADIO_STATIONS.findIndex((s) => s.id === currentStation.id);
    const prevIdx = (currentIdx - 1 + RADIO_STATIONS.length) % RADIO_STATIONS.length;
    handlePlayStation(RADIO_STATIONS[prevIdx]);
  };

  const handleShareStation = (station: RadioStation, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `استمع الآن إلى ${station.name} عبر موقع القرآن الكريم: ${window.location.href}`;
    if (navigator.share) {
      navigator.share({
        title: station.name,
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setShareFeedback(station.id);
      setTimeout(() => setShareFeedback(null), 2000);
    }
  };

  const filteredStations = useMemo(() => {
    return RADIO_STATIONS.filter((station) => {
      // Category filter
      if (selectedCategory === 'favorites' && !favorites.includes(station.id)) return false;
      if (selectedCategory === 'general' && station.category !== 'general') return false;
      if (selectedCategory === 'reciter' && station.category !== 'reciter') return false;
      if (selectedCategory === 'tafsir' && station.category !== 'tafsir') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return (
          station.name.toLowerCase().includes(q) ||
          station.city.toLowerCase().includes(q) ||
          station.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedCategory, searchQuery, favorites]);

  return (
    <div className="space-y-8 pb-20 select-none font-cairo">
      {/* Hidden Native Audio Element */}
      <audio
        ref={audioRef}
        src={currentStation.url}
        preload="none"
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onError={() => {
          setIsLoading(false);
          setIsPlaying(false);
          setStreamError(true);
        }}
      />

      {/* ============================================================ */}
      {/* 1. Brand New Luxury Master Console (استوديو الإذاعة العصري الجديد) */}
      {/* ============================================================ */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 shadow-2xl transition-all duration-300 border border-amber-400/30 bg-gradient-to-br from-[#070D18] via-[#0E1A2C] to-[#081220]">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Right Column: Radio Branding & Frequency Tuner */}
          <div className="flex-1 text-right space-y-4 w-full">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Live On-Air Pill */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span>بث مباشر حي 24/7</span>
              </span>

              {/* Station Frequency Display */}
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30 shadow-xs">
                <Signal className="w-3.5 h-3.5 text-amber-400" />
                <span>{STATION_FREQUENCIES[currentStation.id] || '101.5 FM'}</span>
              </span>

              {/* Broadcasting City Clock */}
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-400/30 shadow-xs">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>توقيت {currentStation.city}: {cityLocalTime || '--:--'}</span>
              </span>
            </div>

            {/* Station Title in Royal Gold Typography */}
            <div>
              <h1 className="text-2xl sm:text-4xl font-amiri font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-200 tracking-wide drop-shadow-xs leading-relaxed">
                {currentStation.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                {currentStation.description}
              </p>
            </div>

            {/* Quick Station Jump Strip (Radio Tuner Dial Buttons) */}
            <div className="pt-2">
              <label className="text-[11px] font-bold text-slate-400 block mb-1.5 flex items-center gap-1">
                <Radio className="w-3 h-3 text-amber-400" />
                <span>مفتاح المحطات السريعة:</span>
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {RADIO_STATIONS.slice(0, 6).map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handlePlayStation(st)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      currentStation.id === st.id
                        ? 'bg-amber-400 text-stone-950 font-bold shadow-md scale-105'
                        : 'bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10'
                    }`}
                  >
                    {st.name.replace('إذاعة ', '').split('-')[0].trim()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Left Column: Audiophile Sound Deck Player Console */}
          <div className="w-full lg:w-96 rounded-3xl p-5 sm:p-6 bg-[#0E1726]/80 backdrop-blur-xl border border-white/15 shadow-2xl space-y-4">
            
            {/* Top Deck Info: Live Spectrum Visualizer */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isPlaying ? 'bg-amber-400 text-stone-950 shadow-md' : 'bg-white/5 text-amber-300 border border-white/10'}`}>
                  <Disc className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">حالة البث</span>
                  <span className="text-xs font-bold text-amber-300">
                    {isLoading ? 'جاري الاتصال بالموجة...' : isPlaying ? 'البث متصل وصافٍ' : 'متوقف مؤقتاً'}
                  </span>
                </div>
              </div>

              {/* Dynamic 12-Bar Sound Waveform Spectrum */}
              <div className="flex items-end gap-1 h-8 px-2 py-1 rounded-xl bg-black/40 border border-white/5">
                {[30, 75, 100, 45, 85, 60, 95, 40, 70, 90, 50, 80].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-200 ${
                      isPlaying
                        ? 'bg-gradient-to-t from-cyan-400 to-amber-300 shadow-[0_0_6px_rgba(56,189,248,0.5)]'
                        : 'bg-slate-700'
                    }`}
                    style={{
                      height: isPlaying ? `${Math.max(20, Math.sin(Date.now() / 200 + i) * 40 + h * 0.6)}%` : '15%',
                      animation: isPlaying ? `pulse 1s infinite ${i * 0.08}s` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Master Control Buttons: Prev, Play/Pause, Next */}
            <div className="flex items-center justify-center gap-4 py-2" dir="ltr">
              <button
                onClick={handlePrevStation}
                className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-all active:scale-95 shadow-sm"
                title="المحطة السابقة"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlay}
                disabled={isLoading}
                className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-400 text-stone-950 flex items-center justify-center shadow-xl shadow-amber-950/40 hover:scale-105 active:scale-95 transition-all font-black border border-white/40"
                aria-label={isPlaying ? 'إيقاف البث' : 'تشغيل البث'}
                title={isPlaying ? 'إيقاف البث' : 'تشغيل البث'}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-3 border-stone-950 border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-1" />
                )}
              </button>

              <button
                onClick={handleNextStation}
                className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-all active:scale-95 shadow-sm"
                title="المحطة التالية"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Volume Control Slider */}
            <div className="flex items-center gap-3 pt-2 border-t border-white/10">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-amber-300 hover:text-white transition-colors"
                title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  setIsMuted(false);
                }}
                className="flex-1 h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />

              <span className="text-[11px] font-mono text-slate-400 tabular-nums w-8 text-center">
                {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
              </span>
            </div>

            {/* Sleep Timer & Favorite Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
              {/* Sleep Timer */}
              <div className="flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] text-slate-400">مؤقت النوم:</span>
                <div className="flex items-center gap-1">
                  {[
                    { m: null, label: 'إيقاف' },
                    { m: 15, label: '١٥ د' },
                    { m: 30, label: '٣٠ د' },
                    { m: 60, label: 'ساعة' },
                  ].map((it) => (
                    <button
                      key={String(it.m)}
                      onClick={() => handleSetSleepTimer(it.m)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                        sleepTimerMinutes === it.m
                          ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                          : 'bg-white/5 text-slate-300 hover:text-white'
                      }`}
                    >
                      {it.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Sleep Seconds Badge */}
              {sleepSecondsLeft !== null && (
                <span className="text-[10px] font-mono text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                  {Math.floor(sleepSecondsLeft / 60)}:{String(sleepSecondsLeft % 60).padStart(2, '0')}
                </span>
              )}
            </div>

          </div>
        </div>

        {/* Stream Error Banner */}
        {streamError && (
          <div className="mt-4 p-3 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-center justify-between gap-3">
            <span>تعذر الاتصال بالبث المباشر لهذه الإذاعة حالياً، تم تفعيل السيرفر البديل أو يمكنك اختيار محطة أخرى.</span>
            <button
              onClick={() => handlePlayStation(currentStation)}
              className="px-3 py-1 rounded-xl bg-red-800 hover:bg-red-700 text-white font-bold text-xs shrink-0 transition-colors"
            >
              إعادة الاتصال
            </button>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 2. Control Toolbar: Search & Smart Categories */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ابحث باسم الإذاعة، القارئ، أو المدينة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 text-xs sm:text-sm rounded-2xl ios-liquid-glass focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/40 text-slate-100 placeholder:text-slate-400 transition-all"
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

        {/* Category Segmented Pills */}
        <div className="flex flex-wrap items-center gap-1 p-1.5 ios-liquid-glass rounded-2xl text-xs font-semibold">
          {[
            { id: 'all', label: `الكل (${RADIO_STATIONS.length})` },
            { id: 'favorites', label: `المفضلة (${favorites.length})` },
            { id: 'general', label: 'العواصم والحرمين' },
            { id: 'reciter', label: 'كبار القراء' },
            { id: 'tafsir', label: 'التفسير والرقية' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'ios-glass-pill-active font-bold text-amber-200'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. High-Tech Grid of Radio Stations */}
      {/* ============================================================ */}
      {filteredStations.length === 0 ? (
        <div className="py-16 text-center ios-liquid-glass rounded-3xl p-8 space-y-3">
          <Radio className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">لم يتم العثور على محطات مطابقة</h3>
          <p className="text-xs text-slate-400">جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-amber-400/20 text-amber-300 font-bold text-xs hover:bg-amber-400 hover:text-stone-950 transition-all border border-amber-400/40"
          >
            عرض جميع الإذاعات
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStations.map((station) => {
            const isSelected = currentStation.id === station.id;
            const isStationActive = isSelected && isPlaying;
            const isFav = favorites.includes(station.id);
            const freq = STATION_FREQUENCIES[station.id] || '101.5 FM';

            return (
              <div
                key={station.id}
                onClick={() => handlePlayStation(station)}
                className={`group relative rounded-3xl p-5 border transition-all duration-300 cursor-pointer flex flex-col justify-between gap-4 select-none ${
                  isStationActive
                    ? 'bg-gradient-to-br from-[#122238] via-[#0E1A2C] to-[#0A1422] border-amber-400/90 shadow-[0_10px_30px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/60 scale-[1.01]'
                    : isSelected
                    ? 'bg-[#0E1726]/90 border-cyan-400/50 shadow-md'
                    : 'bg-[#09111E]/75 hover:bg-[#0E1A2C] border-white/10 hover:border-amber-400/40 shadow-sm'
                }`}
              >
                {/* Station Upper Row: FM Frequency & Favorite Button */}
                <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
                  <div className="flex items-center gap-1.5 font-mono font-bold">
                    <span className={`w-2 h-2 rounded-full ${isStationActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                    <span className="text-amber-300 text-[11px]">{freq}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400 text-[10px] font-cairo">بث متزامن</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Share Button */}
                    <button
                      onClick={(e) => handleShareStation(station, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="مشاركة رابط الإذاعة"
                    >
                      {shareFeedback === station.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Star Favorite Button */}
                    <button
                      onClick={(e) => toggleFavorite(station.id, e)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isFav
                          ? 'text-amber-400 bg-amber-400/10'
                          : 'text-slate-400 hover:text-amber-300 hover:bg-white/10'
                      }`}
                      title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Main Station Name & Description */}
                <div className="flex items-start justify-between gap-3 text-right">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-amiri text-lg font-bold text-slate-100 group-hover:text-amber-200 transition-colors truncate">
                      {station.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {station.description}
                    </p>
                  </div>

                  {/* Play / Pause Interactive Button */}
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                      isStationActive
                        ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-950/40 scale-105 border border-white/40'
                        : 'bg-white/10 group-hover:bg-amber-400 text-amber-300 group-hover:text-stone-950 border border-white/15 group-hover:border-amber-400'
                    }`}
                  >
                    {isStationActive ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </div>
                </div>

                {/* Station Bottom Tag: City Timing & Category */}
                <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-[11px] text-slate-400">
                  <span className="inline-flex items-center gap-1 text-cyan-300 font-semibold font-cairo">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>توقيت {station.city}</span>
                  </span>

                  <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                    {station.category === 'reciter'
                      ? 'إذاعة قارئ'
                      : station.category === 'tafsir'
                      ? 'إذاعة تفسير'
                      : 'إذاعة رسمية'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
