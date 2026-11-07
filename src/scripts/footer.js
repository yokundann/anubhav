/* footer.js — the end credits.
   · fits the giant outlined name to the footer width at any zoom (never cropped)
   · a "flashlight" follows the pointer across the name and fills it with gold; with no pointer (touch / idle) it sweeps by itself
   · closing credits roll on a letterboxed screen (seamless loop, pauses on hover)
   · live Kathmandu clock, projector beam that leans toward the pointer */
import { onFrame, reduced, finePointer, lerp } from './lib/motion.js';

export function initFooter() {
  const footer = document.getElementById('footer');
  if (!footer) return;

  /* ── fit the name ── */
  const mark = document.getElementById('footerMark');
  const lit = document.getElementById('footerMarkLit');
  const wrap = document.getElementById('footerMarkWrap');
  if (mark && wrap) {
    const span = mark.firstElementChild;
    let last = 0;
    const fit = () => {
      const avail = wrap.clientWidth * 0.97;
      if (!avail) return;
      mark.style.fontSize = '100px';
      const natural = span.offsetWidth;
      if (!natural) return;
      last = Math.max(24, Math.min(320, (100 * avail) / natural));
      const px = last.toFixed(2) + 'px';
      mark.style.fontSize = px;
      if (lit) lit.style.fontSize = px;
    };
    fit();
    document.fonts?.ready.then(fit);
    window.addEventListener('load', fit);
    window.addEventListener('resize', fit);
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(wrap);
  }

  /* ── closing credits: duplicate the list once so the roll loops without a jump ── */
  const credits = document.getElementById('credits');
  if (credits && !credits.dataset.cloned) {
    credits.dataset.cloned = '1';
    const originals = [...credits.children];
    originals.forEach((li) => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); credits.appendChild(c); });
    // roll speed follows the content height so it always reads at the same pace
    const setSpeed = () => {
      const half = credits.scrollHeight / 2;
      credits.style.setProperty('--roll-dur', Math.max(30, half / 38).toFixed(1) + 's');
    };
    setSpeed();
    document.fonts?.ready.then(setSpeed);
    window.addEventListener('resize', setSpeed);
  }

  /* ── Kathmandu clock ── */
  const clock = document.querySelector('#npClock b');
  if (clock) {
    let fmt;
    try { fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit', hour12: false }); } catch (e) { fmt = null; }
    const tick = () => { clock.textContent = fmt ? fmt.format(new Date()) : '--:--'; };
    tick();
    setInterval(tick, 15000);
  }

  if (reduced) { footer.classList.add('is-still'); return; }

  /* ── screen timecode (counts while the screen is in view) ── */
  const tc = document.getElementById('screenTc');
  const screen = document.getElementById('screen');
  let secs = 0, screenIn = false;
  if (screen) new IntersectionObserver(([e]) => (screenIn = e.isIntersecting)).observe(screen);
  const pad = (n) => String(n).padStart(2, '0');
  let tcAcc = 0;

  /* ── flashlight + beam ── */
  let inView = false;
  new IntersectionObserver(([e]) => (inView = e.isIntersecting), { rootMargin: '120px' }).observe(footer);
  let px = null, py = null, touched = false, idle = 0, t = 0;
  let lx = 0.5, ly = 0.5, bx = 0;
  const onMove = (e) => {
    const r = wrap.getBoundingClientRect();
    px = (e.clientX - r.left) / r.width;
    py = (e.clientY - r.top) / r.height;
    idle = 0; touched = true;
    footer.classList.add('is-lit');
    const fr = footer.getBoundingClientRect();
    bx = ((e.clientX - fr.left) / fr.width - 0.5);
  };
  if (finePointer) footer.addEventListener('pointermove', onMove, { passive: true });
  footer.addEventListener('pointerleave', () => { px = null; });

  onFrame((dt) => {
    if (!inView) return;
    t += dt; idle += dt;
    // target: pointer if present, else a slow automatic sweep (so touch / idle visitors still see it)
    let tx, ty;
    if (px !== null && idle < 4) { tx = px; ty = py; }
    else { tx = 0.5 + Math.sin(t * 0.55) * 0.46; ty = 0.5 + Math.sin(t * 0.9 + 1) * 0.22; }
    lx = lerp(lx, tx, 1 - Math.exp(-dt * 5));
    ly = lerp(ly, ty, 1 - Math.exp(-dt * 5));
    wrap.style.setProperty('--lx', (lx * 100).toFixed(2) + '%');
    wrap.style.setProperty('--ly', (ly * 100).toFixed(2) + '%');
    footer.style.setProperty('--lean', (lerp(parseFloat(footer.style.getPropertyValue('--lean')) || 0, bx * 14, 1 - Math.exp(-dt * 3))).toFixed(2) + 'deg');

    if (screenIn && tc) {
      tcAcc += dt;
      if (tcAcc >= 1) { tcAcc -= 1; secs++; tc.textContent = `${pad(Math.floor(secs / 3600))}:${pad(Math.floor(secs / 60) % 60)}:${pad(secs % 60)}`; }
    }
  });
}
