/* ═══════════════════════════════════════════════
   PARTICLES.JS — Raven-Trading Particle Motion Engine
   Canvas-based ambient + reactive particle system
   ═══════════════════════════════════════════════ */

const ParticleEngine = (() => {

  /* ── State ── */
  let canvas, ctx, W, H, RAF;
  let particles = [];
  let bursts    = [];
  let streaks   = [];
  let currentWorld = 'reactor';
  let scrollY   = 0;
  let time      = 0;

  /* ── World profiles ── */
  const WORLDS = {
    reactor: {
      color:   '#ff6600',
      color2:  '#ff2200',
      count:   80,
      speed:   0.4,
      size:    [1, 2.5],
      drift:   { x: 0.1, y: -0.3 },
      connect: true,
      burst:   { color: '#ff8800', count: 25, speed: 4 }
    },
    signals: {
      color:   '#00d4ff',
      color2:  '#0066ff',
      count:   120,
      speed:   0.7,
      size:    [0.5, 1.8],
      drift:   { x: 0.2, y: -0.2 },
      connect: true,
      burst:   { color: '#00eeff', count: 30, speed: 5 }
    },
    cityscape: {
      color:   '#cc00ff',
      color2:  '#ff2200',
      count:   90,
      speed:   0.9,
      size:    [0.5, 2],
      drift:   { x: 0.3, y: -0.4 },
      connect: false,
      burst:   { color: '#ff44ff', count: 35, speed: 6 }
    },
    fusion: {
      color:   '#00ffdd',
      color2:  '#00aaff',
      count:   100,
      speed:   0.3,
      size:    [1, 3],
      drift:   { x: 0, y: -0.2 },
      connect: true,
      burst:   { color: '#80ffee', count: 40, speed: 3 }
    },
    command: {
      color:   '#ffcc00',
      color2:  '#ff8800',
      count:   70,
      speed:   0.5,
      size:    [0.8, 2],
      drift:   { x: 0.15, y: -0.25 },
      connect: true,
      burst:   { color: '#ffdd44', count: 20, speed: 4 }
    }
  };

  /* ── Particle class ── */
  class Particle {
    constructor(world) {
      this.world = world;
      this.reset(true);
    }

    reset(initial = false) {
      const p  = WORLDS[this.world];
      this.x   = Math.random() * W;
      this.y   = initial ? Math.random() * H : H + 10;
      this.vx  = (Math.random() - 0.5) * p.speed + p.drift.x;
      this.vy  = -(Math.random() * p.speed + 0.1) + p.drift.y;
      this.life    = 0;
      this.maxLife = 200 + Math.random() * 300;
      const sizes  = p.size;
      this.radius  = sizes[0] + Math.random() * (sizes[1] - sizes[0]);
      this.alpha   = 0;
      this.targetAlpha = 0.4 + Math.random() * 0.5;
      /* Alternate color */
      this.color   = Math.random() > 0.7 ? p.color2 : p.color;
      /* Wiggle */
      this.wiggleFreq  = 0.01 + Math.random() * 0.02;
      this.wiggleAmp   = 0.3 + Math.random() * 0.6;
      this.wiggleOff   = Math.random() * Math.PI * 2;
    }

    update() {
      this.life++;
      const progress = this.life / this.maxLife;

      /* Fade in/out */
      if (progress < 0.1)      this.alpha = (progress / 0.1) * this.targetAlpha;
      else if (progress > 0.8) this.alpha = ((1 - progress) / 0.2) * this.targetAlpha;
      else                     this.alpha = this.targetAlpha;

      /* Move */
      this.x += this.vx + Math.sin(time * this.wiggleFreq + this.wiggleOff) * this.wiggleAmp;
      this.y += this.vy;

      if (this.life >= this.maxLife) this.reset();
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle   = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur  = this.radius * 3;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /* ── Burst particle ── */
  class BurstParticle {
    constructor(x, y, color, speed) {
      this.x     = x;
      this.y     = y;
      this.color = color;
      const angle = Math.random() * Math.PI * 2;
      const spd   = speed * (0.3 + Math.random());
      this.vx    = Math.cos(angle) * spd;
      this.vy    = Math.sin(angle) * spd;
      this.life  = 0;
      this.maxLife = 40 + Math.random() * 30;
      this.radius  = 1 + Math.random() * 2.5;
      this.alpha   = 1;
    }

    update() {
      this.life++;
      this.x  += this.vx;
      this.y  += this.vy;
      this.vx *= 0.96;
      this.vy *= 0.96;
      this.alpha = 1 - this.life / this.maxLife;
      return this.life < this.maxLife;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle   = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur  = 8;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /* ── Streak particle ── */
  class Streak {
    constructor(world) {
      const p    = WORLDS[world];
      this.color = p.color;
      this.reset();
    }

    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.len = 20 + Math.random() * 80;
      this.angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.4;
      this.speed = 3 + Math.random() * 5;
      this.alpha = 0;
      this.life  = 0;
      this.maxLife = 30 + Math.random() * 40;
    }

    update() {
      this.life++;
      const progress = this.life / this.maxLife;
      this.alpha = progress < 0.2
        ? progress / 0.2 * 0.6
        : (1 - progress) * 0.6;
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      if (this.life >= this.maxLife) this.reset();
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha * 0.5;
      ctx.strokeStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur  = 4;
      ctx.lineWidth   = 0.8;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(
        this.x - Math.cos(this.angle) * this.len,
        this.y - Math.sin(this.angle) * this.len
      );
      ctx.stroke();
      ctx.restore();
    }
  }

  /* ── Connection lines ── */
  function drawConnections(pList, color) {
    const MAX_DIST = 80;
    for (let i = 0; i < pList.length; i++) {
      for (let j = i + 1; j < pList.length; j++) {
        const dx   = pList[i].x - pList[j].x;
        const dy   = pList[i].y - pList[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.08;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = color;
          ctx.lineWidth   = 0.5;
          ctx.beginPath();
          ctx.moveTo(pList[i].x, pList[i].y);
          ctx.lineTo(pList[j].x, pList[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  /* ── Resize handler ── */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  /* ── World switch ── */
  function switchWorld(world) {
    if (!WORLDS[world]) return;
    currentWorld = world;
    const p = WORLDS[world];

    /* Rebuild particles */
    particles = Array.from({ length: p.count }, () => new Particle(world));

    /* Rebuild streaks */
    const streakCount = world === 'cityscape' ? 12 : 5;
    streaks = Array.from({ length: streakCount }, () => new Streak(world));
  }

  /* ── Burst trigger ── */
  function triggerBurst(x, y) {
    const p = WORLDS[currentWorld].burst;
    for (let i = 0; i < p.count; i++) {
      bursts.push(new BurstParticle(x, y, p.color, p.speed));
    }
  }

  /* ── Draw loop ── */
  function draw() {
    RAF = requestAnimationFrame(draw);
    ctx.clearRect(0, 0, W, H);
    time++;

    const profile = WORLDS[currentWorld];

    /* Update + draw particles */
    particles.forEach(p => { p.update(); p.draw(ctx); });

    /* Connections */
    if (profile.connect) drawConnections(particles, profile.color);

    /* Streaks */
    streaks.forEach(s => { s.update(); s.draw(ctx); });

    /* Burst particles */
    bursts = bursts.filter(b => {
      const alive = b.update();
      if (alive) b.draw(ctx);
      return alive;
    });
  }

  /* ── Init ── */
  function init() {
    canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    switchWorld('reactor');
    draw();

    /* Scroll burst on section enter */
    document.addEventListener('world-change', e => {
      const { world } = e.detail;
      switchWorld(world);
      /* Burst at center on world change */
      setTimeout(() => triggerBurst(W / 2, H / 2), 200);
    });

    /* Click burst */
    document.addEventListener('click', e => {
      triggerBurst(e.clientX, e.clientY);
    });
  }

  return { init, switchWorld, triggerBurst };

})();

document.addEventListener('DOMContentLoaded', ParticleEngine.init);
