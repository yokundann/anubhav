/* hero.js — pointer-follow gold light in hero and contact. */
import { onFrame, reduced, finePointer, lerp } from './lib/motion.js';

function follow(section, light, varX, varY, startX = 0.7, startY = 0.3) {
  if (!section || !light) return;
  let tx = startX, ty = startY, cx = startX, cy = startY, active = false;
  section.addEventListener('pointermove', (e) => {
    const r = section.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width;
    ty = (e.clientY - r.top) / r.height;
  }, { passive: true });
  new IntersectionObserver(([en]) => (active = en.isIntersecting)).observe(section);
  onFrame(() => {
    if (!active) return;
    cx = lerp(cx, tx, 0.07);
    cy = lerp(cy, ty, 0.07);
    light.style.setProperty(varX, (cx * 100).toFixed(2) + '%');
    light.style.setProperty(varY, (cy * 100).toFixed(2) + '%');
  });
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
  });
}

export function initHero() {
  if (!reduced) timecode();
  if (reduced || !finePointer) return;
  follow(document.getElementById('home'), document.getElementById('heroSpot'), '--mx', '--my', 0.7, 0.3);
  follow(document.getElementById('contact'), document.getElementById('contactGlow'), '--gx', '--gy', 0.5, 0.4);
}
