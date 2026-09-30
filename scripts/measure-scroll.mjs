/**
 * Scroll performance harness.
 *
 * Drives headless Chrome over the DevTools Protocol and measures real frame
 * timing while programmatically scrolling the page - the only way to actually
 * confirm the jank is gone rather than guess at it.
 *
 * Usage: node scripts/measure-scroll.mjs [--url http://localhost:4173]
 */

import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME =
  process.env.CHROME_PATH ??
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const args = process.argv.slice(2);
const urlFlag = args.indexOf('--url');
const URL = urlFlag !== -1 ? args[urlFlag + 1] : 'http://localhost:4173';
const PORT = 9222 + Math.floor(Math.random() * 400);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const round = (n) => Math.round(n * 10) / 10;

const pct = (arr, p) => {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(s.length * p))] ?? 0;
};
// __PART2__

/** Minimal CDP client over the browser's WebSocket endpoint. */
class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = new Map();
    ws.addEventListener('message', (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      } else if (msg.method) {
        (this.events.get(msg.method) ?? []).forEach((fn) => fn(msg.params));
      }
    });
  }

  on(method, fn) {
    if (!this.events.has(method)) this.events.set(method, []);
    this.events.get(method).push(fn);
  }

  send(method, params = {}, sessionId) {
    const id = ++this.id;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    this.ws.send(JSON.stringify(payload));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`timeout: ${method}`));
        }
      }, 30000);
    });
  }
}

