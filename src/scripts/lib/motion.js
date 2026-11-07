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

const subs = new Set();
let last = performance.now();
let started = false;

export function onFrame(fn) {
  subs.add(fn);
  start();
  return () => subs.delete(fn);
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
    subs.forEach((fn) => fn(dt, now));
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/** Debounced layout-refresh: parallax & pinned sections re-measure on this event. */
export function refreshLayout() {
  window.dispatchEvent(new CustomEvent('layout-refresh'));
}
