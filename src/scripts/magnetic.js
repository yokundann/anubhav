/* magnetic.js — buttons lean toward the pointer. Strength: data-magnetic="0.3".
   Position is eased every frame (lerp) so it glides instead of tracking the pointer 1:1. */
import { reduced, finePointer } from './lib/motion.js';

export function initMagnetic() {
  if (reduced || !finePointer) return;
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const k = parseFloat(el.dataset.magnetic) || 0.3;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const loop = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      el.style.transform = Math.abs(x) + Math.abs(y) < 0.05 && !tx && !ty ? '' : `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.05 ? requestAnimationFrame(loop) : 0;
      if (!raf && !tx && !ty) el.style.transform = '';
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      // use the un-shifted centre so the target doesn't chase itself
      const cx = r.left + r.width / 2 - x, cy = r.top + r.height / 2 - y;
      tx = (e.clientX - cx) * k;
      ty = (e.clientY - cy) * k;
      kick();
    });
    el.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
  });
}
