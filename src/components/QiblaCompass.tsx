import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navigation } from 'lucide-react';
import { calculateQiblaBearing } from '../utils/prayerCalculations';
import { CityCoordinates } from '../utils/prayerCalculations';

interface QiblaCompassProps {
  initialCity?: CityCoordinates;
}

export const QiblaCompass: React.FC<QiblaCompassProps> = ({ initialCity }) => {
  // Coordinates (default reference without any GPS tracking)
  const [coords] = useState<{ lat: number; lng: number }>(() => {
    if (initialCity) return { lat: initialCity.lat, lng: initialCity.lng };
    return { lat: 30.0444, lng: 31.2357 }; // Standard Cairo / Middle East reference
  });

  const [heading, setHeading] = useState<number>(0);
  const [sensorStarted, setSensorStarted] = useState<boolean>(false);
  const lastVibrateRef = useRef<number>(0);

  // Compute Qibla bearing from current coordinates (Makkah Kaaba)
  const qiblaBearing = calculateQiblaBearing(coords.lat, coords.lng);

  // Shortest angular difference to Qibla
  let diff = (qiblaBearing - heading + 360) % 360;
  if (diff > 180) diff -= 360;
  const isAligned = Math.abs(diff) <= 4;

  // Gentle haptic feedback on exact alignment
  useEffect(() => {
    if (isAligned && typeof navigator !== 'undefined' && navigator.vibrate) {
      const now = Date.now();
      if (now - lastVibrateRef.current > 3000) {
        lastVibrateRef.current = now;
        try {
          navigator.vibrate([40, 50, 40]);
        } catch {
          // ignore
        }
      }
    }
  }, [isAligned]);

  // Handle phone orientation
  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    let currentCompassHeading: number | null = null;

    if ((e as any).webkitCompassHeading !== undefined && (e as any).webkitCompassHeading !== null) {
      currentCompassHeading = (e as any).webkitCompassHeading;
    } else if (e.alpha !== null && e.alpha !== undefined) {
      currentCompassHeading = (360 - e.alpha) % 360;
    }

    if (currentCompassHeading !== null && !isNaN(currentCompassHeading)) {
      setHeading(Math.round(currentCompassHeading));
      setSensorStarted(true);
    }
  }, []);

  // Enable sensor on mount or user touch
  const requestSensorAccess = async () => {
    try {
      if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
        const res = await (DeviceOrientationEvent as any).requestPermission();
        if (res === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
          setSensorStarted(true);
        }
      } else if ('ondeviceorientationabsolute' in (window as any)) {
        (window as any).addEventListener('deviceorientationabsolute', handleOrientation, true);
        setSensorStarted(true);
      } else if ('DeviceOrientationEvent' in window) {
        window.addEventListener('deviceorientation', handleOrientation, true);
        setSensorStarted(true);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    // Auto attach listener for Android and modern browsers that don't block passive events
    if (typeof (DeviceOrientationEvent as any)?.requestPermission !== 'function') {
      if ('ondeviceorientationabsolute' in (window as any)) {
        (window as any).addEventListener('deviceorientationabsolute', handleOrientation, true);
      }
      if ('DeviceOrientationEvent' in window) {
        window.addEventListener('deviceorientation', handleOrientation, true);
      }
    }

    return () => {
      (window as any).removeEventListener?.('deviceorientationabsolute', handleOrientation, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [handleOrientation]);

  return (
    <div
      onClick={requestSensorAccess}
      className="flex flex-col items-center justify-center min-h-[60vh] py-8 select-none"
    >
      {/* Pure, compact, centered compass dial with zero clutter */}
      <div className="relative flex items-center justify-center">
        {/* Compact dial housing */}
        <div
          className={`relative w-56 h-56 sm:w-64 sm:h-64 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
            isAligned
              ? 'border-emerald-400 bg-emerald-950/20 shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-400/20'
              : 'border-[#264D3F] bg-[#10201A] shadow-xl'
          }`}
        >
          {/* Subtle Degree Ticks */}
          {Array.from({ length: 12 }, (_, i) => i * 30).map((deg) => (
            <div
              key={deg}
              className="absolute inset-0 flex justify-center pointer-events-none"
              style={{ transform: `rotate(${deg}deg)` }}
            >
              <div
                className={`w-0.5 ${
                  deg % 90 === 0 ? 'h-3 bg-amber-400/70' : 'h-1.5 bg-[#406254]'
                }`}
              />
            </div>
          ))}

          {/* North marker (rotates opposite to phone orientation) */}
          <div
            className="absolute inset-0 flex justify-center pointer-events-none transition-transform duration-200 ease-out"
            style={{ transform: `rotate(${-heading}deg)` }}
          >
            <span className="text-[11px] font-bold text-red-400/80 mt-2 font-mono">
              ش
            </span>
          </div>

          {/* Direct Qibla Needle (points dynamically toward the Kaaba relative to phone movement) */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-200 ease-out"
            style={{ transform: `rotate(${qiblaBearing - heading}deg)` }}
          >
            <div className="flex flex-col items-center">
              {/* Pointer Icon */}
              <Navigation
                className={`w-8 h-8 -rotate-45 drop-shadow-md transition-colors ${
                  isAligned
                    ? 'text-emerald-400 fill-emerald-400 scale-110'
                    : 'text-amber-400 fill-amber-400'
                }`}
              />
              <div
                className={`w-1.5 h-14 rounded-t-full transition-colors ${
                  isAligned
                    ? 'bg-gradient-to-t from-transparent via-emerald-400 to-emerald-300'
                    : 'bg-gradient-to-t from-transparent via-amber-400 to-amber-300'
                }`}
              />
              {/* Small Kaaba Icon on pointer tip */}
              <div className="w-1 h-8 bg-gradient-to-b from-transparent to-[#335649] rounded-b-full mt-8" />
            </div>
          </div>

          {/* Subtle Kaaba mark at Kaaba bearing on dial ring */}
          <div
            className="absolute inset-0 flex justify-center pointer-events-none transition-transform duration-200 ease-out"
            style={{ transform: `rotate(${qiblaBearing - heading}deg)` }}
          >
            <span className="text-sm -mt-2.5">🕋</span>
          </div>

          {/* Center Hub */}
          <div
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors z-10 ${
              isAligned
                ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                : 'bg-[#142620] border-[#2C5645] text-amber-300'
            }`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                isAligned ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Subtle alignment status, minimal & uncrowded */}
      <div className="mt-5 text-center">
        {isAligned ? (
          <p className="text-emerald-300 font-bold text-sm tracking-wide animate-pulse">
            أنت في اتجاه القبلة 🕋
          </p>
        ) : (
          <p className="text-[#8EA89D] text-xs font-medium">
            القبلة
          </p>
        )}

        {!sensorStarted && (
          <button
            onClick={requestSensorAccess}
            className="mt-3 text-[11px] text-amber-400/80 hover:text-amber-300 underline block mx-auto cursor-pointer"
          >
            انقر هنا إذا لم تتحرك البوصلة مع الهاتف
          </button>
        )}
      </div>
    </div>
  );
};
