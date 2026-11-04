/* main.js */
import { initDoor } from './door.js';
import { initLed } from './led.js';
import { initLayers } from './layers.js';
import { initParallax } from './parallax.js';
import { initReveal } from './reveal.js';
import { initTurntable } from './turntable.js';
import { initStickers } from './stickers.js';
import { initCrate } from './crate.js';
import { initSingles } from './singles.js';
import { initSpray } from './spray.js';
import { initNav } from './nav.js';

function init() {
  initDoor();
  initLed();
  initLayers();
  initParallax();
  initReveal();
  initNav();
  initTurntable();
  initStickers();
  initCrate();
  initSingles();
  initSpray();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
