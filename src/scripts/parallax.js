/* parallax.js — depth on scroll.
   [data-parallax="0.06"]       element drifts vertically (positive = slower than page)
   [data-img-parallax="0.08"]   image drifts inside its mask (.frame) */
import { onFrame, reduced, scroll, clamp } from './lib/motion.js';

export function initParallax() {
  if (reduced) return;
  const layers = [...document.querySelectorAll('[data-parallax]')].map((el) => ({ el, f: parseFloat(el.dataset.parallax) || 0, base: 0, ty: 0 }));
  const imgs = [...document.querySelectorAll('[data-img-parallax]')].map((el) => ({ el, f: parseFloat(el.dataset.imgParallax) || 0.08, frame: el.closest('.frame') || el.parentElement }));
  const hero = document.getElementById('home');
  const name = document.querySelector('.hero__name');

  function measure() {
    layers.forEach((l) => {
      const r = l.el.getBoundingClientRect();
      l.base = r.top + window.scrollY + r.height / 2 - l.ty;
    });
  }
  window.addEventListener('layout-refresh', measure);
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  measure();
  document.fonts?.ready.then(measure);
  if ('ResizeObserver' in window) { let t; new ResizeObserver(() => { clearTimeout(t); t = setTimeout(measure, 120); }).observe(document.body); }

  onFrame(() => {
    const vh = scroll.vh;
    // read phase: all geometry first
    const imgOut = [];
    for (let k = 0; k < imgs.length; k++) {
      const i = imgs[k];
      const r = i.frame.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) continue;
      const p = clamp(((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2), -1, 1);
      imgOut.push([i.el, (-p * r.height * i.f).toFixed(1)]);
    }
    const sm = scroll.smooth;
    // write phase
    return () => {
      for (let k = 0; k < layers.length; k++) {
        const l = layers[k];
        const centerOffset = l.base - sm - vh / 2;
        if (Math.abs(centerOffset) > vh * 1.6) continue;
        l.ty = -centerOffset * l.f;
        l.el.style.translate = `0 ${l.ty.toFixed(1)}px`;
      }
      for (let k = 0; k < imgOut.length; k++) imgOut[k][0].style.translate = `0 ${imgOut[k][1]}px`;
      // Hero name drifts down and softens as you leave the hero
      if (hero && name && sm < vh * 1.2) {
        name.style.translate = `0 ${(sm * 0.16).toFixed(1)}px`;
        name.style.opacity = String(clamp(1 - sm / (vh * 0.9), 0.1, 1).toFixed(3));
      }
    };
  });
}
