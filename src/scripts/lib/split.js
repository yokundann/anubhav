/* lib/split.js — wrap words / characters in masked spans (preserves nested tags such as <em>). */
export function splitText(el, mode = 'words') {
  if (el.dataset.splitDone) return;
  el.dataset.splitDone = '1';
  const label = el.textContent.trim().replace(/\s+/g, ' ');
  if (!el.closest('[aria-label]') && !el.hasAttribute('aria-hidden')) el.setAttribute('aria-label', label);
  let wi = 0;
  let ci = 0;

  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span');
          w.className = 'w';
          w.setAttribute('aria-hidden', 'true');
          const inner = document.createElement('span');
          inner.className = 'wi';
          inner.style.setProperty('--i', wi++);
          if (mode === 'chars') {
            [...part].forEach((ch) => {
              const c = document.createElement('span');
              c.className = 'c';
              c.style.setProperty('--i', ci++);
              c.textContent = ch;
              inner.appendChild(c);
            });
          } else {
            inner.textContent = part;
          }
          w.appendChild(inner);
          frag.appendChild(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1) {
        walk(child);
      }
    });
  };
  walk(el);
}
