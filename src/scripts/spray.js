/* spray.js */
export function initSpray() {
  const canvas = document.getElementById('sprayCanvas');
  if (!canvas) return;

  const wall = canvas.closest('.wall');
  const hint = wall?.querySelector('.wall-hint');
  const exportBtn = document.getElementById('exportBtn');
  const undoBtn = document.getElementById('undoBtn');
  const clearBtn = document.getElementById('clearBtn');
  const colorInputs = [...document.querySelectorAll('.spray-color-input')];
  const capBtns = [...document.querySelectorAll('.cap-btn')];
  const sizeInput = document.getElementById('spraySize');
  const flowInput = document.getElementById('sprayFlow');

  const { showToast } = window._nav || {};
  function toast(msg) { if (showToast) showToast(msg); }

  // Set canvas size
  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * window.devicePixelRatio);
    canvas.height = Math.round(rect.height * window.devicePixelRatio);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
  }
  resize();

  const ctx = canvas.getContext('2d');
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  let painting = false;
  let currentColor = '#e9ff2e';
  let currentSize = 20;
  let currentFlow = 40;
  let hasDrawn = false;

  // Undo stack: array of ImageData snapshots
  const undoStack = [];
  const MAX_UNDO = 20;
  let strokeActive = false;

  function saveSnapshot() {
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStack.push(snap);
    if (undoStack.length > MAX_UNDO) undoStack.shift();
  }

  function undo() {
    if (!undoStack.length) return;
    const snap = undoStack.pop();
    ctx.putImageData(snap, 0, 0);
  }

  function clear() {
    if (!hasDrawn) return;
    saveSnapshot();
    ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
    hasDrawn = false;
    if (hint) hint.classList.remove('hidden');
    toast(window._nav?.toasts?.wallCleared || 'Wall cleared.');
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function spray(x, y) {
    const count = Math.round(currentFlow * 1.2);
    ctx.fillStyle = currentColor;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * currentSize;
      const px = x + radius * Math.cos(angle);
      const py = y + radius * Math.sin(angle);
      const alpha = 0.08 + Math.random() * 0.14;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(px, py, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    painting = true;
    strokeActive = true;
    saveSnapshot();
    if (!hasDrawn) {
      hasDrawn = true;
      if (hint) hint.classList.add('hidden');
    }
    const pos = getPos(e);
    spray(pos.x, pos.y);
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!painting) return;
    const pos = getPos(e);
    spray(pos.x, pos.y);
  });

  canvas.addEventListener('pointerup', () => {
    painting = false;
    strokeActive = false;
  });
  canvas.addEventListener('pointerleave', () => { painting = false; });

  // Color picker
  colorInputs.forEach(input => {
    input.addEventListener('change', () => {
      if (input.checked) currentColor = input.value;
    });
  });

  // Cap buttons (presets)
  capBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentColor = btn.dataset.color;
      capBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Also uncheck radio
      colorInputs.forEach(i => i.checked = false);
    });
  });

  // Sliders
  sizeInput?.addEventListener('input', () => { currentSize = parseInt(sizeInput.value); });
  flowInput?.addEventListener('input', () => { currentFlow = parseInt(flowInput.value); });

  // Undo / Clear
  undoBtn?.addEventListener('click', undo);
  clearBtn?.addEventListener('click', clear);

  // Export
  exportBtn?.addEventListener('click', () => {
    if (!hasDrawn) {
      toast(window._nav?.toasts?.tagFirst || 'Leave your tag first');
      return;
    }

    // Create offscreen canvas at 2560x1440
    const off = document.createElement('canvas');
    off.width = 2560;
    off.height = 1440;
    const offCtx = off.getContext('2d');

    // Dark background
    offCtx.fillStyle = '#0b0d12';
    offCtx.fillRect(0, 0, off.width, off.height);

    // Draw grain pattern
    offCtx.globalAlpha = 0.06;
    // Simple noise simulation
    for (let i = 0; i < 50000; i++) {
      const nx = Math.random() * off.width;
      const ny = Math.random() * off.height;
      offCtx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5})`;
      offCtx.fillRect(nx, ny, 1, 1);
    }
    offCtx.globalAlpha = 1;

    // Draw canvas content centered and scaled
    const scale = Math.min(off.width / canvas.offsetWidth, off.height / canvas.offsetHeight) * 0.8;
    const drawW = canvas.offsetWidth * scale;
    const drawH = canvas.offsetHeight * scale;
    const drawX = (off.width - drawW) / 2;
    const drawY = (off.height - drawH) / 2;

    offCtx.drawImage(canvas, drawX, drawY, drawW, drawH);

    // Caption
    offCtx.font = 'bold 32px "Bungee", system-ui, sans-serif';
    offCtx.fillStyle = 'rgba(255,255,255,0.3)';
    offCtx.textAlign = 'center';
    offCtx.fillText('I visited Anubhav\'s wall', off.width / 2, off.height - 80);
    offCtx.font = '24px "Bungee", system-ui, sans-serif';
    offCtx.fillStyle = 'rgba(255,255,255,0.15)';
    offCtx.fillText('and took this souvenir home', off.width / 2, off.height - 44);

    off.toBlob((blob) => {
      if (!blob) { toast(window._nav?.toasts?.exportFail || 'Could not create image.'); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'anubhav-wall-souvenir.png';
      a.click();
      URL.revokeObjectURL(url);
      toast(window._nav?.toasts?.downloading || 'Souvenir downloading!');
    }, 'image/png');
  });
}
