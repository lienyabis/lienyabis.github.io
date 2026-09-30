import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';

/**
 * Galaxy
 * ------
 * A WebGL star field: parallax layers of twinkling, flared stars over a focal
 * point, with the stars pushed away from the pointer as it moves.
 *
 * Adapted from React Bits (https://reactbits.dev/backgrounds/galaxy), MIT.
 * What changed to suit this project:
 *  - This is Vite, not Next, so there is no "use client" directive and the
 *    styles live in src/styles/layout.css with everything else rather than in a
 *    colocated Galaxy.css.
 *  - The container is `pointer-events: none` so the field can sit behind the
 *    content without stealing clicks. That also means it can no longer be its
 *    own event source, so the pointer is tracked on `window` instead.
 *
 * Performance notes (this background is full-viewport, so its per-frame cost is
 * paid on every single scroll frame - it is the page's biggest GPU item):
 *  - The backing store is DPR aware but capped at 1.5x (1x on phones). The
 *    field is a soft glow, so the extra sharpness of 2x is not resolvable while
 *    costing ~45% more fill rate.
 *  - NUM_LAYER is baked into the shader source per device tier, so phones
 *    compile a 2-layer variant instead of the 4-layer desktop one.
 *  - The render loop is capped at 30fps. The field rotates at 0.1 rad/s, so the
 *    remaining frames bought motion nobody can see at the cost of a full
 *    viewport fragment pass each.
 *  - The loop stops while the tab is hidden, and a single static frame is
 *    drawn when the visitor prefers reduced motion.
 *  - The container's box is cached and only re-measured on resize, so the
 *    pointermove handler never forces a layout.
 *  - `lightMode` flips the shader to dark ink on white for the light theme.
 *  - The two array props are compared as joined strings. Upstream lists them
 *    by identity, but they default to fresh literals every render, so that
 *    would tear down and rebuild the GL context on every single render.
 */

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

/**
 * The fragment shader is parameterised by layer count.
 *
 * NUM_LAYER has to be a compile-time constant because it drives a loop bound,
 * so it cannot be a runtime uniform. Building the source per device tier lets
 * phones compile a 2-layer variant instead of the 4-layer desktop one, which
 * halves the fragment work (each layer evaluates 9 cells) with no runtime cost.
 */
const buildFragmentShader = (layerCount) => `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform bool uTransparent;
uniform float uLightMode;

varying vec2 vUv;

#define NUM_LAYER ${layerCount.toFixed(1)}
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity;
  m *= smoothstep(1.0, 0.2, d);
  return m;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);

  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + vec2(float(x), float(y));
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);

      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;

      float star = Star(gv - offset - pad, flareSize);
      vec3 color = base;

      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;

      col += star * size * color;
    }
  }

  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;

  vec2 mouseNorm = uMouse - vec2(0.5);

  if (uAutoCenterRepulsion > 0.0) {
    vec2 centerUV = vec2(0.0, 0.0);
    float centerDist = length(uv - centerUV);
    vec2 repulsion = normalize(uv - centerUV) * (uAutoCenterRepulsion / (centerDist + 0.1));
    uv += repulsion * 0.05;
  } else if (uMouseRepulsion) {
    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
    float mouseDist = length(uv - mousePosUV);
    vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));
    uv += repulsion * 0.05 * uMouseActiveFactor;
  } else {
    vec2 mouseOffset = mouseNorm * 0.1 * uMouseActiveFactor;
    uv += mouseOffset;
  }

  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;

  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i + uStarSpeed * uSpeed);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }

  if (uLightMode > 0.5) {
    float energy = max(max(col.r, col.g), col.b);
    float coverage = clamp(smoothstep(0.0, 0.42, energy) * 0.92, 0.0, 0.92);
    vec3 ink = clamp(col * 0.48, 0.0, 0.82);
    gl_FragColor = vec4(mix(vec3(1.0), ink, coverage), 1.0);
  } else if (uTransparent) {
    float alpha = length(col);
    alpha = smoothstep(0.0, 0.3, alpha);
    alpha = min(alpha, 1.0);
    gl_FragColor = vec4(col, alpha);
  } else {
    gl_FragColor = vec4(col, 1.0);
  }
}
`;

