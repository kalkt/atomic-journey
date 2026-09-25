/* ═══════════════════════════════════════════════
   PARALLAX.JS — Multi-Layer Depth Scroll System
   ═══════════════════════════════════════════════ */

const ParallaxEngine = (() => {

  /* ── Layer registry ── */
  /* Each entry: { el, depth, baseY, offsetY }
     depth 0 = no parallax, 1 = full scroll speed
     Negative depth = opposite direction             */
  let layers = [];
  let lastScrollY = 0;
  let ticking    = false;
  let viewH = window.innerHeight;

  /* ── Layer depth map by class / id ── */
  const DEPTH_MAP = {
    'layer-city-back'       : 0.06,
    'layer-city-mid'        : 0.12,
    'layer-city-front'      : 0.22,
    'layer-fusion-plasma'   : 0.04,
    'layer-fusion-rings'    : -0.08,
    'layer-reactor-plasma'  : 0.05,
    'layer-reactor-wall'    : 0.02,
    'layer-signals-grid'    : 0.03,
    'layer-signals-streams' : 0.07,
    'layer-command-grid'    : 0.04,
  };

  /* ── Collect layers on init ── */
  function collectLayers() {
    layers = [];
    Object.entries(DEPTH_MAP).forEach(([cls, depth]) => {
      document.querySelectorAll(`.${cls}`).forEach(el => {
        layers.push({
          el,
          depth,
          baseTransform: getComputedStyle(el).transform
        });
      });
    });
  }

  /* ── Update on scroll ── */
  function update() {
    const scrollY = window.scrollY;
    const delta   = scrollY - lastScrollY;

    layers.forEach(({ el, depth }) => {
      const shift = scrollY * depth;
      el.style.transform = `translateY(${shift}px)`;
    });

    lastScrollY = scrollY;
    ticking = false;
  }

  /* ── Scroll handler with RAF throttle ── */
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  /* ── Mouse parallax (subtle depth on mouse move) ── */
  let mouseX = 0.5;
  let mouseY = 0.5;
  let mouseRAF;

  function onMouseMove(e) {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  }

  function mouseParallaxLoop() {
    mouseRAF = requestAnimationFrame(mouseParallaxLoop);

    layers.forEach(({ el, depth }) => {
      /* Only apply mouse shift to layers with meaningful depth */
      if (Math.abs(depth) < 0.04) return;
      const mShift = depth * 20;
      const dx = (mouseX - 0.5) * mShift;
      const dy = (mouseY - 0.5) * mShift;
      const scrollShift = lastScrollY * depth;
      el.style.transform = `translate(${dx}px, ${scrollShift + dy}px)`;
    });
  }

  /* ── Resize handler ── */
  function onResize() {
    viewH = window.innerHeight;
    update();
  }

  /* ── Init ── */
  function init() {
    collectLayers();
    window.addEventListener('scroll',    onScroll,    { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('resize',    onResize);
    mouseParallaxLoop();
    update();
  }

  /* ── Refresh (call after world switch) ── */
  function refresh() {
    collectLayers();
    update();
  }

  return { init, refresh };

})();

document.addEventListener('DOMContentLoaded', ParallaxEngine.init);
