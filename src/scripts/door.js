/* door.js */
export function initDoor() {
  const door = document.getElementById('door');
  if (!door) return;

  // Skip if already seen this session
  if (sessionStorage.getItem('door-lifted')) {
    door.classList.add('gone');
    document.dispatchEvent(new CustomEvent('door-lifted'));
    return;
  }

  // Respect reduced motion
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    door.classList.add('gone');
    sessionStorage.setItem('door-lifted', '1');
    document.dispatchEvent(new CustomEvent('door-lifted'));
    return;
  }

  function lift() {
    if (door.classList.contains('up')) return;
    door.classList.add('up');
    sessionStorage.setItem('door-lifted', '1');
    document.dispatchEvent(new CustomEvent('door-lifted'));
    setTimeout(() => door.classList.add('gone'), 1250);
  }

  // Auto lift after 1100ms
  const autoTimer = setTimeout(lift, 1100);

  door.addEventListener('click', () => { clearTimeout(autoTimer); lift(); });
  window.addEventListener('wheel', () => { clearTimeout(autoTimer); lift(); }, { once: true, passive: true });
  window.addEventListener('touchstart', () => { clearTimeout(autoTimer); lift(); }, { once: true, passive: true });
  window.addEventListener('keydown', (e) => {
    if (['Enter','Space','ArrowUp','ArrowDown'].includes(e.code)) {
      clearTimeout(autoTimer);
      lift();
    }
  }, { once: true });
}
