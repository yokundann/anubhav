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
  let p = 0, loaded = false, shown = '';

  const ready = [
    document.readyState === 'complete' ? Promise.resolve() : new Promise((r) => addEventListener('load', r, { once: true })),
    document.fonts ? document.fonts.ready : Promise.resolve(),
  ];
  Promise.all(ready).then(() => { loaded = true; });

  const paint = () => {
    el.style.setProperty('--p', p.toFixed(3));
    bar.style.strokeDashoffset = (C * (1 - p)).toFixed(1);
    const n = String(Math.round(p * 100)).padStart(3, '0');
    if (n !== shown) { shown = n; num.textContent = n; }
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

/* ── Pointer-driven spotlight, tilt and magnets ──
   Reads are cached (one rect per hover / scroll), writes happen once per frame, and tilt is eased in a shared rAF loop
   that sleeps when nothing is moving, so hovering never queues up layout work. */
let epoch = 0;
addEventListener('scroll', () => { epoch++; }, { passive: true });
addEventListener('resize', () => { epoch++; });
const rectOf = (el) => { if (el._ep !== epoch) { el._r = el.getBoundingClientRect(); el._ep = epoch; } return el._r; };

if (fine && !reduced) {
  /* spotlight */
  $$('.acc__item, .logos li, .hero__card, .contact__card, .open-card').forEach((el) => {
    el.classList.add('spot');
    let ex = 0, ey = 0, queued = false;
    const write = () => {
      queued = false;
      const r = rectOf(el);
      el.style.setProperty('--sx', (ex - r.left).toFixed(0) + 'px');
      el.style.setProperty('--sy', (ey - r.top).toFixed(0) + 'px');
    };
    el.addEventListener('pointermove', (e) => { ex = e.clientX; ey = e.clientY; if (!queued) { queued = true; requestAnimationFrame(write); } }, { passive: true });
  });

  /* film cards: eased 3D tilt + glare */
  const tilts = [];
  let tiltOn = false;
  const tiltFrame = () => {
    let busy = false;
    tilts.forEach((t) => {
      const dx = t.tx - t.cx, dy = t.ty - t.cy;
      if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01 && !t.hot) { if (t.cx !== t.tx || t.cy !== t.ty) { t.cx = t.tx; t.cy = t.ty; t.apply(); } return; }
      t.cx += dx * 0.16; t.cy += dy * 0.16; t.apply(); busy = true;
    });
    if (busy) requestAnimationFrame(tiltFrame); else tiltOn = false;
  };
  const wakeTilt = () => { if (!tiltOn) { tiltOn = true; requestAnimationFrame(tiltFrame); } };

  $$('.film').forEach((el) => {
    const t = { tx: 0, ty: 0, cx: 0, cy: 0, hot: false, gx: 50, gy: 50 };
    t.apply = () => { el.style.transform = `perspective(1100px) rotateX(${t.cy.toFixed(2)}deg) rotateY(${t.cx.toFixed(2)}deg)`; };
    tilts.push(t);
    el.addEventListener('pointerenter', () => { t.hot = true; });
    el.addEventListener('pointermove', (e) => {
      const r = rectOf(el);
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      t.tx = (x - 0.5) * 9; t.ty = (0.5 - y) * 7;
      el.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      wakeTilt();
    }, { passive: true });
    el.addEventListener('pointerleave', () => { t.hot = false; t.tx = 0; t.ty = 0; wakeTilt(); });
  });

  /* magnetic buttons: the pull is measured from the button's resting centre, so the move never feeds back into the maths */
  $$('.btn, .round-btn, .seal, .to-top').forEach((el) => {
    let cx = 0, cy = 0, ex = 0, ey = 0, queued = false;
    const write = () => { queued = false; el.style.translate = `${((ex - cx) * 0.22).toFixed(1)}px ${((ey - cy) * 0.3).toFixed(1)}px`; };
    el.addEventListener('pointerenter', () => {
      const prev = el.style.translate.split(' ').map((v) => parseFloat(v) || 0);
      const r = el.getBoundingClientRect();
      cx = r.left + r.width / 2 - (prev[0] || 0); cy = r.top + r.height / 2 - (prev[1] || 0);
    });
    el.addEventListener('pointermove', (e) => { ex = e.clientX; ey = e.clientY; if (!queued) { queued = true; requestAnimationFrame(write); } }, { passive: true });
    el.addEventListener('pointerleave', () => { el.style.translate = ''; });
  });
}

