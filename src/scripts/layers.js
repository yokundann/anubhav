/* layers.js */
export function initLayers() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const layers = [...document.querySelectorAll('.layer')];
  if (!layers.length) return;

  let ticking = false;

  function update() {
    const vh = window.innerHeight;
    const scrollY = window.scrollY;

    layers.forEach((layer, i) => {
      const rect = layer.getBoundingClientRect();
      const layerH = layer.offsetHeight;
      const top = Math.min(0, vh - layerH);

      layer.style.top = top + 'px';
      layer.style.zIndex = i + 1;

      // Dim overlay using CSS custom property
      const overlap = -rect.top / vh;
      const dim = Math.max(0, Math.min(0.6, overlap));
      layer.style.setProperty('--dim', dim);
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
}
