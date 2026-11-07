/* work.js — pins the Work section and maps vertical scroll to a horizontal film strip.
   Falls back to a stacked layout on small screens / reduced motion (CSS handles it). */
import { onFrame, scroll, clamp, lerp, refreshLayout, reduced } from './lib/motion.js';

export function initWork() {
  const section = document.getElementById('work');
  const pin = document.getElementById('workPin');
  const track = document.getElementById('workTrack');
  if (!section || !pin || !track) return;
  const count = document.getElementById('workCount');
  const bar = document.getElementById('workBar');
  const filmEls = [...track.querySelectorAll('.film')];
  const films = filmEls.length;
  const mq = window.matchMedia('(min-width: 761px) and (min-height: 420px)');

  let enabled = false, dist = 0, top = 0;

  function setup() {
    const want = mq.matches && !reduced;
    section.classList.toggle('is-pinned', want);
    track.style.transform = '';
    pin.style.height = '';
    filmEls.forEach((f) => f.style.removeProperty('--in'));
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

  const later = () => { clearTimeout(setup._t); setup._t = setTimeout(setup, 150); };
  mq.addEventListener('change', setup);
  window.addEventListener('resize', later);
  window.visualViewport?.addEventListener('resize', later);   // browser zoom / pinch zoom
  window.addEventListener('orientationchange', later);
  window.addEventListener('load', setup);
  document.fonts?.ready.then(setup);
  // anything above the pin changing height (lazy images, fonts, accordion, zoom) shifts its page position: re-measure
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => { if (enabled) { top = pin.getBoundingClientRect().top + window.scrollY; } });
    ro.observe(document.body);
    ro.observe(track);
  }
  setup();

  let tick = 0, sk = 0;
  onFrame(() => {
    if (!enabled || !dist) return;
    sk = lerp(sk, clamp(-scroll.vel / 520, -3.2, 3.2), 0.08);
    track.style.setProperty('--sk', sk.toFixed(2));
    // cheap self-correction every ~0.5s so the pin never drifts out of sync with the page
    if ((tick++ % 30) === 0) {
      const t = pin.getBoundingClientRect().top + window.scrollY;
      const d = Math.max(0, track.scrollWidth - window.innerWidth);
      if (Math.abs(t - top) > 1) top = t;
      if (Math.abs(d - dist) > 1) { dist = d; pin.style.height = `${dist + window.innerHeight}px`; }
    }
    const p = clamp((scroll.smooth - top) / dist);
    track.style.transform = `translate3d(${(-p * dist).toFixed(1)}px,0,0)`;
    bar.style.transform = `scaleX(${p.toFixed(4)})`;
    // Each film unmasks as it travels in from the right edge (--in: 0 → 1). Reads 3 rects per frame; cheap.
    const vw = scroll.vw;
    filmEls.forEach((f) => {
      const x = f.getBoundingClientRect().left;
      const t = clamp((vw * 0.96 - x) / (vw * 0.42));
      const v = (1 - Math.pow(1 - t, 3)).toFixed(3);
      if (f._in !== v) { f._in = v; f.style.setProperty('--in', v); }
    });
    const idx = Math.min(films, Math.max(1, Math.floor(p * films) + 1));
    const label = String(idx).padStart(2, '0');
    if (count.textContent !== label) count.textContent = label;
  });
}
