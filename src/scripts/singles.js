/* singles.js */
export function initSingles() {
  const singles = [...document.querySelectorAll('li.single')];

  singles.forEach(single => {
    const disc = single.querySelector('.s-disc');
    const sleeve = single.querySelector('.s-sleeve');

    function enter() {
      if (disc) disc.style.transform = 'rotate(25deg)';
      if (sleeve) sleeve.style.transform = 'translateX(-16px)';
    }
    function leave() {
      if (disc) disc.style.transform = '';
      if (sleeve) sleeve.style.transform = '';
    }

    single.addEventListener('mouseenter', enter);
    single.addEventListener('mouseleave', leave);
    single.addEventListener('focus', enter);
    single.addEventListener('blur', leave);

    // Mobile tap
    single.addEventListener('click', () => {
      const isActive = disc?.style.transform === 'rotate(25deg)';
      if (isActive) leave(); else enter();
    });
  });
}
