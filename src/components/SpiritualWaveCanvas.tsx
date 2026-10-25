import React, { useEffect, useRef } from 'react';

interface SpiritualWaveCanvasProps {
  enabled?: boolean;
  intensity?: 'subtle' | 'normal' | 'vivid';
  theme?: 'parchment' | 'emerald' | 'dark';
}

interface WaveConfig {
  baseY: number; // percentage of height 0..1
  amplitude: number; // amplitude in pixels
  frequency: number; // cycles across the screen
  speed: number; // speed of phase progression
  colorStops: { stop: number; color: string }[];
  lineWidth: number;
  phase: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  alpha: number;
  baseAlpha: number;
  pulseSpeed: number;
  pulsePhase: number;
}

export const SpiritualWaveCanvas: React.FC<SpiritualWaveCanvasProps> = ({
  enabled = true,
  intensity = 'normal',
  theme = 'emerald',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Multiplier based on intensity setting
    const alphaMultiplier = intensity === 'subtle' ? 0.6 : intensity === 'vivid' ? 1.4 : 1.0;

    // Interactive mouse coordinates with smooth lerp tracking
    let targetMouseX = -1000;
    let targetMouseY = -1000;
    let currentMouseX = -1000;
    let currentMouseY = -1000;
    let mouseVelocity = 0;
    let lastMoveTime = 0;

    // Resize handler
    const handleResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.75); // Cap for efficiency
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // Interactive pointer handlers (smooth deflection of luminous waves)
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      const dx = clientX - targetMouseX;
      const dy = clientY - targetMouseY;
      const now = performance.now();
      const dt = Math.max(now - lastMoveTime, 16);
      lastMoveTime = now;

      // Calculate smooth velocity
      const dist = Math.sqrt(dx * dx + dy * dy);
      mouseVelocity = Math.min(dist / dt, 3.5);

      targetMouseX = clientX;
      targetMouseY = clientY;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    // Floating spiritual light motes (أضواء روحانية خافتة وهادئة)
    const particleCount = width < 768 ? 18 : 34;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const baseAlpha = (Math.random() * 0.18 + 0.08) * alphaMultiplier;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.8,
        speedX: (Math.random() - 0.5) * 0.25,
        speedY: (Math.random() - 0.5) * 0.2 - 0.08, // Gently float upwards
        alpha: baseAlpha,
        baseAlpha,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // Configured waves with tranquil color harmony
    const waves: WaveConfig[] = [
      // Wave 1: Gentle Upper Emerald & Teal Breath
      {
        baseY: 0.28,
        amplitude: 38,
        frequency: 0.0018,
        speed: 0.0055,
        lineWidth: 2,
        phase: 0,
        colorStops: [
          { stop: 0, color: `rgba(16, 185, 129, ${0.08 * alphaMultiplier})` },
          { stop: 0.5, color: `rgba(20, 184, 166, ${0.11 * alphaMultiplier})` },
          { stop: 1, color: `rgba(6, 78, 59, ${0.02 * alphaMultiplier})` },
        ],
      },
      // Wave 2: Middle Golden-Amber Spiritual Glow
      {
        baseY: 0.52,
        amplitude: 45,
        frequency: 0.0014,
        speed: 0.0042,
        lineWidth: 2.2,
        phase: 2.4,
        colorStops: [
          { stop: 0, color: `rgba(245, 158, 11, ${0.07 * alphaMultiplier})` },
          { stop: 0.45, color: `rgba(217, 119, 6, ${0.09 * alphaMultiplier})` },
          { stop: 0.8, color: `rgba(16, 185, 129, ${0.06 * alphaMultiplier})` },
          { stop: 1, color: `rgba(245, 158, 11, ${0.02 * alphaMultiplier})` },
        ],
      },
      // Wave 3: Lower Deep Emerald Ribbon
      {
        baseY: 0.74,
        amplitude: 42,
        frequency: 0.0016,
        speed: 0.0048,
        lineWidth: 1.8,
        phase: 4.1,
        colorStops: [
          { stop: 0, color: `rgba(4, 120, 87, ${0.06 * alphaMultiplier})` },
          { stop: 0.5, color: `rgba(13, 148, 136, ${0.08 * alphaMultiplier})` },
          { stop: 1, color: `rgba(16, 185, 129, ${0.03 * alphaMultiplier})` },
        ],
      },
      // Wave 4: Ultra-subtle Serene Horizon Wave
      {
        baseY: 0.88,
        amplitude: 28,
        frequency: 0.0022,
        speed: 0.0062,
        lineWidth: 1.5,
        phase: 1.2,
        colorStops: [
          { stop: 0, color: `rgba(5, 150, 105, ${0.04 * alphaMultiplier})` },
          { stop: 0.5, color: `rgba(245, 158, 11, ${0.05 * alphaMultiplier})` },
          { stop: 1, color: `rgba(15, 23, 42, ${0.01 * alphaMultiplier})` },
        ],
      },
    ];

    let time = 0;
    let isTabVisible = !document.hidden;

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Main render loop
    const render = () => {
      if (!isTabVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      time += 0.8;

      // Smooth lerp mouse coordinates
      if (targetMouseX > -500) {
        currentMouseX += (targetMouseX - currentMouseX) * 0.06;
        currentMouseY += (targetMouseY - currentMouseY) * 0.06;
      }

      // Slowly decay mouse velocity
      mouseVelocity *= 0.94;

      // Clear with clean transparent pass
      ctx.clearRect(0, 0, width, height);

      // Render Floating Light Particles (ذرات النور الهادئة)
      ctx.save();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulsePhase += p.pulseSpeed;

        // Wrap around boundaries
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Breathing alpha pulse
        const dynamicAlpha = p.baseAlpha * (0.7 + 0.3 * Math.sin(p.pulsePhase));

        // Interaction with mouse: gently drift away when cursor is near
        if (currentMouseX > 0) {
          const dx = p.x - currentMouseX;
          const dy = p.y - currentMouseY;
          const distSq = dx * dx + dy * dy;
          if (distSq < 16000 && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / 126) * 0.8;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }

        // Draw soft glow particle
        const pGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
        pGrad.addColorStop(0, `rgba(253, 230, 138, ${dynamicAlpha})`);
        pGrad.addColorStop(0.5, `rgba(52, 211, 153, ${dynamicAlpha * 0.6})`);
        pGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');

        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Render Luminous Waves
      for (let wIndex = 0; wIndex < waves.length; wIndex++) {
        const wave = waves[wIndex];
        const currentPhase = wave.phase + time * wave.speed;
        const baseY = height * wave.baseY;

        ctx.save();

        // Use soft screen composite mode for harmonious luminosity without harsh glare
        ctx.globalCompositeOperation = 'screen';

        // Horizontal gradient across the screen for the wave fill & stroke
        const grad = ctx.createLinearGradient(0, baseY - wave.amplitude * 2, width, baseY + wave.amplitude * 2);
        wave.colorStops.forEach((stop) => {
          grad.addColorStop(stop.stop, stop.color);
        });

        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, baseY);

        // Step resolution: 14px on desktop, 18px on mobile for silky smooth performance
        const step = width < 768 ? 18 : 12;

        for (let x = 0; x <= width + step; x += step) {
          // Base sinusoidal harmonic component
          const sin1 = Math.sin(x * wave.frequency + currentPhase);
          const cos2 = Math.cos(x * wave.frequency * 0.55 - currentPhase * 0.7) * 0.35;
          let y = baseY + (sin1 + cos2) * wave.amplitude;

          // Interactive Pointer Deflection:
          // Creates a gentle, liquid-like elevation or depression around the cursor position
          if (currentMouseX > 0) {
            const dx = x - currentMouseX;
            const dy = y - currentMouseY;
            const distSq = dx * dx + dy * dy;
            const maxRadiusSq = 240 * 240;

            if (distSq < maxRadiusSq) {
              const influence = Math.exp(-distSq / (2 * 80 * 80)); // Smooth Gaussian decay
              // Upward fluid crest with slight reactive ripple
              const reactiveLift = 32 * influence * (1 + mouseVelocity * 0.5);
              y -= reactiveLift;
            }
          }

          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        // Fill with soft translucent mist
        ctx.fillStyle = grad;
        ctx.fill();

        // Draw luminous top crest line
        ctx.beginPath();
        for (let x = 0; x <= width + step; x += step) {
          const sin1 = Math.sin(x * wave.frequency + currentPhase);
          const cos2 = Math.cos(x * wave.frequency * 0.55 - currentPhase * 0.7) * 0.35;
          let y = baseY + (sin1 + cos2) * wave.amplitude;

          if (currentMouseX > 0) {
            const dx = x - currentMouseX;
            const dy = y - currentMouseY;
            const distSq = dx * dx + dy * dy;
            const maxRadiusSq = 240 * 240;

            if (distSq < maxRadiusSq) {
              const influence = Math.exp(-distSq / (2 * 80 * 80));
              const reactiveLift = 32 * influence * (1 + mouseVelocity * 0.5);
              y -= reactiveLift;
            }
          }

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Crest line highlight
        ctx.strokeStyle = grad;
        ctx.lineWidth = wave.lineWidth;
        ctx.shadowColor = 'rgba(245, 158, 11, 0.25)';
        ctx.shadowBlur = 12;
        ctx.stroke();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, intensity, theme]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full select-none"
      style={{ opacity: 0.95 }}
      aria-hidden="true"
    />
  );
};
