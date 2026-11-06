/* cursor.js — gold dot + ring cursor (fine pointers only). Grows on links, shows a label on [data-cursor="view"]. */
import { onFrame, reduced, finePointer, lerp } from './lib/motion.js';

export function initCursor() {
  const root = document.getElementById('cursor');
  if (!root || reduced || !finePointer) return;
  document.documentElement.classList.add('has-cursor');
  const dot = root.querySelector('.cursor__dot');
  const ring = root.querySelector('.cursor__ring');
  const label = document.getElementById('cursorLabel');
  let x = -100, y = -100, rx = -100, ry = -100;

  window.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
  window.addEventListener('pointerdown', () => root.classList.add('is-down'));
  window.addEventListener('pointerup', () => root.classList.remove('is-down'));
  document.addEventListener('mouseleave', () => (root.style.opacity = '0'));
  document.addEventListener('mouseenter', () => (root.style.opacity = ''));

  document.addEventListener('pointerover', (e) => {
    const view = e.target.closest?.('[data-cursor="view"]');
    const link = e.target.closest?.('a, button, .int, .xp__btn, input, [tabindex="0"]');
    root.classList.toggle('is-view', !!view);
    root.classList.toggle('is-link', !!link && !view);
    if (view) label.textContent = view.dataset.cursorLabel || 'View';
  });

  onFrame(() => {
    rx = lerp(rx, x, 0.16);
    ry = lerp(ry, y, 0.16);
    dot.style.transform = `translate3d(${x}px,${y}px,0)`;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
  });
}
