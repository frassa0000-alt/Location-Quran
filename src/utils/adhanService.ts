// Service to manage Adhan playback, browser audio notifications, and auto-adhan alerts

export interface AdhanVoice {
  id: string;
  name: string;
  location: string;
  url: string;
}

export const ADHAN_VOICES: AdhanVoice[] = [
  {
    id: 'makkah-mulla',
    name: 'الشيخ علي ملا',
    location: 'أذان المسجد الحرام بمكة المكرمة',
    url: 'https://cdn.mp3quran.net/audio/adhan/ali-mulla.mp3',
  },
];

export interface AdhanNotificationSettings {
  autoPlayAdhan: boolean;
  notifyBeforeMinutes: number; // e.g. 0 (at time) or 5, 10, 15 min before
  voiceId: string;
  volume: number; // 0 to 1
  enabledPrayers: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  };
}

export const DEFAULT_ADHAN_SETTINGS: AdhanNotificationSettings = {
  autoPlayAdhan: true,
  notifyBeforeMinutes: 0,
  voiceId: 'makkah-mulla',
  volume: 0.9,
  enabledPrayers: {
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  },
};

const STORAGE_KEY = 'quran_adhan_settings_v1';

export function loadAdhanSettings(): AdhanNotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_ADHAN_SETTINGS,
        ...parsed,
        enabledPrayers: {
          ...DEFAULT_ADHAN_SETTINGS.enabledPrayers,
          ...(parsed.enabledPrayers || {}),
        },
      };
    }
  } catch {
    // fallback
  }
  return DEFAULT_ADHAN_SETTINGS;
}

export function saveAdhanSettings(settings: AdhanNotificationSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

// Global audio player instance for Adhan
let globalAdhanAudio: HTMLAudioElement | null = null;
let currentPlayingVoiceId: string | null = null;
const listeners = new Set<(isPlaying: boolean, voiceId: string | null) => void>();

function notifyListeners(isPlaying: boolean, voiceId: string | null) {
  listeners.forEach((fn) => {
    try {
      fn(isPlaying, voiceId);
    } catch {
      // ignore
    }
  });
}

export function subscribeAdhanState(callback: (isPlaying: boolean, voiceId: string | null) => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function isAdhanPlaying(): boolean {
  return !!globalAdhanAudio && !globalAdhanAudio.paused;
}

export function getCurrentPlayingVoiceId(): string | null {
  return isAdhanPlaying() ? currentPlayingVoiceId : null;
}

export function playAdhan(voiceId: string = 'makkah-mulla', volume: number = 0.9): Promise<void> {
  const voice = ADHAN_VOICES.find((v) => v.id === voiceId) || ADHAN_VOICES[0];

  stopAdhan();

  const audio = new Audio(voice.url);
  audio.volume = Math.max(0, Math.min(1, volume));
  globalAdhanAudio = audio;
  currentPlayingVoiceId = voice.id;

  audio.onplay = () => {
    notifyListeners(true, voice.id);
  };

  audio.onended = () => {
    currentPlayingVoiceId = null;
    notifyListeners(false, null);
  };

  audio.onerror = () => {
    currentPlayingVoiceId = null;
    notifyListeners(false, null);
  };

  return audio.play().catch((err) => {
    currentPlayingVoiceId = null;
    notifyListeners(false, null);
    throw err;
  });
}

export function stopAdhan() {
  if (globalAdhanAudio) {
    try {
      globalAdhanAudio.pause();
      globalAdhanAudio.currentTime = 0;
    } catch {
      // ignore
    }
    globalAdhanAudio = null;
  }
  currentPlayingVoiceId = null;
  notifyListeners(false, null);
}

export function toggleAdhan(voiceId: string = 'makkah-mulla', volume: number = 0.9) {
  if (isAdhanPlaying()) {
    stopAdhan();
  } else {
    playAdhan(voiceId, volume);
  }
}
