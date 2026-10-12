import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Hand, ChevronDown } from 'lucide-react';

export type BeadThemeKey = 'amber' | 'wood' | 'emerald' | 'pearl' | 'turquoise';

export interface BeadTheme {
  id: BeadThemeKey;
  name: string;
  bg: string;
  specular: string;
  ring: string;
  glow: string;
  stringColor: string;
  tasselColor: string;
  border: string;
}

export const BEAD_THEMES: Record<BeadThemeKey, BeadTheme> = {
  amber: {
    id: 'amber',
    name: 'كهرمان عسلي ملكي',
    bg: 'radial-gradient(circle at 35% 28%, #ffea85 0%, #f59e0b 38%, #b45309 72%, #451a03 100%)',
    specular: 'rgba(255, 255, 255, 0.85)',
    ring: '#fbbf24',
    glow: 'rgba(245, 158, 11, 0.5)',
    stringColor: '#d4af37',
    tasselColor: '#f59e0b',
    border: 'border-amber-400/50',
  },
  wood: {
    id: 'wood',
    name: 'خشب الصندل العطري',
    bg: 'radial-gradient(circle at 35% 28%, #d7a16e 0%, #854d0e 40%, #451a03 75%, #1c0802 100%)',
    specular: 'rgba(254, 215, 170, 0.75)',
    ring: '#92400e',
    glow: 'rgba(146, 64, 14, 0.4)',
    stringColor: '#b45309',
    tasselColor: '#78350f',
    border: 'border-amber-700/60',
  },
  emerald: {
    id: 'emerald',
    name: 'عقيق أخضر زمردي',
    bg: 'radial-gradient(circle at 35% 28%, #a7f3d0 0%, #10b981 38%, #047857 70%, #022c22 100%)',
    specular: 'rgba(236, 253, 245, 0.85)',
    ring: '#34d399',
    glow: 'rgba(16, 185, 129, 0.5)',
    stringColor: '#d4af37',
    tasselColor: '#059669',
    border: 'border-emerald-500/50',
  },
  pearl: {
    id: 'pearl',
    name: 'لؤلؤ إسلامي ناصع',
    bg: 'radial-gradient(circle at 35% 28%, #ffffff 0%, #f8fafc 35%, #cbd5e1 70%, #475569 100%)',
    specular: 'rgba(255, 255, 255, 0.95)',
    ring: '#e2e8f0',
    glow: 'rgba(255, 255, 255, 0.4)',
    stringColor: '#cbd5e1',
    tasselColor: '#d4af37',
    border: 'border-slate-300/50',
  },
  turquoise: {
    id: 'turquoise',
    name: 'فيروز نيشابوري',
    bg: 'radial-gradient(circle at 35% 28%, #a5f3fc 0%, #06b6d4 40%, #0e7490 75%, #083344 100%)',
    specular: 'rgba(207, 250, 254, 0.85)',
    ring: '#22d3ee',
    glow: 'rgba(6, 182, 212, 0.5)',
    stringColor: '#d4af37',
    tasselColor: '#0891b2',
    border: 'border-cyan-400/50',
  },
};

interface RealisticMisbahaStrandProps {
  onBeadDrop: () => void;
  count: number;
  targetLimit: number;
  currentDhikr: string;
  themeKey: BeadThemeKey;
  onChangeTheme: (theme: BeadThemeKey) => void;
}

const TRAVEL_DISTANCE = 90; // Pixels the bead drops down along the thread

