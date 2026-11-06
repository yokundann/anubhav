/* scrollfx.js — scroll-scrubbed effects: word-by-word text fill (About) and timeline line (Education). */
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

  const timeline = document.getElementById('timeline');
  const fill = document.getElementById('timelineFill');
  if (reduced && fill) fill.style.transform = 'scaleY(1)';
  if (reduced) return;

  let n = 0;
  onFrame(() => {
    if ((n++ & 1) === 1) return;
    const vh = scroll.vh;
    if (lead) {
      const r = lead.getBoundingClientRect();
      if (r.bottom > -50 && r.top < vh + 50) {
        const p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.28));
        const on = Math.round(p * words.length);
        words.forEach((w, i) => w.classList.toggle('on', i < on));
      }
    }
    if (timeline && fill) {
      const r = timeline.getBoundingClientRect();
      if (r.bottom > -50 && r.top < vh + 50) {
        fill.style.transform = `scaleY(${clamp((vh * 0.62 - r.top) / r.height).toFixed(4)})`;
      }
    }
  });
}
