import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Compass,
  MapPin,
  RotateCw,
  Sparkles,
  CheckCircle2,
  Sliders,
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
  RefreshCw,
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
      // Check if user has saved city in prayer times
      const savedCityName = localStorage.getItem('quran_selected_city_name');
      if (savedCityName) {
        const found = POPULAR_CITIES.find((c) => c.name === savedCityName);
        if (found) return found;
      }
    } catch {
      // ignore
    }
    // Default to Cairo / Middle East reference
    return (
      POPULAR_CITIES.find((c) => c.name === 'القاهرة') || POPULAR_CITIES[0]
    );
  });

  const [realGpsLocation, setRealGpsLocation] = useState<RealGpsLocation | null>(() => {
    return getStoredRealLocation();
  });

  // Active coordinates used for bearing calculation
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
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);

  // Audio & Haptic state refs to avoid continuous repeat
  const hasChimedRef = useRef<boolean>(false);
  const lastVibrateRef = useRef<number>(0);

  // Dial dragging state for manual mode & desktop
  const dialRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragCenterRef = useRef<{ cx: number; cy: number }>({ cx: 0, cy: 0 });

  // Calculate Qibla bearing and distance from active coordinates
  const qiblaBearing = calculateQiblaBearing(activeLat, activeLng);
  const distanceToKaaba = calculateDistanceToKaaba(activeLat, activeLng);
  const cardinalDirName = getCompassCardinalName(qiblaBearing);

  // Difference between current heading and Qibla bearing (-180 to +180)
  let diff = (qiblaBearing - heading + 360) % 360;
  if (diff > 180) diff -= 360;
  const diffAbs = Math.abs(diff);

  // Aligned when heading is within ±3 degrees of Qibla bearing
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
        triggerVibration([50, 70, 50]);
      }
    } else {
      hasChimedRef.current = false;
    }
  }, [isAligned, soundEnabled]);

  // Handle Device Orientation
  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    let currentHeading: number | null = null;

    // iOS WebKit Compass Heading (absolute true magnetic heading)
    if (
      (e as any).webkitCompassHeading !== undefined &&
      (e as any).webkitCompassHeading !== null
    ) {
      currentHeading = (e as any).webkitCompassHeading;
    }
    // Android Absolute Orientation
    else if (
      e.absolute === true &&
      e.alpha !== null &&
      e.alpha !== undefined
    ) {
      currentHeading = (360 - e.alpha) % 360;
    }
    // Standard Alpha fallback
    else if (e.alpha !== null && e.alpha !== undefined) {
      currentHeading = (360 - e.alpha) % 360;
    }

    if (currentHeading !== null && !isNaN(currentHeading)) {
      const rounded = Math.round((currentHeading + 360) % 360);
      setHeading(rounded);
      setSensorStatus('active');
    }
  }, []);

  // Request Device Orientation Permission (specifically needed for iOS 13+ Safari)
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

  // Auto-listen on initial mount if browser supports it passively
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

    // Check if orientation event actually fires within 1.5 seconds, otherwise inform user
    const checkTimer = setTimeout(() => {
      if (sensorStatus === 'idle') {
        // If no orientation event fired yet, user might be on desktop or needs permission
        setSensorStatus('idle');
      }
    }, 1500);

    return () => {
      clearTimeout(checkTimer);
      if (win && 'ondeviceorientationabsolute' in win) {
        win.removeEventListener('deviceorientationabsolute', handleOrientation, true);
      }
      win?.removeEventListener?.('deviceorientation', handleOrientation, true);
    };
  }, [handleOrientation, sensorStatus]);

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
        err?.message || 'تعذر الوصول إلى نظام تحديد المواقع. تأكد من تفعيل الـ GPS في جهازك.'
      );
    } finally {
      setIsGpsLoading(false);
    }
  };

  // Change City from popular list
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

  // Interactive Touch & Mouse Rotation on the Dial (for PC, Laptop, and Manual Mode)
  const calculateAngleFromPointer = (clientX: number, clientY: number) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rad = Math.atan2(clientY - cy, clientX - cx);
    let deg = Math.round((rad * 180) / Math.PI) + 90; // Align 0 to Top (North)
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

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
  };

  // Quick alignment helpers
  const handleSnapToQibla = () => {
    setHeading(qiblaBearing);
    setMode('manual');
  };

  const handleResetToNorth = () => {
    setHeading(0);
  };

  // Calculate rotation angles
  // The compass rose rotates opposite to the user's heading: -heading
  const compassDialRotation = -heading;
  // The Kaaba angle on the dial is at qiblaBearing
  // Needle points to true North (0 on dial), while Kaaba target is at qiblaBearing on the dial ring

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 select-none px-3 sm:px-4 font-cairo">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#132820] border border-[#234A3C] text-xs text-amber-300 font-semibold shadow-xs">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>بوصلة القبلة التفاعلية الذكية</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-amiri font-bold text-amber-200">
          اتجاه القبلة الشريفة
        </h1>
        <p className="text-xs sm:text-sm text-[#8FA89E] max-w-md mx-auto leading-relaxed">
          تحديد دقيق ومباشر لزاوية الكعبة المشرفة بمكة المكرمة بالدرجات الحسابية والمستشعر الجيروسكوبي.
        </p>
      </div>

      {/* Location Bar & City Selector */}
      <div className="bg-[#12221D] border border-[#214336] rounded-2xl p-3 sm:p-4 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="text-right min-w-0">
              <span className="text-[11px] text-[#78968A] block">موقعك الحالي لحساب الزاوية:</span>
              <span className="font-bold text-amber-200 text-sm truncate block">
                {locationLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* GPS Detection Button */}
            <button
              onClick={handleDetectGps}
              disabled={isGpsLoading}
              className="px-3 py-1.5 rounded-xl bg-[#162F26] hover:bg-[#1C3B30] text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="تحديد موقعي الدقيق عبر الـ GPS"
            >
              <Crosshair className={`w-3.5 h-3.5 ${isGpsLoading ? 'animate-spin' : ''}`} />
              <span>{isGpsLoading ? 'جاري التحديد...' : 'موقعي (GPS)'}</span>
            </button>

            {/* City Picker Toggle Button */}
            <button
              onClick={() => setShowCityPicker(!showCityPicker)}
              className="px-3 py-1.5 rounded-xl bg-[#142621] hover:bg-[#1A332C] text-[#C0D9CD] border border-[#244A3D] text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-amber-300" />
              <span>تغيير المدينة</span>
              <ChevronDown
                className={`w-3 h-3 text-[#78968A] transition-transform ${
                  showCityPicker ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* GPS Error Message */}
        {gpsError && (
          <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{gpsError}</span>
          </div>
        )}

        {/* Expanded Popular Cities Grid */}
        {showCityPicker && (
          <div className="pt-3 border-t border-[#1C362F] space-y-2 animate-in fade-in duration-200">
            <span className="text-[11px] text-[#78968A] block">
              اختر مدينتك من القائمة المعتمدة:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {POPULAR_CITIES.map((c) => {
                const isSelected = selectedCity.name === c.name && !realGpsLocation;
                return (
                  <button
                    key={c.name}
                    onClick={() => handleSelectCity(c)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-right truncate cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                        : 'bg-[#0E1A16] hover:bg-[#162A22] text-[#B0CEC2] border border-[#1A3329]'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] opacity-75 mr-1 block text-right font-normal">
                      {c.country}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Mode Selector & Sensor Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Dual Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#101D19] rounded-xl border border-[#1D382F]">
          <button
            onClick={() => {
              setMode('sensor');
              requestSensorAccess();
            }}
            className={`px-3 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1.5 cursor-pointer ${
              mode === 'sensor'
                ? 'bg-[#18362B] text-amber-300 border border-[#2B5445] shadow-xs'
                : 'text-[#7D9A8D] hover:text-[#E5EFE9]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>حساس الهاتف (تلقائي)</span>
          </button>

          <button
            onClick={() => setMode('manual')}
            className={`px-3 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1.5 cursor-pointer ${
              mode === 'manual'
                ? 'bg-[#18362B] text-amber-300 border border-[#2B5445] shadow-xs'
                : 'text-[#7D9A8D] hover:text-[#E5EFE9]'
            }`}
          >
            <MousePointerClick className="w-3.5 h-3.5" />
            <span>التدوير اليدوي / الماوس</span>
          </button>
        </div>

        {/* Audio Sound & Calibrate */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-[#18362B] text-amber-300 border-[#2B5445]'
                : 'bg-[#101D19] text-[#5C786D] border-[#1C362F]'
            }`}
            title={soundEnabled ? 'تمكين نغمة التأكيد' : 'كتم نغمة التأكيد'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={handleSnapToQibla}
            className="px-2.5 py-2 rounded-xl bg-[#142A22] hover:bg-[#1B382E] text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            title="محاذاة فورية مع زاوية القبلة"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">محاذاة للقبلة</span>
          </button>
        </div>
      </div>

      {/* Main Luxury Astrolabe Qibla Compass Dial (100% Brand New Visual Design) */}
      <div className="relative flex flex-col items-center justify-center pt-2 pb-4">
        {/* Dynamic Glow Aura behind compass when aligned */}
        <div
          className={`absolute w-72 h-72 sm:w-84 sm:h-84 rounded-full transition-all duration-700 pointer-events-none blur-2xl ${
            isAligned
              ? 'bg-emerald-500/30 scale-110 opacity-100'
              : 'bg-amber-500/10 scale-95 opacity-40'
          }`}
        />

        {/* The Master Outer Compass Ring Housing */}
        <div
          ref={dialRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ touchAction: 'none' }}
          className={`relative w-72 h-72 sm:w-84 sm:h-84 rounded-full p-2.5 transition-all duration-300 flex items-center justify-center cursor-grab active:cursor-grabbing select-none ${
            isAligned
              ? 'border-4 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.35)] ring-4 ring-emerald-400/25'
              : 'border-4 border-[#3D6955] shadow-2xl ring-2 ring-[#224436]'
          } bg-gradient-to-b from-[#18352A] via-[#0E1F18] to-[#08120E]`}
        >
          {/* Outer Astrolabe Brass Bezel with 360 degree scale */}
          <div className="absolute inset-2 rounded-full border border-amber-500/40 pointer-events-none" />
          <div className="absolute inset-3.5 rounded-full border border-[#2A5241] pointer-events-none" />

          {/* ROTATING COMPASS ROSE (Rotates by compassDialRotation = -heading) */}
          <div
            className="absolute inset-4 rounded-full transition-transform duration-200 ease-out will-change-transform"
            style={{ transform: `rotate(${compassDialRotation}deg)` }}
          >
            {/* Degree Ticks (Every 15° & 30°) */}
            {Array.from({ length: 24 }, (_, i) => i * 15).map((deg) => {
              const isMajor = deg % 30 === 0;
              const isQuadrant = deg % 90 === 0;
              return (
                <div
                  key={deg}
                  className="absolute inset-0 flex justify-center pointer-events-none"
                  style={{ transform: `rotate(${deg}deg)` }}
                >
                  <div
                    className={`w-0.5 rounded-full ${
                      isQuadrant
                        ? 'h-3.5 bg-amber-400'
                        : isMajor
                        ? 'h-2.5 bg-amber-300/70'
                        : 'h-1.5 bg-[#406856]'
                    }`}
                  />
                  {/* Major degree numbers (0°, 60°, 120°, 180°, 240°, 300°) */}
                  {deg % 60 === 0 && (
                    <span className="absolute top-4 text-[9px] font-mono text-[#82A395] select-none font-bold">
                      {deg}°
                    </span>
                  )}
                </div>
              );
            })}

            {/* Arabic Cardinal Direction Markers on the Rotating Dial */}
            {/* North (شمال - Red Ruby) */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
              <span className="text-sm font-amiri font-bold text-rose-400 drop-shadow-sm">
                ش
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-xs" />
            </div>

            {/* East (شرق - Amber) */}
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <span className="text-sm font-amiri font-bold text-amber-300/90 drop-shadow-sm">
                ق
              </span>
            </div>

            {/* South (جنوب - Slate) */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
              <span className="text-sm font-amiri font-bold text-[#9BB7AB] drop-shadow-sm">
                ج
              </span>
            </div>

            {/* West (غرب - Amber) */}
            <div className="absolute left-1.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <span className="text-sm font-amiri font-bold text-amber-300/90 drop-shadow-sm">
                غ
              </span>
            </div>

            {/* THE KAABA TARGET POINT ON THE ROTATING DIAL (at qiblaBearing) */}
            <div
              className="absolute inset-0 flex justify-center pointer-events-none"
              style={{ transform: `rotate(${qiblaBearing}deg)` }}
            >
              {/* Guidance beam from center towards the Kaaba */}
              <div className="absolute top-6 bottom-1/2 w-0.5 bg-gradient-to-t from-transparent via-amber-400/30 to-amber-400/80 pointer-events-none" />

              {/* Kaaba Badge at the outer perimeter */}
              <div className="absolute -top-3 flex flex-col items-center group pointer-events-none">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg transition-transform ${
                    isAligned
                      ? 'bg-emerald-500 text-stone-950 scale-125 ring-2 ring-emerald-300 animate-bounce'
                      : 'bg-gradient-to-b from-amber-400 to-amber-600 text-stone-950 scale-100 ring-2 ring-amber-300'
                  }`}
                >
                  <span className="text-sm">🕋</span>
                </div>
                <span className="text-[9px] font-bold mt-0.5 px-1.5 py-0.2 rounded-full bg-black/80 text-amber-300 border border-amber-500/40">
                  {qiblaBearing}°
                </span>
              </div>
            </div>
          </div>

          {/* INNER CELESTIAL ASTROLABE PATTERN (Fixed Watermark Plate) */}
          <div className="absolute inset-16 sm:inset-20 rounded-full border border-amber-500/20 bg-radial from-[#122A21] to-[#0A1612] flex items-center justify-center pointer-events-none">
            {/* Islamic 8-point geometric star decoration */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 opacity-15 border border-amber-400 rotate-45 absolute" />
            <div className="w-20 h-20 sm:w-24 sm:h-24 opacity-15 border border-amber-400 rotate-0 absolute" />
          </div>

          {/* FIXED TOP HEADING INDICATOR (Lubber line at 12 o'clock) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1.5 flex flex-col items-center pointer-events-none z-20">
            <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[10px] border-t-amber-400 filter drop-shadow-md" />
          </div>

          {/* THE 3D METALLIC COMPASS NEEDLE (Centered in the hub) */}
          {/* Note: The needle points North (towards North on the dial, which is at compassDialRotation) */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-200 ease-out z-10"
            style={{ transform: `rotate(${compassDialRotation}deg)` }}
          >
            {/* Dual Arrow Needle */}
            <div className="relative flex flex-col items-center justify-center h-48 sm:h-56">
              {/* North Spear (Crimson / Ruby / Gold) */}
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[84px] sm:border-b-[98px] border-b-rose-600 filter drop-shadow-[0_2px_4px_rgba(225,29,72,0.5)] relative">
                {/* Shiny metallic ridge */}
                <div className="absolute left-0 top-0 w-0 h-0 border-l-[8px] border-l-transparent border-b-[84px] sm:border-b-[98px] border-b-rose-400 opacity-60" />
              </div>

              {/* South Spear (Silver / Dark Steel) */}
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[84px] sm:border-t-[98px] border-t-[#6B887B] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] relative">
                {/* Shiny metallic ridge */}
                <div className="absolute left-0 top-0 w-0 h-0 border-l-[8px] border-l-transparent border-t-[84px] sm:border-t-[98px] border-t-[#96B5A7] opacity-60" />
              </div>
            </div>
          </div>

          {/* CENTER BRASS PIVOT & EMERALD GEM (Center Hub) */}
          <div
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-30 shadow-xl ${
              isAligned
                ? 'bg-gradient-to-b from-emerald-600 to-emerald-950 border-emerald-300 ring-4 ring-emerald-400/40'
                : 'bg-gradient-to-b from-amber-500 via-amber-700 to-amber-950 border-amber-300 ring-2 ring-amber-500/30'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full shadow-inner transition-colors ${
                isAligned
                  ? 'bg-emerald-300 shadow-emerald-200'
                  : 'bg-gradient-to-b from-amber-200 to-amber-400'
              }`}
            />
          </div>
        </div>

        {/* Manual Drag Hint for Desktop */}
        <span className="text-[10px] text-[#6E8B7E] mt-3 block text-center font-cairo">
          {mode === 'manual'
            ? '💡 يمكنك سحب وتدوير البوصلة بالماوس أو اللمس لمحاكاة حركتك'
            : '💡 حرّك الهاتف في يدك حتى يتطابق السهم مع الكعبة المشرفة'}
        </span>
      </div>

      {/* Dynamic Directional Guidance Banner */}
      <div
        className={`p-4 rounded-2xl border text-center transition-all duration-300 space-y-1.5 shadow-lg ${
          isAligned
            ? 'bg-gradient-to-r from-emerald-950 via-[#102C20] to-emerald-950 border-emerald-400 text-emerald-200 shadow-emerald-500/20'
            : 'bg-[#12221D] border-[#214336] text-[#C2D8CD]'
        }`}
      >
        {isAligned ? (
          <div className="space-y-1 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center gap-2 text-emerald-300 font-bold text-base sm:text-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span>أنت في اتجاه القبلة تماماً نحو الكعبة المشرفة 🕋</span>
            </div>
            <p className="text-xs text-[#9ED0B9]">
              تقبّل الله صلاتكم وطاعتكم · الزاوية الحالية متطابقة مع مكة المكرمة ({qiblaBearing}°).
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 text-amber-300 font-bold text-sm sm:text-base">
              <Navigation className="w-4 h-4 text-amber-400 -rotate-45" />
              {diff > 0 ? (
                <span>أدر الهاتف بمقدار {Math.round(diffAbs)}° جهة اليمين ↻</span>
              ) : (
                <span>أدر الهاتف بمقدار {Math.round(diffAbs)}° جهة اليسار ↺</span>
              )}
            </div>
            <p className="text-xs text-[#8EA89D]">
              وجهة هاتفك الحالية: <strong className="text-amber-200 font-mono">{heading}°</strong> · زاوية القبلة المطلوبة: <strong className="text-amber-300 font-mono">{qiblaBearing}°</strong> ({cardinalDirName})
            </p>
          </div>
        )}
      </div>

      {/* Precision Degree Slider for Manual Alignment (Desktop & Precise adjustment) */}
      <div className="p-3.5 bg-[#12221D] border border-[#214336] rounded-2xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
            <Sliders className="w-3.5 h-3.5" />
            <span>ضبط زاوية التوجيه يدوياً (درجات البوصلة):</span>
          </div>
          <span className="font-mono text-sm font-bold text-amber-200 bg-[#162C23] px-2.5 py-0.5 rounded-lg border border-[#244A3C]">
            {heading}°
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="359"
          value={heading}
          onChange={(e) => {
            setHeading(Number(e.target.value));
            setMode('manual');
          }}
          className="w-full accent-amber-400 cursor-pointer h-2 bg-[#172D24] rounded-lg"
        />

        <div className="flex items-center justify-between text-[10px] text-[#6D8A7D] font-mono">
          <span>0° (شمال)</span>
          <span>90° (شرق)</span>
          <span>180° (جنوب)</span>
          <span>270° (غرب)</span>
          <span>359°</span>
        </div>
      </div>

      {/* Telemetry Metrics Grid (زاوية القبلة، المسافة إلى مكة، الاتجاه الجغرافي) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Qibla Angle */}
        <div className="p-4 bg-[#12221D] border border-[#214336] rounded-2xl text-right space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#8FA89E]">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>زاوية القبلة لموقعك</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-mono font-bold text-amber-300">
              {qiblaBearing}°
            </span>
            <span className="text-xs text-[#8FA89E]">درجة مئوية</span>
          </div>
          <span className="text-[11px] text-[#719082] block">
            {cardinalDirName}
          </span>
        </div>

        {/* Distance to Kaaba */}
        <div className="p-4 bg-[#12221D] border border-[#214336] rounded-2xl text-right space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#8FA89E]">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>المسافة إلى الكعبة المشرفة</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-mono font-bold text-emerald-300">
              {distanceToKaaba.toLocaleString('ar-EG')}
            </span>
            <span className="text-xs text-[#8FA89E]">كم</span>
          </div>
          <span className="text-[11px] text-[#719082] block">
            خط مستقيم إلى الحرم المكي
          </span>
        </div>

        {/* Coordinates */}
        <div className="p-4 bg-[#12221D] border border-[#214336] rounded-2xl text-right space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#8FA89E]">
            <Crosshair className="w-3.5 h-3.5 text-amber-400" />
            <span>إحداثيات الموقع</span>
          </div>
          <div className="text-xs font-mono text-[#D2E4DC] pt-1">
            <div>عرض: {activeLat.toFixed(3)}° N</div>
            <div>طول: {activeLng.toFixed(3)}° E</div>
          </div>
          <span className="text-[11px] text-[#719082] block">
            {realGpsLocation ? 'نظام GPS مباشر' : 'إحداثيات المدينة'}
          </span>
        </div>
      </div>

      {/* Sensor Calibration & Troubleshooting Guide */}
      <div className="p-4 bg-[#0F1E19] border border-[#1C3A2F] rounded-2xl text-xs space-y-2 text-[#8FA89E] leading-relaxed">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>إرشادات الاستخدام ودقة البوصلة:</span>
          </div>
          {sensorStatus === 'idle' && (
            <button
              onClick={requestSensorAccess}
              className="text-[11px] text-amber-400 hover:text-amber-200 underline cursor-pointer"
            >
              تفعيل الحساس الآن
            </button>
          )}
        </div>
        <ul className="list-disc list-inside space-y-1 text-[11px] text-[#7E9C8F]">
          <li>
            <strong>على الهاتف المحمول:</strong> ضع الهاتف على سطح مستوٍ أو احمله أفقياً في يدك بعيداً عن الأجهزة الكهربائية أو المغناطيس لضمان دقة القراءة.
          </li>
          <li>
            <strong>إذا لم تتحرك البوصلة:</strong> انقر زر «حساس الهاتف» أو حرّك الهاتف في الهواء على شكل رقم ثمانية (8) لمعايرة مستشعر البوصلة.
          </li>
          <li>
            <strong>على أجهزة الكمبيوتر واللابتوب:</strong> استخدم ميزة «التدوير اليدوي / الماوس» أو شريط الدرجات بالأعلى لضبط الاتجاه يدوياً حسب نافذتك أو شروق الشمس.
          </li>
        </ul>
      </div>
    </div>
  );
};
