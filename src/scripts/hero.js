/* hero.js — pointer-follow gold light in hero and contact. */
import { onFrame, reduced, finePointer, lerp } from './lib/motion.js';

/* The glow is a small element that is moved with `translate`, not a section-sized gradient that is repainted:
   same look, but only compositing work per frame. Offsets are written in px (--tx / --ty). */
function follow(section, light, startX = 0.7, startY = 0.3) {
  if (!section || !light) return;
  let tx = startX, ty = startY, cx = startX, cy = startY, active = false, w = 1, h = 1, lastX = '', lastY = '';
  const size = () => { w = section.offsetWidth; h = section.offsetHeight; };
  size();
  window.addEventListener('resize', size);
  window.addEventListener('layout-refresh', size);
  section.addEventListener('pointermove', (e) => {
    const r = section.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width;
    ty = (e.clientY - r.top) / r.height;
  }, { passive: true });
  new IntersectionObserver(([en]) => { active = en.isIntersecting; if (active) size(); }).observe(section);
  light.style.setProperty('--tx', (cx * w).toFixed(0) + 'px');
  light.style.setProperty('--ty', (cy * h).toFixed(0) + 'px');
  onFrame(() => {
    if (!active) return;
    cx = lerp(cx, tx, 0.07);
    cy = lerp(cy, ty, 0.07);
    const X = (cx * w).toFixed(0) + 'px', Y = (cy * h).toFixed(0) + 'px';
    if (X === lastX && Y === lastY) return;     // settled: no writes at all
    lastX = X; lastY = Y;
    light.style.setProperty('--tx', X);
    light.style.setProperty('--ty', Y);
  }, 'late');
}

function timecode() {
  const el = document.getElementById('hudTc');
  if (!el) return;
  const t0 = performance.now();
  const pad = (n) => String(n).padStart(2, '0');
  let last = -1;
  onFrame((dt, now) => {
    const f = Math.floor(((now - t0) / 1000) * 24);   // 24 fps timecode
    if (f === last) return;
    last = f;
    el.textContent = `${pad(Math.floor(f / 86400) % 100)}:${pad(Math.floor(f / 1440) % 60)}:${pad(Math.floor(f / 24) % 60)}:${pad(f % 24)}`;
  }, 'late');
}

export function initHero() {
  if (!reduced) timecode();
  if (reduced || !finePointer) return;
  follow(document.getElementById('home'), document.getElementById('heroSpot'), 0.7, 0.3);
  follow(document.getElementById('contact'), document.getElementById('contactGlow'), 0.5, 0.4);
}
