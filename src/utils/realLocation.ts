/**
 * Real Location & Reverse Geocoding Utility
 * Ensures 100% authentic GPS coordinates and real place naming without fake/mock data.
 */

export interface RealGpsLocation {
  lat: number;
  lng: number;
  accuracy: number; // in meters
  city: string;
  state?: string;
  country: string;
  neighbourhood?: string;
  fullAddress: string;
  timestamp: number;
  isRealGps: boolean;
}

const STORAGE_KEY = 'quran_user_real_gps_location';

/**
 * Get stored GPS location from localStorage if available
 */
export function getStoredRealLocation(): RealGpsLocation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RealGpsLocation;
    if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse stored location', e);
  }
  return null;
}

/**
 * Save verified GPS location to localStorage
 */
export function saveStoredRealLocation(location: RealGpsLocation): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  } catch (e) {
    console.warn('Failed to save location', e);
  }
}

/**
 * Reverse geocode real coordinates using OpenStreetMap Nominatim
 * Returns authentic city, neighbourhood, governorate, and country in Arabic.
 */
export async function fetchRealAddressFromCoords(lat: number, lng: number): Promise<{
  city: string;
  state?: string;
  country: string;
  neighbourhood?: string;
  fullAddress: string;
}> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`,
      {
        headers: {
          'Accept-Language': 'ar',
          'User-Agent': 'QuranKarimApp/1.0 (Islamic App)',
        },
      }
    );

    if (!res.ok) throw new Error('Geocoding service unavailable');
    const data = await res.json();
    const addr = data.address || {};

    const country = addr.country || 'موقع جغرافي';
    const state = addr.state || addr.region || addr.governorate || '';
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.suburb ||
      addr.county ||
      state ||
      'موقعي الحالي';
    const neighbourhood = addr.neighbourhood || addr.suburb || addr.road || '';

    // Build concise, clean address
    const uniqueParts = [country, state, city, neighbourhood].filter(
      (part, index, self) => Boolean(part) && self.indexOf(part) === index
    );

    const fullAddress =
      uniqueParts.length > 0
        ? uniqueParts.join('، ')
        : data.display_name || `إحداثيات: ${lat.toFixed(4)}°، ${lng.toFixed(4)}°`;

    return { city, state, country, neighbourhood, fullAddress };
  } catch (err) {
    console.warn('Reverse geocoding error:', err);
    return {
      city: 'موقعي الحالي (GPS)',
      country: 'إحداثيات حية',
      fullAddress: `خط العرض: ${lat.toFixed(4)}° | خط الطول: ${lng.toFixed(4)}°`,
    };
  }
}

/**
 * High-precision phone GPS request
 */
export function requestPhoneGpsPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('متصفحك أو جهازك لا يدعم خاصية تحديد الموقع الجغرافي.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
}
