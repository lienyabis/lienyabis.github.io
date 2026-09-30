/**
 * Mobile render verification.
 *
 * Loads the built site in headless Chrome at a phone viewport over the DevTools
 * Protocol and asserts that the page actually paints: React mounted, no console
 * errors, the hero is on screen, and every scroll-reveal target reaches opacity 1
 * as it is scrolled through.
 *
 * This exists because the failure mode it guards against is silent - a blank
 * page is a perfectly valid DOM, and `--dump-dom` hangs on the galaxy's rAF loop,
 * so nothing short of driving a real browser catches it.
 *
 * Usage: node scripts/verify-mobile.mjs [--url http://localhost:4173]
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
const PORT = 9700 + Math.floor(Math.random() * 200);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Defaults to iPhone 12 metrics, including the mobile flag that selects the
 * phone code paths. `--width`/`--height` override it so the same assertions
 * can be run against desktop.
 */
const VIEWPORT = {
  width: args.includes('--width') ? Number(args[args.indexOf('--width') + 1]) : 390,
  height: args.includes('--height') ? Number(args[args.indexOf('--height') + 1]) : 844,
};
const MOBILE = VIEWPORT.width <= 768;

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

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  return new Promise((resolve, reject) => {
    ws.addEventListener('open', () => resolve(new CDP(ws)), { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
}

/**
 * Reads what actually got painted. `opacity` is the value that matters: a
 * crashed React tree and a fully revealed one both produce a non-empty `#root`,
 * but only one of them has anything a visitor can see.
 */
const PAINT_PROBE = `(() => {
  const root = document.getElementById('root');
  const heroTitle = document.querySelector('.hero-title');
  const hero = document.querySelector('.hero');
  const reveals = [...document.querySelectorAll('.reveal')];
  const visible = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      opacity: Number(s.opacity),
      onScreen: r.top < window.innerHeight && r.bottom > 0,
      height: Math.round(r.height),
    };
  };
  return {
    rootChildren: root ? root.children.length : 0,
    rootText: root ? root.innerText.replace(/\\s+/g, ' ').trim().slice(0, 120) : '',
    bodyBg: getComputedStyle(document.body).backgroundColor,
    docHeight: document.documentElement.scrollHeight,
    hero: visible(hero),
    heroTitle: visible(heroTitle),
    revealTotal: reveals.length,
    revealsHidden: reveals.filter((el) => Number(getComputedStyle(el).opacity) < 0.9).length,
    sections: [...document.querySelectorAll('.section')].map((s) => s.id),
    galaxyCanvas: !!document.querySelector('.galaxy-container canvas'),
  };
})()`;

/**
 * Scrolls the whole document in steps so every reveal target gets its turn.
 *
 * Deliberately unhurried. Each step pauses for several frames because a
 * section can be skipped by `content-visibility` until the browser decides it is
 * relevant to the user, and IntersectionObserver only reports a reveal on a
 * frame *after* that subtree has been laid out. Scrolling faster than the
 * observer can settle skips past whole sections, which reads as a bug in the
 * page when it is really the harness outrunning it.
 */
const SCROLL_PROBE = `(() => new Promise((resolve) => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const steps = 24;
  let i = 0;
  const step = () => {
    i += 1;
    window.scrollTo(0, Math.round((max * i) / steps));
    if (i <= steps) {
      setTimeout(step, 220);
    } else {
      // Settle at the bottom, then walk back up so anything revealed on the way
      // down stays revealed and the header/progress path is exercised too.
      setTimeout(() => {
        window.scrollTo(0, 0);
        setTimeout(resolve, 800);
      }, 600);
    }
  };
  setTimeout(step, 200);
}))()`;

const failures = [];
const check = (ok, label, detail = '') => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` - ${detail}` : ''}`);
  if (!ok) failures.push(label);
};

// __PART2__
async function run() {
  const profile = await mkdtemp(join(tmpdir(), 'verify-'));
  const chrome = spawn(CHROME, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--hide-scrollbars',
    '--enable-unsafe-swiftshader',
    'about:blank',
  ], { stdio: 'ignore' });

  const cleanup = async () => {
    chrome.kill();
    await rm(profile, { recursive: true, force: true }).catch(() => {});
  };

  try {
    let version = null;
    for (let i = 0; i < 40 && !version; i += 1) {
      await sleep(250);
      try {
        version = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
      } catch { /* not up yet */ }
    }
    if (!version) throw new Error('Chrome did not expose a debugging endpoint');

    const cdp = await connect(version.webSocketDebuggerUrl);
    const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });

    const errors = [];
    cdp.on('Runtime.consoleAPICalled', (p) => {
      if (p.type === 'error') errors.push(p.args.map((a) => a.value ?? a.description).join(' '));
    });
    cdp.on('Runtime.exceptionThrown', (p) => {
      errors.push(p.exceptionDetails?.exception?.description ?? p.exceptionDetails?.text);
    });

    await cdp.send('Runtime.enable', {}, sessionId);
    await cdp.send('Page.enable', {}, sessionId);

    // The mobile flag selects the phone code paths (2-layer shader, 1x backing
    // store, the 768px breakpoints), so it has to be set for the phone run.
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: VIEWPORT.width,
      height: VIEWPORT.height,
      deviceScaleFactor: MOBILE ? 3 : 1,
      mobile: MOBILE,
    }, sessionId);
    if (MOBILE) {
      await cdp.send('Emulation.setUserAgentOverride', {
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 ' +
          '(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      }, sessionId);
    }

    // Headless Chrome reports `prefers-reduced-motion: reduce` by default. Both
    // Reveal and the stat counters take an early "just show everything" branch
    // when that matches, which would silently bypass the exact code this harness
    // exists to exercise - and report a green run against a broken build.
    await cdp.send('Emulation.setEmulatedMedia', {
      features: [
        { name: 'prefers-reduced-motion', value: 'no-preference' },
        { name: 'prefers-color-scheme', value: 'dark' },
      ],
    }, sessionId);

    console.log(
      `\nVerifying ${URL} at ${VIEWPORT.width}x${VIEWPORT.height} ` +
      `(${MOBILE ? 'mobile' : 'desktop'})\n`,
    );

    await cdp.send('Page.navigate', { url: URL }, sessionId);

    /*
     * Wait for React to actually commit rather than sleeping a fixed amount.
     * Headless Chrome renders WebGL through SwiftShader on the CPU, and the
     * desktop galaxy draws a 4-layer, 9-cell-per-layer shader over a full
     * viewport at 30fps - slow enough to starve the main thread well past any
     * fixed delay. Polling makes the run deterministic instead of flaky.
     */
    let mounted = false;
    for (let i = 0; i < 60 && !mounted; i += 1) {
      await sleep(500);
      const probe = await cdp.send('Runtime.evaluate', {
        expression:
          "document.getElementById('root').children.length > 0 && " +
          "!!document.querySelector('.hero-title')",
        returnByValue: true,
      }, sessionId);
      mounted = probe.result.value === true;
    }
    // Let the entrance animations finish so opacity is meaningful.
    await sleep(1200);

    const first = await cdp.send('Runtime.evaluate', {
      expression: PAINT_PROBE, returnByValue: true,
    }, sessionId);

    const before = first.result.value;
    console.log('  -- after load --');
    check(before.rootChildren > 0, 'React mounted', `${before.rootChildren} children in #root`);
    check(before.heroTitle?.opacity === 1, 'Hero title visible',
      `opacity ${before.heroTitle?.opacity}, height ${before.heroTitle?.height}px`);
    check((before.hero?.height ?? 0) > 0, 'Hero has layout', `${before.hero?.height}px`);
    check(before.sections.length === 7, 'All 7 sections rendered', before.sections.join(','));
    check(before.revealTotal > 0, 'Reveal targets present', `${before.revealTotal} total`);

    await cdp.send('Runtime.evaluate', {
      expression: SCROLL_PROBE, awaitPromise: true, returnByValue: true,
    }, sessionId);
    await sleep(1500);

    const second = await cdp.send('Runtime.evaluate', {
      expression: PAINT_PROBE, returnByValue: true,
    }, sessionId);
    const after = second.result.value;

    console.log('  -- after scrolling the full page --');
    check(after.revealsHidden === 0, 'Every reveal target is visible',
      `${after.revealTotal - after.revealsHidden}/${after.revealTotal} at opacity 1`);
    check((after.docHeight ?? 0) > VIEWPORT.height * 3, 'Document is full height',
      `${after.docHeight}px`);
    console.log(`  info: galaxy canvas present = ${after.galaxyCanvas}`);
    console.log(`  info: body background      = ${after.bodyBg}`);
    console.log(`  info: hero text            = "${before.rootText}"`);

    console.log('\n  -- console --');
    // The same throw is reported once per mounted Reveal, so collapse duplicates
    // before printing - otherwise a single bug buries the output in 30 copies.
    const seen = new Map();
    for (const e of errors) {
      const key = String(e).split('\n')[0].trim();
      if (!/favicon/i.test(key)) seen.set(key, (seen.get(key) ?? 0) + 1);
    }
    const summary = [...seen].map(([msg, n]) => (n > 1 ? `${msg} (x${n})` : msg)).join('\n      ');
    check(seen.size === 0, 'No console errors', summary || 'clean');

    // The light theme repaints the galaxy through a different shader branch and
    // a different clear colour, so it is worth proving the toggle still works
    // after the changes rather than assuming it.
    console.log('\n  -- theme toggle --');
    const toggle = await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector('button[aria-label^="Switch to"]');
        if (!btn) return { found: false };
        btn.click();
        return { found: true };
      })()`,
      returnByValue: true,
    }, sessionId);
    check(toggle.result.value?.found === true, 'Theme toggle present');
    await sleep(900);

    const themed = await cdp.send('Runtime.evaluate', {
      expression: PAINT_PROBE, returnByValue: true,
    }, sessionId);
    const theme = await cdp.send('Runtime.evaluate', {
      expression: `({
        attr: document.documentElement.getAttribute('data-theme'),
        bodyBg: getComputedStyle(document.body).backgroundColor,
        textColor: getComputedStyle(document.body).color,
        canvasAlive: !!document.querySelector('.galaxy-container canvas'),
      })`,
      returnByValue: true,
    }, sessionId);
    const t = theme.result.value;
    check(t.attr === 'light', 'Switched to light theme', `data-theme=${t.attr}`);
    check(t.canvasAlive, 'Galaxy survives the theme toggle');
    check(themed.result.value.rootChildren > 0, 'Still mounted after toggle',
      `${themed.result.value.rootChildren} children`);
    console.log(`  info: light body bg = ${t.bodyBg}, text = ${t.textColor}`);

    await cleanup();
  } catch (error) {
    await cleanup();
    console.error('\nverification error:', error.message);
    process.exitCode = 1;
    return;
  }

  console.log(
    failures.length
      ? `\n${failures.length} check(s) FAILED: ${failures.join(', ')}\n`
      : '\nAll checks passed.\n',
  );
  if (failures.length) process.exitCode = 1;
}

run();