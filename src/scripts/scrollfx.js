/* scrollfx.js — scroll-scrubbed effects: word-by-word text fill (About). The Education reel lives in education.js. */
import { onFrame, scroll, reduced, clamp } from './lib/motion.js';

export function initScrollFx() {
  // Scrubbed paragraph
  const lead = document.querySelector('[data-scrub]');
  let words = [];
  if (lead) {
    const label = lead.textContent.trim();
    lead.setAttribute('aria-label', label);
    const parts = label.split(/\s+/);
    lead.innerHTML = parts.map((w) => `<span class="sw" aria-hidden="true">${w}</span>`).join(' ');
    words = [...lead.querySelectorAll('.sw')];
    if (reduced) words.forEach((w) => w.classList.add('on'));
  }

  if (reduced) return;

  let n = 0, shown = -1;
  onFrame(() => {
    if ((n++ & 1) === 1) return;
    const vh = scroll.vh;
    if (lead) {
      const r = lead.getBoundingClientRect();
      if (r.bottom > -50 && r.top < vh + 50) {
        const p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.28));
        const on = Math.round(p * words.length);
        if (on === shown) return;
        shown = on;
        return () => words.forEach((w, i) => w.classList.toggle('on', i < on));
      }
    }
  });
}
