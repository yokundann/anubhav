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
  let tick = 0, liveSec = null, max = 1;
  // a mode switch changes every section's accent: force a re-read
  document.addEventListener('modechange', () => { liveSec = null; tick = 0; });

  onFrame(() => {
    const y = scroll.y;
    const doRead = (tick++ & 3) === 0;
    if (doRead) max = document.documentElement.scrollHeight - scroll.vh;   // layout read, throttled
    const p = max > 0 ? clamp(y / max) : 0;
    let tone = null, current = null, active = -1;
    if (doRead) {
      const probe = 38;
      // every section shares one tone per mode, so the header simply follows the mode
      tone = root.getAttribute('data-mode') === 'day' ? 'light' : 'dark';
      themed.forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) current = s;
      });
      const line = scroll.vh * 0.4;
      spy.forEach((sec, i) => { if (sec && sec.getBoundingClientRect().top <= line) active = i; });
      const lastSec = spy[spy.length - 1];
      if (lastSec && lastSec.getBoundingClientRect().bottom < line) active = -1;
    }
    return () => {
      bar.style.transform = `scaleX(${p.toFixed(4)})`;
      toTopBar.style.strokeDashoffset = String(RING * (1 - p));
      toTop.classList.toggle('is-visible', y > scroll.vh * 0.9);
      header.classList.toggle('is-stuck', y > 24);
      if (!doRead) return;
      if (header.dataset.tone !== tone) header.dataset.tone = tone;
      // Progress bar, cursor, logo dot and header hover states take on the accent of the section in view.
      if (current && current !== liveSec) {
        liveSec = current;
        const c = getComputedStyle(current).getPropertyValue('--accent').trim();
        if (c) root.style.setProperty('--live-accent', c);
      }
      links.forEach((a, i) => a.classList.toggle('is-active', i === active));
    };
  });
}
