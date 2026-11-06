/* reveal.js — scroll-triggered entrances: [data-reveal], [data-split], counters.
   data-d="ms" adds a delay. Hero items (data-hero) wait for the preloader. */
import { reduced } from './lib/motion.js';
import { splitText } from './lib/split.js';

export function initReveal() {
  document.querySelectorAll('[data-split]').forEach((el) => splitText(el, el.dataset.split));
  document.querySelectorAll('[data-d]').forEach((el) => el.style.setProperty('--d', el.dataset.d));

  const targets = [...document.querySelectorAll('[data-reveal], [data-split]')];
  const show = (el) => el.classList.add('is-in');

  // Counters
  const counters = [...document.querySelectorAll('[data-count]')];
  const runCount = (el) => {
    const to = parseInt(el.dataset.count, 10);
    const from = parseInt(el.dataset.from ?? '0', 10);
    if (reduced) { el.textContent = to; return; }
    const t0 = performance.now();
    const dur = 1800;
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - t, 4)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  counters.forEach((el) => { if (!reduced) el.textContent = el.dataset.from ?? '0'; });

  if (reduced) {
    targets.forEach(show);
    counters.forEach(runCount);
    return;
  }

  const hero = targets.filter((el) => el.hasAttribute('data-hero'));
  const rest = targets.filter((el) => !el.hasAttribute('data-hero'));

  document.addEventListener('intro-ready', () => {
    hero.forEach(show);
    setTimeout(() => counters.filter((c) => c.closest('.hero')).forEach(runCount), 1200);
  }, { once: true });

  // clip-path'd elements have zero visible area, so observe their parent instead
  const owner = new Map();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      show(owner.get(e.target) || e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  rest.forEach((el) => {
    if (el.dataset.reveal === 'clip' && el.parentElement) { owner.set(el.parentElement, el); io.observe(el.parentElement); }
    else io.observe(el);
  });

  // Safety: reveal anything still hidden after load (e.g. printed / blocked observers)
  window.addEventListener('beforeprint', () => targets.forEach(show));
}
