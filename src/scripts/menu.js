/* menu.js — full-screen menu with focus trap, copy-email toast. */
import { content } from '../data/content.js';

export function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2400);
}

export function initMenu() {
  const menu = document.getElementById('menu');
  const openBtn = document.getElementById('menuBtn');
  const closeBtn = document.getElementById('menuClose');
  if (menu) {
    const open = () => {
      menu.setAttribute('aria-hidden', 'false');
      openBtn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('is-locked');
      setTimeout(() => closeBtn.focus(), 300);
    };
    const close = (refocus = true) => {
      menu.setAttribute('aria-hidden', 'true');
      openBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('is-locked');
      if (refocus) openBtn.focus();
    };
    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', () => close());
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => close(false)));
    document.addEventListener('keydown', (e) => {
      if (menu.getAttribute('aria-hidden') === 'true') return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        const f = [...menu.querySelectorAll('a, button')];
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
    });
    // inert while closed
    const sync = () => (menu.inert = menu.getAttribute('aria-hidden') === 'true');
    new MutationObserver(sync).observe(menu, { attributes: true, attributeFilter: ['aria-hidden'] });
    sync();
  }

  document.getElementById('copyEmailBtn')?.addEventListener('click', () => {
    const { email, toasts } = content.contact;
    (navigator.clipboard?.writeText(email) ?? Promise.reject())
      .then(() => showToast(toasts.copied))
      .catch(() => showToast(toasts.copyFail));
  });
}
