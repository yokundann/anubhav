/* marquee.js — infinite text bands that speed up and skew with scroll velocity.
   Direction: data-marquee="-1" (left) or "1" (right). Base speed: BASE px/s. */
import { onFrame, reduced, scroll, clamp } from './lib/motion.js';

const BASE = 55;

export function initMarquee() {
  document.querySelectorAll('[data-marquee]').forEach((root) => {
    const track = root.querySelector('.marquee__track');
    const row = track?.querySelector('.marquee__row');
    if (!track || !row) return;
    const dir = parseFloat(root.dataset.marquee) || -1;

    // Clone the row enough times to cover 2× viewport
    const fill = () => {
      track.querySelectorAll('[data-clone]').forEach((c) => c.remove());
      const need = Math.ceil((window.innerWidth * 2) / Math.max(1, row.offsetWidth));
      for (let i = 0; i < need; i++) {
        const c = row.cloneNode(true);
        c.dataset.clone = '1';
        c.setAttribute('aria-hidden', 'true');
        track.appendChild(c);
      }
    };
    fill();
    window.addEventListener('resize', fill);
    document.fonts?.ready.then(fill);

    if (reduced) return;
    let x = 0, visible = false, w = 1;
    const measure = () => { w = row.offsetWidth || 1; };
    measure(); window.addEventListener('resize', measure); document.fonts?.ready.then(measure);
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(root);
    onFrame((dt) => {
      if (!visible) return;
      const boost = clamp(Math.abs(scroll.vel) / 1200, 0, 3.5);
      x += dir * (BASE + boost * BASE * 2.2) * dt * (scroll.dir < 0 && boost > 0.15 ? -0.6 : 1);
      if (x <= -w) x += w;
      if (x > 0) x -= w;
      const skew = clamp(-scroll.vel * 0.0035, -9, 9);
      track.style.transform = `translate3d(${x.toFixed(2)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
    }, 'late');
  });
}
