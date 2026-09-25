/* ═══════════════════════════════════════════════
   FUSION-TOWER.JS — Procedural Three.js module
   Futuristic skyscraper with neon energy conduits
   ═══════════════════════════════════════════════ */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';

const FusionTower = (() => {

  let group;
  let towerBody;
  let conduits = [];
  let conduitLights = [];
  let spire;
  let glowDisc;
  let initialized = false;

  function buildTower(scene) {
    group = new THREE.Group();

    /* ── Main tower body ── */
    const bodyGeo = new THREE.BoxGeometry(0.6, 4.0, 0.6);
    const bodyMat = new THREE.MeshBasicMaterial({
      color: 0x050215,
      transparent: true,
      opacity: 0.92
    });
    towerBody = new THREE.Mesh(bodyGeo, bodyMat);
    towerBody.position.y = 0;
    group.add(towerBody);

    /* ── Tower panels (slightly inset geometry) ── */
    const panelGeo = new THREE.BoxGeometry(0.58, 3.95, 0.58);
    const panelMat = new THREE.MeshBasicMaterial({
      color: 0x08052a,
      wireframe: false,
      transparent: true,
      opacity: 0.5
    });
    group.add(new THREE.Mesh(panelGeo, panelMat));

    /* ── Neon conduit lines (vertical) ── */
    const conduitColors = [0xcc00ff, 0xff2200, 0x00ffdd, 0xcc00ff];
    const conduitOffsets = [
      { x: 0.31, z: 0.0 },
      { x: -0.31, z: 0.0 },
      { x: 0.0, z: 0.31 },
      { x: 0.0, z: -0.31 }
    ];

    conduitOffsets.forEach((off, i) => {
      /* Conduit tube */
      const cGeo = new THREE.CylinderGeometry(0.015, 0.015, 4.2, 8);
      const cMat = new THREE.MeshBasicMaterial({
        color: conduitColors[i],
        transparent: true,
        opacity: 0.7
      });
      const c = new THREE.Mesh(cGeo, cMat);
      c.position.set(off.x, 0, off.z);
      group.add(c);
      conduits.push({ mesh: c, phase: i * Math.PI / 2 });

      /* Point light for conduit glow */
      const light = new THREE.PointLight(conduitColors[i], 0.8, 2);
      light.position.set(off.x, 0, off.z);
      group.add(light);
      conduitLights.push({ light, phase: i * Math.PI / 2 });
    });

    /* ── Floor ledge rings ── */
    const ledgeY = [-1.5, -0.5, 0.5, 1.5];
    ledgeY.forEach(y => {
      const lGeo = new THREE.BoxGeometry(0.75, 0.04, 0.75);
      const lMat = new THREE.MeshBasicMaterial({ color: 0x0a0530, transparent: true, opacity: 0.8 });
      const ledge = new THREE.Mesh(lGeo, lMat);
      ledge.position.y = y;
      group.add(ledge);
      /* Ledge neon trim */
      const trimGeo = new THREE.EdgesGeometry(lGeo);
      const trimMat = new THREE.LineBasicMaterial({ color: 0xcc00ff, transparent: true, opacity: 0.3 });
      const trim = new THREE.LineSegments(trimGeo, trimMat);
      trim.position.y = y;
      group.add(trim);
    });

    /* ── Spire ── */
    const spireGeo = new THREE.ConeGeometry(0.04, 1.2, 8);
    const spireMat = new THREE.MeshBasicMaterial({ color: 0xcc00ff, transparent: true, opacity: 0.8 });
    spire = new THREE.Mesh(spireGeo, spireMat);
    spire.position.y = 2.6;
    group.add(spire);

    /* Spire tip light */
    const spireLight = new THREE.PointLight(0xcc00ff, 2.0, 1.5);
    spireLight.position.y = 3.2;
    group.add(spireLight);
    conduitLights.push({ light: spireLight, phase: 0, isSpire: true });

    /* ── Ground glow disc ── */
    const discGeo = new THREE.CircleGeometry(1.2, 32);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0xcc00ff,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide
    });
    glowDisc = new THREE.Mesh(discGeo, discMat);
    glowDisc.rotation.x = -Math.PI / 2;
    glowDisc.position.y = -2.05;
    group.add(glowDisc);

    group.position.set(0, -0.5, -3);
    scene.add(group);
    initialized = true;
  }

  function init(scene) {
    if (!initialized) buildTower(scene);
    if (group) group.visible = true;
  }

  function update(t) {
    if (!initialized || !group) return;

    /* Animate conduits */
    conduits.forEach(c => {
      c.mesh.material.opacity = 0.4 + Math.sin(t * 3 + c.phase) * 0.3;
    });

    /* Animate conduit lights */
    conduitLights.forEach(cl => {
      if (cl.isSpire) {
        cl.light.intensity = 1.5 + Math.sin(t * 4) * 1.0;
      } else {
        cl.light.intensity = 0.5 + Math.sin(t * 2.5 + cl.phase) * 0.3;
      }
    });

    /* Spire pulse */
    if (spire) {
      spire.material.opacity = 0.6 + Math.sin(t * 4) * 0.4;
    }

    /* Ground glow pulse */
    if (glowDisc) {
      glowDisc.material.opacity = 0.04 + Math.sin(t * 1.5) * 0.03;
    }

    /* Slow rotation */
    group.rotation.y += 0.003;
    group.position.y = -0.5 + Math.sin(t * 0.3) * 0.1;
  }

  function hide() {
    if (group) group.visible = false;
  }

  return { init, update, hide, get mesh() { return group; } };

})();

export default FusionTower;
