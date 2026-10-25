import React, { useState, useEffect } from 'react';

interface QuranSplashIntroProps {
  onFinish?: () => void;
}

export const QuranSplashIntro: React.FC<QuranSplashIntroProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    // Smooth progress increment
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const step = prev < 60 ? Math.random() * 9 + 5 : Math.random() * 15 + 10;
        return Math.min(100, Math.round(prev + step));
      });
    }, 65);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  const handleDismiss = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      setIsMounted(false);
      if (onFinish) onFinish();
    }, 500);
  };

  if (!isMounted) return null;

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080B0E] text-slate-100 transition-all duration-500 select-none cursor-pointer overflow-hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      dir="rtl"
      role="dialog"
      aria-label="تحميل القرآن الكريم"
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Simple elegant circular loading ring around "قرآن" */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
          {/* Background circle track */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="#1E293B"
              strokeWidth="2.5"
              fill="none"
            />
            {/* Animated Loading Progress Arc */}
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="#F59E0B"
              strokeWidth="3"
              strokeDasharray={276}
              strokeDashoffset={276 - (276 * progress) / 100}
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-150 ease-out"
            />
          </svg>

          {/* كتابة القرآن الكريم في المنتصف بتصميم بديع متناسق */}
          <div className="flex flex-col items-center justify-center text-center px-2 select-none">
            <span className="font-amiri font-bold text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-200 drop-shadow-md leading-relaxed">
              القرآن الكريم
            </span>
            <span className="text-[10px] text-emerald-400/90 font-cairo tracking-widest mt-0.5">
              كِتَابُ اللَّهِ المَجِيد
            </span>
          </div>
        </div>

        {/* Clean simple loading bar */}
        <div className="w-28 sm:w-32 h-1 bg-slate-800 rounded-full overflow-hidden mt-6">
          <div
            className="h-full bg-amber-400 rounded-full transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
