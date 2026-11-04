/* stickers.js */
export function initStickers() {
  const wall = document.getElementById('stickerWall');
  const shuffleBtn = document.getElementById('shuffleBtn');
  if (!wall) return;

  const stickers = [...wall.querySelectorAll('.sticker')];
  let topZ = 10;

  function placeStickers() {
    const cols = 4;
    const rows = Math.ceil(stickers.length / cols);
    const wallW = wall.offsetWidth;
    const wallH = wall.offsetHeight;
    const cellW = wallW / cols;
    const cellH = wallH / rows;

    stickers.forEach((el, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const jitterX = (Math.random() - 0.5) * cellW * 0.5;
      const jitterY = (Math.random() - 0.5) * cellH * 0.5;
      const x = col * cellW + cellW / 2 - el.offsetWidth / 2 + jitterX;
      const y = row * cellH + cellH / 2 - el.offsetHeight / 2 + jitterY;
      const rot = (Math.random() - 0.5) * 20;

      el.style.left = Math.max(4, Math.min(x, wallW - el.offsetWidth - 4)) + 'px';
      el.style.top = Math.max(4, Math.min(y, wallH - el.offsetHeight - 4)) + 'px';
      el.style.transform = `rotate(${rot}deg)`;
      el.style.setProperty('--r', rot + 'deg');
    });
  }

  // Entrance animation via IntersectionObserver
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      placeStickers();
      stickers.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = `rotate(${el.style.getPropertyValue('--r')}) scale(0.5)`;
        setTimeout(() => {
          el.style.transition = 'opacity 0.3s, transform 0.4s var(--ease-slap)';
          el.style.opacity = '1';
          el.style.transform = `rotate(${el.style.getPropertyValue('--r')}) scale(1)`;
        }, 50 + i * 60);
      });
      obs.unobserve(wall);
    });
  }, { threshold: 0.1 });
  obs.observe(wall);

  shuffleBtn?.addEventListener('click', () => {
    stickers.forEach(el => {
      el.style.transition = 'opacity 0.2s, transform 0.4s var(--ease-slap)';
      el.style.opacity = '0';
      el.style.transform = `scale(0.5)`;
    });
    setTimeout(() => {
      placeStickers();
      stickers.forEach((el, i) => {
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = `rotate(${el.style.getPropertyValue('--r')}) scale(1)`;
        }, i * 40);
      });
    }, 220);
  });

  // Drag
  stickers.forEach(el => {
    let startX, startY, origLeft, origTop;

    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      el.classList.add('dragging');
      topZ++;
      el.style.zIndex = topZ;
      startX = e.clientX;
      startY = e.clientY;
      origLeft = parseFloat(el.style.left) || 0;
      origTop = parseFloat(el.style.top) || 0;
      el.style.transition = 'none';
    });

    el.addEventListener('pointermove', (e) => {
      if (!el.classList.contains('dragging')) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const wallRect = wall.getBoundingClientRect();
      const newLeft = Math.max(0, Math.min(origLeft + dx, wallRect.width - el.offsetWidth));
      const newTop = Math.max(0, Math.min(origTop + dy, wallRect.height - el.offsetHeight));
      el.style.left = newLeft + 'px';
      el.style.top = newTop + 'px';
    });

    el.addEventListener('pointerup', () => {
      el.classList.remove('dragging');
      el.style.transition = '';
    });

    // Arrow key nudge
    el.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 40 : 10;
      const left = parseFloat(el.style.left) || 0;
      const top = parseFloat(el.style.top) || 0;
      const wallRect = wall.getBoundingClientRect();

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          el.style.left = Math.max(0, left - step) + 'px';
          break;
        case 'ArrowRight':
          e.preventDefault();
          el.style.left = Math.min(wallRect.width - el.offsetWidth, left + step) + 'px';
          break;
        case 'ArrowUp':
          e.preventDefault();
          el.style.top = Math.max(0, top - step) + 'px';
          break;
        case 'ArrowDown':
          e.preventDefault();
          el.style.top = Math.min(wallRect.height - el.offsetHeight, top + step) + 'px';
          break;
      }
    });
  });
}
