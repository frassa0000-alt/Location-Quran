import React, { useState, useEffect, useCallback } from 'react';
import {
  Cloud,
  CloudSun,
  Sun,
  CloudRain,
  CloudLightning,
  CloudSnow,
  CloudFog,
  Wind,
  Droplets,
  Thermometer,
  RotateCw,
  Info,
  Clock,
  Compass,
} from 'lucide-react';
import { CityCoordinates } from '../utils/prayerCalculations';

interface PrayerWeatherCardProps {
  city: CityCoordinates;
  nextPrayer?: {
    name: string;
    time12: string;
    secondsRemaining: number;
  } | null;
}

interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
  precipitation: number;
  updatedAt: number;
}

// Translate WMO weather code to Arabic name and icon
function getWeatherDetails(code: number, isDay: boolean): {
  title: string;
  description: string;
  icon: React.ReactNode;
} {
  if (code === 0) {
    return {
      title: isDay ? 'سماء صافية ومشمسة' : 'ليلة صافية وقمرية',
      description: 'أجواء نقية ووضوح ممتاز للرؤية',
      icon: isDay ? (
        <Sun className="w-8 h-8 text-amber-400 animate-[spin_30s_linear_infinite]" />
      ) : (
        <Sun className="w-8 h-8 text-amber-200" />
      ),
    };
  }
  if (code >= 1 && code <= 3) {
    return {
      title: code === 1 ? 'صحو جزئي' : code === 2 ? 'غائم جزئياً' : 'غائم غالباً',
      description: 'غيوم متفرقة وطقس مريح للمشي إلى المسجد',
      icon: <CloudSun className="w-8 h-8 text-amber-300" />,
    };
  }
  if (code === 45 || code === 48) {
    return {
      title: 'ضباب وأجواء رطبة',
      description: 'انخفاض في مدى الرؤية، توخ الحذر عند الذهاب لصلاة الفجر',
      icon: <CloudFog className="w-8 h-8 text-teal-300" />,
    };
  }
  if (code >= 51 && code <= 57) {
    return {
      title: 'رذاذ خفيف',
      description: 'قطرات مطر خفيفة ونسائم منعشة',
      icon: <CloudRain className="w-8 h-8 text-cyan-400" />,
    };
  }
  if (code >= 61 && code <= 67) {
    return {
      title: 'أمطار متفرقة',
      description: 'أجواء ماطرة مباركة، تفتح فيها أبواب الدعاء المستجاب',
      icon: <CloudRain className="w-8 h-8 text-sky-400" />,
    };
  }
  if (code >= 71 && code <= 77) {
    return {
      title: 'تساقط ثلوج / جليد',
      description: 'طقس شديد البرودة، يُسن إسباغ الوضوء على المكاره',
      icon: <CloudSnow className="w-8 h-8 text-blue-200" />,
    };
  }
  if (code >= 80 && code <= 82) {
    return {
      title: 'زخات مطر غزيرة',
      description: 'أمطار غزيرة يُشرع معها الدعاء: «اللهم صيّباً نافعاً»',
      icon: <CloudRain className="w-8 h-8 text-blue-400" />,
    };
  }
  if (code >= 95 && code <= 99) {
    return {
      title: 'عواصف رعدية وأمطار',
      description: 'رعد وبرق، يُسن الاستعاذة والدعاء: «سبحان الذي يسبح الرعد بحمده»',
      icon: <CloudLightning className="w-8 h-8 text-amber-400" />,
    };
  }
  return {
    title: 'طقس معتدل',
    description: 'أجواء ملائمة لأداء الصلوات',
    icon: <Cloud className="w-8 h-8 text-emerald-300" />,
  };
}

