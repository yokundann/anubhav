/* crate.js */
import { content } from '../data/content.js';

export function initCrate() {
  const crateRow = document.getElementById('crateRow');
  const detailPanel = document.querySelector('.edu-detail');
  if (!crateRow || !detailPanel) return;

  const sleeves = [...crateRow.querySelectorAll('.sleeve')];

  function selectSleeve(idx) {
    sleeves.forEach((s, i) => {
      s.setAttribute('aria-selected', i === idx ? 'true' : 'false');
      s.setAttribute('tabindex', i === idx ? '0' : '-1');
    });

    const data = content.education.sleeves[idx];
    if (!data) return;

    detailPanel.innerHTML = `
      <div class="edu-card">
        <p class="edu-kind">${data.kind === 'education' ? 'Education' : 'Recognition'}</p>
        <h3 class="edu-heading">${data.detailHeading}</h3>
        <p class="edu-meta">${data.detailMeta}</p>
        ${data.detailLines.length ? `
          <ul class="edu-lines">
            ${data.detailLines.map(l => `<li>${l}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `;
  }

  sleeves.forEach((sleeve, idx) => {
    sleeve.addEventListener('click', () => selectSleeve(idx));
    sleeve.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = (idx + 1) % sleeves.length;
        selectSleeve(next);
        sleeves[next].focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = (idx - 1 + sleeves.length) % sleeves.length;
        selectSleeve(prev);
        sleeves[prev].focus();
      }
    });
  });

  // Auto-select first on enter
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        selectSleeve(0);
        obs.disconnect();
      }
    });
  }, { threshold: 0.2 });
  obs.observe(crateRow);
}
