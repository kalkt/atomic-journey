/* ═══════════════════════════════════════════════
   ANIMATIONS.JS — Immersive Motion Engine
   · Zoom-in reveals with perspective depth
   · 3D card tilt on hover (mousemove)
   · Exploding particle bursts on scroll entry
   · Hover-reveal panels
   · Section number counter animations
   ═══════════════════════════════════════════════ */

const AnimationEngine = (() => {

  /* ══════════════════════════════
     ZOOM REVEAL
     Elements scale(0.7) blur(24px) → scale(1) blur(0)
     ══════════════════════════════ */
  function setupZoomReveals() {
    const els = document.querySelectorAll('.zoom-reveal');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el    = entry.target;
          const delay = parseFloat(el.dataset.zoomDelay || 0);
          setTimeout(() => el.classList.add('zoom-revealed'), delay * 1000);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => obs.observe(el));
  }

  /* ══════════════════════════════
     3D CARD TILT (hover)
     ══════════════════════════════ */
  function setupCardTilt() {
    const cards = document.querySelectorAll('.card-3d');
    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect   = card.getBoundingClientRect();
        const cx     = rect.left + rect.width  / 2;
        const cy     = rect.top  + rect.height / 2;
        const dx     = (e.clientX - cx) / (rect.width  / 2);
        const dy     = (e.clientY - cy) / (rect.height / 2);
        const rotX   = -dy * 8;  /* up to ±8deg */
        const rotY   =  dx * 8;
        const glowX  = 50 + dx * 30;
        const glowY  = 50 + dy * 30;

        card.style.transform =
          `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(4px)`;
        card.style.setProperty('--glow-x', glowX + '%');
        card.style.setProperty('--glow-y', glowY + '%');
        card.classList.add('card-3d--active');
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform =
          'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        card.classList.remove('card-3d--active');
      });
    });
  }

  /* ══════════════════════════════
     EXPLODE ON SCROLL ENTRY
     Spawns canvas burst at element center
     ══════════════════════════════ */
  const EXPLODE_COLORS = {
    reactor:   ['#ff6600', '#ff4400', '#ffaa44', '#ff8800'],
    signals:   ['#00d4ff', '#0066ff', '#44eeff', '#00aaff'],
    cityscape: ['#cc00ff', '#ff2200', '#ff44ff', '#9900ff'],
    fusion:    ['#00ffdd', '#00aaff', '#80ffee', '#00ffaa'],
    command:   ['#ffcc00', '#ff8800', '#ffee44', '#ffaa00']
  };

  function spawnExplode(el, world) {
    const colors = EXPLODE_COLORS[world] || EXPLODE_COLORS.reactor;
    const rect   = el.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2 + window.scrollY;

    /* Reuse the particle canvas */
    if (typeof ParticleEngine !== 'undefined' && ParticleEngine.triggerBurst) {
      ParticleEngine.triggerBurst(
        rect.left + rect.width  / 2,
        rect.top  + rect.height / 2
      );
    }
  }

  function setupExplodeOnScroll() {
    const els = document.querySelectorAll('.explode-reveal');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el    = entry.target;
          const world = el.closest('[data-world]')?.dataset.world || 'reactor';
          const delay = parseFloat(el.dataset.explodeDelay || 0);
          setTimeout(() => {
            el.classList.add('explode-revealed');
            spawnExplode(el, world);
          }, delay * 1000);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
    els.forEach(el => obs.observe(el));
  }

  /* ══════════════════════════════
     HOVER REVEAL PANELS
     .hover-reveal → shows .hover-panel on hover
     ══════════════════════════════ */
  function setupHoverReveals() {
    document.querySelectorAll('.hover-reveal').forEach(el => {
      const panel = el.querySelector('.hover-panel');
      if (!panel) return;
      el.addEventListener('mouseenter', () => panel.classList.add('visible'));
      el.addEventListener('mouseleave', () => panel.classList.remove('visible'));
    });
  }

  /* ══════════════════════════════
     SVG IMAGE PARALLAX ON SCROLL
     ══════════════════════════════ */
  function setupImageParallax() {
    const images = document.querySelectorAll('.parallax-img');
    window.addEventListener('scroll', () => {
      images.forEach(img => {
        const rect  = img.getBoundingClientRect();
        const rel   = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
        const shift = rel * 30;
        img.style.transform = `translateY(${shift}px) scale(1.05)`;
      });
    }, { passive: true });
  }

  /* ══════════════════════════════
     SECTION TITLE GLITCH EFFECT
     ══════════════════════════════ */
  function setupGlitch() {
    document.querySelectorAll('.glitch-text').forEach(el => {
      const text = el.textContent;
      el.setAttribute('data-text', text);
    });
  }

  /* ══════════════════════════════
     COUNTER STRIP ANIMATION
     ══════════════════════════════ */
  function animateCounterStrip() {
    document.querySelectorAll('.stat-number').forEach(el => {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const target = parseFloat(el.dataset.value || '0');
          const suffix = el.dataset.suffix || '';
          const dur    = 1400;
          const start  = performance.now();
          function step(now) {
            const t = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            el.textContent = (ease * target).toFixed(el.dataset.decimals || 0) + suffix;
            if (t < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          obs.unobserve(el);
        });
      }, { threshold: 0.6 });
      obs.observe(el);
    });
  }

  /* ══════════════════════════════
     TEXT LINE WIPE (clip-path reveal)
     ══════════════════════════════ */
  function setupLineWipes() {
    const els = document.querySelectorAll('.line-wipe');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el    = entry.target;
          const delay = parseFloat(el.dataset.wipeDelay || 0);
          setTimeout(() => el.classList.add('line-wiped'), delay * 1000);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.2 });
    els.forEach(el => obs.observe(el));
  }

  /* ══════════════════════════════
     FLOATING ATOM ICONS
     ══════════════════════════════ */
  function setupFloatingAtoms() {
    document.querySelectorAll('.atom-float').forEach((el, i) => {
      el.style.animationDelay = (i * 0.4) + 's';
    });
  }

  /* ══════════════════════════════
     INIT
     ══════════════════════════════ */
  function init() {
    setupZoomReveals();
    setupCardTilt();
    setupExplodeOnScroll();
    setupHoverReveals();
    setupImageParallax();
    setupGlitch();
    animateCounterStrip();
    setupLineWipes();
    setupFloatingAtoms();
  }

  return { init };

})();

document.addEventListener('DOMContentLoaded', AnimationEngine.init);
