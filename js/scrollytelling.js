/* ═══════════════════════════════════════════════
   SCROLLYTELLING.JS — Staggered Reveal Engine
   Observes elements, adds .revealed class,
   triggers typewriter and scan effects
   ═══════════════════════════════════════════════ */

const ScrollyEngine = (() => {

  let observer, staggerObserver;

  /* ── Thresholds ── */
  const REVEAL_OPTIONS = {
    threshold: 0.12,
    rootMargin: '0px 0px -6% 0px'
  };

  const STAGGER_OPTIONS = {
    threshold: 0.08,
    rootMargin: '0px 0px -4% 0px'
  };

  /* ── Single element reveal ── */
  function setupRevealObserver() {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.dataset.delay || 0;
          setTimeout(() => {
            el.classList.add('revealed');
          }, Number(delay));
          observer.unobserve(el);
        }
      });
    }, REVEAL_OPTIONS);

    document.querySelectorAll(
      '.reveal-el, .reveal-left, .reveal-scale, .reveal-line'
    ).forEach(el => observer.observe(el));
  }

  /* ── Stagger group reveal ── */
  function setupStaggerObserver() {
    staggerObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          staggerObserver.unobserve(entry.target);
        }
      });
    }, STAGGER_OPTIONS);

    document.querySelectorAll('.stagger-container').forEach(el => {
      staggerObserver.observe(el);
    });
  }

  /* ── Number counter animation ── */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = (el.dataset.count.includes('.')) ? 1 : 0;
    const duration = 1200;
    const start = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); /* ease-out cubic */
      el.textContent = (eased * target).toFixed(decimals);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  /* ── Counter observer ── */
  function setupCounterObserver() {
    const counterObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach(el => {
      el.textContent = '0';
      counterObs.observe(el);
    });
  }

  /* ── Typewriter trigger ── */
  function setupTypewriterObserver() {
    const twObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          twObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.typewriter').forEach(el => {
      el.style.animationPlayState = 'paused';
      twObs.observe(el);
    });
  }

  /* ── Progress bar fill ── */
  function setupProgressBars() {
    const pbObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = el.dataset.fill || '100';
          el.style.transition = 'width 1.2s cubic-bezier(0.25,0.46,0.45,0.94)';
          el.style.width = target + '%';
          pbObs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-fill]').forEach(el => {
      el.style.width = '0%';
      pbObs.observe(el);
    });
  }

  /* ── Scroll progress line (top of page) ── */
  function setupScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;

    window.addEventListener('scroll', () => {
      const max     = document.documentElement.scrollHeight - window.innerHeight;
      const current = window.scrollY;
      const pct     = (current / max) * 100;
      bar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ── Init ── */
  function init() {
    setupRevealObserver();
    setupStaggerObserver();
    setupCounterObserver();
    setupTypewriterObserver();
    setupProgressBars();
    setupScrollProgress();
  }

  return { init };

})();

document.addEventListener('DOMContentLoaded', ScrollyEngine.init);
