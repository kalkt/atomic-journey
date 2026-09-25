/* ═══════════════════════════════════════════════
   THREE-SETUP.JS — Three.js Scene Initialization
   Manages renderer, camera, scene, lights, RAF
   ═══════════════════════════════════════════════ */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';

const ThreeSetup = (() => {

  let renderer, scene, camera;
  let clock;
  let RAF;
  let activeAsset = null;
  let assetMap    = {};

  /* ── Resize handler ── */
  function onResize() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H);
  }

  /* ── Create renderer ── */
  function createRenderer() {
    renderer = new THREE.WebGLRenderer({
      alpha:     true,
      antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const container = document.getElementById('three-container');
    if (container) container.appendChild(renderer.domElement);
  }

  /* ── Create camera ── */
  function createCamera() {
    camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);
  }

  /* ── Create scene ── */
  function createScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.06);
  }

  /* ── Create lights ── */
  function createLights() {
    /* Ambient */
    const ambient = new THREE.AmbientLight(0x111122, 0.8);
    scene.add(ambient);

    /* Point lights for glow effect */
    const pointA = new THREE.PointLight(0xff6600, 2, 12);
    pointA.position.set(2, 2, 4);
    pointA.name = 'light-a';
    scene.add(pointA);

    const pointB = new THREE.PointLight(0x0066ff, 1.5, 10);
    pointB.position.set(-2, -1, 3);
    pointB.name = 'light-b';
    scene.add(pointB);
  }

  /* ── Animate loop ── */
  function animate() {
    RAF = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    /* Animate active asset */
    if (activeAsset && activeAsset.update) {
      activeAsset.update(t, scene, camera, renderer);
    }

    /* Subtle camera drift */
    camera.position.x = Math.sin(t * 0.08) * 0.3;
    camera.position.y = Math.cos(t * 0.06) * 0.15;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  /* ── Show a 3D asset ── */
  function showAsset(name) {
    /* Clear current */
    if (activeAsset && activeAsset.mesh) {
      scene.remove(activeAsset.mesh);
    }

    /* Load or retrieve */
    if (!assetMap[name]) return;

    activeAsset = assetMap[name];
    if (activeAsset.mesh) scene.add(activeAsset.mesh);
    if (activeAsset.init) activeAsset.init(scene, camera, renderer);
  }

  /* ── Register a 3D asset module ── */
  function registerAsset(name, module) {
    assetMap[name] = module;
  }

  /* ── Update lights for world ── */
  function setWorldLighting(world) {
    const colors = {
      reactor:   { a: 0xff4400, b: 0x220800 },
      signals:   { a: 0x00d4ff, b: 0x002244 },
      cityscape: { a: 0xcc00ff, b: 0x1a0033 },
      fusion:    { a: 0x00ffdd, b: 0x001133 },
      command:   { a: 0xffcc00, b: 0x221100 }
    };

    const c = colors[world] || colors.reactor;
    const lightA = scene.getObjectByName('light-a');
    const lightB = scene.getObjectByName('light-b');

    if (lightA) {
      lightA.color.setHex(c.a);
    }
    if (lightB) {
      lightB.color.setHex(c.b);
    }
  }

  /* ── Expose globals ── */
  function getScene()    { return scene; }
  function getCamera()   { return camera; }
  function getRenderer() { return renderer; }
  function getClock()    { return clock; }

  /* ── Init ── */
  function init() {
    clock = new THREE.Clock();
    createRenderer();
    createCamera();
    createScene();
    createLights();
    window.addEventListener('resize', onResize);
    animate();

    /* Listen for world changes */
    document.addEventListener('world-change', e => {
      const { world } = e.detail;
      setWorldLighting(world);
      showAsset(world);
    });
  }

  return {
    init,
    registerAsset,
    showAsset,
    getScene,
    getCamera,
    getRenderer,
    getClock
  };

})();

export default ThreeSetup;
