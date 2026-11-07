/* mode.js — day / night toggle. The initial mode is set by an inline script in <head> (no flash).
   Switching uses a circular View Transition from the button when supported, else a short colour cross-fade.
   Choice is saved to localStorage (wrapped in try/catch: it can throw in private windows). */
import { reduced } from './lib/motion.js';

export function initMode() {
  const root = document.documentElement;
  const btn = document.getElementById('modeToggle');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!btn) return;

  const apply = (mode) => {
    root.setAttribute('data-mode', mode);
    btn.setAttribute('aria-pressed', String(mode === 'day'));
    btn.setAttribute('aria-label', mode === 'day' ? 'Switch to night mode' : 'Switch to day mode');
    if (meta) meta.setAttribute('content', mode === 'day' ? '#f7f3ea' : '#15171a');
    document.dispatchEvent(new CustomEvent('modechange', { detail: mode }));
  };
  apply(root.getAttribute('data-mode') === 'day' ? 'day' : 'night');

  btn.addEventListener('click', (e) => {
    const next = root.getAttribute('data-mode') === 'day' ? 'night' : 'day';
    try { localStorage.setItem('mode', next); } catch (err) {}

    const r = btn.getBoundingClientRect();
    const x = e.clientX || r.left + r.width / 2;
    const y = e.clientY || r.top + r.height / 2;

    if (document.startViewTransition && !reduced) {
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const vt = document.startViewTransition(() => apply(next));
      vt.ready.then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 1000, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' }
        );
      }).catch(() => {});
    } else if (!reduced) {
      root.classList.add('mode-fade');
      apply(next);
      setTimeout(() => root.classList.remove('mode-fade'), 800);
    } else {
      apply(next);
    }
  });
}
