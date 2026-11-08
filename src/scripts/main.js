/* main.js — everything interactive, in one small file.
   Site copy lives in index.html; shared strings (email, toasts) live in ../data/content.js. */
import { content } from '../data/content.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Day / night ── */
(function mode() {
  const root = document.documentElement;
  const btn = $('#modeToggle');
  const meta = $('meta[name="theme-color"]');
  const sync = () => {
    const night = root.getAttribute('data-mode') === 'night';
    btn.setAttribute('aria-pressed', String(night));
    btn.setAttribute('aria-label', night ? 'Switch to day mode' : 'Switch to night mode');
    if (meta) meta.content = night ? '#121418' : '#bcc4ce';
  };
  btn.addEventListener('click', () => {
    const next = root.getAttribute('data-mode') === 'night' ? 'day' : 'night';
    root.setAttribute('data-mode', next);
    try { localStorage.setItem('mode', next); } catch (e) {}
    sync();
  });
  sync();
})();

/* ── Full-screen menu ── */
(function menu() {
  const m = $('#menu'), open = $('#menuBtn'), close = $('#menuClose');
  const set = (on) => {
    m.classList.toggle('is-open', on);
    m.setAttribute('aria-hidden', String(!on));
    open.setAttribute('aria-expanded', String(on));
    document.body.style.overflow = on ? 'hidden' : '';
    (on ? close : open).focus({ preventScroll: true });
  };
  open.addEventListener('click', () => set(true));
  close.addEventListener('click', () => set(false));
  $$('a', m).forEach((a) => a.addEventListener('click', () => { m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true'); open.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && m.classList.contains('is-open')) set(false); });
  m.setAttribute('inert', '');
  new MutationObserver(() => m.toggleAttribute('inert', !m.classList.contains('is-open'))).observe(m, { attributes: true, attributeFilter: ['class'] });
})();

/* ── Header state, scroll-spy, to-top ── */
(function chrome() {
  const header = $('#header'), top = $('#toTop');
  const links = $$('.nav a');
  const targets = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  const onScroll = () => {
    const y = scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    top.classList.toggle('is-on', y > innerHeight * 1.2);
    let cur = null;
    targets.forEach((t) => { if (t.getBoundingClientRect().top < innerHeight * 0.4) cur = t.id; });
    links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + cur));
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── Accordions: one open at a time per group ── */
$$('[data-acc]').forEach((group) => {
  const items = $$('.acc__item', group);
  items.forEach((item) => {
    const btn = $('.acc__btn', item);
    btn.addEventListener('click', () => {
      const willOpen = btn.getAttribute('aria-expanded') !== 'true';
      items.forEach((it) => { it.classList.remove('is-open'); $('.acc__btn', it).setAttribute('aria-expanded', 'false'); });
      if (willOpen) { item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
    });
  });
  /* Collapsed panels must not be tabbable */
  const sync = () => items.forEach((it) => $('.acc__panel', it).toggleAttribute('inert', !it.classList.contains('is-open')));
  new MutationObserver(sync).observe(group, { subtree: true, attributes: true, attributeFilter: ['class'] });
  sync();
});

/* ── Stats count up (once, when seen) ── */
(function counters() {
  const els = $$('[data-count]');
  if (reduced || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target, to = +el.dataset.count, from = +(el.dataset.from ?? 0), t0 = performance.now(), dur = 1400;
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur), eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(from + (to - from) * eased);
        if (p < 1) requestAnimationFrame(tick);
      };
      el.textContent = from;
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  els.forEach((el) => io.observe(el));
})();

/* ── Tape: duplicate the row so the loop has no jump ── */
$$('.tape__track').forEach((track) => {
  const row = track.firstElementChild;
  if (!row) return;
  const copy = row.cloneNode(true);
  track.appendChild(copy);
});

/* ── Toast ── */
const toast = $('#toast');
let toastTimer;
function say(msg) {
  toast.textContent = msg;
  toast.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-on'), 3200);
}

/* ── Copy email ── */
$('#copyEmailBtn')?.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(content.contact.email); say(content.contact.toasts.copied); }
  catch (e) { say(content.contact.toasts.copyFail); }
});

/* ── Contact form: builds a mailto: (no backend needed) ── */
(function form() {
  const f = $('#mailForm'), note = $('#formNote');
  if (!f) return;
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(f);
    const name = String(d.get('name') || '').trim(), email = String(d.get('email') || '').trim(), msg = String(d.get('message') || '').trim();
    let ok = true;
    ['name', 'email', 'message'].forEach((k) => {
      const field = f.elements[k];
      const valid = k === 'email' ? /^\S+@\S+\.\S+$/.test(email) : !!String(d.get(k) || '').trim();
      field.setAttribute('aria-invalid', String(!valid));
      if (!valid) ok = false;
    });
    if (!ok) { note.textContent = 'Please fill in your name, a valid email and a message.'; f.querySelector('[aria-invalid="true"]').focus(); return; }
    const body = `${msg}\n\n${name}\n${email}`;
    location.href = `mailto:${content.contact.email}?subject=${encodeURIComponent("Let's work together")}&body=${encodeURIComponent(body)}`;
    note.textContent = 'Opening your email app. If nothing opens, use Copy email.';
  });
})();

/* ── Clapperboard ── */
(function clap() {
  const c = $('#clap'), take = $('#clapTake'), date = $('#clapDate');
  if (!c) return;
  try { date.textContent = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) {}
  let n = 1;
  c.addEventListener('click', () => {
    n += 1; take.textContent = n;
    c.classList.remove('is-clack'); void c.offsetWidth; c.classList.add('is-clack');
  });
})();

/* ── Footer: credits loop + Kathmandu clock ── */
(function footer() {
  const credits = $('#credits');
  if (credits && !credits.dataset.cloned) {
    credits.dataset.cloned = '1';
    [...credits.children].forEach((li) => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); credits.appendChild(c); });
    const setSpeed = () => credits.style.setProperty('--roll-dur', Math.max(30, credits.scrollHeight / 2 / 38).toFixed(1) + 's');
    setSpeed();
    document.fonts?.ready.then(setSpeed);
    addEventListener('resize', setSpeed);
  }
  const clock = $('#npClock b');
  if (clock) {
    let fmt = null;
    try { fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit', hour12: false }); } catch (e) {}
    const tick = () => { clock.textContent = fmt ? fmt.format(new Date()) : '--:--'; };
    tick(); setInterval(tick, 15000);
  }
})();

/* ── Fit giant words to their container (any font, any zoom) ── */
(function fit() {
  const els = $$('.ghost, .footer__mark');
  const run = () => els.forEach((el) => {
    el.style.fontSize = '';
    const w = el.clientWidth, sw = el.scrollWidth;
    if (w && sw > w) el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * (w / sw) * 0.985).toFixed(2) + 'px';
  });
  const sign = $('.hero__sign span');
  const fitSign = () => {
    if (!sign) return;
    sign.style.fontSize = '';
    const max = document.documentElement.clientWidth * 0.98, w = sign.getBoundingClientRect().width;
    if (w > max) sign.style.fontSize = (parseFloat(getComputedStyle(sign).fontSize) * (max / w)).toFixed(2) + 'px';
  };
  const all = () => { run(); fitSign(); };
  all();
  document.fonts?.ready.then(all);
  addEventListener('load', all);
  let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(all, 120); });
})();
