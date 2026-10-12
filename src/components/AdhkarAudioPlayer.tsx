import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  User,
  Radio,
  ChevronDown,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import { DhikrItem } from '../data/adhkar';

export interface AdhkarReciterAudio {
  id: string;
  name: string;
  tracks: Partial<Record<DhikrItem['category'], string>>;
}

export const ADHKAR_RECITERS: AdhkarReciterAudio[] = [
  {
    id: 'alafasy',
    name: 'الشيخ مشاري راشد العفاسي',
    tracks: {
      morning: 'https://archive.org/download/TvQuran.com__Athkar/TvQuran.com_athkar_03.mp3',
      evening: 'https://archive.org/download/TvQuran.com__Athkar/TvQuran.com_athkar_04.mp3',
      sleep: 'https://archive.org/download/TvQuran.com__Athkar/TvQuran.com_athkar_11.mp3',
      wake: 'https://archive.org/download/TvQuran.com__Athkar/TvQuran.com_athkar_01.mp3',
    },
  },
  {
    id: 'abbad',
    name: 'الشيخ فارس عبّاد',
    tracks: {
      morning: 'https://archive.org/download/TvQuran.com__Athkar/TvQuran.com_athkar_05.mp3',
      evening: 'https://archive.org/download/TvQuran.com__Athkar/TvQuran.com_athkar_06.mp3',
    },
  },
  {
    id: 'jibril',
    name: 'الشيخ محمد جبريل',
    tracks: {
      morning: 'https://archive.org/download/TvQuran.com__Athkar/TvQuran.com_athkar_07.mp3',
      evening: 'https://archive.org/download/TvQuran.com__Athkar/TvQuran.com_athkar_08.mp3',
    },
  },
  {
    id: 'qatami',
    name: 'الشيخ ناصر القطامي',
    tracks: {
      morning: 'https://archive.org/download/TvQuran.com__Athkar/TvQuran.com_athkar_02.mp3',
      evening: 'https://archive.org/download/TvQuran.com__Athkar/TvQuran.com_athkar_02.mp3',
    },
  },
];

interface AdhkarAudioPlayerProps {
  selectedCategory: DhikrItem['category'];
  categoryTitle: string;
}

export const AdhkarAudioPlayer: React.FC<AdhkarAudioPlayerProps> = ({
  selectedCategory,
  categoryTitle,
}) => {
  const [selectedReciterId, setSelectedReciterId] = useState<string>('alafasy');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.9);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeReciter =
    ADHKAR_RECITERS.find((r) => r.id === selectedReciterId) || ADHKAR_RECITERS[0];

  // Look for category audio, fallback to alafasy's morning or first available track
  const audioUrl =
    activeReciter.tracks[selectedCategory] ||
    ADHKAR_RECITERS[0].tracks[selectedCategory] ||
    null;

  // Handle track changes
  useEffect(() => {
    if (!audioRef.current) return;
    setIsPlaying(false);
    setCurrentTime(0);
    setErrorMsg(null);
    audioRef.current.pause();

    if (audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }
  }, [audioUrl]);

  // Audio element events
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
      setIsLoading(false);
    }
  };

  const handlePlayPause = async () => {
    if (!audioRef.current || !audioUrl) return;
    setErrorMsg(null);

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('Audio playback error:', err);
        setErrorMsg('تعذر تشغيل الصوت، يرجى التفاعل مع الصفحة أو المحاولة مجدداً');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleSkip = (seconds: number) => {
    if (!audioRef.current) return;
    const target = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
  };

  const handleToggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.muted = false;
      audioRef.current.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const formatTime = (secs: number): string => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!audioUrl) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d2a20] via-[#143d2f] to-[#0d2a20] border-2 border-amber-500/40 p-4 sm:p-5 shadow-2xl text-[#EAEFEA] transition-all duration-300">
      {/* Hidden Audio Tag */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          setIsLoading(false);
          setIsPlaying(false);
          setErrorMsg('تعذر تحميل التسجيل الصوتي.');
        }}
      />

      {/* Background Ambience */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Top Info Bar: Track Title & Sheikh Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#214b3c] pb-3">
          <div className="flex items-center gap-3 text-right">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 flex items-center justify-center shrink-0 shadow-lg ring-2 ring-amber-400/30">
              <Radio className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-amiri text-lg font-bold text-amber-200">
                  تلاوة {categoryTitle} بصوت الشيخ
                </span>
                {isPlaying && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    جاري الاستماع
                  </span>
                )}
              </div>
              <p className="text-xs text-[#9bb7ab]">
                استمع إلى الأذكار بخشوع واقرأ وتفاعل معها في نفس الوقت
              </p>
            </div>
          </div>

          {/* Sheikh Selection Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <select
                value={selectedReciterId}
                onChange={(e) => setSelectedReciterId(e.target.value)}
                className="appearance-none bg-[#11271f] hover:bg-[#163529] text-amber-200 text-xs font-bold py-2 px-8 rounded-xl border border-[#2a5544] focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer text-right pr-3 pl-8 shadow-sm transition-colors"
                title="اختر صوت الشيخ"
              >
                {ADHKAR_RECITERS.map((r) => (
                  <option key={r.id} value={r.id} className="bg-[#11271f] text-white">
                    {r.name}
                  </option>
                ))}
              </select>
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-amber-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Audio Player Controls & Progress Slider */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Main Controls: Play, Skip 10s */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
            {/* Skip Back 10s */}
            <button
              onClick={() => handleSkip(-10)}
              className="p-2 text-[#9bb7ab] hover:text-amber-200 bg-[#142d22] hover:bg-[#1a382b] border border-[#234839] rounded-xl transition-colors cursor-pointer"
              title="تراجع 10 ثوانٍ"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Play / Pause Primary Button */}
            <button
              onClick={handlePlayPause}
              disabled={isLoading}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer ${
                isPlaying
                  ? 'bg-amber-400 text-stone-950 shadow-amber-950/40 ring-2 ring-amber-300'
                  : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 shadow-amber-950/30'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>إيقاف مؤقت</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>تشغيل تلاوة الأذكار</span>
                </>
              )}
            </button>

            {/* Skip Forward 10s */}
            <button
              onClick={() => handleSkip(10)}
              className="p-2 text-[#9bb7ab] hover:text-amber-200 bg-[#142d22] hover:bg-[#1a382b] border border-[#234839] rounded-xl transition-colors cursor-pointer"
              title="تقديم 10 ثوانٍ"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Time & Progress Slider */}
          <div className="flex-1 flex items-center gap-3 w-full">
            <span className="font-mono text-xs text-[#8ea89d] shrink-0 tabular-nums">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-[#10231b] rounded-lg"
              title="شريط التقديم والتأخير"
            />
            <span className="font-mono text-xs text-[#8ea89d] shrink-0 tabular-nums">
              {formatTime(duration)}
            </span>
          </div>

          {/* Volume Control */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button
              onClick={handleToggleMute}
              className="p-2 text-[#9bb7ab] hover:text-amber-200 transition-colors cursor-pointer"
              title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 accent-amber-500 cursor-pointer h-1.5 bg-[#10231b] rounded-lg"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="text-xs text-red-300 bg-red-950/50 border border-red-500/30 p-2 rounded-lg text-right">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
};
