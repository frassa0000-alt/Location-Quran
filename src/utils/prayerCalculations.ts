import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';

export interface CityCoordinates {
  name: string;
  country: string;
  lat: number;
  lng: number;
  timezone: number;
  timezoneString?: string;
}

// قائمة مبسطة ونخبوية لأبرز المدن والأماكن الإسلامية الكبرى (دون تعقيد أو خيارات مفرطة)
export const POPULAR_CITIES: CityCoordinates[] = [
  { name: 'مكة المكرمة', country: 'السعودية', lat: 21.4225, lng: 39.8262, timezone: 3, timezoneString: 'Asia/Riyadh' },
  { name: 'المدينة المنورة', country: 'السعودية', lat: 24.4672, lng: 39.6111, timezone: 3, timezoneString: 'Asia/Riyadh' },
  { name: 'القدس الشريف', country: 'فلسطين', lat: 31.7683, lng: 35.2137, timezone: 2, timezoneString: 'Asia/Hebron' },
  { name: 'القاهرة', country: 'مصر', lat: 30.0444, lng: 31.2357, timezone: 2, timezoneString: 'Africa/Cairo' },
  { name: 'الإسكندرية', country: 'مصر', lat: 31.2001, lng: 29.9187, timezone: 2, timezoneString: 'Africa/Cairo' },
  { name: 'الرياض', country: 'السعودية', lat: 24.7136, lng: 46.6753, timezone: 3, timezoneString: 'Asia/Riyadh' },
  { name: 'دبي', country: 'الإمارات', lat: 25.2048, lng: 55.2708, timezone: 4, timezoneString: 'Asia/Dubai' },
  { name: 'عمان', country: 'الأردن', lat: 31.9454, lng: 35.9284, timezone: 3, timezoneString: 'Asia/Amman' },
  { name: 'بغداد', country: 'العراق', lat: 33.3152, lng: 44.3661, timezone: 3, timezoneString: 'Asia/Baghdad' },
  { name: 'الدوحة', country: 'قطر', lat: 25.2854, lng: 51.5310, timezone: 3, timezoneString: 'Asia/Qatar' },
  { name: 'الكويت', country: 'الكويت', lat: 29.3759, lng: 47.9774, timezone: 3, timezoneString: 'Asia/Kuwait' },
  { name: 'المنامة', country: 'البحرين', lat: 26.2285, lng: 50.5860, timezone: 3, timezoneString: 'Asia/Bahrain' },
  { name: 'مسقط', country: 'سلطنة عمان', lat: 23.5880, lng: 58.3829, timezone: 4, timezoneString: 'Asia/Muscat' },
  { name: 'دمشق', country: 'سوريا', lat: 33.5138, lng: 36.2765, timezone: 3, timezoneString: 'Asia/Damascus' },
  { name: 'بيروت', country: 'لبنان', lat: 33.8938, lng: 35.5018, timezone: 2, timezoneString: 'Asia/Beirut' },
  { name: 'الدار البيضاء', country: 'المغرب', lat: 33.5731, lng: -7.5898, timezone: 1, timezoneString: 'Africa/Casablanca' },
  { name: 'الجزائر', country: 'الجزائر', lat: 36.7538, lng: 3.0588, timezone: 1, timezoneString: 'Africa/Algiers' },
  { name: 'تونس', country: 'تونس', lat: 36.8065, lng: 10.1815, timezone: 1, timezoneString: 'Africa/Tunis' },
  { name: 'طرابلس', country: 'ليبيا', lat: 32.8872, lng: 13.1913, timezone: 2, timezoneString: 'Africa/Tripoli' },
  { name: 'الخرطوم', country: 'السودان', lat: 15.5007, lng: 32.5599, timezone: 2, timezoneString: 'Africa/Khartoum' },
  { name: 'صنعاء', country: 'اليمن', lat: 15.3694, lng: 44.1910, timezone: 3, timezoneString: 'Asia/Aden' },
  { name: 'إسطنبول', country: 'تركيا', lat: 41.0082, lng: 28.9784, timezone: 3, timezoneString: 'Europe/Istanbul' },
];

export interface PrayerTimesResult {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  // 12-hour format with AM/PM (ص/م)
  fajr12: string;
  sunrise12: string;
  dhuhr12: string;
  asr12: string;
  maghrib12: string;
  isha12: string;
  nextPrayer: {
    id: string;
    name: string;
    time: string;
    time12: string;
    timeRemainingFormatted: string;
    secondsRemaining: number;
  };
}

