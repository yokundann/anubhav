/* perf.js — keeps ambient animation from costing frames the visitor can't see.
   Every section (and marquee band) gets .is-offscreen while it is outside the viewport; editorial.css pauses all CSS
   animation inside it. The page looks and behaves the same, but only what is on screen is being animated. */
export function initPerf() {
  if (!('IntersectionObserver' in window)) return;
  const targets = document.querySelectorAll('main > section, main > .marquee, #footer, .hero__fx, .footer__fx');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => e.target.classList.toggle('is-offscreen', !e.isIntersecting));
  }, { rootMargin: '160px 0px 160px 0px' });
  targets.forEach((t) => { t.classList.add('is-offscreen'); io.observe(t); });

  // pause everything while the tab is hidden (CSS animations keep running in some browsers)
  document.addEventListener('visibilitychange', () => document.documentElement.classList.toggle('is-paused', document.hidden));
}