/* ── Eyes: the pupils drift towards the pointer, lightly ──
   Pupils move with `translate` (compositor), and the loop only runs while the pointer is moving or the pupils are still settling. */
(function eyes() {
  const av = $('.stats__avatar');
  if (!av || reduced) return;
  /* image-pixel geometry of the portrait (1213 px wide): eye centre, eye radii, resting pupil offset, pupil radius */
  const specs = [
    { el: $('.eye--l', av), rx: 35.5, ry: 34.5, rest: [22, -13], pr: 19 },
    { el: $('.eye--r', av), rx: 33.5, ry: 34, rest: [24, -13], pr: 19 },
  ].filter((e) => e.el);
  specs.forEach((e) => {
    e.x = e.rest[0]; e.y = e.rest[1]; e.i = $('i', e.el); e.k = 1;
    e.i.style.left = ((e.rx - e.pr) / (e.rx * 2) * 100).toFixed(2) + '%';
    e.i.style.top = ((e.ry - e.pr) / (e.ry * 2) * 100).toFixed(2) + '%';
  });
  const scale = () => specs.forEach((e) => { e.k = e.el.clientWidth / (e.rx * 2) || 1; });
  scale();
  addEventListener('resize', () => { scale(); put(); });

  let px = null, py = null, wake = 0, on = false;
  const put = () => specs.forEach((e) => { e.i.style.translate = `${(e.x * e.k).toFixed(2)}px ${(e.y * e.k).toFixed(2)}px`; });
  put();
  const draw = () => {
    let moving = false;
    const vr = av.getBoundingClientRect();
    if (vr.bottom > 0 && vr.top < innerHeight && px !== null) {
      const rects = specs.map((e) => e.el.getBoundingClientRect());      /* reads first … */
      specs.forEach((e, n) => {
        const r = rects[n];
        const dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy) || 1;
        const m = Math.min(1, d / 260) * 13;                               /* max drift in image px */
        const nx = lerp(e.x, (dx / d) * m, 0.14), ny = lerp(e.y, (dy / d) * m, 0.14);
        if (Math.abs(nx - e.x) > 0.01 || Math.abs(ny - e.y) > 0.01) moving = true;
        e.x = nx; e.y = ny;
      });
      put();                                                               /* … then writes */
    }
    if (wake > 0) wake--;
    if (moving || wake > 0) requestAnimationFrame(draw); else on = false;
  };
  addEventListener('pointermove', (ev) => { px = ev.clientX; py = ev.clientY; wake = 45; if (!on) { on = true; requestAnimationFrame(draw); } }, { passive: true });
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

/* ── Scroll-linked pieces: one rAF loop that sleeps when nothing is moving ──
   Positions of the ghost words are measured once (and when the page height changes), never per frame, and a value is
   only written to the DOM when it actually changed. */
(function loop() {
  if (reduced) return;
  const timeline = $('#timeline');
  const hero = $('.hero');
  const heroEls = hero ? { ghost: $('.ghost--hero', hero), arch: $('.hero__arch', hero), sign: $('.hero__sign', hero) } : {};
  const ghosts = $$('.ghost:not(.ghost--hero)').map((el) => ({ el, top: 0, h: 0, off: 0, last: NaN }));
  const anim = $('.tape__track')?.getAnimations?.()[0];
  let mx = 0, my = 0, px = 0, py = 0, lastY = scrollY, vel = 0, rate = 1, lastP = -1, tw = root.clientWidth, lastHero = '';
  let running = false, measureQueued = false;

  const measure = () => {
    measureQueued = false;
    const y = scrollY;
    const rects = ghosts.map((g) => g.el.getBoundingClientRect());     /* all reads together */
    ghosts.forEach((g, i) => { g.top = rects[i].top + y - g.off; g.h = rects[i].height; });
    tw = root.clientWidth;
    kick();
  };
  const queueMeasure = () => { if (!measureQueued) { measureQueued = true; requestAnimationFrame(measure); } };

  const frame = () => {
    const y = scrollY;
    vel = lerp(vel, y - lastY, 0.2); lastY = y;
    let busy = Math.abs(vel) > 0.05;

    if (timeline) {
      const max = root.scrollHeight - innerHeight;
      const p = max > 0 ? clamp(y / max, 0, 1) : 0;
      if (Math.abs(p - lastP) > 0.0003) { lastP = p; timeline.style.setProperty('--p', p.toFixed(4)); timeline.style.setProperty('--x', (p * tw).toFixed(1)); }
    }

    if (hero && y < innerHeight * 1.2) {
      const tx = fine ? mx : 0, ty = fine ? my : 0;
      px = lerp(px, tx, 0.08); py = lerp(py, ty, 0.08);
      if (Math.abs(px - tx) < 0.001) px = tx;
      if (Math.abs(py - ty) < 0.001) py = ty;
      const sy = clamp(y / innerHeight, 0, 1.2);
      const key = px.toFixed(3) + py.toFixed(3) + sy.toFixed(3);
      if (key !== lastHero) {
        lastHero = key;
        const { ghost, arch, sign } = heroEls;
        if (ghost) ghost.style.translate = `${(px * -22).toFixed(1)}px ${(sy * 80).toFixed(1)}px`;
        if (arch) arch.style.translate = `${(px * 14).toFixed(1)}px ${(py * 9).toFixed(1)}px`;
        if (sign) sign.style.translate = `${(px * 10).toFixed(1)}px ${(py * 6).toFixed(1)}px`;
      }
      if (px !== tx || py !== ty) busy = true;
    }

    ghosts.forEach((g) => {
      const c = g.top + g.h / 2 - y;                                    /* centre relative to the viewport, from cached geometry */
      if (c < -g.h / 2 - 200 || c > innerHeight + g.h / 2 + 200) return;
      const gy = clamp((c - innerHeight / 2) / innerHeight, -1.2, 1.2) * -34;
      if (Math.abs(gy - g.last) > 0.08 || Number.isNaN(g.last)) { g.last = gy; g.off = gy; g.el.style.translate = `0 ${gy.toFixed(1)}px`; }
    });

    if (anim) {
      rate = lerp(rate, 1 + Math.min(7, Math.abs(vel) * 0.35), 0.1);
      if (Math.abs(rate - 1) < 0.02) rate = 1;
      if (Math.abs(anim.playbackRate - rate) > 0.02) anim.playbackRate = rate;
      if (rate !== 1) busy = true;
    }

    if (busy) requestAnimationFrame(frame); else running = false;
  };
  function kick() { if (!running) { running = true; requestAnimationFrame(frame); } }

  addEventListener('scroll', kick, { passive: true });
  addEventListener('pointermove', (e) => { mx = (e.clientX / innerWidth - 0.5) * 2; my = (e.clientY / innerHeight - 0.5) * 2; kick(); }, { passive: true });
  addEventListener('resize', queueMeasure);
  addEventListener('load', queueMeasure);
  document.fonts?.ready.then(queueMeasure);
  if ('ResizeObserver' in window) new ResizeObserver(queueMeasure).observe(document.body);   /* accordions opening, fonts, images */
  queueMeasure();
})();
