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

export function initHero() {
  if (reduced || !finePointer) return;
  follow(document.getElementById('home'), document.getElementById('heroSpot'), '--mx', '--my', 0.7, 0.3);
  follow(document.getElementById('contact'), document.getElementById('contactGlow'), '--gx', '--gy', 0.5, 0.4);
}
