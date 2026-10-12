import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Headphones,
  ChevronDown,
  RotateCcw,
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
    name: 'مشاري العفاسي',
    tracks: {
      morning: 'https://archive.org/download/TvQuran.com__Athkar/TvQuran.com_athkar_03.mp3',
      evening: 'https://archive.org/download/TvQuran.com__Athkar/TvQuran.com_athkar_04.mp3',
      sleep: 'https://archive.org/download/TvQuran.com__Athkar/TvQuran.com_athkar_11.mp3',
      wake: 'https://archive.org/download/TvQuran.com__Athkar/TvQuran.com_athkar_01.mp3',
    },
  },
  {
    id: 'abbad',
    name: 'فارس عبّاد',
    tracks: {
      morning: 'https://archive.org/download/TvQuran.com__Athkar/TvQuran.com_athkar_05.mp3',
      evening: 'https://archive.org/download/TvQuran.com__Athkar/TvQuran.com_athkar_06.mp3',
    },
  },
  {
    id: 'jibril',
    name: 'محمد جبريل',
    tracks: {
      morning: 'https://archive.org/download/TvQuran.com__Athkar/TvQuran.com_athkar_07.mp3',
      evening: 'https://archive.org/download/TvQuran.com__Athkar/TvQuran.com_athkar_08.mp3',
    },
  },
  {
    id: 'qatami',
    name: 'ناصر القطامي',
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
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeReciter =
    ADHKAR_RECITERS.find((r) => r.id === selectedReciterId) || ADHKAR_RECITERS[0];

  // Look for category audio track
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
      audioRef.current.playbackRate = playbackRate;
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
        setErrorMsg('يرجى النقر للمتابعة والتشغيل');
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

  const handleToggleSpeed = () => {
    const rates = [1, 1.25, 1.5];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const handleReplay = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
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
    <div
      dir="rtl"
      className="w-full rounded-2xl bg-gradient-to-b from-[#0F261D] to-[#0A1D16] border border-[#224A3B] p-3 sm:p-4 shadow-md text-[#EAEFEA] overflow-hidden"
    >
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

      {/* Row 1: Header / Sheikh Selection */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#1C3E31]">
        {/* Audio Title & Icon */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/25 text-amber-400 flex items-center justify-center shrink-0">
            <Headphones className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-amber-200 truncate font-cairo">
              صوت {categoryTitle}
            </h4>
            <span className="text-[10px] text-[#8EA89D] block truncate">
              استمع للتلاوة بصوت الشيخ المفضل
            </span>
          </div>
        </div>

        {/* Sheikh Dropdown */}
        <div className="relative shrink-0">
          <select
            dir="rtl"
            value={selectedReciterId}
            onChange={(e) => setSelectedReciterId(e.target.value)}
            className="appearance-none bg-[#122A20] hover:bg-[#183629] text-amber-300 text-xs font-medium py-1.5 pr-2.5 pl-7 rounded-xl border border-[#234D3D] focus:outline-none focus:ring-1 focus:ring-amber-400/50 cursor-pointer text-right transition-colors max-w-[140px] sm:max-w-[180px] truncate"
            title="اختر صوت الشيخ"
          >
            {ADHKAR_RECITERS.map((r) => (
              <option key={r.id} value={r.id} className="bg-[#0F251C] text-white">
                الشيخ {r.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-400" />
        </div>
      </div>

      {/* Row 2: Dedicated Progress Bar Row */}
      <div className="pt-3 pb-2">
        <div className="flex items-center gap-2 w-full">
          <span className="font-mono text-[11px] text-[#A0BAAF] shrink-0 tabular-nums w-10 text-right">
            {formatTime(currentTime)}
          </span>

          <div className="relative flex-1 min-w-0 flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-[#142E23] rounded-lg appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400"
              title="التقديم والتأخير"
            />
          </div>

          <span className="font-mono text-[11px] text-[#719183] shrink-0 tabular-nums w-10 text-left">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Row 3: Action Buttons */}
      <div className="flex items-center justify-between gap-2 pt-1">
        {/* Play & Replay Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayPause}
            disabled={isLoading}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              isPlaying
                ? 'bg-amber-400 text-stone-950 shadow-md ring-2 ring-amber-300'
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md'
            }`}
            title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل الصوت'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>إيقاف</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>تشغيل</span>
              </>
            )}
          </button>

          <button
            onClick={handleReplay}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#122A20] hover:bg-[#183629] text-[#8EA89D] hover:text-amber-200 border border-[#234D3D] text-xs transition-colors cursor-pointer"
            title="إعادة من البداية"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline text-[11px]">من البداية</span>
          </button>
        </div>

        {/* Speed & Mute Options */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleSpeed}
            className="px-2 py-1 rounded-xl text-[11px] font-mono font-bold bg-[#122A20] hover:bg-[#183629] text-amber-300 border border-[#234D3D] transition-colors cursor-pointer"
            title="تغيير سرعة الصوت"
          >
            {playbackRate}x
          </button>

          <button
            onClick={handleToggleMute}
            className="p-1.5 rounded-xl bg-[#122A20] hover:bg-[#183629] text-[#8EA89D] hover:text-amber-200 border border-[#234D3D] transition-colors cursor-pointer"
            title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-2 pt-2 border-t border-[#1C3E31] text-[11px] text-amber-300 text-right">
          {errorMsg}
        </div>
      )}
    </div>
  );
};
