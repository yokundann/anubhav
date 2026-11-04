/* turntable.js */
export function initTurntable() {
  const section = document.getElementById('experience');
  const record = document.getElementById('record');
  const tonearm = document.getElementById('tonearm');
  const playBtn = document.getElementById('playBtn');
  const tracklist = document.getElementById('tracklist');
  const detailPanel = document.getElementById('trackDetail');
  const recordLabel = document.getElementById('recordLabel');

  if (!record || !section) return;

  let angle = 0;
  let playing = false;
  let lastTime = null;
  let raf = null;
  let activeIdx = 0;
  let dragActive = false;
  let dragStartAngle = 0;
  let dragStartMouse = 0;
  let accumulatedDrag = 0;

  const tracks = [...document.querySelectorAll('.track-btn')];

  function getRecordCenter() {
    const rect = record.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  function getAngleFromEvent(e) {
    const center = getRecordCenter();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return Math.atan2(clientY - center.y, clientX - center.x) * (180 / Math.PI);
  }

  function rotateTonearm(idx) {
    if (tonearm) {
      tonearm.style.transform = `rotate(${14 + idx * 3.4}deg)`;
    }
  }

  function setTrack(idx) {
    activeIdx = idx;
    tracks.forEach((t, i) => t.classList.toggle('active', i === idx));
    rotateTonearm(idx);
    updateDetail(idx);
    updateLabel(idx);
  }

  function updateLabel(idx) {
    if (!recordLabel) return;
    const btn = tracks[idx];
    if (!btn) return;
    const side = btn.querySelector('.side')?.textContent || '';
    const co = btn.querySelector('.t-co')?.textContent || '';
    const yr = btn.querySelector('.t-yr span')?.textContent || '';
    const color = btn.dataset.color || '#e9ff2e';
    const textColor = btn.dataset.textColor || '#0b0d12';

    recordLabel.style.background = color;
    recordLabel.style.color = textColor;
    recordLabel.querySelector('.rl-side').textContent = side;
    recordLabel.querySelector('.rl-co').textContent = co;
    recordLabel.querySelector('.rl-yr').textContent = yr;
  }

  function updateDetail(idx) {
    if (!detailPanel) return;
    const btn = tracks[idx];
    if (!btn) return;

    const co = btn.querySelector('.t-co')?.textContent || '';
    const role = btn.querySelector('.t-role')?.textContent || '';
    const yr = btn.querySelector('.t-yr span')?.textContent || '';
    const bullets = [...btn.querySelectorAll('.track-bullets li')].map(li => li.textContent);

    detailPanel.classList.add('animating');
    setTimeout(() => detailPanel.classList.remove('animating'), 400);

    const kind = btn.dataset.kind || '';
    const loc = btn.dataset.location || '';

    detailPanel.innerHTML = `
      <p class="td-co">${co}${loc ? ' · ' + loc : ''}</p>
      <p class="td-role">${role}</p>
      <p class="td-meta">${yr}</p>
      <ul class="td-bullets">${bullets.map(b => `<li>${b}</li>`).join('')}</ul>
    `;
  }

  // Rotation loop
  function loop(ts) {
    if (!playing) return;
    if (lastTime !== null) {
      const delta = Math.min(ts - lastTime, 50);
      angle += 0.2 * delta / 16.67; // 0.2 deg per frame @ 60fps
    }
    lastTime = ts;
    record.style.transform = `rotate(${angle}deg)`;
    raf = requestAnimationFrame(loop);
  }

  function play() {
    playing = true;
    lastTime = null;
    playBtn.querySelector('.icon-play')?.classList.add('hidden');
    playBtn.querySelector('.icon-pause')?.classList.remove('hidden');
    raf = requestAnimationFrame(loop);
  }

  function pause() {
    playing = false;
    lastTime = null;
    cancelAnimationFrame(raf);
    playBtn.querySelector('.icon-play')?.classList.remove('hidden');
    playBtn.querySelector('.icon-pause')?.classList.add('hidden');
  }

  playBtn?.addEventListener('click', () => {
    if (playing) pause(); else play();
  });

  // Drag
  record.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    record.setPointerCapture(e.pointerId);
    dragActive = true;
    dragStartAngle = angle;
    dragStartMouse = getAngleFromEvent(e);
    accumulatedDrag = 0;
    pause();
  });

  record.addEventListener('pointermove', (e) => {
    if (!dragActive) return;
    const currentMouse = getAngleFromEvent(e);
    let delta = currentMouse - dragStartMouse;
    // Handle wraparound
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    angle = dragStartAngle + delta;
    accumulatedDrag += Math.abs(delta);
    record.style.transform = `rotate(${angle}deg)`;

    // Change track every 150deg of drag
    const trackChanges = Math.floor(accumulatedDrag / 150);
    if (trackChanges > 0 && delta > 0) {
      const newIdx = (activeIdx + 1) % tracks.length;
      setTrack(newIdx);
      accumulatedDrag = 0;
    } else if (trackChanges > 0 && delta < 0) {
      const newIdx = (activeIdx - 1 + tracks.length) % tracks.length;
      setTrack(newIdx);
      accumulatedDrag = 0;
    }
  });

  record.addEventListener('pointerup', () => {
    dragActive = false;
    play();
  });

  // Track clicks
  tracks.forEach((btn, idx) => {
    btn.addEventListener('click', () => setTrack(idx));
  });

  // Arrow key support (slider role)
  record.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      setTrack((activeIdx + 1) % tracks.length);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      setTrack((activeIdx - 1 + tracks.length) % tracks.length);
    }
  });

  // Start when section 25% visible
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !playing) play();
      if (!e.isIntersecting && playing) pause();
    });
  }, { threshold: 0.25 });
  obs.observe(section);

  // Initial state
  setTrack(0);
  rotateTonearm(0);
}
