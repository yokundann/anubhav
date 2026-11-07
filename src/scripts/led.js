/* led.js — seven-segment LED counters for the hero stats.
   Boot sequence (the "loading animation"): every segment flashes on like a display powering up, the digits
   scramble, then count up to their value and settle with a glow pulse. Starts once the intro curtain has opened
   AND the panel is on screen. Reduced motion: shows the final value immediately. */
import { reduced } from './lib/motion.js';

const SEG = {
  a: '14,5 46,5 52,11 46,17 14,17 8,11',
  b: '52,15 58,21 58,41 52,47 46,41 46,21',
  c: '52,53 58,59 58,79 52,85 46,79 46,59',
  d: '14,83 46,83 52,89 46,95 14,95 8,89',
  e: '8,53 14,59 14,79 8,85 2,79 2,59',
  f: '8,15 14,21 14,41 8,47 2,41 2,21',
  g: '14,44 46,44 52,50 46,56 14,56 8,50',
};
const MAP = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };

const cellSvg = () =>
  `<svg class="led__d" viewBox="0 0 60 100" aria-hidden="true">${Object.entries(SEG).map(([k, pts]) => `<polygon data-s="${k}" points="${pts}"/>`).join('')}</svg>`;

export function initLed() {
  const els = [...document.querySelectorAll('[data-led]')];
  if (!els.length) return;
  const panel = document.querySelector('.stats');

  const displays = els.map((el) => {
    const target = parseInt(el.dataset.led, 10);
    const from = parseInt(el.dataset.from ?? '0', 10);
    const cells = parseInt(el.dataset.cells ?? String(String(target).length), 10);
    el.innerHTML = Array.from({ length: cells }, cellSvg).join('');
    const svgs = [...el.querySelectorAll('.led__d')];
    const show = (str) => {
      const chars = str.padStart(cells, ' ').split('');
      svgs.forEach((svg, i) => {
        const on = MAP[chars[i]] || '';
        svg.querySelectorAll('polygon').forEach((p) => p.classList.toggle('on', on.includes(p.dataset.s)));
      });
    };
    return { el, target, from, cells, show };
  });

  const final = () => displays.forEach((d) => d.show(String(d.target)));
  const blank = () => displays.forEach((d) => d.show(''));
  final(); // a readable value even if scripts later fail or motion is reduced
  if (reduced) return;
  blank();

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const ease = (t) => 1 - Math.pow(1 - t, 4);

  async function boot() {
    panel?.classList.add('is-booting');
    // 1. power-on flicker: all segments
    for (const on of [1, 0, 1, 0, 1]) {
      displays.forEach((d) => d.show(on ? '8'.repeat(d.cells) : ''));
      await sleep(on ? 110 : 70);
    }
    // 2. scramble, each display resolves left to right at its own moment
    const t0 = performance.now();
    await new Promise((resolve) => {
      const step = (now) => {
        const t = now - t0;
        let done = true;
        displays.forEach((d, i) => {
          const settleAt = 700 + i * 260;
          if (t < settleAt) {
            done = false;
            d.show(Array.from({ length: d.cells }, () => Math.floor(Math.random() * 10)).join(''));
          }
        });
        if (done) resolve(); else setTimeout(() => requestAnimationFrame(step), 55);
      };
      requestAnimationFrame(step);
    });
    // 3. count up
    const c0 = performance.now();
    await new Promise((resolve) => {
      const step = (now) => {
        const t = Math.min(1, (now - c0) / 1500);
        displays.forEach((d) => d.show(String(Math.round(d.from + (d.target - d.from) * ease(t)))));
        if (t < 1) requestAnimationFrame(step); else resolve();
      };
      requestAnimationFrame(step);
    });
    final();
    panel?.classList.remove('is-booting');
    panel?.classList.add('is-live');
  }

  // start when the intro curtain is open and the panel is visible
  let ready = document.documentElement.classList.contains('is-ready'), visible = false, started = false;
  const go = () => { if (ready && visible && !started) { started = true; setTimeout(boot, 350); } };
  document.addEventListener('intro-ready', () => { ready = true; go(); }, { once: true });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; go(); }, { threshold: 0.2 }).observe(panel || els[0]);
  // safety: never leave the displays blank
  setTimeout(() => { if (!started) { started = true; final(); } }, 12000);
}
