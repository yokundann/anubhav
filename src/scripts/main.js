/* main.js — entry. Order matters: reveal/split first, then motion systems. */
import { initPreloader } from './preloader.js';
import { initReveal } from './reveal.js';
import { initParallax } from './parallax.js';
import { initHero } from './hero.js';
import { initMarquee } from './marquee.js';
import { initChrome } from './chrome.js';
import { initMenu } from './menu.js';
import { initCursor } from './cursor.js';
import { initMagnetic } from './magnetic.js';
import { initExperience } from './experience.js';
import { initScrollFx } from './scrollfx.js';
import { initWork } from './work.js';

function init() {
  initReveal();
  initScrollFx();
  initExperience();
  initMenu();
  initMarquee();
  initWork();
  initParallax();
  initHero();
  initChrome();
  initCursor();
  initMagnetic();
  initPreloader();
  window.__siteReady = true;
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
