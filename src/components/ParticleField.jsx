import { useEffect, useRef } from 'react';

/**
 * ParticleField
 * -------------
 * An ambient constellation of drifting particles that sits over the page and
 * reacts to the pointer.
 *
 * Why this replaced the smoke trail: smoke only appeared *after* the pointer
 * moved, it was switched off entirely on touch devices and for reduced motion,
 * and `mix-blend-mode: screen` made it disappear wherever the plume crossed
 * bright content (the photo, headings) - measured, its brightest pixel reached
 * only 45% alpha. This field is on the moment the page loads, reads in both
 * themes, and works on touch.
 *
 * How it stays cheap:
 *  - DPR is capped at 2 and the backing store is sized from the viewport.
 *  - Particle count scales with viewport area and is hard-capped.
 *  - The neighbour pass is O(n^2) over at most MAX_PARTICLES points.
 *  - One radial sprite is pre-rendered offscreen and reused for every glow.
 *  - The loop stops when the tab is hidden, and a single static frame is drawn
 *    when the visitor prefers reduced motion.
 */

const AREA_PER_PARTICLE = 19000;
const MIN_PARTICLES = 20;
const MAX_PARTICLES = 72;
const LINK_DISTANCE = 104;
const POINTER_RADIUS = 160;
const DRIFT = 9; // px/s
const LINK_ALPHA = 0.14;

const PALETTE_VARS = ['--accent', '--accent-2', '--accent-3'];

/** Accepts `#7c5cff`, `#7c5cffff` and `rgb(124, 92, 255)` from the stylesheet. */
function toRgb(value) {
  const hex = value.trim();
  if (hex.startsWith('#')) {
    const clean = hex.slice(1);
    const full =
      clean.length === 3
        ? clean
            .split('')
            .map((c) => c + c)
            .join('')
        : clean.slice(0, 6);
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
    ];
  }
  const match = hex.match(/[\d.]+/g);
  if (!match) return [124, 92, 255];
  return [Number(match[0]), Number(match[1]), Number(match[2])];
}

const rgba = ([r, g, b], alpha) => `rgba(${r}, ${g}, ${b}, ${alpha})`;

/** A soft, pre-rendered glow so the loop only pays for drawImage(). */
function createGlow(size = 96) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const half = size / 2;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  gradient.addColorStop(0.35, 'rgba(255, 255, 255, 0.32)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

export default function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const glow = createGlow();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let palette = { dots: [] };
    let particles = [];

    const pointer = { x: -9999, y: -9999, active: false };

    /**
     * Reads the accent colours from the stylesheet so both themes are covered
     * automatically: `--accent-2` is a bright cyan in dark mode and a dark teal
     * in light mode, which is exactly the contrast each one needs.
     */
    const readPalette = () => {
      const styles = getComputedStyle(document.documentElement);
      palette = {
        dots: PALETTE_VARS.map((name) => toRgb(styles.getPropertyValue(name))),
      };
    };

    const seed = () => {
      const count = Math.min(
        MAX_PARTICLES,
        Math.max(MIN_PARTICLES, Math.round((width * height) / AREA_PER_PARTICLE)),
      );
      particles = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * DRIFT,
        vy: (Math.random() - 0.5) * DRIFT,
        radius: 0.9 + Math.random() * 1.9,
        tint: index % Math.max(1, palette.dots.length),
        phase: Math.random() * Math.PI * 2,
        boost: 0,
      }));
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;

      // Neighbour lines first, so the dots always sit on top of them.
      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j];
          const dx = a.x - b.x;
          if (dx > LINK_DISTANCE || dx < -LINK_DISTANCE) continue;
          const dy = a.y - b.y;
          if (dy > LINK_DISTANCE || dy < -LINK_DISTANCE) continue;
          const distance = Math.hypot(dx, dy);
          if (distance > LINK_DISTANCE) continue;
          ctx.strokeStyle = rgba(palette.dots[a.tint], LINK_ALPHA * (1 - distance / LINK_DISTANCE));
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        const twinkle = 0.55 + 0.45 * Math.sin(p.phase);
        const alpha = Math.min(0.95, (0.3 + 0.5 * twinkle) * (1 + p.boost));
        const size = p.radius * 9 * (1 + p.boost * 0.5);
        ctx.globalAlpha = 0.28 * alpha;
        ctx.drawImage(glow, p.x - size, p.y - size, size * 2, size * 2);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = rgba(palette.dots[p.tint], 1);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * (1 + p.boost * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }

      // A soft bloom that follows the pointer, so the cursor always reacts.
      if (pointer.active) {
        const size = POINTER_RADIUS * 1.6;
        ctx.globalAlpha = 0.2;
        ctx.drawImage(glow, pointer.x - size / 2, pointer.y - size / 2, size, size);
      }

      ctx.globalAlpha = 1;
    };

    const step = (dt) => {
      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];

        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < POINTER_RADIUS && distance > 0.01) {
            // Push outwards, harder the closer the particle gets.
            const force = ((1 - distance / POINTER_RADIUS) * 70 * dt) / distance;
            p.vx += dx * force;
            p.vy += dy * force;
            p.boost = 1 - distance / POINTER_RADIUS;
          } else {
            p.boost *= 0.92;
          }
        } else {
          p.boost *= 0.92;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.phase += dt * 1.6;

        // Ease the velocity back to the base drift so the field never explodes.
        p.vx -= p.vx * 0.35 * dt;
        p.vy -= p.vy * 0.35 * dt;
        p.vx = Math.max(-60, Math.min(60, p.vx));
        p.vy = Math.max(-60, Math.min(60, p.vy));

        if (p.x < -20) p.x = width + 20;
        else if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        else if (p.y > height + 20) p.y = -20;
      }
    };

    let frame = 0;
    let previous = performance.now();

    const animate = (now) => {
      const dt = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      step(dt);
      draw();
      frame = requestAnimationFrame(animate);
    };

    const start = () => {
      if (frame || document.hidden) return;
      previous = performance.now();
      frame = requestAnimationFrame(animate);
    };

    const stop = () => {
      if (!frame) return;
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const renderStatic = () => {
      step(0);
      draw();
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    const onPointerMove = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const onReducedMotion = () => {
      if (reducedMotion.matches) {
        stop();
        renderStatic();
      } else {
        start();
      }
    };


    readPalette();
    resize();
    seed();
    renderStatic();

    // The palette is theme dependent, so re-read it when the theme flips.
    const themeObserver = new MutationObserver(() => {
      readPalette();
      draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        seed();
        draw();
      }, 150);
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('blur', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);
    reducedMotion.addEventListener('change', onReducedMotion);

    if (!reducedMotion.matches) start();

    return () => {
      stop();
      clearTimeout(resizeTimer);
      themeObserver.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('blur', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      reducedMotion.removeEventListener('change', onReducedMotion);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-field" aria-hidden="true" />;
}

