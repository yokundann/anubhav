/* led.js */

// Seven-segment display: which segments light for each digit 0-9
// Segments: [a=top, b=top-right, c=bot-right, d=bot, e=bot-left, f=top-left, g=mid]
const SEGMENTS = {
  '0': [1,1,1,1,1,1,0],
  '1': [0,1,1,0,0,0,0],
  '2': [1,1,0,1,1,0,1],
  '3': [1,1,1,1,0,0,1],
  '4': [0,1,1,0,0,1,1],
  '5': [1,0,1,1,0,1,1],
  '6': [1,0,1,1,1,1,1],
  '7': [1,1,1,0,0,0,0],
  '8': [1,1,1,1,1,1,1],
  '9': [1,1,1,1,0,1,1]
};

function buildDigit(char) {
  const segs = SEGMENTS[char] || [0,0,0,0,0,0,0];
  const el = document.createElement('span');
  el.className = 'digit';

  // 7 segment i elements in layout order
  // Grid layout: row1=a(top), row2=f(top-left)+g(mid-placeholder)+b(top-right),
  // row3=g(mid), row4=e(bot-left)+?+c(bot-right), row5=d(bot)
  const configs = [
    { cls: 'seg-h seg-a', on: segs[0] },  // a top
    { cls: 'seg-v seg-f', on: segs[5] },  // f top-left
    { cls: 'seg-v seg-b', on: segs[1] },  // b top-right
    { cls: 'seg-h seg-g', on: segs[6] },  // g mid
    { cls: 'seg-v seg-e', on: segs[4] },  // e bot-left
    { cls: 'seg-v seg-c', on: segs[2] },  // c bot-right
    { cls: 'seg-h seg-d', on: segs[3] },  // d bot
  ];

  configs.forEach(cfg => {
    const i = document.createElement('i');
    i.className = cfg.cls + (cfg.on ? ' on' : '');
    el.appendChild(i);
  });

  return el;
}

function animateValue(container, targetStr, delay) {
  const digits = targetStr.split('');

  // Clear existing
  container.innerHTML = '';

  // Build digit containers
  const digitEls = digits.map(() => {
    const wrap = document.createElement('span');
    wrap.className = 'digit-wrap';
    container.appendChild(wrap);
    return wrap;
  });

  const steps = 16;
  let step = 0;

  function tick() {
    if (step > steps) {
      // Render final
      digits.forEach((d, i) => {
        digitEls[i].innerHTML = '';
        digitEls[i].appendChild(buildDigit(d));
      });
      return;
    }

    const t = step / steps;
    const eased = Math.pow(t, 0.6);

    digits.forEach((targetDigit, i) => {
      const targetNum = parseInt(targetDigit, 10);
      const current = isNaN(targetNum) ? targetDigit : Math.round(targetNum * eased);
      const char = isNaN(targetNum) ? targetDigit : String(current);
      digitEls[i].innerHTML = '';
      if (char >= '0' && char <= '9') {
        digitEls[i].appendChild(buildDigit(char));
      } else {
        const sp = document.createElement('span');
        sp.className = 'digit-char';
        sp.textContent = char;
        sp.style.cssText = 'font-family:var(--f-sign);font-size:14px;color:var(--red);line-height:1;';
        digitEls[i].appendChild(sp);
      }
    });

    step++;
    setTimeout(tick, 50);
  }

  setTimeout(tick, delay);
}

export function initLed() {
  document.addEventListener('door-lifted', () => {
    const cells = document.querySelectorAll('.led-cell');
    cells.forEach((cell, idx) => {
      const led = cell.querySelector('.led');
      if (!led) return;
      const value = led.dataset.value || '0';
      animateValue(led, value, 250 + idx * 140);
    });
  });
}