// Convert degrees to radians and vice versa
const d2r = (deg: number) => (deg * Math.PI) / 180.0;
const r2d = (rad: number) => (rad * 180.0) / Math.PI;

/**
 * Format a Date to 12-hour format: "H:MM ص" or "H:MM م"
 */
function formatTime12(d: Date, tz?: string): string {
  try {
    const opts: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      ...(tz ? { timeZone: tz } : {}),
    };
    const parts = new Intl.DateTimeFormat('en-US', opts).formatToParts(d);
    let h = '12', m = '00', dayPeriod = 'AM';
    for (const p of parts) {
      if (p.type === 'hour') h = p.value;
      if (p.type === 'minute') m = p.value;
      if (p.type === 'dayPeriod') dayPeriod = p.value.toUpperCase();
    }
    const periodAr = dayPeriod === 'PM' ? 'م' : 'ص';
    return `${h}:${m} ${periodAr}`;
  } catch {
    const h24 = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    const periodAr = h24 >= 12 ? 'م' : 'ص';
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    return `${h12}:${m} ${periodAr}`;
  }
}

/**
 * Format a Date to 24-hour format: "HH:MM"
 */
function formatTime24(d: Date, tz?: string): string {
  try {
    const opts: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      ...(tz ? { timeZone: tz } : {}),
    };
    return new Intl.DateTimeFormat('en-US', opts).format(d);
  } catch {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
}

/**
 * Get astronomical calculation method based on location/country authority
 */
function getCalculationParameters(lat: number, lng: number, tz?: string) {
  if (tz === 'Africa/Cairo' || (lat >= 21 && lat <= 32 && lng >= 24 && lng <= 36)) {
    // الهيئة المصرية العامة للمساحة (القاهرة ومصر)
    return CalculationMethod.Egyptian();
  }
  if (tz === 'Asia/Riyadh' || (lat >= 16 && lat <= 32 && lng >= 34 && lng <= 55)) {
    // تقويم أم القرى (مكة المكرمة والسعودية)
    return CalculationMethod.UmmAlQura();
  }
  if (tz === 'Asia/Dubai') {
    return CalculationMethod.Dubai();
  }
  if (tz === 'Asia/Kuwait') {
    return CalculationMethod.Kuwait();
  }
  if (tz === 'Asia/Qatar') {
    return CalculationMethod.Qatar();
  }
  if (tz === 'Europe/Istanbul') {
    return CalculationMethod.Turkey();
  }
  if (tz?.startsWith('America/')) {
    return CalculationMethod.NorthAmerica();
  }
  // رابطة العالم الإسلامي (المعيار العالمي المعتمد لباقي الدول)
  return CalculationMethod.MuslimWorldLeague();
}

/**
 * Calculate precise and certified prayer times using standard astronomical algorithms
 */
