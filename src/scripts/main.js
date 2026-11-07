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
import { initMode } from './mode.js';
import { initEducation } from './education.js';
import { initInterests } from './interests.js';
import { initFooter } from './footer.js';
import { initLed } from './led.js';
import { initCinema } from './cinema.js';

function init() {
  initReveal();
  initScrollFx();
  initExperience();
  initMenu();
  initMarquee();
  initWork();
  initParallax();
  initHero();
  initMode();
  initEducation();
  initInterests();
  initFooter();
  initLed();
  initCinema();
  initChrome();
  initCursor();
  initMagnetic();
  initPreloader();
  window.__siteReady = true;
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
