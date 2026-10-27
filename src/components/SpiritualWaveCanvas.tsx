import React, { useEffect, useRef } from 'react';

interface SpiritualWaveCanvasProps {
  enabled?: boolean;
  intensity?: 'subtle' | 'normal' | 'vivid';
  theme?: 'parchment' | 'emerald' | 'dark';
}

export const SpiritualWaveCanvas: React.FC<SpiritualWaveCanvasProps> = ({
  enabled = true,
  intensity = 'normal',
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

    const alphaMultiplier = intensity === 'subtle' ? 0.6 : intensity === 'vivid' ? 1.3 : 1.0;

    let targetMouseX = -1000;
    let targetMouseY = -1000;
    let currentMouseX = -1000;
    let currentMouseY = -1000;
    let isScrolling = false;
    let scrollTimeout: ReturnType<typeof setTimeout>;

    // Strict 1.0 DPR for max performance on mobile & desktop
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // Pause rendering while user is actively scrolling for 60/120 FPS buttery scrolling
    const handleScroll = () => {
      isScrolling = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Pointer move listener
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e && e.touches.length > 0) {
        targetMouseX = e.touches[0].clientX;
        targetMouseY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        targetMouseX = (e as MouseEvent).clientX;
        targetMouseY = (e as MouseEvent).clientY;
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    // 12 lightweight floating particles
    const particles = Array.from({ length: 12 }, () => ({
      x: Math.random() * (width || 800),
      y: Math.random() * (height || 600),
      size: Math.random() * 1.8 + 0.8,
      speedX: (Math.random() - 0.5) * 0.2,
      speedY: -Math.random() * 0.25 - 0.05,
      alpha: (Math.random() * 0.12 + 0.06) * alphaMultiplier,
    }));

    let time = 0;
    let lastRenderTime = 0;
    const FRAME_INTERVAL = 30; // ~33 FPS cap: saves 50% CPU/GPU while looking completely smooth

    const render = (now: number) => {
      animationFrameId = requestAnimationFrame(render);

      // Skip frame if page is hidden, or if user is actively scrolling
      if (document.hidden || isScrolling) return;

      // Throttle to 33 FPS for ultra-lightweight CPU consumption
      if (now - lastRenderTime < FRAME_INTERVAL) return;
      lastRenderTime = now;

      time += 0.015;

      // Smooth pointer lerp
      if (targetMouseX > -500) {
        currentMouseX += (targetMouseX - currentMouseX) * 0.05;
        currentMouseY += (targetMouseY - currentMouseY) * 0.05;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Draw 12 Lightweight floating light flecks (no expensive radial gradients)
      ctx.fillStyle = `rgba(251, 191, 36, ${0.12 * alphaMultiplier})`;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Wave 1: Gentle Upper Emerald & Teal Breath
      const baseY1 = height * 0.35;
      const grad1 = ctx.createLinearGradient(0, baseY1 - 60, width, baseY1 + 60);
      grad1.addColorStop(0, `rgba(16, 185, 129, ${0.05 * alphaMultiplier})`);
      grad1.addColorStop(0.5, `rgba(20, 184, 166, ${0.07 * alphaMultiplier})`);
      grad1.addColorStop(1, `rgba(6, 78, 59, ${0.02 * alphaMultiplier})`);

      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, baseY1);

      const step = 24; // Fast, lightweight resolution
      for (let x = 0; x <= width + step; x += step) {
        let y = baseY1 + Math.sin(x * 0.002 + time) * 32 + Math.cos(x * 0.001 - time * 0.7) * 12;

        if (currentMouseX > 0) {
          const dx = x - currentMouseX;
          const dy = y - currentMouseY;
          const distSq = dx * dx + dy * dy;
          if (distSq < 22500) {
            y -= (1 - Math.sqrt(distSq) / 150) * 18;
          }
        }
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // 3. Wave 2: Lower Spiritual Warm Amber & Deep Emerald Ribbon
      const baseY2 = height * 0.68;
      const grad2 = ctx.createLinearGradient(0, baseY2 - 60, width, baseY2 + 60);
      grad2.addColorStop(0, `rgba(245, 158, 11, ${0.04 * alphaMultiplier})`);
      grad2.addColorStop(0.5, `rgba(16, 185, 129, ${0.06 * alphaMultiplier})`);
      grad2.addColorStop(1, `rgba(217, 119, 6, ${0.02 * alphaMultiplier})`);

      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, baseY2);

      for (let x = 0; x <= width + step; x += step) {
        let y = baseY2 + Math.sin(x * 0.0018 - time * 0.8) * 36 + Math.cos(x * 0.0009 + time) * 14;

        if (currentMouseX > 0) {
          const dx = x - currentMouseX;
          const dy = y - currentMouseY;
          const distSq = dx * dx + dy * dy;
          if (distSq < 22500) {
            y -= (1 - Math.sqrt(distSq) / 150) * 20;
          }
        }
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(scrollTimeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
    };
  }, [enabled, intensity]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full select-none"
      style={{ opacity: 0.9, transform: 'translateZ(0)' }}
      aria-hidden="true"
    />
  );
};