export default function Galaxy({
  focal = [0.5, 0.5],
  rotation = [1.0, 0.0],
  starSpeed = 0.5,
  density = 1,
  hueShift = 140,
  disableAnimation = false,
  speed = 1.0,
  mouseInteraction = true,
  glowIntensity = 0.3,
  saturation = 0.0,
  mouseRepulsion = true,
  repulsionStrength = 2,
  twinkleIntensity = 0.3,
  rotationSpeed = 0.1,
  autoCenterRepulsion = 0,
  transparent = true,
  lightMode = false,
  ...rest
}) {
  const ctnDom = useRef(null);
  const targetMousePos = useRef({ x: 0.5, y: 0.5 });
  const smoothMousePos = useRef({ x: 0.5, y: 0.5 });
  const targetMouseActive = useRef(0.0);
  const smoothMouseActive = useRef(0.0);
  // The program and the frame painter outlive individual renders so a theme
  // toggle can push new uniforms in without tearing down the GL context.
  const programRef = useRef(null);
  const drawRef = useRef(null);
  const glRef = useRef(null);

  // The array props default to a fresh `[0.5, 0.5]` / `[1.0, 0.0]` literal on
  // every render, so they can never be compared by identity. These strings are
  // the stable stand-ins used to decide when the GL context must be rebuilt.
  const focalKey = focal.join(',');
  const rotationKey = rotation.join(',');

  /**
   * Device tier, resolved once per mount.
   *
   * `matchMedia` is a style/layout read, so this used to run inside its own
   * effect that had to complete before the main one. Resolving it inline on
   * first render removes that ordering dependency and one layout read.
   */
  const tierRef = useRef(null);
  if (tierRef.current === null) {
    const narrow = window.matchMedia('(max-width: 768px)').matches;
    tierRef.current = {
      // Phones get a 2-layer shader (half the fragment work) and a 1x backing
      // store; desktop keeps all 4 layers at up to 1.5x.
      layers: narrow ? 2 : 4,
      dpr: Math.min(window.devicePixelRatio || 1, narrow ? 1 : 1.5),
      // The field drifts slowly enough that 30fps is indistinguishable from 60,
      // and it halves the GPU cost of a full-viewport pass every frame.
      fps: 30,
    };
  }
  const tier = tierRef.current;

  useEffect(() => {
    const ctn = ctnDom.current;
    if (!ctn) return undefined;

    const renderer = new Renderer({
      alpha: transparent,
      premultipliedAlpha: false,
      // The star field is a soft, blurred glow, so a 1.5x backing store is
      // visually indistinguishable from 2x while costing ~45% less fill rate.
      // Phones stay at 1x. The fragment shader is heavy (layers x 9 cells), so
      // this is one of the largest single wins available.
      dpr: tier.dpr,
    });
    const gl = renderer.gl;
    if (!gl) return undefined;

    if (lightMode) {
      gl.clearColor(1, 1, 1, 1);
    } else if (transparent) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
    } else {
      gl.clearColor(0, 0, 0, 1);
    }

    let program;

    // Cached container box. `getBoundingClientRect()` inside a pointermove
    // handler is a forced layout on every mouse event; the container is
    // `position: fixed; inset: 0`, so this only changes on resize.
    let bounds = null;
    const measureBounds = () => {
      bounds = ctn.getBoundingClientRect();
    };

    function resize() {
      measureBounds();
      // Re-clamp DPR on every resize so dragging the window to a different-DPI
      // display (or a browser zoom change) re-derives the fill rate instead of
      // inheriting whatever was cached at mount.
      renderer.dpr = Math.min(window.devicePixelRatio || 1, tier.dpr);
      renderer.setSize(ctn.offsetWidth, ctn.offsetHeight);
      if (program) {
        program.uniforms.uResolution.value = new Color(
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / gl.canvas.height,
        );
      }
    }
    window.addEventListener('resize', resize, false);
    resize();

    const geometry = new Triangle(gl);
    program = new Program(gl, {
      vertex: vertexShader,
      fragment: buildFragmentShader(tier.layers),
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height),
        },
        uFocal: { value: new Float32Array(focal) },
        uRotation: { value: new Float32Array(rotation) },
        uStarSpeed: { value: starSpeed },
        uDensity: { value: density },
        uHueShift: { value: hueShift },
        uSpeed: { value: speed },
        uMouse: {
          value: new Float32Array([smoothMousePos.current.x, smoothMousePos.current.y]),
        },
        uGlowIntensity: { value: glowIntensity },
        uSaturation: { value: saturation },
        uMouseRepulsion: { value: mouseRepulsion },
        uTwinkleIntensity: { value: twinkleIntensity },
        uRotationSpeed: { value: rotationSpeed },
        uRepulsionStrength: { value: repulsionStrength },
        uMouseActiveFactor: { value: 0.0 },
        uAutoCenterRepulsion: { value: autoCenterRepulsion },
        uTransparent: { value: transparent },
        uLightMode: { value: lightMode ? 1 : 0 },
      },
    });
    programRef.current = program;
    glRef.current = gl;

    const mesh = new Mesh(gl, { geometry, program });
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animateId = 0;

    /**
     * Draws one frame. The time uniforms only move when animation is on, so a
     * single call is also the static frame we show for reduced motion.
     */
    const draw = (t) => {
      if (!disableAnimation) {
        program.uniforms.uTime.value = t * 0.001;
        program.uniforms.uStarSpeed.value = (t * 0.001 * starSpeed) / 10.0;
      }

      // Ease towards the pointer so the repulsion glides instead of snapping.
      // The factor is scaled by the actual frame rate so the glide covers the
      // same ground per *second* whether we run at 60fps or the throttled 30.
      smoothMousePos.current.x += (targetMousePos.current.x - smoothMousePos.current.x) * lerpFactor;
      smoothMousePos.current.y += (targetMousePos.current.y - smoothMousePos.current.y) * lerpFactor;
      smoothMouseActive.current += (targetMouseActive.current - smoothMouseActive.current) * lerpFactor;

      program.uniforms.uMouse.value[0] = smoothMousePos.current.x;
      program.uniforms.uMouse.value[1] = smoothMousePos.current.y;
      program.uniforms.uMouseActiveFactor.value = smoothMouseActive.current;

      renderer.render({ scene: mesh });
    };
    drawRef.current = draw;

    /**
     * Frame rate cap.
     *
     * The field drifts very slowly (0.1 rad/s), so drawing it at 60fps burns
     * a full-viewport fragment pass per frame for motion nobody can perceive -
     * and every one of those passes competes with scrolling for GPU time.
     * Capping at 30fps halves the cost with no visible difference, and the
     * remainder of the interval is skipped inside the existing rAF tick rather
     * than spinning up extra timers.
     */
    const frameInterval = 1000 / tier.fps;
    // 0.05 per 60fps frame, converted to the throttled rate.
    const lerpFactor = 1 - Math.pow(1 - 0.05, 60 / tier.fps);
    let lastDraw = -Infinity;

    const update = (t) => {
      animateId = requestAnimationFrame(update);

      // Carrying the remainder forward keeps the cadence even instead of
      // drifting by a fraction of a frame on every tick.
      if (t - lastDraw < frameInterval) return;
      lastDraw = t - ((t - lastDraw) % frameInterval);

      draw(t);
    };

    const start = () => {
      if (animateId || document.hidden) return;
      lastDraw = -Infinity;
      animateId = requestAnimationFrame(update);
    };

    const stop = () => {
      if (!animateId) return;
      cancelAnimationFrame(animateId);
      animateId = 0;
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    const onReducedMotion = () => {
      if (reducedMotion.matches) {
        stop();
        draw(0);
      } else {
        start();
      }
    };

    // Append before the first paint so the container is laid out at its real
    // size, then size the drawing buffer to match and draw frame one.
    ctn.appendChild(gl.canvas);
    resize();
    draw(0);
    if (!reducedMotion.matches) start();

    // `.galaxy-container` is `pointer-events: none` so it can sit behind the
    // page without swallowing clicks - which also means it never receives its
    // own mousemove, so the pointer is tracked on the window instead.
    const handlePointerMove = (e) => {
      // Uses the box cached in resize() - this fires on every mouse event and
      // getBoundingClientRect() would force a layout each time.
      if (!bounds || !bounds.width || !bounds.height) return;
      targetMousePos.current = {
        x: (e.clientX - bounds.left) / bounds.width,
        // GL's origin is bottom-left, the DOM's is top-left.
        y: 1.0 - (e.clientY - bounds.top) / bounds.height,
      };
      targetMouseActive.current = 1.0;
    };

    const handlePointerLeave = () => {
      targetMouseActive.current = 0.0;
    };

    document.addEventListener('visibilitychange', onVisibility);
    reducedMotion.addEventListener('change', onReducedMotion);

    if (mouseInteraction) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      window.addEventListener('pointerdown', handlePointerMove, { passive: true });
      document.addEventListener('pointerleave', handlePointerLeave);
      window.addEventListener('blur', handlePointerLeave);
    }

    return () => {
      stop();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      reducedMotion.removeEventListener('change', onReducedMotion);
      if (mouseInteraction) {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerdown', handlePointerMove);
        document.removeEventListener('pointerleave', handlePointerLeave);
        window.removeEventListener('blur', handlePointerLeave);
      }
      // Drop the refs before the context is lost so the uniform-sync effect can
      // never write into a program whose backing store has been released.
      programRef.current = null;
      drawRef.current = null;
      glRef.current = null;
      gl.canvas.remove();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [focalKey, rotationKey, disableAnimation, mouseInteraction, transparent, tier]);

  // Anything that is just a uniform value is pushed into the live program
  // instead of being a reason to tear the GL context down and build a new one.
  // Without this the theme toggle would drop the canvas for a frame, and the
  // two array props would re-run the whole effect on every render.
  useEffect(() => {
    const program = programRef.current;
    if (!program) return;
    const { uFocal, uRotation } = program.uniforms;
    uFocal.value.set(focal);
    uRotation.value.set(rotation);
    program.uniforms.uStarSpeed.value = starSpeed;
    program.uniforms.uDensity.value = density;
    program.uniforms.uHueShift.value = hueShift;
    program.uniforms.uSpeed.value = speed;
    program.uniforms.uGlowIntensity.value = glowIntensity;
    program.uniforms.uSaturation.value = saturation;
    program.uniforms.uMouseRepulsion.value = mouseRepulsion;
    program.uniforms.uTwinkleIntensity.value = twinkleIntensity;
    program.uniforms.uRotationSpeed.value = rotationSpeed;
    program.uniforms.uRepulsionStrength.value = repulsionStrength;
    program.uniforms.uAutoCenterRepulsion.value = autoCenterRepulsion;

    // The light theme has to repaint the clear colour too, otherwise the first
    // frame after the toggle keeps the dark backdrop behind white stars.
    if (lightMode) {
      program.uniforms.uLightMode.value = 1;
      glRef.current?.clearColor(1, 1, 1, 1);
    } else {
      program.uniforms.uLightMode.value = 0;
      glRef.current?.clearColor(0, 0, 0, 0);
    }
    drawRef.current?.(0);
  }, [
    focal,
    rotation,
    starSpeed,
    density,
    hueShift,
    speed,
    glowIntensity,
    saturation,
    mouseRepulsion,
    twinkleIntensity,
    rotationSpeed,
    repulsionStrength,
    autoCenterRepulsion,
    lightMode,
  ]);

  return <div ref={ctnDom} className="galaxy-container" aria-hidden="true" {...rest} />;
}