// Islamic weather guidance based on real conditions
function getIslamicWeatherAdvice(temp: number, code: number, wind: number): {
  badge: string;
  tip: string;
  hadith?: string;
} {
  // Heavy rain or thunderstorms
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) {
    return {
      badge: 'رخصة الجمع وصلاة الرحال',
      tip: 'عند اشتداد المطر والمشقة، يُشرع جمع الصلاتين (الظهر مع العصر، أو المغرب مع العشاء)، وصلاة المعذور في رحله.',
      hadith: 'قال ﷺ: «صلوا في رحالكم» متفق عليه عند المطر الشديد.',
    };
  }

  // Extreme cold
  if (temp <= 12) {
    return {
      badge: 'أجر إسباغ الوضوء على المكاره',
      tip: 'الوضوء بالماء في البرد الشديد له فضل عظيم ويرفع الدرجات ويكفر السيئات.',
      hadith: 'قال ﷺ: «ألا أدلكم على ما يمحو الله به الخطايا ويرفع به الدرجات؟ إسباغ الوضوء على المكاره...» (صحيح مسلم).',
    };
  }

  // Extreme heat
  if (temp >= 36) {
    return {
      badge: 'سنة الإبراد بصلاة الظهر',
      tip: 'في شدة القيظ والحرارة العالية، يستحب تأخير صلاة الظهر قليلاً حتى يخف وهج الشمس وتبرد الأجواء.',
      hadith: 'قال رسول الله ﷺ: «إذا اشتد الحر فأبردوا بالصلاة؛ فإن شدة الحر من فيح جهنم» (رواه البخاري).',
    };
  }

  // High winds
  if (wind >= 32) {
    return {
      badge: 'دعاء هبوب الريح الشديدة',
      tip: 'يُسن لمن هاجت عليه الريح ألا يسبها وأن يدعو بخيرها ويسأل الله السلامة.',
      hadith: 'كان ﷺ إذا عصفت الريح قال: «اللهم إني أسألك خيرها وخير ما فيها وخير ما أرسلت به...» (صحيح مسلم).',
    };
  }

  // Mild pleasant weather
  return {
    badge: 'فضل المشي إلى المساجد',
    tip: 'أجواء لطيفة تشجع على التبكير للمسجد والمشي على الأقدام لكسب الخطوات.',
    hadith: '«من غدا إلى المسجد أو راح أعد الله له في الجنة نزلاً كلما غدا أو راح» (متفق عليه).',
  };
}

// Format countdown helper
function formatSeconds(sec: number): string {
  if (sec <= 0) return 'الآن';
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  if (hours > 0) {
    return `${hours} س و ${minutes} د`;
  }
  return `${minutes} دقيقة`;
}

