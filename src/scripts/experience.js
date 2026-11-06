/* experience.js — single-open accordion. */
export function initExperience() {
  const items = [...document.querySelectorAll('#xpList .xp')];
  const set = (item, open) => {
    item.classList.toggle('is-open', open);
    item.querySelector('.xp__btn').setAttribute('aria-expanded', String(open));
    const inner = item.querySelector('.xp__panel-in');
    if (inner) inner.inert = !open;
  };
  items.forEach((item) => {
    set(item, item.classList.contains('is-open'));
    item.querySelector('.xp__btn').addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');
      items.forEach((o) => set(o, false));
      set(item, willOpen);
    });
  });
}
