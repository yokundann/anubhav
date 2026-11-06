/* chrome.js — header behaviour (stuck / hide-on-scroll / light-dark tone), scroll progress,
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
  let lastY = 0, hideAcc = 0, tick = 0;

  onFrame(() => {
    const y = scroll.y;
    const max = document.documentElement.scrollHeight - scroll.vh;
    const p = max > 0 ? clamp(y / max) : 0;
    bar.style.transform = `scaleX(${p.toFixed(4)})`;
    toTopBar.style.strokeDashoffset = String(RING * (1 - p));
    toTop.classList.toggle('is-visible', y > scroll.vh * 0.9);

    header.classList.toggle('is-stuck', y > 24);

    // hide on scroll down, reveal on scroll up
    const dy = y - lastY;
    lastY = y;
    hideAcc = clamp(hideAcc + dy, -60, 80) ;
    const menuOpen = document.getElementById('menu')?.getAttribute('aria-hidden') === 'false';
    if (y < 160 || menuOpen) header.classList.remove('is-hidden');
    else if (hideAcc > 60) header.classList.add('is-hidden');
    else if (hideAcc < -30) header.classList.remove('is-hidden');

    // throttled DOM reads: tone + spy
    if ((tick++ & 3) === 0) {
      const probe = 38;
      let tone = 'dark';
      themed.forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) tone = s.dataset.theme;
      });
      if (header.dataset.tone !== tone) header.dataset.tone = tone;

      const line = scroll.vh * 0.4;
      let active = -1;
      spy.forEach((sec, i) => { if (sec && sec.getBoundingClientRect().top <= line) active = i; });
      const lastSec = spy[spy.length - 1];
      if (lastSec && lastSec.getBoundingClientRect().bottom < line) active = -1;
      links.forEach((a, i) => a.classList.toggle('is-active', i === active));
    }
  });
}
