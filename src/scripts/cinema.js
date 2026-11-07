/* cinema.js — the small film-language interactions added on top of each section.
   · About:      the photo racks focus (blurred → sharp) as it reaches the middle of the screen; the autofocus box locks on
   · Experience: a soft spotlight follows the pointer
   · Skills:     the aperture seal opens / turns with the skill you hover and with scroll (rack focus is pure CSS)
   · Contact:    the clapperboard: the stick lifts as you approach and snaps on click / "Copy email" (take counter ticks up)
   Everything is live-measured, and stays still under prefers-reduced-motion. */
import { onFrame, scroll, reduced, finePointer, clamp, lerp } from './lib/motion.js';

export function initCinema() {
  aboutFocus();
  experienceGlow();
  skillsIris();
  clapper();
}

/* ───────── About: rack focus ───────── */
function aboutFocus() {
  const fig = document.querySelector('.about__photo');
  if (!fig) return;
  if (reduced) { fig.style.setProperty('--fx', '1'); fig.classList.add('is-locked'); return; }
  let cur = 0, locked = false;
  fig.style.setProperty('--fx', '0');
  onFrame((dt) => {
    const r = fig.getBoundingClientRect();
    if (r.bottom < -80 || r.top > scroll.vh + 80) return;
    const d = Math.abs((r.top + r.bottom) / 2 - scroll.vh * 0.5) / (scroll.vh * 0.5);
    const target = 1 - clamp((d - 0.18) / 0.62);           // sharp in the middle band, soft toward the edges
    cur = lerp(cur, target, 1 - Math.exp(-dt * 5));
    fig.style.setProperty('--fx', cur.toFixed(3));
    const now = cur > 0.92;
    if (now !== locked) { locked = now; fig.classList.toggle('is-locked', now); }
  });
}

/* ───────── Experience: spotlight ───────── */
function experienceGlow() {
  const sec = document.getElementById('experience');
  const glow = document.getElementById('xpGlow');
  if (!sec || !glow || reduced || !finePointer) return;
  let tx = 0.5, ty = 0.3, x = tx, y = ty, active = false;
  sec.addEventListener('pointermove', (e) => {
    const r = sec.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width;
    ty = (e.clientY - r.top) / r.height;
  }, { passive: true });
  new IntersectionObserver(([e]) => (active = e.isIntersecting)).observe(sec);
  onFrame(() => {
    if (!active) return;
    x = lerp(x, tx, 0.09); y = lerp(y, ty, 0.09);
    glow.style.setProperty('--gx', (x * 100).toFixed(2) + '%');
    glow.style.setProperty('--gy', (y * 100).toFixed(2) + '%');
  });
}

/* ───────── Skills: aperture ───────── */
function skillsIris() {
  const svg = document.getElementById('irisSvg');
  const blades = document.getElementById('irisBlades');
  const hole = document.getElementById('irisHole');
  if (!svg || !blades || !hole) return;
  const NS = 'http://www.w3.org/2000/svg';
  const N = 9;
  let html = '';
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    html += `<path d="M60 60 L${(60 + Math.cos(a) * 48).toFixed(2)} ${(60 + Math.sin(a) * 48).toFixed(2)}"/>`;
  }
  blades.innerHTML = html;
  blades.setAttribute('transform-origin', '60 60');

  const rows = [...document.querySelectorAll('.skills__list li')];
  let target = 14, r = 14, rot = 0, hover = 0, spinVel = 0, active = false;
  rows.forEach((li, i) => {
    li.addEventListener('pointerenter', () => { hover = 1; target = 9 + (i % 12) * 2.4; });
    li.addEventListener('pointerleave', () => { hover = 0; target = 14; });
  });
  const seal = svg.closest('.skills__seal');
  if (seal) new IntersectionObserver(([e]) => (active = e.isIntersecting)).observe(seal);
  if (reduced) { hole.setAttribute('r', '16'); return; }
  onFrame((dt) => {
    if (!active) return;
    r = lerp(r, target, 1 - Math.exp(-dt * 6));
    spinVel = lerp(spinVel, hover ? 70 : 8, 1 - Math.exp(-dt * 3));
    rot += (spinVel + scroll.vel * 0.02) * dt;
    hole.setAttribute('r', r.toFixed(2));
    blades.setAttribute('transform', `rotate(${rot.toFixed(2)} 60 60)`);
  });
}

/* ───────── Contact: the clapperboard ───────── */
function clapper() {
  const clap = document.getElementById('clap');
  const top = document.getElementById('clapTop');
  const takeEl = document.getElementById('clapTake');
  const dateEl = document.getElementById('clapDate');
  if (!clap || !top) return;
  if (dateEl) {
    const d = new Date();
    dateEl.textContent = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toLowerCase();
  }
  let take = 1, busy = false;
  const snap = () => {
    if (busy) return;
    busy = true;
    clap.classList.remove('is-clap');
    void clap.offsetWidth;
    clap.classList.add('is-clap');
    setTimeout(() => { take++; if (takeEl) takeEl.textContent = String(take); }, reduced ? 0 : 330);
    setTimeout(() => { busy = false; clap.classList.remove('is-clap'); }, reduced ? 50 : 900);
  };
  clap.addEventListener('click', snap);
  clap.tabIndex = 0;
  clap.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); snap(); } });
  document.getElementById('copyEmailBtn')?.addEventListener('click', snap);

  if (reduced || !finePointer) return;
  // the stick lifts as the pointer gets close
  let lift = 0, tl = 0, active = false;
  window.addEventListener('pointermove', (e) => {
    const r = clap.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const d = Math.hypot(e.clientX - cx, e.clientY - cy);
    tl = clamp(1 - d / Math.max(360, r.width * 1.4));
  }, { passive: true });
  new IntersectionObserver(([e]) => (active = e.isIntersecting)).observe(clap);
  onFrame((dt) => {
    if (!active || busy) return;
    lift = lerp(lift, tl, 1 - Math.exp(-dt * 7));
    clap.style.setProperty('--lift', lift.toFixed(3));
  });
}
