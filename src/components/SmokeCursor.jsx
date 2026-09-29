import { useEffect, useRef, useState } from 'react';

/**
 * SmokeCursor
 * -----------
 * A canvas-based smoke plume that trails the mouse pointer.
 *
 * How it works:
 *  - Soft radial sprites (one per tint) are pre-rendered offscreen so the
 *    animation loop only spends time on cheap drawImage() calls.
 *  - While the pointer moves, particles are seeded along the travelled path so
 *    fast flicks still leave a continuous trail.
 *  - Each particle rises, expands and fades, which reads as smoke rather than a
 *    hard trail. A large "aura" puff lags behind the pointer so the screen keeps
 *    feeling alive even when the mouse stops.
 *  - Disabled on touch devices and for visitors who prefer reduced motion.
 */

const TINTS = [
  [124, 92, 255], // violet
  [34, 211, 238], // cyan
  [90, 120, 255], // indigo
  [255, 255, 255], // soft white core
];

const MAX_PARTICLES = 320;
const TRAIL_SPACING = 6; // px of travel between two spawned puffs

function createSprite([r, g, b], size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const half = size / 2;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.85)`);
  gradient.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, 0.32)`);
  gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.08)`);
  gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

function supportsSmoke() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  return !reduced && !coarse;
}

export default function SmokeCursor() {
  const canvasRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const update = () => setEnabled(supportsSmoke());
    update();
    if (!window.matchMedia) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduced.addEventListener('change', update);
    return () => reduced.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const sprites = TINTS.map((tint) => createSprite(tint));
    const particles = [];

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const pointer = {
      x: width / 2,
      y: height / 2,
      lastX: null,
      lastY: null,
      auraX: width / 2,
      auraY: height / 2,
      speed: 0,
      inside: false,
    };

    const spawn = (x, y, intensity = 1) => {
      if (particles.length >= MAX_PARTICLES) particles.shift();
      const tintIndex = 1 + Math.floor(Math.random() * 2);
      const angle = Math.random() * Math.PI * 2;
      const spread = 6 + Math.random() * 16 * intensity;
      particles.push({
        x: x + Math.cos(angle) * Math.random() * 6,
        y: y + Math.sin(angle) * Math.random() * 6,
        vx: Math.cos(angle) * spread,
        vy: Math.sin(angle) * spread - 14 - Math.random() * 22,
        life: 0,
        ttl: 1.1 + Math.random() * 1.5,
        size: 26 + Math.random() * 42 * intensity,
        growth: 1.6 + Math.random() * 1.5,
        alpha: 0.1 + Math.random() * 0.16,
        sprite: sprites[Math.random() < 0.3 ? 3 : tintIndex],
      });
    };

    const onPointerMove = (event) => {
      const x = event.clientX;
      const y = event.clientY;
      pointer.inside = true;

      if (pointer.lastX === null) {
        pointer.lastX = x;
        pointer.lastY = y;
        pointer.x = x;
        pointer.y = y;
        return;
      }

      const dx = x - pointer.lastX;
      const dy = y - pointer.lastY;
      const distance = Math.hypot(dx, dy);
      pointer.speed = Math.min(distance, 60);

      if (distance > 0.4) {
        const steps = Math.max(1, Math.floor(distance / TRAIL_SPACING));
        for (let i = 1; i <= steps; i += 1) {
          const ratio = i / steps;
          spawn(
            pointer.lastX + dx * ratio,
            pointer.lastY + dy * ratio,
            Math.min(1.7, 0.6 + distance / 40),
          );
        }
      }

      pointer.lastX = x;
      pointer.lastY = y;
      pointer.x = x;
      pointer.y = y;
    };

    const onPointerLeave = () => {
      pointer.inside = false;
      pointer.lastX = null;
      pointer.lastY = null;
    };

    let frame = 0;
    let previous = performance.now();

    const animate = (now) => {
      const dt = Math.min((now - previous) / 1000, 0.05);
      previous = now;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      // Aura: a large, slow puff that chases the pointer.
      const ease = Math.min(1, dt * 3.4);
      pointer.auraX += (pointer.x - pointer.auraX) * ease;
      pointer.auraY += (pointer.y - pointer.auraY) * ease;
      const auraSize = 200 + pointer.speed * 3.4;
      ctx.globalAlpha = pointer.inside ? 0.18 : 0;
      ctx.drawImage(
        sprites[0],
        pointer.auraX - auraSize / 2,
        pointer.auraY - auraSize / 2,
        auraSize,
        auraSize,
      );

      // A quiet ember keeps the scene breathing while the pointer is still.
      if (pointer.inside && Math.random() < 0.14) spawn(pointer.x, pointer.y, 0.5);

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.life += dt;
        const progress = p.life / p.ttl;
        if (progress >= 1) {
          particles.splice(i, 1);
          continue;
        }

        p.vx *= 0.985;
        p.vy = p.vy * 0.985 - 6 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        const size = p.size * (1 + progress * p.growth);
        ctx.globalAlpha = p.alpha * Math.pow(1 - progress, 1.7);
        ctx.drawImage(p.sprite, p.x - size / 2, p.y - size / 2, size, size);
      }

      pointer.speed *= 0.92;
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('blur', onPointerLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('blur', onPointerLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return <canvas ref={canvasRef} className="smoke-cursor" aria-hidden="true" />;
}
