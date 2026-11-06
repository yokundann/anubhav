/* work.js — pins the Work section and maps vertical scroll to a horizontal film strip.
   Falls back to a stacked layout on small screens / reduced motion (CSS handles it). */
import { onFrame, scroll, clamp, refreshLayout, reduced } from './lib/motion.js';

export function initWork() {
  const section = document.getElementById('work');
  const pin = document.getElementById('workPin');
  const track = document.getElementById('workTrack');
  if (!section || !pin || !track) return;
  const count = document.getElementById('workCount');
  const bar = document.getElementById('workBar');
  const films = track.querySelectorAll('.film').length;
  const mq = window.matchMedia('(min-width: 901px) and (min-height: 560px)');

  let enabled = false, dist = 0, top = 0;

  function setup() {
    const want = mq.matches && !reduced;
    section.classList.toggle('is-pinned', want);
    track.style.transform = '';
    pin.style.height = '';
    enabled = want;
    if (!want) { refreshLayout(); return; }
    // measure after layout switch
    requestAnimationFrame(() => {
      dist = Math.max(0, track.scrollWidth - window.innerWidth);
      pin.style.height = `${dist + window.innerHeight}px`;
      top = pin.getBoundingClientRect().top + window.scrollY;
      refreshLayout();
    });
  }

  mq.addEventListener('change', setup);
  window.addEventListener('resize', () => { clearTimeout(setup._t); setup._t = setTimeout(setup, 150); });
  window.addEventListener('load', setup);
  document.fonts?.ready.then(setup);
  setup();

  onFrame(() => {
    if (!enabled || !dist) return;
    const p = clamp((scroll.smooth - top) / dist);
    track.style.transform = `translate3d(${(-p * dist).toFixed(1)}px,0,0)`;
    bar.style.transform = `scaleX(${p.toFixed(4)})`;
    const idx = Math.min(films, Math.max(1, Math.floor(p * films) + 1));
    const label = String(idx).padStart(2, '0');
    if (count.textContent !== label) count.textContent = label;
  });
}
