/* ═══════════════════════════════════════════════
   WORLD-SWITCHER.JS — Section → Environment Manager
   Detects active section, fires world transitions
   ═══════════════════════════════════════════════ */

const WorldSwitcher = (() => {

  /* ── World config (mirrors section data attributes) ── */
  const WORLD_CONFIG = {
    reactor: {
      neon:      '#ff6600',
      neon2:     '#ff2200',
      atomSymbol: 'U',
      atomName:  'Uranium',
      atomNum:   '92',
      label:     'REACTOR CORE',
      speed:     'SLOW',
      cssVar:    'var(--neon-reactor)'
    },
    signals: {
      neon:      '#00d4ff',
      neon2:     '#0066ff',
      atomSymbol: 'Th',
      atomName:  'Thorium',
      atomNum:   '90',
      label:     'SIGNAL SPACE',
      speed:     'MEDIUM',
      cssVar:    'var(--neon-signals)'
    },
    cityscape: {
      neon:      '#cc00ff',
      neon2:     '#ff2200',
      atomSymbol: 'Pu',
      atomName:  'Plutonium',
      atomNum:   '94',
      label:     'URBAN MATRIX',
      speed:     'FAST',
      cssVar:    'var(--neon-city)'
    },
    fusion: {
      neon:      '#00ffdd',
      neon2:     '#00aaff',
      atomSymbol: 'He',
      atomName:  'Helium-4',
      atomNum:   '2',
      label:     'FUSION STATE',
      speed:     'SLOW',
      cssVar:    'var(--neon-fusion)'
    },
    command: {
      neon:      '#ffcc00',
      neon2:     '#ff8800',
      atomSymbol: 'U-235',
      atomName:  'Uranium-235',
      atomNum:   '92',
      label:     'COMMAND LAYER',
      speed:     'MEDIUM',
      cssVar:    'var(--neon-command)'
    }
  };

  /* ── Section → world mapping ── */
  const SECTION_MAP = {
    'section-hero':      'reactor',
    'section-executive': 'reactor',
    'section-signals':   'signals',
    'section-scenarios': 'cityscape',
    'section-preferred': 'fusion',
    'section-pathway':   'command',
    'section-conclusion':'command',
    'section-references':'command'
  };

  /* ── HUD element cache ── */
  let hudAtomSymbol, hudAtomName, hudAtomNum;
  let hudWorldName, hudWorldSpeed;
  let hudSectionName;
  let hudPips;
  let hudFlash;
  let hudOrbitalRing, hudOrbitalRing2;
  let hudCorners;
  let atomTransition, atomTransitionSymbol;
  let allWorlds;

  let currentWorld = null;
  const SECTIONS    = Object.keys(SECTION_MAP);

  /* ── Cache DOM ── */
  function cacheDom() {
    hudAtomSymbol   = document.getElementById('hud-atom-symbol');
    hudAtomName     = document.getElementById('hud-atom-name');
    hudAtomNum      = document.getElementById('hud-atom-number');
    hudWorldName    = document.getElementById('hud-world-name');
    hudWorldSpeed   = document.getElementById('hud-world-speed');
    hudSectionName  = document.getElementById('hud-section-name');
    hudPips         = document.querySelectorAll('.hud-section-pip');
    hudFlash        = document.getElementById('hud-world-flash');
    hudOrbitalRing  = document.getElementById('hud-orbital-ring');
    hudOrbitalRing2 = document.getElementById('hud-orbital-ring-2');
    hudCorners      = document.querySelectorAll('.hud-corner');
    atomTransition       = document.getElementById('atom-transition');
    atomTransitionSymbol = document.getElementById('atom-transition-symbol');
    allWorlds       = document.querySelectorAll('.world');
  }

  /* ── Switch to a world ── */
  function switchToWorld(worldKey) {
    if (worldKey === currentWorld) return;
    const config = WORLD_CONFIG[worldKey];
    if (!config) return;

    const prev = currentWorld;
    currentWorld = worldKey;

    /* 1. Flash HUD */
    if (hudFlash) {
      hudFlash.classList.remove('flash');
      void hudFlash.offsetWidth; /* reflow */
      hudFlash.classList.add('flash');
    }

    /* 2. Atom transition overlay */
    if (atomTransition && atomTransitionSymbol) {
      atomTransitionSymbol.textContent = config.atomSymbol;
      atomTransition.classList.remove('active');
      void atomTransition.offsetWidth;
      atomTransition.classList.add('active');
      setTimeout(() => atomTransition.classList.remove('active'), 1200);
    }

    /* 3. Update CSS --neon-current globally */
    document.documentElement.style.setProperty(
      '--neon-current', config.neon
    );

    /* 4. Update HUD text */
    if (hudAtomSymbol)  hudAtomSymbol.textContent  = config.atomSymbol;
    if (hudAtomName)    hudAtomName.textContent     = config.atomName;
    if (hudAtomNum)     hudAtomNum.textContent      = `Z = ${config.atomNum}`;
    if (hudWorldName)   hudWorldName.textContent    = config.label;
    if (hudWorldSpeed)  hudWorldSpeed.textContent   = `SPEED: ${config.speed}`;
    if (hudSectionName) hudSectionName.textContent  = config.label;

    /* 5. Toggle world backgrounds */
    allWorlds.forEach(w => {
      const isTarget = w.id === `world-${worldKey}`;
      if (isTarget) {
        w.classList.add('active');
        w.classList.remove('exiting');
      } else if (w.classList.contains('active')) {
        w.classList.add('exiting');
        w.classList.remove('active');
        setTimeout(() => w.classList.remove('exiting'), 1400);
      }
    });

    /* 6. Dispatch event for particles + three */
    document.dispatchEvent(new CustomEvent('world-change', {
      detail: { world: worldKey, config, prev }
    }));

    /* 7. Parallax refresh */
    if (typeof ParallaxEngine !== 'undefined') ParallaxEngine.refresh();
  }

  /* ── Update pip indicators ── */
  function updatePips(sectionIndex) {
    if (!hudPips) return;
    hudPips.forEach((pip, i) => {
      pip.classList.toggle('active', i === sectionIndex);
    });
  }

  /* ── Intersection Observer ── */
  function setupObserver() {
    const sections = document.querySelectorAll('.story-section[data-world]');

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
          const sectionId = entry.target.id;
          const world     = entry.target.dataset.world || SECTION_MAP[sectionId];
          if (world) switchToWorld(world);

          /* Pip update */
          const idx = Array.from(sections).indexOf(entry.target);
          updatePips(idx);
        }
      });
    }, {
      threshold: [0.3, 0.6],
      rootMargin: '0px 0px -10% 0px'
    });

    sections.forEach(s => observer.observe(s));
  }

  /* ── Init ── */
  function init() {
    cacheDom();
    setupObserver();

    /* Default state */
    switchToWorld('reactor');

    /* Boot cover removal */
    const cover = document.getElementById('cover');
    if (cover) {
      setTimeout(() => cover.classList.add('fade-out'), 1800);
      setTimeout(() => { cover.style.display = 'none'; }, 3200);
    }
  }

  return { init, switchToWorld };

})();

document.addEventListener('DOMContentLoaded', WorldSwitcher.init);
