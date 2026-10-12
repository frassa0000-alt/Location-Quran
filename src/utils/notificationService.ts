// Helper service to manage Web Notifications & Service Worker for Prayer Times and Adhan

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

export async function registerServiceWorker(): Promise<void> {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
    } catch {
      // Ignore if service workers are restricted in iframe or certain dev environments
    }
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  // Pre-register service worker if supported
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js').catch(() => {});
    } catch {
      // ignore
    }
  }

  try {
    let perm: NotificationPermission = 'default';
    if (typeof Notification.requestPermission === 'function') {
      try {
        perm = await Notification.requestPermission();
      } catch {
        // Fallback for older Safari callback syntax
        perm = await new Promise<NotificationPermission>((resolve) => {
          Notification.requestPermission((p) => resolve(p));
        });
      }
    }
    return perm;
  } catch (err) {
    console.warn('Notification permission error:', err);
    return 'denied';
  }
}

export async function sendPrayerNotification(title: string, body: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  const options: NotificationOptions & Record<string, unknown> = {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'quran-adhan-prayer-time',
    dir: 'rtl',
    lang: 'ar',
  };

  // 1. Try Service Worker first (necessary for Android Chrome and mobile PWAs in production)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, options);
        return true;
      }
    } catch {
      // Fallback below
    }
  }

  // 2. Standard Window Notification fallback
  try {
    new Notification(title, options);
    return true;
  } catch (err) {
    console.warn('Direct notification error:', err);
    return false;
  }
}
