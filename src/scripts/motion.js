/* motion.js: the animation layer (pairs with styles/motion.css).
   Loader and iris, word-by-word titles, focus-pull and "develop" reveals, parallax, tilt, eye tracking, film timeline.
   Everything is skipped for visitors who prefer reduced motion, and nothing here is needed to read the page. */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;

let stageReady = false;
const queued = [];

/* ── Word-by-word titles (a title card) ── */
function split(el) {
  let i = 0;
  [...el.childNodes].forEach((n) => {
    if (n.nodeType !== 3) return;
    const frag = document.createDocumentFragment();
    n.textContent.split(/(\s+)/).forEach((tok) => {
      if (!tok) return;
      if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
      const w = document.createElement('span'); w.className = 'w';
      const wi = document.createElement('span'); wi.className = 'wi';
      wi.style.setProperty('--i', i++); wi.textContent = tok;
      w.appendChild(wi); frag.appendChild(w);
    });
    n.replaceWith(frag);
  });
  el.classList.add('is-split');
}

/* ── Loader: slate, reel, count-up, then the iris opens on the page ── */
function stageGo() {
  if (stageReady) return;
  stageReady = true;
  root.classList.remove('is-loading');
  root.classList.add('is-ready');
  $$('.hero__title').forEach((t) => t.classList.add('is-in'));
  queued.splice(0).forEach((el) => settle(el));
}

(function loader() {
  const el = $('#loader');
  const skip = reduced || location.hash || scrollY > 120;
  if (!el || skip) { el?.remove(); stageGo(); return; }

  const num = $('#loaderNum'), bar = $('#loaderBar');
  const C = 2 * Math.PI * 90;
  bar.style.strokeDasharray = C.toFixed(1);
  const MIN = 2200, MAX = 6000;
  const t0 = performance.now();
  let p = 0, loaded = false;

  const ready = [
    document.readyState === 'complete' ? Promise.resolve() : new Promise((r) => addEventListener('load', r, { once: true })),
    document.fonts ? document.fonts.ready : Promise.resolve(),
  ];
  Promise.all(ready).then(() => { loaded = true; });

  const paint = () => {
    el.style.setProperty('--p', p.toFixed(3));
    bar.style.strokeDashoffset = (C * (1 - p)).toFixed(1);
    num.textContent = String(Math.round(p * 100)).padStart(3, '0');
  };
  const out = () => {
    el.classList.add('is-out');
    setTimeout(stageGo, 300);
    setTimeout(() => el.remove(), 1700);
  };
  const tick = (t) => {
    const e = t - t0;
    if (e > MAX) loaded = true;
    const time = clamp(e / MIN, 0, 1);
    const eased = 1 - Math.pow(1 - time, 3);
    const target = loaded ? eased : Math.min(eased, 0.9);
    p = lerp(p, target, 0.14);
    if (loaded && time >= 1 && p > 0.995) { p = 1; paint(); out(); return; }
    paint();
    requestAnimationFrame(tick);
  };
  paint();
  requestAnimationFrame(tick);
})();

/* ── Reveals ── */
const doneClean = (el, ms) => setTimeout(() => ['data-rv', 'data-dev', 'data-clip'].forEach((a) => el.removeAttribute(a)), ms);
function settle(el) {
  el.classList.add('is-in');
  if (el.hasAttribute('data-rv') || el.hasAttribute('data-dev') || el.hasAttribute('data-clip')) {
    doneClean(el, 2200 + (parseInt(el.style.getPropertyValue('--d')) || 0));
  }
}

(function reveals() {
  if (reduced || !('IntersectionObserver' in window)) return;
  root.classList.add('reveal-on');

  $$('.title, .cta-row p, .hero__title').forEach(split);

  const focus = [
    '.head__intro', '.about__lead', '.about__body', '.contact__lede', '.hero__hi', '.hero__sub', '.hero__links a', '.hero__card', '.hero__jump a',
    '.stat', '.chips li', '.open-card', '.logos li', '.film__info', '.cta-row',
    '.sub', '.tools li', '.row', '.acc__item', '.contact__card', '.meta > div', '.footer__tbc', '.footer__who', '.footer__col', '.screen', '.footer__mark', '.stats__avatar',
  ];
  const develop = ['.film__img', '.viewfinder', '.edu__award'];
  const clip = ['.contact__photo'];

  const stagger = (el) => {
    const sibs = [...(el.parentElement?.children ?? [])];
    return Math.min(sibs.indexOf(el), 8) * 80;
  };
  $$(focus.join(',')).forEach((el) => { if (el.closest('.acc__panel')) return; el.setAttribute('data-rv', ''); el.style.setProperty('--d', stagger(el)); });
  $$(develop.join(',')).forEach((el) => { el.setAttribute('data-dev', ''); el.style.setProperty('--d', el.classList.contains('film__img') ? stagger(el.closest('.film')) : 0); });
  $$(clip.join(',')).forEach((el) => el.setAttribute('data-clip', ''));

  /* hero pieces start slightly after the iris, in reading order */
  $$('.hero [data-rv]').forEach((el, i) => el.style.setProperty('--d', 350 + i * 90));

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      if (stageReady) settle(e.target); else queued.push(e.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
  $$('[data-rv], [data-dev], [data-clip], .is-split:not(.hero__title)').forEach((el) => io.observe(el));

  /* tall footer word and the clapper need a gentler trigger */
  const clap = $('#clap');
  if (clap) {
    const cio = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      cio.disconnect();
      setTimeout(() => { clap.classList.remove('is-clack'); void clap.offsetWidth; clap.classList.add('is-clack'); }, 700);
    }), { threshold: 0.7 });
    cio.observe(clap);
  }
})();

