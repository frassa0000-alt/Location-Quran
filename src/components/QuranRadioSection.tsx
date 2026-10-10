import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Radio, Volume2, VolumeX, MapPin } from 'lucide-react';
import { RADIO_STATIONS, RadioStation } from '../data/radioStations';

export const QuranRadioSection: React.FC = () => {
  const [currentStation, setCurrentStation] = useState<RadioStation>(RADIO_STATIONS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamError, setStreamError] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

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

  return (
    <div className="space-y-8 pb-16">
      <audio
        ref={audioRef}
        src={currentStation.url}
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

      {/* Hero Marquee for Radio */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c241c] via-[#123126] to-[#0a1814] text-[#EAEFEA] p-6 sm:p-10 shadow-xl border border-[#214336]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold">
                بث حي ومباشر على مدار الساعة
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-amiri font-bold text-amber-200">
              إذاعات القرآن الكريم
            </h1>
            <p className="text-[#B5CBBF] text-xs sm:text-sm mt-1 font-cairo">
              استمع للبث المباشر لأشهر إذاعات القرآن الكريم متزامنة بالدقيقة والثانية مع توقيتها المحلي ومواعيد الأذان.
            </p>
          </div>

          {/* Active Player Card */}
          <div className="p-4 rounded-2xl bg-[#142921]/90 backdrop-blur-md border border-[#2A5041] text-right w-full sm:w-80 space-y-3 shadow-md">
            <div>
              <div className="flex items-center justify-between text-[11px] text-[#8EA89D]">
                <span>المحطة الحالية:</span>
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <MapPin className="w-3 h-3" />
                  {currentStation.city}
                </span>
              </div>
              <h2 className="text-base font-amiri font-bold text-amber-300">
                {currentStation.name}
              </h2>
            </div>

            {/* Visualizer animation when playing */}
            <div className="flex items-center justify-center gap-1 h-6">
              {[40, 70, 95, 60, 85, 50, 90, 65, 45].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    isPlaying ? 'bg-amber-400 animate-pulse' : 'bg-[#254A3D]'
                  }`}
                  style={{
                    height: isPlaying ? `${h}%` : '20%',
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>

            {/* Play button and volume slider */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#23473A]">
              <button
                onClick={togglePlay}
                disabled={isLoading}
                className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center transition-transform active:scale-95 shadow-md shrink-0 font-bold"
                aria-label={isPlaying ? 'إيقاف البث' : 'تشغيل البث'}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              <div className="flex items-center gap-2 flex-1">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-amber-300 hover:text-amber-200 transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(Number(e.target.value));
                    setIsMuted(false);
                  }}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {streamError && (
          <p className="mt-4 text-xs text-amber-300">
            تنبيه: تعذر الاتصال بالبث المباشر لهذه المحطة في الوقت الحالي، يرجى تجربة محطة أخرى.
          </p>
        )}
      </div>

      {/* Stations Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {RADIO_STATIONS.map((station) => {
          const isSelected = currentStation.id === station.id;
          const isStationActive = isSelected && isPlaying;

          return (
            <div
              key={station.id}
              onClick={() => handlePlayStation(station)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 select-none ${
                isStationActive
                  ? 'bg-[#18322A] border-amber-500/80 shadow-lg ring-1 ring-amber-500/30'
                  : 'bg-[#142520] hover:bg-[#182F28] border-[#213C33] hover:border-amber-500/40 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3 text-right">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    {isStationActive ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    ) : (
                      <Radio className="w-3.5 h-3.5 text-[#7A988E]" />
                    )}
                    <h3 className="font-amiri text-lg font-bold text-amber-200">
                      {station.name}
                    </h3>
                  </div>
                  <p className="text-xs text-[#8FA89E] font-cairo leading-relaxed">
                    {station.description}
                  </p>
                </div>

                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isStationActive
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                      : 'bg-[#1A332B] text-amber-300 border border-[#274B3F]'
                  }`}
                >
                  {isStationActive ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </div>
              </div>

              {/* Station Timing Badge & Tag */}
              <div className="flex items-center justify-between pt-2.5 border-t border-[#1C362E] text-[11px] font-cairo">
                <span className="inline-flex items-center gap-1 text-amber-300 font-semibold">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  توقيت {station.city}
                </span>
                <span className="text-[#7A988E]">
                  {station.category === 'reciter' ? 'إذاعة قارئ' : station.category === 'tafsir' ? 'إذاعة تفسير' : 'إذاعة عامة'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
