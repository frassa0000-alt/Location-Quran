import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Hand, RotateCcw } from 'lucide-react';

export type BeadThemeKey = 'amber' | 'onyx' | 'emerald' | 'wood' | 'pearl';

export interface BeadTheme {
  id: BeadThemeKey;
  name: string;
  bg: string;
  beadFill: string;
  specular: string;
  ring: string;
  glow: string;
  stringColor: string;
  tasselColor: string;
  separatorColor: string;
}

export const BEAD_THEMES: Record<BeadThemeKey, BeadTheme> = {
  amber: {
    id: 'amber',
    name: 'كهرمان عسلي ملكي',
    bg: 'radial-gradient(circle at 35% 28%, #fff3a8 0%, #f59e0b 42%, #b45309 75%, #451a03 100%)',
    beadFill: '#f59e0b',
    specular: 'rgba(255, 255, 255, 0.9)',
    ring: '#fde047',
    glow: 'rgba(245, 158, 11, 0.6)',
    stringColor: '#d4af37',
    tasselColor: '#d97706',
    separatorColor: '#fef08a',
  },
  onyx: {
    id: 'onyx',
    name: 'عقيق أسود ملكي وذهب',
    bg: 'radial-gradient(circle at 35% 28%, #78716c 0%, #292524 45%, #1c1917 80%, #0c0a09 100%)',
    beadFill: '#1c1917',
    specular: 'rgba(255, 255, 255, 0.85)',
    ring: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.45)',
    stringColor: '#b45309',
    tasselColor: '#d97706',
    separatorColor: '#fbbf24',
  },
  emerald: {
    id: 'emerald',
    name: 'عقيق أخضر زمردي',
    bg: 'radial-gradient(circle at 35% 28%, #a7f3d0 0%, #10b981 40%, #047857 75%, #022c22 100%)',
    beadFill: '#059669',
    specular: 'rgba(236, 253, 245, 0.9)',
    ring: '#34d399',
    glow: 'rgba(16, 185, 129, 0.6)',
    stringColor: '#d4af37',
    tasselColor: '#047857',
    separatorColor: '#fde047',
  },
  wood: {
    id: 'wood',
    name: 'خشب الصندل العطري',
    bg: 'radial-gradient(circle at 35% 28%, #d7a16e 0%, #854d0e 42%, #451a03 78%, #1c0802 100%)',
    beadFill: '#78350f',
    specular: 'rgba(254, 215, 170, 0.75)',
    ring: '#b45309',
    glow: 'rgba(146, 64, 14, 0.5)',
    stringColor: '#92400e',
    tasselColor: '#78350f',
    separatorColor: '#f59e0b',
  },
  pearl: {
    id: 'pearl',
    name: 'لؤلؤ بحري ناصع',
    bg: 'radial-gradient(circle at 35% 28%, #ffffff 0%, #f8fafc 38%, #cbd5e1 75%, #64748b 100%)',
    beadFill: '#f1f5f9',
    specular: 'rgba(255, 255, 255, 0.98)',
    ring: '#e2e8f0',
    glow: 'rgba(255, 255, 255, 0.5)',
    stringColor: '#cbd5e1',
    tasselColor: '#d4af37',
    separatorColor: '#fde047',
  },
};

interface RealisticPhysicalMisbahaProps {
  count: number;
  targetLimit: number;
  currentDhikr: string;
  themeKey: BeadThemeKey;
  onChangeTheme: (theme: BeadThemeKey) => void;
  onTapBead: () => void;
  onReset: () => void;
}