export const RealisticMisbahaStrand: React.FC<RealisticMisbahaStrandProps> = ({
  onBeadDrop,
  count,
  targetLimit,
  currentDhikr,
  themeKey,
  onChangeTheme,
}) => {
  const currentTheme = BEAD_THEMES[themeKey] || BEAD_THEMES.amber;

  // Animation states
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragProgress, setDragProgress] = useState(0); // 0 to 1
  const [tasselSway, setTasselSway] = useState(false);
  const [beadDropRipple, setBeadDropRipple] = useState(false);

  // Gesture tracking
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropTimeoutRef = useRef<number | null>(null);

  // Trigger bead drop down
  const triggerDrop = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDragProgress(1);

    // Call counter and audio/haptics immediately on bead release
    onBeadDrop();

    // Trigger physical impact effects (tassel sway & ripple)
    setTasselSway(true);
    setBeadDropRipple(true);

    if (dropTimeoutRef.current) {
      window.clearTimeout(dropTimeoutRef.current);
    }

    dropTimeoutRef.current = window.setTimeout(() => {
      setIsAnimating(false);
      setDragProgress(0);
      setTasselSway(false);
      setBeadDropRipple(false);
    }, 220);
  }, [isAnimating, onBeadDrop]);

  // Touch handlers for mobile swipe-down
  const handleTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = true;
    startYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || isAnimating) return;
    const currentY = e.touches[0].clientY;
    const delta = currentY - startYRef.current;
    if (delta > 0) {
      const progress = Math.min(1, Math.max(0, delta / TRAVEL_DISTANCE));
      setDragProgress(progress);
    }
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (dragProgress > 0.35) {
      triggerDrop();
    } else {
      setDragProgress(0);
    }
  };

  // Mouse handlers for desktop click & drag
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || isAnimating) return;
    const delta = e.clientY - startYRef.current;
    if (delta > 0) {
      const progress = Math.min(1, Math.max(0, delta / TRAVEL_DISTANCE));
      setDragProgress(progress);
    }
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (dragProgress > 0.35) {
      triggerDrop();
    } else {
      // Just a simple click! Trigger full drop
      triggerDrop();
    }
  };

  useEffect(() => {
    return () => {
      if (dropTimeoutRef.current) {
        window.clearTimeout(dropTimeoutRef.current);
      }
    };
  }, []);

  // Compute animated drop position (in pixels)
  const currentDropY = isAnimating
    ? TRAVEL_DISTANCE
    : dragProgress * TRAVEL_DISTANCE;

  // Upper beads shift down smoothly as active bead descends
  const upperBeadsShiftY = isAnimating ? currentDropY * 0.45 : dragProgress * 25;

  return (
    <div className="flex flex-col items-center select-none w-full max-w-md mx-auto">
      {/* Bead Material Selector */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 p-2 bg-[#0f211b] border border-[#1e3b30] rounded-2xl mb-4 w-full">
        <span className="text-[11px] text-amber-200/80 px-1 font-bold font-cairo shrink-0">نوع السبحة:</span>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {(Object.keys(BEAD_THEMES) as BeadThemeKey[]).map((key) => {
            const t = BEAD_THEMES[key];
            const isSelected = themeKey === key;
            return (
              <button
                key={key}
                onClick={() => onChangeTheme(key)}
                className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-cairo transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                    : 'bg-[#152e24] text-[#8ea89d] hover:text-amber-200 hover:bg-[#1b3d30]'
                }`}
                title={t.name}
              >
                <span
                  className="w-3 h-3 rounded-full border border-white/30 shrink-0 shadow-inner"
                  style={{ background: t.bg }}
                />
                <span className="text-[11px] whitespace-nowrap">{t.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Prayer Beads Stage / Arch Backdrop */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="relative w-full h-[430px] sm:h-[460px] rounded-3xl bg-gradient-to-b from-[#081712] via-[#0d221b] to-[#06120e] border-2 border-amber-500/40 shadow-2xl p-4 flex flex-col items-center justify-between cursor-pointer overflow-hidden group touch-none"
        title="انقر أو اسحب الخرزة لأسفل للتسبيح"
      >
        {/* Subtle Ambient Backlight */}
        <div
          className="absolute inset-x-0 top-1/4 h-56 rounded-full blur-3xl pointer-events-none opacity-40 transition-colors duration-500"
          style={{ background: currentTheme.glow }}
        />

        {/* Decorative Islamic Arch Lines */}
        <div className="absolute inset-2 rounded-2xl border border-amber-500/15 pointer-events-none" />
        <div className="absolute inset-4 rounded-xl border border-amber-500/10 pointer-events-none" />

        {/* Top Header: Current Dhikr & Live Counter */}
        <div className="relative z-10 w-full text-center pt-2 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#122820]/90 border border-amber-500/30 shadow-sm backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-amiri text-base sm:text-lg font-bold text-amber-200">
              {currentDhikr}
            </span>
          </div>

          {/* Golden Odometer Plate */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <div className="px-5 py-1.5 rounded-2xl bg-gradient-to-b from-[#1b3a2f] to-[#0f241d] border-2 border-amber-500/50 shadow-inner flex items-baseline gap-2">
              <span className="font-mono text-4xl sm:text-5xl font-black text-amber-200 tracking-wider tabular-nums drop-shadow-md">
                {count}
              </span>
              {targetLimit > 0 && (
                <span className="font-mono text-xs text-amber-400/80 font-bold">
                  / {targetLimit}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Vertical Misbaha Strand */}
        <div className="relative z-20 flex-1 w-full flex items-center justify-center py-2">
          {/* Silk Braided Thread (الحبل الحريري الذهبي) */}
          <div
            className="absolute top-2 bottom-12 w-1.5 rounded-full shadow-md z-0"
            style={{
              background: `linear-gradient(to right, #453412, ${currentTheme.stringColor}, #453412)`,
              boxShadow: '0 0 4px rgba(0,0,0,0.8)',
            }}
          />

          {/* Beads Container */}
          <div className="relative w-28 h-full flex flex-col items-center justify-start z-10">
            {/* Top Incoming Beads (خرز السبحة العلوي) */}
            <div
              className="flex flex-col items-center -space-y-2 transition-transform duration-150"
              style={{
                transform: `translateY(${upperBeadsShiftY}px)`,
              }}
            >
              {/* Bead -2 */}
              <div
                className="w-10 h-10 rounded-full shadow-lg border border-white/20 opacity-70 transform scale-85 shrink-0"
                style={{ background: currentTheme.bg }}
              />
              {/* Bead -1 */}
              <div
                className="w-11 h-11 rounded-full shadow-lg border border-white/25 opacity-90 transform scale-95 shrink-0"
                style={{ background: currentTheme.bg }}
              />
            </div>

            {/* The Active Sliding Bead (الخرزة النشطة التي تنزل عند النقر أو السحب) */}
            <div
              className={`relative z-20 my-1 transition-transform ${
                isAnimating ? 'duration-200 ease-out' : 'duration-75'
              }`}
              style={{
                transform: `translateY(${currentDropY}px)`,
              }}
            >
              {/* Active Bead Sphere with 3D Gloss & Shadow */}
              <div
                className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing border-2 border-amber-300/60 transition-transform active:scale-95 group-hover:scale-105"
                style={{
                  background: currentTheme.bg,
                  boxShadow: `0 8px 24px rgba(0,0,0,0.8), 0 0 20px ${currentTheme.glow}`,
                }}
              >
                {/* 3D Specular Highlight Oval (لمعة الخرزة الحقيقية) */}
                <div
                  className="absolute top-2 left-3 w-5 h-2.5 rounded-full transform -rotate-25 blur-[0.8px] pointer-events-none"
                  style={{ background: currentTheme.specular }}
                />

                {/* Sub-surface Inner Glow */}
                <div className="absolute inset-1 rounded-full bg-gradient-to-t from-black/30 via-transparent to-white/20 pointer-events-none" />

                {/* Thread Exit Holes (الثقبين) */}
                <div className="absolute top-0.5 w-2.5 h-1 bg-stone-950/80 rounded-full shadow-inner" />
                <div className="absolute bottom-0.5 w-2.5 h-1 bg-stone-950/80 rounded-full shadow-inner" />

                {/* Current count badge inside bead center */}
                <span className="font-mono text-xs font-black text-amber-100/90 drop-shadow-sm select-none">
                  {((count - 1 + (targetLimit || 33)) % (targetLimit || 33)) + 1}
                </span>

                {/* Drop Action Ripple Ring */}
                {beadDropRipple && (
                  <div className="absolute inset-0 rounded-full border-2 border-amber-300 animate-ping opacity-75 pointer-events-none" />
                )}
              </div>
            </div>

            {/* Lower Stacked Beads & Resting Base */}
            <div className="flex flex-col items-center -space-y-2 mt-auto pt-4">
              {/* Stacked Bead 1 */}
              <div
                className="w-13 h-13 rounded-full shadow-xl border border-white/30 shrink-0 transform transition-transform"
                style={{
                  background: currentTheme.bg,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.7)',
                }}
              />
              {/* Stacked Bead 2 */}
              <div
                className="w-12 h-12 rounded-full shadow-lg border border-white/25 shrink-0 opacity-95"
                style={{
                  background: currentTheme.bg,
                }}
              />

              {/* The Minaret / Imam Bead (المئذنة / شاهد السبحة المنحوت) */}
              <div className="relative flex flex-col items-center mt-1 z-10">
                {/* Ornate Gold Cap */}
                <div className="w-6 h-2 rounded-t-md bg-gradient-to-r from-amber-700 via-amber-400 to-amber-700 shadow-sm border border-amber-300/40" />

                {/* Minaret Body (مئذنة السبحة) */}
                <div
                  className="w-5 h-8 rounded-b-md shadow-lg border border-amber-400/40 relative flex items-center justify-center"
                  style={{
                    background: `linear-gradient(to right, #2d1805, ${currentTheme.ring}, #2d1805)`,
                  }}
                >
                  <div className="w-1 h-full bg-amber-300/50 blur-[0.5px]" />
                </div>

                {/* Gold Rings Accent */}
                <div className="w-4 h-1.5 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600 rounded-full my-0.5 shadow-xs" />

                {/* The Golden Silk Tassel (الشرابة / الكركوشة الحريرية) */}
                <div
                  className={`flex flex-col items-center origin-top transition-transform ${
                    tasselSway ? 'rotate-6 duration-150' : 'rotate-0 duration-300'
                  }`}
                >
                  {/* Tassel Cap Knot */}
                  <div
                    className="w-4 h-3 rounded-full border border-amber-400/50 shadow-md"
                    style={{ background: currentTheme.tasselColor }}
                  />
                  {/* Silk Fringes (خيوط الشرابة الحريرية) */}
                  <div className="flex gap-[1px] -mt-0.5">
                    {[...Array(9)].map((_, i) => (
                      <div
                        key={i}
                        className="w-[2px] h-8 rounded-full shadow-xs"
                        style={{
                          background: `linear-gradient(to bottom, ${currentTheme.tasselColor}, #d4af37, #78350f)`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Instructional Prompt (تنزل مثل السبحة الحقيقية) */}
        <div className="relative z-10 w-full text-center pb-1 flex items-center justify-center gap-1.5 text-xs text-amber-300/80 font-cairo">
          <Hand className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          <span>انقر أو اسحب الخرزة لأسفل للتسبيح</span>
          <ChevronDown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
};