/* ── Pointer-driven spotlight and tilt ── */
if (fine && !reduced) {
  $$('.acc__item, .logos li, .hero__card, .contact__card, .open-card').forEach((el) => {
    el.classList.add('spot');
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--sx', (e.clientX - r.left).toFixed(0) + 'px');
      el.style.setProperty('--sy', (e.clientY - r.top).toFixed(0) + 'px');
    });
  });

  $$('.film').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--ry', ((x - 0.5) * 9).toFixed(2) + 'deg');
      el.style.setProperty('--rx', ((0.5 - y) * 7).toFixed(2) + 'deg');
      el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  });

  /* magnetic buttons */
  $$('.btn, .round-btn, .seal, .to-top').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      el.style.translate = `${(dx * 0.22).toFixed(1)}px ${(dy * 0.3).toFixed(1)}px`;
    });
    el.addEventListener('pointerleave', () => { el.style.translate = ''; });
  });
}

/* ── Eyes: the pupils drift towards the pointer, lightly ── */
(function eyes() {
  const av = $('.stats__avatar');
  if (!av || reduced) return;
  /* image-pixel geometry of the portrait (1213 px wide): eye centre, eye radii, resting pupil offset, pupil radius */
  const specs = [
    { el: $('.eye--l', av), rx: 35.5, ry: 34.5, rest: [22, -13], pr: 19 },
    { el: $('.eye--r', av), rx: 33.5, ry: 34, rest: [24, -13], pr: 19 },
  ].filter((e) => e.el);
  specs.forEach((e) => { e.x = e.rest[0]; e.y = e.rest[1]; e.i = $('i', e.el); });
  let px = null, py = null, wake = 0;
  addEventListener('pointermove', (ev) => { px = ev.clientX; py = ev.clientY; wake = 90; }, { passive: true });
  const draw = () => {
    if (wake > 0) {
      wake--;
      const vr = av.getBoundingClientRect();
      if (vr.bottom > 0 && vr.top < innerHeight && px !== null) {
        specs.forEach((e) => {
          const r = e.el.getBoundingClientRect();
          const dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
          const d = Math.hypot(dx, dy) || 1;
          const m = Math.min(1, d / 260) * 13;           /* max drift in image px */
          e.x = lerp(e.x, (dx / d) * m, 0.14); e.y = lerp(e.y, (dy / d) * m, 0.14);
        });
      }
    }
    specs.forEach((e) => {
      const w = e.rx * 2, h = e.ry * 2;
      e.i.style.left = ((e.rx + e.x - e.pr) / w * 100).toFixed(2) + '%';
      e.i.style.top = ((e.ry + e.y - e.pr) / h * 100).toFixed(2) + '%';
    });
    requestAnimationFrame(draw);
  };
  draw();
})();

/* ── Mode toggle: icon flip + soft colour crossfade ── */
$('#modeToggle')?.addEventListener('click', (e) => {
  const b = e.currentTarget;
  root.classList.add('mode-anim');
  b.classList.remove('is-flip'); void b.offsetWidth; b.classList.add('is-flip');
  setTimeout(() => root.classList.remove('mode-anim'), 750);
});

/* ── Timecode on the viewfinder ── */
(function timecode() {
  const tc = $('#tc');
  if (!tc) return;
  const t0 = Date.now();
  const f = (n) => String(n).padStart(2, '0');
  const tick = () => { const s = Math.floor((Date.now() - t0) / 1000); tc.textContent = `${f(Math.floor(s / 3600))}:${f(Math.floor(s / 60) % 60)}:${f(s % 60)}`; };
  tick(); setInterval(tick, 1000);
})();

/* ── Scroll-linked pieces, one rAF loop ── */
(function loop() {
  if (reduced) return;
  const timeline = $('#timeline');
  const hero = $('.hero');
  const ghosts = $$('.ghost:not(.ghost--hero)');
  const anim = $('.tape__track')?.getAnimations?.()[0];
  let mx = 0, my = 0, px = 0, py = 0, lastY = scrollY, vel = 0, rate = 1, heroOn = true;

  addEventListener('pointermove', (e) => { mx = (e.clientX / innerWidth - 0.5) * 2; my = (e.clientY / innerHeight - 0.5) * 2; }, { passive: true });

  const frame = () => {
    const y = scrollY;
    vel = lerp(vel, y - lastY, 0.2); lastY = y;

    if (timeline) { const max = document.documentElement.scrollHeight - innerHeight; timeline.style.setProperty('--p', (max > 0 ? clamp(y / max, 0, 1) : 0).toFixed(4)); }

    if (hero) {
      heroOn = y < innerHeight * 1.2;
      if (heroOn) {
        px = lerp(px, fine ? mx : 0, 0.06); py = lerp(py, fine ? my : 0, 0.06);
        hero.style.setProperty('--px', px.toFixed(3)); hero.style.setProperty('--py', py.toFixed(3));
        hero.style.setProperty('--sy', clamp(y / innerHeight, 0, 1.2).toFixed(3));
      }
    }

    ghosts.forEach((g) => {
      const r = g.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) return;
      g.style.setProperty('--gy', (clamp((r.top + r.height / 2 - innerHeight / 2) / innerHeight, -1.2, 1.2) * -34).toFixed(1));
    });

    if (anim) { rate = lerp(rate, 1 + Math.min(7, Math.abs(vel) * 0.35), 0.1); anim.playbackRate = rate; }

    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
