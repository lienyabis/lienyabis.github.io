/**
 * Shared scroll metrics.
 * ---------------------
 * Every scroll-driven piece of the page used to own its own `scroll` listener
 * and read layout (`scrollHeight`, `offsetTop`, `innerHeight`) inside the
 * handler. That is a forced synchronous layout per listener *per scroll event*,
 * which is the single biggest cause of scroll jank here, and React re-rendered
 * the whole navbar on every tick because the progress bar lived in state.
 *
 * This module is the single scroll event source for the page. It:
 *   - coalesces every scroll event into one `requestAnimationFrame` callback,
 *   - reads only `window.scrollY` inside the frame (cheap, no layout),
 *   - caches `scrollHeight` / `innerHeight` and only re-measures them when the
 *     layout actually changes (resize, body resize, or 180ms after scrolling
 *     settles), and bumps `layoutVersion` so consumers can invalidate their own
 *     cached geometry,
 *   - never triggers a React render on its own.
 *
 * Consumers use `subscribeScroll(fn)`; `fn` receives a single reused state
 * object, so read from it synchronously and never store the reference.
 */

const listeners = new Set();

const state = {
  scrollY: 0,
  innerHeight: 0,
  scrollHeight: 0,
  /** scrollHeight - innerHeight, floored at 0. Cached for progress bars. */
  maxScroll: 0,
  atBottom: false,
  /**
   * Bumped whenever a cached layout value above may have changed. Consumers
   * that cache their own geometry (e.g. section offsets) compare against this
   * instead of re-measuring on every frame.
   */
  layoutVersion: 0,
};

let running = false;
let frameId = 0;
let layoutFrameId = 0;
let idleTimer = 0;
let bodyObserver = null;

const isBrowser = () =>
  typeof window !== 'undefined' && typeof document !== 'undefined';

/**
 * Re-reads the cached document/viewport metrics. The early return keeps
 * `layoutVersion` stable so consumers do not recompute geometry pointlessly.
 */
function measureLayout() {
  if (!isBrowser()) return;

  const doc = document.documentElement;
  const body = document.body;
  const scrollHeight = Math.max(doc ? doc.scrollHeight : 0, body ? body.scrollHeight : 0);
  const innerHeight = window.innerHeight;

  if (scrollHeight === state.scrollHeight && innerHeight === state.innerHeight) return;

  state.scrollHeight = scrollHeight;
  state.innerHeight = innerHeight;
  state.maxScroll = Math.max(0, scrollHeight - innerHeight);
  state.layoutVersion += 1;
}

/** Publishes the current metrics to every subscriber (once per frame). */
function publish() {
  frameId = 0;
  if (!isBrowser()) return;

  state.scrollY = window.scrollY;
  state.atBottom = state.scrollY + state.innerHeight >= state.scrollHeight - 2;

  for (const listener of listeners) listener(state);
}

/**
 * Layout-dependent publish. Kept on its own rAF handle so it can never be
 * swallowed by a scroll frame that is already queued.
 */
function scheduleLayoutPublish() {
  if (layoutFrameId) return;
  layoutFrameId = requestAnimationFrame(() => {
    layoutFrameId = 0;
    measureLayout();
    publish();
  });
}

function handleScroll() {
  if (!frameId) frameId = requestAnimationFrame(publish);

  // Content can grow mid-scroll (entrance animations, late web fonts, lazy
  // images), so re-check the cached height once the visitor stops scrolling
  // rather than paying for a forced layout on every single frame.
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    idleTimer = 0;
    if (frameId) {
      cancelAnimationFrame(frameId);
      frameId = 0;
    }
    measureLayout();
    publish();
  }, 180);
}

function handleResize() {
  clearTimeout(idleTimer);
  idleTimer = 0;
  scheduleLayoutPublish();
}

function start() {
  if (running || !isBrowser()) return;
  running = true;

  measureLayout();
  state.scrollY = window.scrollY;

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleResize, { passive: true });
  window.addEventListener('orientationchange', handleResize, { passive: true });

  // Catches height changes that never fire a resize event (content revealed,
  // fonts swapping in, the drawer locking body scroll).
  if (typeof ResizeObserver !== 'undefined' && document.body) {
    bodyObserver = new ResizeObserver(scheduleLayoutPublish);
    bodyObserver.observe(document.body);
  }

  publish();
}

function stop() {
  if (!running) return;
  running = false;

  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('orientationchange', handleResize);

  clearTimeout(idleTimer);
  idleTimer = 0;
  if (frameId) cancelAnimationFrame(frameId);
  if (layoutFrameId) cancelAnimationFrame(layoutFrameId);
  frameId = 0;
  layoutFrameId = 0;

  if (bodyObserver) {
    bodyObserver.disconnect();
    bodyObserver = null;
  }
}

/**
 * Registers a scroll listener. Returns an unsubscribe function. The first
 * subscriber starts the shared pipeline; the last one to leave tears it down.
 */
export function subscribeScroll(listener) {
  listeners.add(listener);
  if (listeners.size === 1) start();
  else listener(state);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) stop();
  };
}

/**
 * Current metrics without subscribing. Safe to call before the pipeline has
 * started (it measures on demand), which is what lets consumers seed their
 * initial state without waiting for a frame.
 */
export function getScrollState() {
  if (!running && isBrowser()) {
    measureLayout();
    state.scrollY = window.scrollY;
    state.atBottom = state.scrollY + state.innerHeight >= state.scrollHeight - 2;
  }
  return state;
}
