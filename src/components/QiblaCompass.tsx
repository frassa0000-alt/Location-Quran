import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Compass,
  MapPin,
  Sparkles,
  CheckCircle2,
  Volume2,
  VolumeX,
  Smartphone,
  MousePointerClick,
  ChevronDown,
  Navigation,
  Globe,
  Crosshair,
  AlertCircle,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import {
  POPULAR_CITIES,
  CityCoordinates,
  calculateQiblaBearing,
  calculateDistanceToKaaba,
  getCompassCardinalName,
} from '../utils/prayerCalculations';
import {
  getStoredRealLocation,
  saveStoredRealLocation,
  requestPhoneGpsPosition,
  fetchRealAddressFromCoords,
  RealGpsLocation,
} from '../utils/realLocation';
import { playSuccessChime, triggerVibration } from '../utils/audio';

interface QiblaCompassProps {
  initialCity?: CityCoordinates;
}

export const QiblaCompass: React.FC<QiblaCompassProps> = ({ initialCity }) => {
  // Current user location (GPS or selected city)
  const [selectedCity, setSelectedCity] = useState<CityCoordinates>(() => {
    if (initialCity) return initialCity;
    try {
      const savedCityName = localStorage.getItem('quran_selected_city_name');
      if (savedCityName) {
        const found = POPULAR_CITIES.find((c) => c.name === savedCityName);
        if (found) return found;
      }
    } catch {
      // ignore
    }
    return POPULAR_CITIES.find((c) => c.name === 'القاهرة') || POPULAR_CITIES[0];
  });

  const [realGpsLocation, setRealGpsLocation] = useState<RealGpsLocation | null>(() => {
    return getStoredRealLocation();
  });

  // Active coordinates
  const activeLat = realGpsLocation ? realGpsLocation.lat : selectedCity.lat;
  const activeLng = realGpsLocation ? realGpsLocation.lng : selectedCity.lng;
  const locationLabel = realGpsLocation
    ? `${realGpsLocation.city} (${realGpsLocation.country})`
    : `${selectedCity.name} (${selectedCity.country})`;

  // Compass Heading (0 - 359 degrees)
  const [heading, setHeading] = useState<number>(0);
  const [mode, setMode] = useState<'sensor' | 'manual'>('sensor');
  const [sensorStatus, setSensorStatus] = useState<'idle' | 'active' | 'denied' | 'unsupported'>('idle');
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [showCityPicker, setShowCityPicker] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Audio & Haptic state refs
  const hasChimedRef = useRef<boolean>(false);
  const lastVibrateRef = useRef<number>(0);

  // Dial dragging state for manual mode & desktop
  const dialRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Qibla calculations
  const qiblaBearing = calculateQiblaBearing(activeLat, activeLng);
  const distanceToKaaba = calculateDistanceToKaaba(activeLat, activeLng);
  const cardinalDirName = getCompassCardinalName(qiblaBearing);

  // Difference between current heading and Qibla bearing (-180 to +180)
  let diff = (qiblaBearing - heading + 360) % 360;
  if (diff > 180) diff -= 360;
  const diffAbs = Math.abs(diff);

  // Aligned when heading is within ±3.5 degrees of Qibla bearing
  const isAligned = diffAbs <= 3.5;

  // Sound & Vibration on Alignment
  useEffect(() => {
    if (isAligned) {
      const now = Date.now();
      if (!hasChimedRef.current && soundEnabled) {
        hasChimedRef.current = true;
        playSuccessChime();
      }
      if (now - lastVibrateRef.current > 3000) {
        lastVibrateRef.current = now;
        triggerVibration([40, 60, 40]);
      }
    } else {
      hasChimedRef.current = false;
    }
  }, [isAligned, soundEnabled]);

  // Handle Device Orientation (iOS and Android)
  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    let currentHeading: number | null = null;

    if (
      (e as any).webkitCompassHeading !== undefined &&
      (e as any).webkitCompassHeading !== null
    ) {
      currentHeading = (e as any).webkitCompassHeading;
    } else if (
      e.absolute === true &&
      e.alpha !== null &&
      e.alpha !== undefined
    ) {
      currentHeading = (360 - e.alpha) % 360;
    } else if (e.alpha !== null && e.alpha !== undefined) {
      currentHeading = (360 - e.alpha) % 360;
    }

    if (currentHeading !== null && !isNaN(currentHeading)) {
      const rounded = Math.round((currentHeading + 360) % 360);
      setHeading(rounded);
      setSensorStatus('active');
    }
  }, []);

  // Request Sensor Access (iOS Safari requirement)
  const requestSensorAccess = async () => {
    try {
      const win = window as any;
      if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          win.addEventListener('deviceorientation', handleOrientation, true);
          setSensorStatus('active');
          setMode('sensor');
        } else {
          setSensorStatus('denied');
          setMode('manual');
        }
      } else if (win && 'ondeviceorientationabsolute' in win) {
        win.addEventListener('deviceorientationabsolute', handleOrientation, true);
        setSensorStatus('active');
        setMode('sensor');
      } else if (typeof DeviceOrientationEvent !== 'undefined') {
        win.addEventListener('deviceorientation', handleOrientation, true);
        setSensorStatus('active');
        setMode('sensor');
      } else {
        setSensorStatus('unsupported');
        setMode('manual');
      }
    } catch (err) {
      console.warn('Orientation permission error:', err);
      setSensorStatus('unsupported');
      setMode('manual');
    }
  };

  // Passive initial orientation listener
  useEffect(() => {
    const win = window as any;
    if (typeof (DeviceOrientationEvent as any)?.requestPermission !== 'function') {
      if (win && 'ondeviceorientationabsolute' in win) {
        win.addEventListener('deviceorientationabsolute', handleOrientation, true);
      }
      if (typeof DeviceOrientationEvent !== 'undefined') {
        win.addEventListener('deviceorientation', handleOrientation, true);
      }
    }

    return () => {
      if (win && 'ondeviceorientationabsolute' in win) {
        win.removeEventListener('deviceorientationabsolute', handleOrientation, true);
      }
      win?.removeEventListener?.('deviceorientation', handleOrientation, true);
    };
  }, [handleOrientation]);

  // Request High Precision Phone GPS Location
  const handleDetectGps = async () => {
    setIsGpsLoading(true);
    setGpsError(null);
    try {
      const pos = await requestPhoneGpsPosition();
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const accuracy = pos.coords.accuracy;

      const addr = await fetchRealAddressFromCoords(lat, lng);

      const newGps: RealGpsLocation = {
        lat,
        lng,
        accuracy,
        city: addr.city || 'موقعي المباشر',
        country: addr.country || 'GPS',
        state: addr.state,
        neighbourhood: addr.neighbourhood,
        fullAddress: addr.fullAddress,
        timestamp: Date.now(),
        isRealGps: true,
      };

      setRealGpsLocation(newGps);
      saveStoredRealLocation(newGps);
    } catch (err: any) {
      console.warn('GPS error:', err);
      setGpsError(
        err?.message || 'تعذر الوصول لنظام GPS. تأكد من تفعيل خدمة الموقع في جهازك.'
      );
    } finally {
      setIsGpsLoading(false);
    }
  };

  // Change City
  const handleSelectCity = (city: CityCoordinates) => {
    setSelectedCity(city);
    setRealGpsLocation(null);
    try {
      localStorage.removeItem('quran_user_real_gps_location');
      localStorage.setItem('quran_selected_city_name', city.name);
    } catch {
      // ignore
    }
    setShowCityPicker(false);
  };

  // Interactive Touch & Mouse Rotation (Lightweight circular drag)
  const calculateAngleFromPointer = (clientX: number, clientY: number) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rad = Math.atan2(clientY - cy, clientX - cx);
    let deg = Math.round((rad * 180) / Math.PI) + 90;
    deg = (deg + 360) % 360;
    setHeading(deg);
    setMode('manual');
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    calculateAngleFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    calculateAngleFromPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Quick snap to Qibla
  const handleSnapToQibla = () => {
    setHeading(qiblaBearing);
    setMode('manual');
  };

  const handleResetToNorth = () => {
    setHeading(0);
    setMode('manual');
  };

  // Rotations:
  // The dial rotates counter-clockwise with user heading: -heading
  const dialRotation = -heading;

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-20 select-none px-3.5 sm:px-4 font-cairo">
      {/* Sleek Minimalist Header */}
      <div className="text-center space-y-1.5 pt-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/25 text-xs text-emerald-300 font-medium">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>بوصلة القبلة الذكية</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-amber-100">
          اتجاه القبلة الشريفة
        </h1>
        <p className="text-xs text-[#8BAAA0] max-w-sm mx-auto">
          توجيه مباشر نحو الكعبة المشرفة بمكة المكرمة
        </p>
      </div>

      {/* Lightweight Location Pill */}
      <div className="bg-[#0F1E19]/90 border border-emerald-900/40 rounded-2xl p-2.5 sm:p-3 shadow-md">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0 pr-1">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="truncate text-right">
              <span className="text-[11px] text-[#719286] block">الموقع المعتمد:</span>
              <span className="font-bold text-amber-200 text-xs sm:text-sm truncate block">
                {locationLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 justify-end">
            <button
              onClick={handleDetectGps}
              disabled={isGpsLoading}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="تحديد الموقع عبر GPS"
            >
              <Crosshair className={`w-3.5 h-3.5 ${isGpsLoading ? 'animate-spin' : ''}`} />
              <span>{isGpsLoading ? 'تحديد...' : 'GPS'}</span>
            </button>

            <button
              onClick={() => setShowCityPicker(!showCityPicker)}
              className="px-2.5 py-1.5 rounded-xl bg-[#142822] hover:bg-[#1B362E] text-[#B8D3C8] border border-[#23483D] text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-amber-300" />
              <span>المدينة</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform ${
                  showCityPicker ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {gpsError && (
          <div className="mt-2 p-2 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-200 text-[11px] flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
            <span>{gpsError}</span>
          </div>
        )}

        {/* Compact City Dropdown */}
        {showCityPicker && (
          <div className="mt-2.5 pt-2.5 border-t border-[#1C362F] space-y-1.5 animate-in fade-in duration-150">
            <span className="text-[11px] text-[#719286] block">اختر مدينة:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-40 overflow-y-auto pr-1">
              {POPULAR_CITIES.map((c) => {
                const isSelected = selectedCity.name === c.name && !realGpsLocation;
                return (
                  <button
                    key={c.name}
                    onClick={() => handleSelectCity(c)}
                    className={`px-2 py-1.5 rounded-lg text-xs transition-all text-right truncate cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 font-bold'
                        : 'bg-[#0B1713] hover:bg-[#142822] text-[#A6C4B8] border border-[#183329]'
                    }`}
                  >
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lightweight Sleek Compass Dial (شكل جديد خفيف وعصري) */}
      <div className="relative flex flex-col items-center justify-center py-2">
        {/* Soft Ambient Halo behind the dial when aligned */}
        <div
          className={`absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full transition-all duration-500 pointer-events-none blur-xl ${
            isAligned
              ? 'bg-emerald-500/25 scale-105 opacity-100'
              : 'bg-amber-400/5 scale-95 opacity-30'
          }`}
        />

        {/* The Clean Minimalist Dial Container */}
        <div
          ref={dialRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ touchAction: 'none' }}
          className={`relative w-64 h-64 sm:w-72 sm:h-72 rounded-full p-2 transition-all duration-300 flex items-center justify-center cursor-grab active:cursor-grabbing select-none shadow-xl ${
            isAligned
              ? 'bg-gradient-to-b from-[#0F2D22] to-[#081711] ring-2 ring-emerald-400/50 shadow-emerald-500/20'
              : 'bg-gradient-to-b from-[#11241D] to-[#0A1612] ring-1 ring-emerald-500/20 shadow-black/40'
          }`}
        >
          {/* Subtle Outer Hairline Ring */}
          <div className="absolute inset-2 rounded-full border border-emerald-500/20 pointer-events-none" />

          {/* ROTATING COMPASS RING (Rotates smoothly opposite to heading) */}
          <div
            className="absolute inset-3.5 rounded-full transition-transform duration-150 ease-out will-change-transform pointer-events-none"
            style={{ transform: `rotate(${dialRotation}deg)` }}
          >
            {/* Minimalist 12 Hour Ticks (Every 30 degrees) */}
            {Array.from({ length: 12 }, (_, i) => i * 30).map((deg) => {
              const isCardinal = deg % 90 === 0;
              return (
                <div
                  key={deg}
                  className="absolute inset-0 flex justify-center pointer-events-none"
                  style={{ transform: `rotate(${deg}deg)` }}
                >
                  <div
                    className={`rounded-full ${
                      isCardinal
                        ? 'w-0.5 h-2.5 bg-amber-400'
                        : 'w-0.5 h-1.5 bg-emerald-500/40'
                    }`}
                  />
                </div>
              );
            })}

            {/* Cardinal Letters: ش (North), ق (East), ج (South), غ (West) */}
            {/* North (شمال) */}
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 text-center pointer-events-none">
              <span className="text-xs font-bold text-rose-400 block leading-none">ش</span>
            </div>

            {/* East (شرق) */}
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-xs font-bold text-[#8FAFA1] block leading-none">ق</span>
            </div>

            {/* South (جنوب) */}
            <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 text-center pointer-events-none">
              <span className="text-xs font-bold text-[#8FAFA1] block leading-none">ج</span>
            </div>

            {/* West (غرب) */}
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-xs font-bold text-[#8FAFA1] block leading-none">غ</span>
            </div>

            {/* KAABA TARGET ORBITING ON THE RING (Exact Qibla Bearing) */}
            <div
              className="absolute inset-0 flex justify-center pointer-events-none"
              style={{ transform: `rotate(${qiblaBearing}deg)` }}
            >
              {/* Slender golden beam to Kaaba */}
              <div
                className={`absolute top-4 bottom-1/2 w-0.5 pointer-events-none transition-opacity ${
                  isAligned
                    ? 'bg-gradient-to-t from-transparent to-emerald-400 opacity-90'
                    : 'bg-gradient-to-t from-transparent to-amber-400/60 opacity-60'
                }`}
              />

              {/* Kaaba Badge */}
              <div className="absolute -top-3 flex flex-col items-center pointer-events-none">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-md transition-all ${
                    isAligned
                      ? 'bg-emerald-500 scale-115 ring-2 ring-emerald-300 animate-pulse'
                      : 'bg-[#18362B] border border-amber-400/80 ring-1 ring-amber-400/30'
                  }`}
                >
                  <span>🕋</span>
                </div>
                <span className="text-[9px] font-mono font-bold mt-0.5 px-1 rounded-sm bg-black/80 text-amber-300">
                  {qiblaBearing}°
                </span>
              </div>
            </div>
          </div>

          {/* FIXED TOP LUBBER MARKER (Points straight ahead) */}
          <div className="absolute top-0.5 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-20">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm" />
          </div>

          {/* SLEEK LIGHTWEIGHT NEEDLE (Centered Arrow Pointer) */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-150 ease-out z-10"
            style={{ transform: `rotate(${dialRotation}deg)` }}
          >
            {/* North pointing arrow (Red slim spear) & South (Silver slim spear) */}
            <div className="relative flex flex-col items-center justify-center h-40 sm:h-44">
              {/* North tip */}
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[68px] sm:border-b-[76px] border-b-rose-500 drop-shadow-[0_2px_4px_rgba(244,63,94,0.4)]" />
              {/* South tip */}
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[68px] sm:border-t-[76px] border-t-[#5E7F72]/80" />
            </div>
          </div>

          {/* INNER GLASS CENTER DISC with live readout */}
          <div
            className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full border flex flex-col items-center justify-center z-20 transition-all duration-300 shadow-md ${
              isAligned
                ? 'bg-[#0E281F]/90 border-emerald-400/60 ring-2 ring-emerald-400/30'
                : 'bg-[#0D1C16]/90 border-emerald-500/20'
            }`}
          >
            <span className="text-[10px] text-[#7E9F92] leading-none mb-0.5">
              {isAligned ? 'مُتطابق' : 'الوجهة'}
            </span>
            <span
              className={`text-lg sm:text-xl font-bold font-mono leading-none ${
                isAligned ? 'text-emerald-300' : 'text-amber-200'
              }`}
            >
              {heading}°
            </span>
            <span className="text-[9px] text-[#6E8F82] mt-0.5">
              {isAligned ? '🕋 القبلة' : getCompassCardinalName(heading)}
            </span>
          </div>
        </div>

        {/* Small Interaction Hint */}
        <span className="text-[10px] text-[#69887B] mt-2 block text-center">
          {mode === 'manual'
            ? 'يمكنك سحب البوصلة باللمس أو الماوس لتدويرها'
            : 'حرّك الهاتف أفقياً حتى تتطابق مع زاوية الكعبة'}
        </span>
      </div>

      {/* Lightweight Directional Guidance Banner */}
      <div
        className={`p-3 rounded-xl border text-center transition-all duration-300 ${
          isAligned
            ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200 shadow-xs'
            : 'bg-[#0F1E19]/90 border-emerald-900/30 text-[#BDD7CC]'
        }`}
      >
        {isAligned ? (
          <div className="flex items-center justify-center gap-2 text-emerald-300 font-bold text-sm sm:text-base">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>أنت في اتجاه القبلة تماماً نحو الكعبة المشرفة 🕋</span>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-amber-300 font-semibold text-xs sm:text-sm">
              <Navigation className="w-3.5 h-3.5 text-amber-400 -rotate-45 shrink-0" />
              {diff > 0 ? (
                <span>أدر الهاتف بمقدار {Math.round(diffAbs)}° لليمين ↻</span>
              ) : (
                <span>أدر الهاتف بمقدار {Math.round(diffAbs)}° لليسار ↺</span>
              )}
            </div>
            <p className="text-[11px] text-[#7D9E91]">
              زاوية القبلة المطلوبة: <strong className="text-amber-200 font-mono">{qiblaBearing}°</strong> ({cardinalDirName})
            </p>
          </div>
        )}
      </div>

      {/* Compact Controls Bar (حساس الهاتف / تدوير يدوي / كتم الصوت / محاذاة) */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-0.5">
        <div className="flex items-center gap-1 p-1 bg-[#0D1C17] rounded-xl border border-emerald-900/40">
          <button
            onClick={() => {
              setMode('sensor');
              requestSensorAccess();
            }}
            className={`px-2.5 py-1 rounded-lg transition-all font-medium flex items-center gap-1 cursor-pointer ${
              mode === 'sensor'
                ? 'bg-emerald-900/80 text-emerald-200 shadow-xs'
                : 'text-[#7D9F91] hover:text-[#D5E6DF]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>حساس الهاتف</span>
          </button>

          <button
            onClick={() => setMode('manual')}
            className={`px-2.5 py-1 rounded-lg transition-all font-medium flex items-center gap-1 cursor-pointer ${
              mode === 'manual'
                ? 'bg-emerald-900/80 text-emerald-200 shadow-xs'
                : 'text-[#7D9F91] hover:text-[#D5E6DF]'
            }`}
          >
            <MousePointerClick className="w-3.5 h-3.5" />
            <span>يدوي</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleResetToNorth}
            className="p-1.5 rounded-lg bg-[#0D1C17] hover:bg-[#142C24] text-[#86A89B] border border-emerald-900/40 transition-colors cursor-pointer"
            title="إعادة التوجيه للشمال (0°)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-600/40'
                : 'bg-[#0D1C17] text-[#5A7A6D] border-emerald-900/40'
            }`}
            title={soundEnabled ? 'تمكين نغمة التأكيد' : 'كتم نغمة التأكيد'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleSnapToQibla}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
            title="محاذاة فورية مع زاوية القبلة"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>توجيه للقبلة</span>
          </button>
        </div>
      </div>

      {/* Lightweight Telemetry Cards (زاوية القبلة، المسافة، الإحداثيات) */}
      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
        <div className="p-2.5 bg-[#0F1E19]/90 border border-emerald-900/30 rounded-xl space-y-0.5">
          <span className="text-[10px] text-[#719286] block">زاوية القبلة</span>
          <div className="font-mono font-bold text-base sm:text-lg text-amber-300">
            {qiblaBearing}°
          </div>
          <span className="text-[10px] text-[#8BAAA0] block truncate">
            {cardinalDirName}
          </span>
        </div>

        <div className="p-2.5 bg-[#0F1E19]/90 border border-emerald-900/30 rounded-xl space-y-0.5">
          <span className="text-[10px] text-[#719286] block">المسافة لمكة</span>
          <div className="font-mono font-bold text-base sm:text-lg text-emerald-300">
            {distanceToKaaba.toLocaleString('ar-EG')}
          </div>
          <span className="text-[10px] text-[#8BAAA0] block">كم</span>
        </div>

        <div className="p-2.5 bg-[#0F1E19]/90 border border-emerald-900/30 rounded-xl space-y-0.5">
          <span className="text-[10px] text-[#719286] block">الموقع</span>
          <div className="font-mono text-xs sm:text-sm font-semibold text-[#D2E4DC] pt-0.5 truncate">
            {activeLat.toFixed(1)}°N
          </div>
          <span className="text-[10px] text-[#8BAAA0] block truncate">
            {activeLng.toFixed(1)}°E
          </span>
        </div>
      </div>

      {/* Quick Minimalist Help Note */}
      <div className="p-2.5 bg-[#0B1713]/80 border border-emerald-900/30 rounded-xl text-[11px] text-[#77998C] flex items-start gap-2">
        <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          <strong>ملاحظة:</strong> ضع الهاتف أفقياً بعيداً عن المعادن والمغناطيس. إذا لم يتحرك المؤشر، اضغط زر «حساس الهاتف» أو حرّك الهاتف في الهواء على شكل رقم (8) للمعايرة.
        </span>
      </div>
    </div>
  );
};