export const PrayerWeatherCard: React.FC<PrayerWeatherCardProps> = ({
  city,
  nextPrayer,
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchWeather = useCallback(async (force = false) => {
    const cacheKey = `weather_${city.lat.toFixed(2)}_${city.lng.toFixed(2)}`;
    if (!force) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as WeatherData;
          // 15-minute cache validity
          if (Date.now() - parsed.updatedAt < 15 * 60 * 1000) {
            setWeather(parsed);
            setLoading(false);
            return;
          }
        }
      } catch {
        // ignore cache read errors
      }
    }

    try {
      if (force) setIsRefreshing(true);
      else setLoading(true);
      setError(null);

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('فشل جلب بيانات الطقس');

      const data = await res.json();
      const current = data.current;

      const weatherResult: WeatherData = {
        temperature: Math.round(current.temperature_2m),
        apparentTemperature: Math.round(current.apparent_temperature),
        humidity: Math.round(current.relative_humidity_2m),
        windSpeed: Math.round(current.wind_speed_10m),
        weatherCode: current.weather_code,
        isDay: current.is_day === 1,
        precipitation: current.precipitation || 0,
        updatedAt: Date.now(),
      };

      setWeather(weatherResult);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(weatherResult));
      } catch {
        // ignore cache write errors
      }
    } catch (err: any) {
      console.warn('Weather fetch error:', err);
      setError('تعذر تحديث الطقس المباشر للمدينة حالياً');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [city.lat, city.lng]);

  useEffect(() => {
    fetchWeather(false);
  }, [fetchWeather]);

  const weatherDetails = weather
    ? getWeatherDetails(weather.weatherCode, weather.isDay)
    : null;

  const islamicAdvice = weather
    ? getIslamicWeatherAdvice(weather.temperature, weather.weatherCode, weather.windSpeed)
    : null;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#12221D] via-[#152B23] to-[#12221D] border border-[#214337] p-4 sm:p-5 shadow-xl text-[#EAEFEA] transition-all relative overflow-hidden">
      {/* Background Subtle Accent Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header: City & Live Weather Tag */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3.5 border-b border-[#1D3A2F]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-amiri font-bold text-base sm:text-lg text-amber-200 leading-tight">
                حالة الطقس وأجواء الصلاة في {city.name}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#1A382E] text-emerald-300 border border-[#274D3F]">
                مباشر
              </span>
            </div>
            <p className="text-[11px] text-[#8EA89D] mt-0.5">
              متابعة درجات الحرارة وظروف الطقس لربطها بمواعيد الصلاة وسنن الخروج إلى المساجد
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => fetchWeather(true)}
            disabled={isRefreshing || loading}
            title="تحديث حالة الطقس"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#162D24] hover:bg-[#1C3A2E] text-slate-300 hover:text-amber-300 border border-[#274A3C] text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span className="text-[11px]">تحديث</span>
          </button>
        </div>
      </div>

      {/* Body: Loading / Error / Weather Metrics */}
      {loading && !weather ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
          <RotateCw className="w-6 h-6 animate-spin text-amber-400" />
          <span className="text-xs">جاري جلب حالة الطقس لمدينة {city.name}...</span>
        </div>
      ) : error && !weather ? (
        <div className="py-6 text-center text-xs text-amber-300/80">
          <p>{error}</p>
          <button
            onClick={() => fetchWeather(true)}
            className="mt-2 text-xs text-amber-400 underline cursor-pointer"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : weather && weatherDetails ? (
        <div className="pt-4 space-y-4">
          {/* Main Weather Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
            {/* Left/Main Col: Temperature & Condition Icon */}
            <div className="sm:col-span-6 bg-[#0E1B17]/90 p-3.5 rounded-xl border border-[#1E3B30] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  {weatherDetails.icon}
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-bold font-mono text-amber-300">
                      {weather.temperature}°
                    </span>
                    <span className="text-xs text-[#8EA89D]">مئوية</span>
                  </div>
                  <h4 className="font-amiri font-bold text-sm text-[#EAEFEA] mt-0.5">
                    {weatherDetails.title}
                  </h4>
                  <p className="text-[11px] text-[#7E9C91]">
                    المحسوسة: {weather.apparentTemperature}°C
                  </p>
                </div>
              </div>

              {/* Extra Weather Indicators: Humidity & Wind */}
              <div className="border-r border-[#1C362E] pr-3 space-y-2 text-[11px] text-[#9EB5AC]">
                <div className="flex items-center gap-1.5" title="نسبة الرطوبة">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>الرطوبة: {weather.humidity}%</span>
                </div>
                <div className="flex items-center gap-1.5" title="سرعة الرياح">
                  <Wind className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>الرياح: {weather.windSpeed} كم/س</span>
                </div>
              </div>
            </div>

            {/* Right Col: Next Prayer Weather Context & Alert */}
            <div className="sm:col-span-6 bg-[#0E1B17]/90 p-3.5 rounded-xl border border-[#1E3B30] flex flex-col justify-between h-full">
              <div className="flex items-center justify-between pb-2 border-b border-[#1A3329]">
                <div className="flex items-center gap-1.5 text-amber-300 text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>الصلاة القادمة والطقس</span>
                </div>
                {nextPrayer && (
                  <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    متبقي {formatSeconds(nextPrayer.secondsRemaining)}
                  </span>
                )}
              </div>

              <div className="pt-2 text-xs leading-relaxed">
                {nextPrayer ? (
                  <p className="text-[#CFDBD5]">
                    تتهيأ الأجواء لـ{' '}
                    <span className="font-amiri font-bold text-amber-300 text-sm">
                      {nextPrayer.name}
                    </span>{' '}
                    في تمام الساعة{' '}
                    <span className="font-mono font-bold text-amber-200">
                      {nextPrayer.time12}
                    </span>
                    ، بدرجة حرارة متوقعة حوالى{' '}
                    <span className="font-mono text-amber-300 font-bold">{weather.temperature}°C</span>{' '}
                    وطقس {weatherDetails.title.toLowerCase()}.
                  </p>
                ) : (
                  <p className="text-[#8EA89D]">
                    يتم احتساب موعد الأذان القادم بحسب إحداثيات {city.name}.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Islamic Prayer & Weather Tip / Sunnah Guidance Banner */}
          {islamicAdvice && (
            <div className="p-3 rounded-xl bg-[#142922] border border-[#234639] flex items-start gap-2.5 text-xs">
              <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-amiri font-bold text-amber-200 text-xs sm:text-sm">
                    {islamicAdvice.badge}
                  </span>
                </div>
                <p className="text-[#A5BEB4] text-[11px] sm:text-xs leading-relaxed">
                  {islamicAdvice.tip}
                </p>
                {islamicAdvice.hadith && (
                  <p className="text-amber-300/90 text-[10px] sm:text-[11px] font-amiri italic pt-0.5">
                    {islamicAdvice.hadith}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
