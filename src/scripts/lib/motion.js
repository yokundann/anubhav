/* lib/motion.js — shared motion utilities: one rAF ticker, smoothed scroll state, helpers.
   Tune global feel here (SCROLL_SMOOTH = how floaty parallax feels, 0..1, lower = floatier). */
export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export const SCROLL_SMOOTH = 0.11;

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const map = (v, a, b, c, d) => c + ((v - a) / (b - a)) * (d - c);

/** Shared scroll state, updated once per frame. */
export const scroll = { y: 0, smooth: 0, vel: 0, dir: 1, vh: window.innerHeight, vw: window.innerWidth };

const subs = new Set();   // read phase: may return a function, which is run in the write phase
const late = new Set();   // write-only subscribers (run after every read has finished)
let last = performance.now();
let started = false;

/** Per-frame callback. Return a function to defer your DOM writes until all readers have run (avoids layout thrash).
 *  Pass 'late' for subscribers that only write. */
export function onFrame(fn, phase) {
  const set = phase === 'late' ? late : subs;
  set.add(fn);
  start();
  return () => set.delete(fn);
}

/* Adaptive quality: if the device can't hold ~45fps while the page is being used, drop the purely ambient layers
   (grain, blended light leaks, particles) by adding html.lite. Never removes content or interaction. */
let sampleN = 0, sampleT = 0, lowRuns = 0;
function sampleQuality(dt) {
  if (document.documentElement.classList.contains('lite') || !document.documentElement.classList.contains('is-ready')) return;
  sampleN++; sampleT += dt;
  if (sampleN >= 90) {
    const avg = sampleT / sampleN;
    lowRuns = avg > 0.026 ? lowRuns + 1 : 0;
    if (lowRuns >= 2) document.documentElement.classList.add('lite');
    sampleN = 0; sampleT = 0;
  }
}

function start() {
  if (started) return;
  started = true;
  scroll.y = scroll.smooth = window.scrollY;
  const tick = (now) => {
    const dt = Math.min(64, now - last) / 1000;
    last = now;
    const y = window.scrollY;
    scroll.vel = (y - scroll.y) / Math.max(dt, 0.001); // px / s
    if (Math.abs(y - scroll.y) > 0.5) scroll.dir = y > scroll.y ? 1 : -1;
    scroll.y = y;
    scroll.smooth = reduced ? y : lerp(scroll.smooth, y, 1 - Math.pow(1 - SCROLL_SMOOTH, dt * 60));
    scroll.vh = window.innerHeight;
    scroll.vw = window.innerWidth;
    const writes = [];
    subs.forEach((fn) => { const w = fn(dt, now); if (typeof w === 'function') writes.push(w); });
    for (let i = 0; i < writes.length; i++) writes[i]();
    late.forEach((fn) => fn(dt, now));
    if (!reduced) sampleQuality(dt);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/** Debounced layout-refresh: parallax & pinned sections re-measure on this event. */
export function refreshLayout() {
  window.dispatchEvent(new CustomEvent('layout-refresh'));
}
