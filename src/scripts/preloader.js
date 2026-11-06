/* preloader.js — gold counter + split curtain. Emits html.is-ready when the curtain opens. */
import { reduced } from './lib/motion.js';

export function initPreloader() {
  const root = document.documentElement;
  const el = document.getElementById('preloader');
  const num = document.getElementById('preCount');
  const bar = document.getElementById('preBar');

  const ready = () => {
    if (root.classList.contains('is-ready')) return;
    root.classList.add('is-ready');
    document.dispatchEvent(new CustomEvent('intro-ready'));
  };

  if (!el || reduced) {
    el?.classList.add('is-gone');
    ready();
    return;
  }

  const seen = sessionStorage.getItem('intro-seen') === '1';
  const DURATION = seen ? 800 : 2000; // counter length (ms)
  document.body.classList.add('is-locked');
  const t0 = performance.now();
  let loaded = document.readyState === 'complete';
  window.addEventListener('load', () => (loaded = true), { once: true });

  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const step = (now) => {
    let t = Math.min(1, (now - t0) / DURATION);
    let v = ease(t) * 100;
    if (!loaded && v > 92) v = 92 + (v - 92) * 0.1; // hold near the end until assets are ready
    num.textContent = String(Math.floor(v)).padStart(3, '0');
    bar.style.transform = `scaleX(${v / 100})`;
    if (t < 1 || !loaded) {
      requestAnimationFrame(step);
      return;
    }
    num.textContent = '100';
    bar.style.transform = 'scaleX(1)';
    setTimeout(() => {
      el.classList.add('is-done');
      setTimeout(ready, 450);
      setTimeout(() => {
        el.classList.add('is-gone');
        document.body.classList.remove('is-locked');
        sessionStorage.setItem('intro-seen', '1');
      }, 1250);
    }, 250);
  };
  requestAnimationFrame(step);

  // Safety net: never trap the visitor behind the curtain
  setTimeout(() => { ready(); el.classList.add('is-done'); setTimeout(() => { el.classList.add('is-gone'); document.body.classList.remove('is-locked'); }, 1200); }, 7000);
}