export const RealisticPhysicalMisbaha: React.FC<RealisticPhysicalMisbahaProps> = ({
  count,
  targetLimit,
  currentDhikr,
  themeKey,
  onChangeTheme,
  onTapBead,
  onReset,
}) => {
  const currentTheme = BEAD_THEMES[themeKey] || BEAD_THEMES.amber;

  // Animation state for the physical drop (تنزل وتطلع)
  const [isDropping, setIsDropping] = useState(false);
  const [tasselSway, setTasselSway] = useState(false);
  const [dragY, setDragY] = useState(0);

  const isDraggingRef = useRef(false);
  const didDragRef = useRef(false);
  const startYRef = useRef(0);
  const animTimeoutRef = useRef<number | null>(null);

  // Active bead index (0 to 32)
  const activeBeadNumber = ((count - 1 + 33) % 33) + 1;
  const currentLap = targetLimit > 0 ? Math.floor(count / targetLimit) : Math.floor(count / 33);

  // Trigger bead drop physics (الخرزة تنزل للأسفل والخرز المعاكس يطلع للأعلى)
  const triggerBeadDrop = useCallback(() => {
    setIsDropping(true);
    setTasselSway(true);

    onTapBead();

    if (animTimeoutRef.current) {
      window.clearTimeout(animTimeoutRef.current);
    }

    animTimeoutRef.current = window.setTimeout(() => {
      setIsDropping(false);
      setDragY(0);
      setTasselSway(false);
    }, 140);
  }, [onTapBead]);

  // Touch handlers for mobile swipe-down
  const handleTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = true;
    didDragRef.current = false;
    startYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const deltaY = e.touches[0].clientY - startYRef.current;
    if (deltaY > 6) {
      didDragRef.current = true;
      setDragY(Math.min(60, deltaY));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (e.cancelable) {
      e.preventDefault();
    }
    triggerBeadDrop();
  };

  // Mouse handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    didDragRef.current = false;
    startYRef.current = e.clientY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaY = e.clientY - startYRef.current;
    if (deltaY > 8) {
      didDragRef.current = true;
      setDragY(Math.min(60, deltaY));
    }
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (didDragRef.current) {
      triggerBeadDrop();
    }
  };

  const handleClick = () => {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    triggerBeadDrop();
  };

  useEffect(() => {
    return () => {
      if (animTimeoutRef.current) {
        window.clearTimeout(animTimeoutRef.current);
      }
    };
  }, []);

  // Compute visual offsets for physical down/up loop (تنزل وتطلع)
  const dropOffset = isDropping ? 55 : dragY;
  const returnOffset = isDropping ? -55 : -dragY;

  return (
    <div className="w-full space-y-5">
      {/* ============================================================ */}
      {/* 1. Theme Material Picker (اختيار نوع وحجر السبحة الفاخر) */}
      {/* ============================================================ */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 ml-2">خامة السبحة:</span>
          {Object.values(BEAD_THEMES).map((th) => (
            <button
              key={th.id}
              onClick={() => onChangeTheme(th.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                themeKey === th.id
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-md scale-105 border border-white/40'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              <span
                className="w-3.5 h-3.5 rounded-full shadow-inner border border-white/30"
                style={{ background: th.bg }}
              />
              <span>{th.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Lap Badge */}
        <div className="flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-400/10 px-3 py-1.5 rounded-2xl border border-amber-400/30">
          <span>الدورة المكتملة:</span>
          <span className="font-mono text-sm font-black">{currentLap}</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. REAL PHYSICAL HAND-HELD MISBAHA (سبحة حقيقية تنزل وتطلع) */}
      {/* ============================================================ */}
      <div
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="relative w-full rounded-3xl p-6 sm:p-10 border border-amber-400/30 shadow-2xl overflow-hidden cursor-pointer select-none transition-all duration-300 bg-gradient-to-br from-[#08121E] via-[#0E1E2E] to-[#0A1624] hover:border-amber-400/50"
      >
        {/* Soft Ambient Radiance */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none transition-colors duration-500"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${currentTheme.glow} 0%, transparent 70%)`,
          }}
        />

        {/* Top Active Dhikr Heading */}
        <div className="relative z-20 flex flex-col items-center justify-center text-center space-y-2 pointer-events-none">
          <div className="px-6 py-2 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md shadow-inner max-w-xl">
            <h2 className="text-xl sm:text-3xl font-amiri font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-200 tracking-wide drop-shadow-xs">
              {currentDhikr}
            </h2>
          </div>

          {/* Odometer Main Numbers */}
          <div className="flex items-baseline justify-center gap-2" dir="ltr">
            <span className="font-mono text-5xl sm:text-7xl font-black text-amber-300 tracking-tight tabular-nums drop-shadow-md">
              {count}
            </span>
            {targetLimit > 0 && (
              <span className="font-mono text-sm sm:text-lg font-bold text-slate-400">
                / {targetLimit}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3.5 py-0.5 rounded-full font-mono font-bold bg-white/10 text-amber-200 border border-white/15">
              الخرزة {activeBeadNumber} من ٣٣
            </span>
            <span className="text-[11px] text-slate-400 font-cairo flex items-center gap-1">
              <Hand className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>مرر للأسفل أو انقر للتسبيح</span>
            </span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* The Dual-Track Physical Misbaha: Down & Up Strands (تنزل وتطلع) */}
        {/* ============================================================ */}
        <div className="relative w-full max-w-2xl mx-auto mt-6 py-4 flex items-center justify-center">
          
          {/* Main SVG Physical Rosary Loop with Descending & Ascending Beads */}
          <div className="relative w-72 sm:w-80 h-96">
            <svg viewBox="0 0 320 380" className="w-full h-full overflow-visible drop-shadow-2xl">
              <defs>
                {/* 3D Drop Shadow */}
                <filter id="beadRealShadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000000" floodOpacity="0.8" />
                </filter>
                {/* Active Bead Luminous Glow */}
                <filter id="beadActiveGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor={currentTheme.ring} floodOpacity="0.9" />
                </filter>
              </defs>

              {/* 1. Silk Braided Thread Loop (خيط السبحة الحريري العريض) */}
              {/* Right track (Descending - خيط النزول) */}
              <path
                d="M 215 30 C 215 15, 105 15, 105 30 L 105 280 C 105 315, 215 315, 215 280 Z"
                fill="none"
                stroke={currentTheme.stringColor}
                strokeWidth="4"
                strokeDasharray="4,2"
                opacity="0.85"
              />

              {/* 2. Left Track: Return Beads Moving UP (خرز الصعود - تطلع للأعلى) */}
              <g
                style={{
                  transform: `translateY(${returnOffset}px)`,
                  transition: isDropping ? 'transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
                }}
              >
                {[60, 110, 160, 210, 260].map((yPos, i) => (
                  <g key={`left-${i}`} transform={`translate(105, ${yPos})`}>
                    {/* Bead Sphere */}
                    <circle
                      cx="0"
                      cy="0"
                      r="16"
                      fill={currentTheme.beadFill}
                      stroke="rgba(255,255,255,0.25)"
                      strokeWidth="1"
                      filter="url(#beadRealShadow)"
                    />
                    {/* Radial depth highlight */}
                    <circle cx="0" cy="0" r="16" fill={currentTheme.bg} opacity="0.95" />
                    {/* Specular Highlight */}
                    <ellipse
                      cx="-4.5"
                      cy="-4.5"
                      rx="6"
                      ry="3.5"
                      transform="rotate(-25 -4.5 -4.5)"
                      fill={currentTheme.specular}
                      opacity="0.8"
                    />
                  </g>
                ))}
              </g>

              {/* 3. Top Curved Loop Beads */}
              <g transform="translate(160, 25)">
                <circle cx="-25" cy="2" r="14" fill={currentTheme.bg} filter="url(#beadRealShadow)" />
                <circle cx="25" cy="2" r="14" fill={currentTheme.bg} filter="url(#beadRealShadow)" />
              </g>

              {/* 4. Right Track: Beads Moving DOWN (خرز النزول - تنزل للأسفل) */}
              <g
                style={{
                  transform: `translateY(${dropOffset}px)`,
                  transition: isDropping ? 'transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
                }}
              >
                {/* Upper incoming bead */}
                <g transform="translate(215, 60)">
                  <circle cx="0" cy="0" r="16" fill={currentTheme.bg} filter="url(#beadRealShadow)" />
                  <ellipse cx="-4.5" cy="-4.5" rx="6" ry="3.5" transform="rotate(-25 -4.5 -4.5)" fill={currentTheme.specular} opacity="0.8" />
                </g>

                {/* Approaching bead */}
                <g transform="translate(215, 115)">
                  <circle cx="0" cy="0" r="17" fill={currentTheme.bg} filter="url(#beadRealShadow)" />
                  <ellipse cx="-5" cy="-5" rx="6.5" ry="4" transform="rotate(-25 -5 -5)" fill={currentTheme.specular} opacity="0.85" />
                </g>

                {/* THE ACTIVE BEAD HELD BETWEEN FINGERS (الخرزة النشطة في موضع الإبهام والسبابة) */}
                <g transform="translate(215, 175)" className="cursor-pointer">
                  {/* Glowing Active Ring */}
                  <circle
                    cx="0"
                    cy="0"
                    r="27"
                    fill="none"
                    stroke={currentTheme.ring}
                    strokeWidth="3"
                    filter="url(#beadActiveGlow)"
                    className="animate-pulse"
                  />

                  {/* Tactile Haptic Shockwave Ripple on Impact */}
                  {isDropping && (
                    <circle
                      cx="0"
                      cy="0"
                      r="36"
                      fill="none"
                      stroke={currentTheme.ring}
                      strokeWidth="2"
                      opacity="0.8"
                      className="animate-ping"
                    />
                  )}

                  {/* Active 3D Gemstone Bead Body */}
                  <circle
                    cx="0"
                    cy="0"
                    r="22"
                    fill={currentTheme.bg}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    filter="url(#beadRealShadow)"
                  />

                  {/* Specular Glint */}
                  <ellipse
                    cx="-6.5"
                    cy="-6.5"
                    rx="8.5"
                    ry="5"
                    transform="rotate(-25 -6.5 -6.5)"
                    fill={currentTheme.specular}
                    opacity="0.98"
                  />

                  {/* Thread Exit Hole */}
                  <ellipse cx="0" cy="-20" rx="3.5" ry="1.5" fill="#000000" opacity="0.8" />
                  <ellipse cx="0" cy="20" rx="3.5" ry="1.5" fill="#000000" opacity="0.8" />

                  {/* Current Bead Number Inside Bead */}
                  <text
                    x="0"
                    y="5"
                    textAnchor="middle"
                    fontSize="13"
                    fontFamily="monospace"
                    fontWeight="black"
                    fill="#ffffff"
                    pointerEvents="none"
                  >
                    {activeBeadNumber}
                  </text>
                </g>

                {/* Lower stack resting bead */}
                <g transform="translate(215, 240)">
                  <circle cx="0" cy="0" r="17" fill={currentTheme.bg} filter="url(#beadRealShadow)" />
                  <ellipse cx="-5" cy="-5" rx="6.5" ry="4" transform="rotate(-25 -5 -5)" fill={currentTheme.specular} opacity="0.8" />
                </g>
              </g>

              {/* 5. The Grand Carved Minaret / Imam & Tassel (المئذنة والشاهد والشرابة في أسفل العقد) */}
              <g
                transform="translate(160, 290)"
                className="transition-transform duration-300"
                style={{
                  transformOrigin: '160px 290px',
                  transform: tasselSway ? 'rotate(6deg) scale(1.04)' : 'rotate(0deg) scale(1)',
                }}
              >
                {/* Minaret Dome Collar */}
                <circle cx="0" cy="-12" r="7" fill="#fbbf24" stroke="#78350f" strokeWidth="1" filter="url(#beadRealShadow)" />
                <polygon points="0,-24 -5,-12 5,-12" fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />

                {/* Minaret Carved Body */}
                <rect
                  x="-8"
                  y="-10"
                  width="16"
                  height="30"
                  rx="4"
                  fill="url(#minaretWoodGrad)"
                  stroke="#d97706"
                  strokeWidth="1.2"
                  filter="url(#beadRealShadow)"
                />
                <radialGradient id="minaretWoodGrad" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="45%" stopColor="#f59e0b" />
                  <stop offset="90%" stopColor="#78350f" />
                </radialGradient>

                {/* Gold Rings Accent */}
                <line x1="-8" y1="0" x2="8" y2="0" stroke="#fef08a" strokeWidth="1.5" />
                <line x1="-8" y1="10" x2="8" y2="10" stroke="#fef08a" strokeWidth="1.5" />

                {/* Silk Tassel Knot */}
                <circle cx="0" cy="24" r="8" fill={currentTheme.tasselColor} stroke="#d4af37" strokeWidth="1" />

                {/* Silk Tassel Fringes (شرابة السبحة الحريرية التي تهتز عند النقر) */}
                {[-7, -5, -3, -1, 1, 3, 5, 7].map((tx, idx) => (
                  <path
                    key={idx}
                    d={`M ${tx} 28 Q ${tx + (tasselSway ? 4 : 0)} 48 ${tx * 1.4} 70`}
                    fill="none"
                    stroke={idx % 2 === 0 ? currentTheme.tasselColor : '#fbbf24'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.95"
                  />
                ))}
              </g>
            </svg>
          </div>

        </div>

        {/* Bottom Interactive Reset Button */}
        <div className="relative z-20 flex items-center justify-between pt-4 border-t border-white/10 text-xs">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-amber-300 border border-white/10 transition-all cursor-pointer active:scale-95"
            title="تصفير العداد"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>تصفير العداد</span>
          </button>

          <span className="text-slate-400 text-xs font-cairo">
            انزلاق خرز واقعي مع صوت واهتزاز طبيعي
          </span>
        </div>
      </div>
    </div>
  );
};
