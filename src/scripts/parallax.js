/* parallax.js */
export function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const hero = document.getElementById('home');
  const lamp = document.querySelector('.lamp');
  const movers = [...document.querySelectorAll('[data-mouse]')];

  if (!hero) return;

  let mx = 0, my = 0;
  let lx = 0, ly = 0;
  let moving = false;
  let raf = null;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function loop() {
    lx = lerp(lx, mx, 0.08);
    ly = lerp(ly, my, 0.08);

    if (lamp) {
      lamp.style.setProperty('--lx', lx.toFixed(2));
      lamp.style.setProperty('--ly', ly.toFixed(2));
    }

    movers.forEach(el => {
      const factor = parseFloat(el.dataset.mouse) || 0;
      const ox = (lx / window.innerWidth - 0.5) * factor;
      const oy = (ly / window.innerHeight - 0.5) * factor;
      el.style.transform = `translate(${ox.toFixed(2)}px, ${oy.toFixed(2)}px)`;
    });

    if (moving) {
      raf = requestAnimationFrame(loop);
    }
  }

  function onMove(e) {
    const rect = hero.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    mx = e.clientX;
    my = e.clientY;
    if (!moving) {
      moving = true;
      loop();
    }
  }

  document.addEventListener('mousemove', onMove, { passive: true });

  // Stop loop when hero not visible
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      moving = e.isIntersecting;
      if (moving) loop();
    });
  }, { threshold: 0 });
  obs.observe(hero);
}
