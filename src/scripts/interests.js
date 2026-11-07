/* interests.js — links the index to the stage: hover / focus picks a motif; otherwise the row nearest the
   middle of the viewport is "on". Live measurements only, so it is zoom-safe. */
import { onFrame, scroll, reduced } from './lib/motion.js';

export function initInterests() {
  const list = document.querySelector('.int-list');
  const stage = document.querySelector('.int-stage');
  if (!list || !stage) return;
  const rows = [...list.querySelectorAll('.int')];
  const arts = [...stage.querySelectorAll('.art')];
  const no = document.getElementById('intNo');
  const name = document.getElementById('intName');
  let cur = -1, hover = false, n = 0;

  const set = (i) => {
    if (i === cur) return;
    cur = i;
    rows.forEach((r, k) => r.classList.toggle('is-on', k === i));
    arts.forEach((a) => a.classList.toggle('is-on', a.dataset.k === rows[i].dataset.k));
    stage.classList.add('is-swap');
    setTimeout(() => {
      no.textContent = String(i + 1).padStart(2, '0');
      name.textContent = rows[i].querySelector('.int__word').textContent;
      stage.classList.remove('is-swap');
    }, 200);
  };

  rows.forEach((r, i) => {
    r.addEventListener('pointerenter', (e) => { if (e.pointerType === 'touch') return; hover = true; set(i); });
    r.addEventListener('focus', () => { hover = true; set(i); });
    r.addEventListener('blur', () => { hover = false; });
  });
  list.addEventListener('pointerleave', () => { hover = false; });

  if (reduced) { set(0); return; }
  set(0);
  onFrame(() => {
    if (hover || (n++ & 3) !== 0) return;
    const lr = list.getBoundingClientRect();
    if (lr.bottom < 0 || lr.top > scroll.vh) return;
    const mid = scroll.vh * 0.5;
    let best = 0, bd = Infinity;
    rows.forEach((r, i) => {
      const b = r.getBoundingClientRect();
      const d = Math.abs((b.top + b.bottom) / 2 - mid);
      if (d < bd) { bd = d; best = i; }
    });
    set(best);
  });
}