/** Opens the DevTools WebSocket directly (fetch cannot speak ws://). */
function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  return new Promise((resolve, reject) => {
    ws.addEventListener('open', () => resolve(new CDP(ws)), { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
}

// __PART3__

/**
 * Injected into the page: performs a smooth programmatic scroll over a few
 * seconds and reports the frame interval distribution. Long frames are what the
 * user perceives as stutter.
 */
const SCROLL_PROBE = `(() => new Promise((resolve) => {
  const frames = [];
  let last = performance.now();
  let running = true;
  const tick = (now) => {
    frames.push(now - last);
    last = now;
    if (running) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  const start = performance.now();
  const step = () => {
    const t = Math.min(1, (performance.now() - start) / 4000);
    const eased = 1 - Math.pow(1 - t, 2);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, eased * max);
    if (t < 1) requestAnimationFrame(step);
    else setTimeout(function () { running = false; resolve(frames); }, 300);
  };
  requestAnimationFrame(step);
}))()`;

/** Counts the paint/layout traps this optimisation pass was targeting. */
const LAYER_PROBE = `(() => {
  const c = { willChange: 0, backdropFilter: 0, blurFilter: 0, blendMode: 0,
              animations: 0, reveals: 0, settledReveals: 0 };
  for (const el of document.querySelectorAll('*')) {
    const s = getComputedStyle(el);
    if (s.willChange && s.willChange !== 'auto') c.willChange++;
    if (s.backdropFilter && s.backdropFilter !== 'none') c.backdropFilter++;
    if (s.filter && s.filter !== 'none' && s.filter.includes('blur')) c.blurFilter++;
    if (s.mixBlendMode && s.mixBlendMode !== 'normal') c.blendMode++;
    if (s.animationName && s.animationName !== 'none') c.animations++;
    if (el.classList.contains('reveal')) {
      c.reveals++;
      if (el.classList.contains('is-settled')) c.settledReveals++;
    }
  }
  const canvas = document.querySelector('.galaxy-container canvas');
  return Object.assign({}, c, {
    canvasBuffer: canvas ? canvas.width + 'x' + canvas.height : 'none',
    viewport: window.innerWidth + 'x' + window.innerHeight,
    dpr: String(window.devicePixelRatio),
  });
})()`;

// __PART4__

async function run(label, viewport, deviceScaleFactor, isMobile) {
  const profile = await mkdtemp(join(tmpdir(), 'perf-'));
  const chrome = spawn(CHROME, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    `--window-size=${viewport.width},${viewport.height}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--hide-scrollbars',
    'about:blank',
  ], { stdio: 'ignore' });

  let version = null;
  for (let i = 0; i < 40 && !version; i += 1) {
    await sleep(250);
    try {
      version = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
    } catch { /* not up yet */ }
  }
  if (!version) {
    chrome.kill();
    throw new Error('Chrome did not expose a debugging endpoint');
  }

  const cdp = await connect(version.webSocketDebuggerUrl);
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', {
    targetId,
    flatten: true,
  });

  const consoleErrors = [];
  cdp.on('Runtime.consoleAPICalled', (p) => {
    if (p.type === 'error') {
      consoleErrors.push(p.args.map((a) => a.value ?? a.description).join(' '));
    }
  });
  cdp.on('Runtime.exceptionThrown', (p) => {
    consoleErrors.push(
      p.exceptionDetails?.exception?.description ?? 'exception',
    );
  });

  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor,
    mobile: isMobile,
  }, sessionId);
  await cdp.send('Page.enable', {}, sessionId);
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Page.navigate', { url: URL }, sessionId);
  await sleep(3500); // let fonts settle and the reveal animations finish

  // returnByValue already hands back the deserialised object.
  const layers = (await cdp.send('Runtime.evaluate', {
    expression: LAYER_PROBE,
    returnByValue: true,
  }, sessionId)).result.value;

  const frames = (await cdp.send('Runtime.evaluate', {
    expression: SCROLL_PROBE,
    awaitPromise: true,
    returnByValue: true,
  }, sessionId)).result.value.slice(2); // drop start-up noise

  cdp.ws.close();
  chrome.kill();
  // Chrome keeps file handles alive for a moment after kill(), so cleanup is
  // best-effort and must never fail the measurement itself.
  await sleep(500);
  await rm(profile, { recursive: true, force: true, maxRetries: 5 }).catch(() => {});
  return { frames, layers, consoleErrors };
}
function report(label, viewport, dpr, { frames, layers, consoleErrors }) {
  const avg = frames.reduce((a, b) => a + b, 0) / frames.length;
  const over32 = frames.filter((f) => f > 32).length;
  const over50 = frames.filter((f) => f > 50).length;
  const p95 = pct(frames, 0.95);

  console.log(`\n=== ${label} (${viewport.width}x${viewport.height} @${dpr}x) ===`);
  console.log(`  frames sampled : ${frames.length}`);
  console.log(`  avg frame      : ${round(avg)} ms  (~${Math.round(1000 / avg)} fps)`);
  console.log(`  p50 / p95      : ${round(pct(frames, 0.5))} / ${round(p95)} ms`);
  console.log(`  worst frame    : ${round(Math.max(...frames))} ms`);
  console.log(`  frames >32ms   : ${over32} (${Math.round((over32 / frames.length) * 100)}%)`);
  console.log(`  frames >50ms   : ${over50}   <-- visible stutter`);
  console.log(`  will-change    : ${layers.willChange}`);
  console.log(`  backdrop-filter: ${layers.backdropFilter}`);
  console.log(`  blur filters   : ${layers.blurFilter}`);
  console.log(`  mix-blend-mode : ${layers.blendMode}`);
  console.log(`  running anims  : ${layers.animations}`);
  console.log(`  reveal settled : ${layers.settledReveals}/${layers.reveals}`);
  console.log(`  canvas buffer  : ${layers.canvasBuffer}  (viewport ${layers.viewport} @${layers.dpr}x)`);
  console.log(`  console errors : ${consoleErrors.length ? consoleErrors.join(' | ') : 'none'}`);

  return { p95, over50, over32, avg, layers, consoleErrors };
}

const desktopViewport = { width: 1440, height: 900 };
const phoneViewport = { width: 390, height: 844 };

const desktop = report('DESKTOP', desktopViewport, 1,
  await run('DESKTOP', desktopViewport, 1, false));
const phone = report('PHONE', phoneViewport, 3,
  await run('PHONE', phoneViewport, 3, true));

console.log('\n--- summary ---');
console.log(`desktop  p95 ${round(desktop.p95)} ms | >50ms ${desktop.over50} | errors ${desktop.consoleErrors.length}`);
console.log(`phone     p95 ${round(phone.p95)} ms | >50ms ${phone.over50} | errors ${phone.consoleErrors.length}`);
process.exit(0);




