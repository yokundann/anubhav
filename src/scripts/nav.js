/* nav.js */
import { content } from '../data/content.js';

function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 2200);
}

export function initNav() {
  const toasts = content.contact.sprayWall.toasts;
  window._nav = { showToast, toasts };

  const navLinks = [...document.querySelectorAll('.topbar-nav a')];
  const sections = navLinks.map(link => document.querySelector(link.getAttribute('href')));
  const setlist = document.querySelector('.setlist');
  const fabTop = document.querySelector('.fab-top');
  const menuBtn = document.getElementById('menuBtn');
  const drawer = document.querySelector('.drawer');
  const drawerClose = document.getElementById('drawerClose');
  const drawerLinks = [...(drawer?.querySelectorAll('a') || [])];
  const copyBtn = document.getElementById('copyEmailBtn');

  // Scroll spy
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const offset = window.innerHeight * 0.45;

      let activeIdx = -1;
      sections.forEach((sec, i) => {
        if (!sec) return;
        const rect = sec.getBoundingClientRect();
        if (rect.top <= offset) activeIdx = i;
      });

      navLinks.forEach((link, i) => {
        link.classList.toggle('active', i === activeIdx);
      });

      // Setlist pill
      if (setlist) {
        setlist.classList.toggle('visible', scrollY > window.innerHeight * 0.6);
      }

      // Fab top
      if (fabTop) {
        fabTop.classList.toggle('visible', scrollY > window.innerHeight * 1.2);
      }

      ticking = false;
    });
    ticking = true;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile drawer
  function openDrawer() {
    drawer?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    drawerClose?.focus();
  }
  function closeDrawer() {
    drawer?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    menuBtn?.focus();
  }

  menuBtn?.addEventListener('click', openDrawer);
  drawerClose?.addEventListener('click', closeDrawer);
  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer?.getAttribute('aria-hidden') === 'false') {
      closeDrawer();
    }
  });

  // Focus trap in drawer
  drawer?.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = [...drawer.querySelectorAll('a, button, [tabindex="0"]')].filter(el => !el.disabled);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { last.focus(); e.preventDefault(); }
    } else {
      if (document.activeElement === last) { first.focus(); e.preventDefault(); }
    }
  });

  // Copy email
  copyBtn?.addEventListener('click', () => {
    navigator.clipboard.writeText(content.contact.email)
      .then(() => showToast(toasts.copied))
      .catch(() => showToast(toasts.copyFail));
  });

  // Sound toggle (decorative)
  const soundToggle = document.getElementById('soundToggle');
  let soundOn = false;
  soundToggle?.addEventListener('click', () => {
    soundOn = !soundOn;
    soundToggle.setAttribute('aria-label', soundOn ? 'Mute' : 'Sound');
    soundToggle.querySelector('.icon-sound')?.classList.toggle('hidden', !soundOn);
    soundToggle.querySelector('.icon-mute')?.classList.toggle('hidden', soundOn);
  });

  // Setlist disc rotation on scroll
  const setlistDisc = document.querySelector('.setlist-disc');
  window.addEventListener('scroll', () => {
    if (setlistDisc) {
      setlistDisc.style.transform = `rotate(${window.scrollY * 0.6}deg)`;
    }
  }, { passive: true });
}
