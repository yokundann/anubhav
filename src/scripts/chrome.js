/* chrome.js — sticky header (always visible; gains a blurred backing once scrolled), day/night tone, scroll progress,
   back-to-top ring and nav scroll-spy. */
import { onFrame, scroll, clamp } from './lib/motion.js';

export function initChrome() {
  const header = document.getElementById('header');
  const bar = document.getElementById('progressBar');
  const toTop = document.getElementById('toTop');
  const toTopBar = document.getElementById('toTopBar');
  const links = [...document.querySelectorAll('.nav a')];
  const spy = links.map((a) => document.querySelector(a.getAttribute('href')));
  const themed = [...document.querySelectorAll('main [data-theme], footer[data-theme]')];
  const RING = 163.4;
  const root = document.documentElement;
  let tick = 0, liveSec = null;
  // a mode switch changes every section's accent: force a re-read
  document.addEventListener('modechange', () => { liveSec = null; tick = 0; });

  onFrame(() => {
    const y = scroll.y;
    const max = document.documentElement.scrollHeight - scroll.vh;
    const p = max > 0 ? clamp(y / max) : 0;
    bar.style.transform = `scaleX(${p.toFixed(4)})`;
    toTopBar.style.strokeDashoffset = String(RING * (1 - p));
    toTop.classList.toggle('is-visible', y > scroll.vh * 0.9);

    header.classList.toggle('is-stuck', y > 24);


    // throttled DOM reads: tone + spy
    if ((tick++ & 3) === 0) {
      const probe = 38;
      // every section shares one tone per mode, so the header simply follows the mode
      const tone = root.getAttribute('data-mode') === 'day' ? 'light' : 'dark';
      let current = null;
      themed.forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) current = s;
      });
      if (header.dataset.tone !== tone) header.dataset.tone = tone;

      // Progress bar, cursor, logo dot and header hover states take on the accent of the section in view.
      // On light sections --accent is already an ink tone with enough contrast.
      if (current && current !== liveSec) {
        liveSec = current;
        const cs = getComputedStyle(current);
        const c = cs.getPropertyValue('--accent').trim();
        if (c) root.style.setProperty('--live-accent', c);
      }

      const line = scroll.vh * 0.4;
      let active = -1;
      spy.forEach((sec, i) => { if (sec && sec.getBoundingClientRect().top <= line) active = i; });
      const lastSec = spy[spy.length - 1];
      if (lastSec && lastSec.getBoundingClientRect().bottom < line) active = -1;
      links.forEach((a, i) => a.classList.toggle('is-active', i === active));
    }
  });
}