export function calculatePrayerTimes(
  lat: number,
  lng: number,
  date: Date = new Date(),
  timezoneString?: string
): PrayerTimesResult {
  const coords = new Coordinates(lat, lng);
  const params = getCalculationParameters(lat, lng, timezoneString);
  const pt = new PrayerTimes(coords, date, params);

  const fajrStr = formatTime24(pt.fajr, timezoneString);
  const sunriseStr = formatTime24(pt.sunrise, timezoneString);
  const dhuhrStr = formatTime24(pt.dhuhr, timezoneString);
  const asrStr = formatTime24(pt.asr, timezoneString);
  const maghribStr = formatTime24(pt.maghrib, timezoneString);
  const ishaStr = formatTime24(pt.isha, timezoneString);

  const fajr12 = formatTime12(pt.fajr, timezoneString);
  const sunrise12 = formatTime12(pt.sunrise, timezoneString);
  const dhuhr12 = formatTime12(pt.dhuhr, timezoneString);
  const asr12 = formatTime12(pt.asr, timezoneString);
  const maghrib12 = formatTime12(pt.maghrib, timezoneString);
  const isha12 = formatTime12(pt.isha, timezoneString);

  // Prayer list to find next upcoming prayer
  const prayers = [
    { id: 'fajr', name: 'الفجر', date: pt.fajr, time: fajrStr, time12: fajr12 },
    { id: 'sunrise', name: 'الشروق', date: pt.sunrise, time: sunriseStr, time12: sunrise12 },
    { id: 'dhuhr', name: 'الظهر', date: pt.dhuhr, time: dhuhrStr, time12: dhuhr12 },
    { id: 'asr', name: 'العصر', date: pt.asr, time: asrStr, time12: asr12 },
    { id: 'maghrib', name: 'المغرب', date: pt.maghrib, time: maghribStr, time12: maghrib12 },
    { id: 'isha', name: 'العشاء', date: pt.isha, time: ishaStr, time12: isha12 },
  ];

  const nowMs = date.getTime();
  const nextP = prayers.find((p) => p.date.getTime() > nowMs);

  let nextPrayerData;
  let secondsRemaining = 0;

  if (nextP) {
    secondsRemaining = Math.max(0, Math.floor((nextP.date.getTime() - nowMs) / 1000));
    nextPrayerData = {
      id: nextP.id,
      name: nextP.name,
      time: nextP.time,
      time12: nextP.time12,
    };
  } else {
    // Past Isha: Next prayer is tomorrow's Fajr
    const tomorrow = new Date(nowMs + 24 * 3600 * 1000);
    const tomorrowPt = new PrayerTimes(coords, tomorrow, params);
    secondsRemaining = Math.max(0, Math.floor((tomorrowPt.fajr.getTime() - nowMs) / 1000));
    nextPrayerData = {
      id: 'fajr',
      name: 'الفجر',
      time: formatTime24(tomorrowPt.fajr, timezoneString),
      time12: formatTime12(tomorrowPt.fajr, timezoneString),
    };
  }

  const remH = Math.floor(secondsRemaining / 3600);
  const remM = Math.floor((secondsRemaining % 3600) / 60);
  const remS = secondsRemaining % 60;
  const timeRemainingFormatted = `${remH > 0 ? `${remH} س و ` : ''}${remM} د و ${remS} ث`;

  return {
    fajr: fajrStr,
    sunrise: sunriseStr,
    dhuhr: dhuhrStr,
    asr: asrStr,
    maghrib: maghribStr,
    isha: ishaStr,
    fajr12,
    sunrise12,
    dhuhr12,
    asr12,
    maghrib12,
    isha12,
    nextPrayer: {
      ...nextPrayerData,
      timeRemainingFormatted,
      secondsRemaining,
    },
  };
}

// Calculate Qibla bearing towards the Kaaba (21.4225° N, 39.8262° E)
export function calculateQiblaBearing(lat: number, lng: number): number {
  const kaabaLat = 21.422487;
  const kaabaLng = 39.826206;

  const latK = d2r(kaabaLat);
  const lngK = d2r(kaabaLng);
  const latU = d2r(lat);
  const lngU = d2r(lng);

  const deltaLng = lngK - lngU;
  const y = Math.sin(deltaLng);
  const x = Math.cos(latU) * Math.tan(latK) - Math.sin(latU) * Math.cos(deltaLng);
  const qibla = r2d(Math.atan2(y, x));
  return Math.round((qibla + 360) % 360);
}

// Calculate distance to Kaaba in kilometers (Great Circle Haversine formula)
export function calculateDistanceToKaaba(lat: number, lng: number): number {
  const kaabaLat = 21.422487;
  const kaabaLng = 39.826206;
  const R = 6371; // Earth radius in km

  const dLat = d2r(kaabaLat - lat);
  const dLng = d2r(kaabaLng - lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(d2r(lat)) * Math.cos(d2r(kaabaLat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Get cardinal direction description in Arabic
export function getCompassCardinalName(bearing: number): string {
  const b = (Math.round(bearing) + 360) % 360;
  if (b >= 337.5 || b < 22.5) return 'الشمال';
  if (b >= 22.5 && b < 67.5) return 'الشمال الشرقي';
  if (b >= 67.5 && b < 112.5) return 'الشرق';
  if (b >= 112.5 && b < 157.5) return 'الجنوب الشرقي';
  if (b >= 157.5 && b < 202.5) return 'الجنوب';
  if (b >= 202.5 && b < 247.5) return 'الجنوب الغربي';
  if (b >= 247.5 && b < 292.5) return 'الغرب';
  return 'الشمال الغربي';
}

// Format Hijri Date approximation using Intl API
export function getHijriDate(date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return formatter.format(date);
  } catch {
    return '١٤٤٨ هـ';
  }
}
