/* =========================================================================
   PARTICLE SYSTEM — ambient drift + confetti bursts + fireworks
   Pure canvas 2D, capped particle counts so it stays smooth on laptops.
   ========================================================================= */

const Particles = (() => {
  let canvas, ctx, w, h, dpr;
  let ambient = [];
  let bursts = []; // confetti / firework particles
  let running = false;
  let performanceMode = false;

  function init() {
    canvas = document.getElementById('particle-canvas');
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    seedAmbient();
    running = true;
    requestAnimationFrame(loop);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = window.innerWidth * dpr;
    h = canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }

  function seedAmbient() {
    const count = performanceMode ? 18 : 42;
    ambient = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: (Math.random() * 1.6 + .4) * dpr,
      vy: (Math.random() * .15 + .04) * dpr,
      vx: (Math.random() - .5) * .08 * dpr,
      alpha: Math.random() * .5 + .15,
      hue: Math.random() > .82 ? 'gold' : 'red',
    }));
  }

  function setPerformanceMode(on) {
    performanceMode = on;
    seedAmbient();
  }

  function drawAmbient() {
    for (const p of ambient) {
      p.y -= p.vy; p.x += p.vx;
      if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      ctx.beginPath();
      ctx.fillStyle = p.hue === 'gold'
        ? `rgba(255,209,102,${p.alpha})`
        : `rgba(230,36,41,${p.alpha})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function confettiBurst(originX = .5, originY = .3, count = 140) {
    if (performanceMode) count = Math.round(count * .5);
    const colors = ['#E62429', '#FF3035', '#FFD166', '#FFFFFF'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 6 + 2) * dpr;
      bursts.push({
        x: w * originX, y: h * originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2 * dpr,
        g: .12 * dpr,
        size: (Math.random() * 5 + 3) * dpr,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: Math.random() * .006 + .004,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - .5) * .3,
        shape: Math.random() > .5 ? 'rect' : 'circle',
      });
    }
  }

  function fireworkBurst(x = Math.random(), y = Math.random() * .4 + .1) {
    confettiBurst(x, y, performanceMode ? 40 : 90);
  }

  function fireworksShow(times = 5) {
    let i = 0;
    const id = setInterval(() => {
      fireworkBurst();
      i++;
      if (i >= times) clearInterval(id);
    }, 450);
  }

  function drawBursts() {
    bursts = bursts.filter(p => p.life > 0);
    for (const p of bursts) {
      p.vy += p.g;
      p.x += p.vx; p.y += p.vy;
      p.rot += p.vrot;
      p.life -= p.decay;
      ctx.save();
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function loop() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    drawAmbient();
    drawBursts();
    requestAnimationFrame(loop);
  }

  return { init, confettiBurst, fireworkBurst, fireworksShow, setPerformanceMode };
})();