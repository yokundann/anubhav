/* preloader.js — name + counter intro. Emits html.is-ready when the curtain opens.
   The counter is a continuously eased value (never jumps), and the name — set in outlined letters — fills in
   letter by letter as that value climbs. Tune: DURATION (ms), SMOOTH (ms, larger = softer), HOLD (ms at 100%). */
import { reduced } from './lib/motion.js';

export function initPreloader() {
  const root = document.documentElement;
  const el = document.getElementById('preloader');
  const num = document.getElementById('preCount');
  const bar = document.getElementById('preBar');
  const name = document.getElementById('preName');

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

  let seen = false;
  try { seen = sessionStorage.getItem('intro-seen') === '1'; } catch (e) {}
  const DURATION = seen ? 1500 : 3400;
  const SMOOTH = 170;
  const HOLD = seen ? 250 : 650;
  document.body.classList.add('is-locked');

  // split the name into letters (the preloader is aria-hidden, so this costs no accessibility)
  const letters = [];
  name?.querySelectorAll('.preloader__word').forEach((w) => {
    const txt = w.textContent;
    w.textContent = '';
    [...txt].forEach((ch) => {
      const s = document.createElement('span');
      s.className = 'l';
      s.textContent = ch;
      w.appendChild(s);
      letters.push(s);
    });
  });
  const n = letters.length;

  let loaded = document.readyState === 'complete';
  window.addEventListener('load', () => (loaded = true), { once: true });

  const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const t0 = performance.now();
  let last = t0, v = 0, lit = 0, finished = false;

  const finish = () => {
    finished = true;
    num.textContent = '100';
    bar.style.transform = 'scaleX(1)';
    letters.forEach((l) => l.classList.add('on'));
    setTimeout(() => {
      el.classList.add('is-done');
      setTimeout(ready, 500);
      setTimeout(() => {
        el.classList.add('is-gone');
        document.body.classList.remove('is-locked');
        try { sessionStorage.setItem('intro-seen', '1'); } catch (e) {}
      }, 1400);
    }, HOLD);
  };

  const step = (now) => {
    const dt = Math.min(64, now - last);
    last = now;
    const t = Math.min(1, (now - t0) / DURATION);
    let target = inOut(t) * 100;
    if (!loaded) target = Math.min(target, 94); // wait for assets near the end
    v += (target - v) * (1 - Math.exp(-dt / SMOOTH)); // exponential smoothing: no steps, no stalls
    if (t >= 1 && loaded && v > 99.4) { finish(); return; }

    num.textContent = String(Math.floor(v)).padStart(3, '0');
    bar.style.transform = `scaleX(${(v / 100).toFixed(4)})`;
    const want = Math.floor((v / 99) * n);
    while (lit < want && lit < n) letters[lit++].classList.add('on');
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);

  // Safety net: never trap the visitor behind the curtain
  setTimeout(() => {
    if (finished) return;
    ready();
    el.classList.add('is-done');
    setTimeout(() => { el.classList.add('is-gone'); document.body.classList.remove('is-locked'); }, 1200);
  }, 8000);
}
