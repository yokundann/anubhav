/* magnetic.js — buttons lean toward the pointer. Strength: data-magnetic="0.3". */
import { reduced, finePointer } from './lib/motion.js';

export function initMagnetic() {
  if (reduced || !finePointer) return;
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const k = parseFloat(el.dataset.magnetic) || 0.3;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${(dx * k).toFixed(1)}px, ${(dy * k).toFixed(1)}px)`;
    });
    el.addEventListener('pointerleave', () => (el.style.transform = ''));
  });
}
