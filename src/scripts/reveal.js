/* reveal.js */
export function initReveal() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    // Make everything visible immediately
    document.querySelectorAll('.poster, .flyer, .section-head h2, .ghost').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  // Slide-in for poster + flyer
  const slideEls = document.querySelectorAll('.poster, aside.flyer');
  slideEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(32px)';
    el.style.transition = 'opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out)';
  });

  // Section headings word-by-word
  document.querySelectorAll('.section-head h2').forEach(h2 => {
    const text = h2.innerHTML;
    // Split preserving HTML
    const words = text.split(/(\s+)/);
    h2.innerHTML = words.map(w => {
      if (/^\s+$/.test(w)) return w;
      return `<span class="word-reveal" style="display:inline-block;opacity:0;transform:translateY(20px);transition:opacity 0.4s var(--ease-out),transform 0.4s var(--ease-out)">${w}</span>`;
    }).join('');
  });

  // Ghost drift
  const ghosts = document.querySelectorAll('.ghost');
  ghosts.forEach(g => {
    g.style.transform = 'translateX(40px)';
    g.style.transition = 'transform 1s var(--ease-out), opacity 0.8s';
    g.style.opacity = '0';
  });

  // Marker highlights
  document.querySelectorAll('mark').forEach(m => {
    m.style.backgroundImage = 'none';
    m.dataset.reveal = 'mark';
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      if (el.classList.contains('poster') || el.classList.contains('flyer')) {
        el.style.opacity = '1';
        el.style.transform = 'none';
        io.unobserve(el);
      }

      if (el.classList.contains('section-head')) {
        const words = el.querySelectorAll('.word-reveal');
        words.forEach((w, i) => {
          setTimeout(() => {
            w.style.opacity = '1';
            w.style.transform = 'none';
          }, i * 60);
        });
        io.unobserve(el);
      }

      if (el.classList.contains('ghost')) {
        el.style.transform = 'translateX(0)';
        el.style.opacity = '1';
        io.unobserve(el);
      }
    });
  }, { threshold: 0.15 });

  slideEls.forEach(el => io.observe(el));
  document.querySelectorAll('.section-head').forEach(el => io.observe(el));
  ghosts.forEach(g => io.observe(g));
}
