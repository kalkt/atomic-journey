/* ═══════════════════════════════════════════════
   TOKAMAK-RING.JS — Procedural Three.js module
   Toroidal magnetic ring with animated plasma
   ═══════════════════════════════════════════════ */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';

const TokamakRing = (() => {

  let group;
  let torusMesh, innerTorus;
  let plasmaBand;
  let orbitalRings = [];
  let plasmaParticles;
  let initialized = false;

  function buildTokamak(scene) {
    group = new THREE.Group();

    /* ── Outer containment torus ── */
    const outerGeo = new THREE.TorusGeometry(2.0, 0.12, 16, 120);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0x004466,
      transparent: true,
      opacity: 0.5,
      wireframe: false
    });
    torusMesh = new THREE.Mesh(outerGeo, outerMat);
    torusMesh.rotation.x = Math.PI / 2;
    group.add(torusMesh);

    /* ── Plasma band torus ── */
    const plasmaGeo = new THREE.TorusGeometry(2.0, 0.06, 8, 120);
    const plasmaMat = new THREE.MeshBasicMaterial({
      color: 0x00ffdd,
      transparent: true,
      opacity: 0.85
    });
    plasmaBand = new THREE.Mesh(plasmaGeo, plasmaMat);
    plasmaBand.rotation.x = Math.PI / 2;
    group.add(plasmaBand);

    /* ── Inner structural torus (magnetic cage) ── */
    const innerGeo = new THREE.TorusGeometry(2.0, 0.3, 6, 80);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x002233,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    });
    innerTorus = new THREE.Mesh(innerGeo, innerMat);
    innerTorus.rotation.x = Math.PI / 2;
    group.add(innerTorus);

    /* ── Magnetic field rings (poloidal) ── */
    const poloidalAngles = [0, Math.PI / 4, Math.PI / 2, Math.PI * 3/4, Math.PI,
                            Math.PI * 5/4, Math.PI * 3/2, Math.PI * 7/4];
    poloidalAngles.forEach((angle, i) => {
      const rGeo = new THREE.TorusGeometry(0.28, 0.008, 8, 40);
      const rMat = new THREE.MeshBasicMaterial({
        color: 0x0088bb,
        transparent: true,
        opacity: 0.25
      });
      const r = new THREE.Mesh(rGeo, rMat);
      r.position.x = Math.cos(angle) * 2.0;
      r.position.z = Math.sin(angle) * 2.0;
      r.rotation.y = -angle;
      group.add(r);
      orbitalRings.push(r);
    });

    /* ── Plasma particles along torus ── */
    const pCount = 600;
    const pGeo   = new THREE.BufferGeometry();
    const pPos   = new Float32Array(pCount * 3);
    const pCol   = new Float32Array(pCount * 3);

    for (let i = 0; i < pCount; i++) {
      const angle = (i / pCount) * Math.PI * 2;
      const jitter = (Math.random() - 0.5) * 0.2;
      const radialJitter = (Math.random() - 0.5) * 0.15;
      const tubeAngle = Math.random() * Math.PI * 2;
      pPos[i * 3]     = (2.0 + Math.cos(tubeAngle) * (0.06 + radialJitter)) * Math.cos(angle + jitter);
      pPos[i * 3 + 1] = Math.sin(tubeAngle) * (0.06 + radialJitter);
      pPos[i * 3 + 2] = (2.0 + Math.cos(tubeAngle) * (0.06 + radialJitter)) * Math.sin(angle + jitter);
      /* Teal to white */
      pCol[i * 3]     = 0.0 + Math.random() * 0.4;
      pCol[i * 3 + 1] = 0.8 + Math.random() * 0.2;
      pCol[i * 3 + 2] = 0.7 + Math.random() * 0.3;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color',    new THREE.BufferAttribute(pCol, 3));

    const pMat = new THREE.PointsMaterial({
      size:         0.035,
      vertexColors: true,
      transparent:  true,
      opacity:      0.8,
      blending:     THREE.AdditiveBlending,
      depthWrite:   false
    });

    plasmaParticles = new THREE.Points(pGeo, pMat);
    group.add(plasmaParticles);

    /* Center glow sphere */
    const cgGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const cgMat = new THREE.MeshBasicMaterial({
      color: 0x00ffdd,
      transparent: true,
      opacity: 0.04,
      side: THREE.BackSide
    });
    group.add(new THREE.Mesh(cgGeo, cgMat));

    group.position.set(-1.5, 0, -2);
    scene.add(group);
    initialized = true;
  }

  function init(scene) {
    if (!initialized) buildTokamak(scene);
    if (group) group.visible = true;
  }

  function update(t) {
    if (!initialized || !group) return;

    /* Rotate whole tokamak slowly */
    group.rotation.y += 0.005;
    group.rotation.x = Math.sin(t * 0.2) * 0.1;

    /* Plasma band pulse */
    if (plasmaBand) {
      plasmaBand.material.opacity = 0.6 + Math.sin(t * 3) * 0.25;
    }

    /* Outer torus rotate */
    if (torusMesh) {
      torusMesh.rotation.z += 0.003;
    }

    /* Poloidal rings flicker */
    orbitalRings.forEach((r, i) => {
      r.material.opacity = 0.15 + Math.sin(t * 2 + i * 0.8) * 0.1;
    });

    /* Particle shimmer */
    if (plasmaParticles) {
      plasmaParticles.rotation.y += 0.008;
      plasmaParticles.material.opacity = 0.6 + Math.sin(t * 4) * 0.2;
    }

    /* Float */
    group.position.y = Math.sin(t * 0.35) * 0.2;
  }

  function hide() {
    if (group) group.visible = false;
  }

  return { init, update, hide, get mesh() { return group; } };

})();

export default TokamakRing;
