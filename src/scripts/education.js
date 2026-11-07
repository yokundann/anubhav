/* education.js — "The Reel", smooth edition.
   What used to switch on and off (active frame, playhead, readouts) is now continuous and damped:
   · every frame gets a focus value --f (0 → 1) that eases toward its target on every animation frame
   · the playhead position is damped, so the lit strip glides instead of stepping
   · the year / frame readouts are slot columns that slide to the right entry, not text that swaps
   All measurements are live (getBoundingClientRect), so it stays correct at any zoom or window size. */
import { onFrame, scroll, reduced, clamp, lerp } from './lib/motion.js';

const smooth = (t) => t * t * (3 - 2 * t);

/** Turn an element into a slot column listing `values`; returns a setter that glides to an index. */
function makeSlot(el, values) {
  if (!el) return () => {};
  el.classList.add('slot');
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<span class="slot__col" style="--i:0">${values.map((v) => `<span>${v}</span>`).join('')}</span>`;
  const col = el.firstElementChild;
  let cur = -1;
  return (i) => { if (i !== cur) { cur = i; col.style.setProperty('--i', i); } };
}

export function initEducation() {
  const tl = document.getElementById('timeline');
  if (!tl) return;
  const reel = tl.querySelector('.reel');
  const items = [...tl.querySelectorAll('.tl')];

  // Odometer digits: each digit is a 0-9-0-9 column that rolls one full lap to its value
  items.forEach((it) => {
    const y = it.querySelector('.tl__year');
    const txt = y.dataset.yearText || y.textContent.trim();
    const cols = [...txt].map((ch, k) => {
      const n = parseInt(ch, 10);
      if (Number.isNaN(n)) return `<span class="dg" aria-hidden="true">${ch}</span>`;
      const nums = Array.from({ length: 20 }, (_, i) => `<span>${i % 10}</span>`).join('');
      return `<span class="dg" aria-hidden="true"><span class="dg__col" style="--n:${n + 10};--k:${k}">${nums}</span></span>`;
    }).join('');
    y.innerHTML = `<span class="sr-only">${txt}</span>${cols}`;
    const wash = document.createElement('span');
    wash.className = 'tl__wash';
    wash.setAttribute('aria-hidden', 'true');
    it.prepend(wash);
  });

  // readouts
  const setYear = makeSlot(document.getElementById('reelYear'), items.map((i) => i.dataset.year));
  const setNo = makeSlot(document.getElementById('eduNo'), items.map((_, i) => String(i + 1).padStart(2, '0')));

  if (reduced) {
    items.forEach((i) => { i.classList.add('is-in'); i.style.setProperty('--f', '1'); });
    reel?.style.setProperty('--p', '1');
    return;
  }

  // entrance: wide rootMargin + threshold 0 so tall entries still trigger on small / zoomed viewports
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { threshold: 0, rootMargin: '0px 0px -12% 0px' });
  items.forEach((i) => io.observe(i));

  const F = items.map(() => 0);        // damped focus per frame
  let P = -1;                          // damped playhead progress
  let best = -1;

  onFrame((dt) => {
    const vh = scroll.vh;
    const r = tl.getBoundingClientRect();
    if (r.bottom < -120 || r.top > vh + 120) return;

    const line = vh * 0.55;
    const target = clamp((line - r.top) / Math.max(1, r.height));
    // frame-rate independent damping
    P = P < 0 ? target : lerp(P, target, 1 - Math.exp(-dt * 6.5));
    const roll = (-(scroll.smooth * 0.5) % 26).toFixed(2) + 'px';

    // continuous focus: closer to the playhead line = more "in frame" (all rects read first, writes deferred)
    let bi = 0, bf = -1;
    const upd = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const b = it.getBoundingClientRect();
      const d = Math.abs((b.top + b.bottom) / 2 - line) / (vh * 0.42);
      const tf = 1 - smooth(clamp(d));
      F[i] = lerp(F[i], tf, 1 - Math.exp(-dt * 5.5));
      if (Math.abs(F[i] - (it._f ?? -1)) > 0.004) { it._f = F[i]; upd.push([it, F[i].toFixed(2)]); }
      if (tf > bf) { bf = tf; bi = i; }
    }
    return () => {
      reel.style.setProperty('--p', P.toFixed(4));
      reel.style.setProperty('--roll', roll);       // sprocket strip advances with the smoothed scroll
      tl.classList.add('is-live');
      for (let k = 0; k < upd.length; k++) upd[k][0].style.setProperty('--f', upd[k][1]);
      if (bi !== best) {
        best = bi;
        items.forEach((it, i) => it.classList.toggle('is-active', i === bi));
        setYear(bi);
        setNo(bi);
      }
    };
  });
}
