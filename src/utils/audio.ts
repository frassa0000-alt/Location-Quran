// Lightweight Web Audio API synthesizer for tactile Tasbeeh bead clicks and Quran audio helpers

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export type HapticIntensity = 'light' | 'medium' | 'strong' | 'off';

/**
 * Acoustic Haptic Sub-Pulse: A dedicated low-frequency impulse (55Hz)
 * that physically vibrates device speakers/earpieces, creating a realistic tactile sensation
 * even on platforms without physical vibration motors (desktop, iOS Safari, etc.).
 */
export function playHapticSubPulse(intensity: HapticIntensity = 'medium') {
  if (intensity === 'off') return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const gainLevels = {
      light: 0.18,
      medium: 0.32,
      strong: 0.5,
      off: 0,
    };

    // Sub-bass thump (58Hz down to 36Hz)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(58, t);
    osc.frequency.exponentialRampToValueAtTime(36, t + 0.035);

    gain.gain.setValueAtTime(gainLevels[intensity] || 0.32, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.036);
  } catch {
    // Graceful fallback
  }
}

export function playTasbeehClickSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Warm bead body resonance
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1100, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.05);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);

    // Realistic bead contact impact transient
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'sine';
    clickOsc.frequency.setValueAtTime(2400, t);
    clickOsc.frequency.exponentialRampToValueAtTime(400, t + 0.018);

    clickGain.gain.setValueAtTime(0.18, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.018);

    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(t);
    clickOsc.stop(t + 0.018);
  } catch {
    // Graceful fallback
  }
}

export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.15, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.36);
    });
  } catch {
    // Graceful fallback
  }
}

export function playPageTurnSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Soft paper rustle / whoosh sound
    const bufferSize = ctx.sampleRate * 0.12; // 120ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const decay = 1 - i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * decay * 0.15;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.12);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  } catch {
    // Graceful fallback
  }
}

/**
 * Standard hardware vibration pattern trigger
 */
export function triggerVibration(pattern: number | number[] = 25) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore if vibration not permitted
    }
  }
}

/**
 * Advanced Multi-Modal Haptic Feedback System:
 * Combines hardware vibration patterns with acoustic sub-bass haptic simulation
 * to provide authentic tactile feedback across all devices and browsers.
 */
export function triggerTasbeehHaptic(
  type: 'tap' | 'separator' | 'milestone' = 'tap',
  intensity: HapticIntensity = 'medium'
) {
  if (intensity === 'off') return;

  // 1. Hardware Vibration Motor
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      let pattern: number | number[] = 22;

      if (type === 'tap') {
        pattern = intensity === 'light' ? 14 : intensity === 'strong' ? 35 : 22;
      } else if (type === 'separator') {
        pattern = intensity === 'light' ? [14, 25, 14] : intensity === 'strong' ? [30, 35, 30] : [20, 30, 20];
      } else if (type === 'milestone') {
        pattern = intensity === 'light' ? [30, 40, 25, 40, 50] : [45, 50, 40, 50, 75];
      }

      navigator.vibrate(pattern);
    } catch {
      // ignore
    }
  }

  // 2. Acoustic Sub-Pulse (Tactile Thump for speakers/headphones)
  playHapticSubPulse(intensity);
}
