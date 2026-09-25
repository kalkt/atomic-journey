/* ═══════════════════════════════════════════════
   NEUTRON-BURST.JS — Procedural Three.js module
   Data-stream particle burst for signals world
   ═══════════════════════════════════════════════ */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';

const NeutronBurst = (() => {

  let group;
  let streamParticles;
  let burstRings = [];
  let core;
  let dataLines = [];
  let initialized = false;

  /* Per-particle velocities */
  let velocities;
  const PARTICLE_COUNT = 500;

  function buildBurst(scene) {
    group = new THREE.Group();

    /* ── Stream particles ── */
    const pGeo = new THREE.BufferGeometry();
    const pos  = new Float32Array(PARTICLE_COUNT * 3);
    const col  = new Float32Array(PARTICLE_COUNT * 3);
    velocities  = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      /* Start clustered near center */
      pos[i * 3]     = (Math.random() - 0.5) * 0.4;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;

      /* Random outward velocity */
      const speed = 0.01 + Math.random() * 0.025;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      velocities[i * 3]     = speed * Math.sin(phi) * Math.cos(theta);
      velocities[i * 3 + 1] = speed * Math.sin(phi) * Math.sin(theta);
      velocities[i * 3 + 2] = speed * Math.cos(phi);

      /* Cyan / blue / white range */
      const mix = Math.random();
      col[i * 3]     = mix * 0.2;
      col[i * 3 + 1] = 0.6 + mix * 0.4;
      col[i * 3 + 2] = 0.8 + mix * 0.2;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    pGeo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

    const pMat = new THREE.PointsMaterial({
      size:         0.045,
      vertexColors: true,
      transparent:  true,
      opacity:      0.75,
      blending:     THREE.AdditiveBlending,
      depthWrite:   false
    });

    streamParticles = new THREE.Points(pGeo, pMat);
    group.add(streamParticles);

    /* ── Expanding burst rings ── */
    for (let r = 0; r < 4; r++) {
      const rGeo = new THREE.TorusGeometry(0.01, 0.005, 6, 60);
      const rMat = new THREE.MeshBasicMaterial({
        color: 0x00d4ff,
        transparent: true,
        opacity: 0.6
      });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);
      burstRings.push({ mesh: ring, phase: r * Math.PI / 2, maxR: 1.5 + r * 0.5 });
    }

    /* ── Data line streams ── */
    for (let l = 0; l < 8; l++) {
      const points = [];
      const angle  = (l / 8) * Math.PI * 2;
      for (let p = 0; p <= 20; p++) {
        const t = p / 20;
        points.push(new THREE.Vector3(
          Math.cos(angle) * t * 2.5,
          (Math.random() - 0.5) * t * 0.3,
          Math.sin(angle) * t * 2.5
        ));
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x00d4ff,
        transparent: true,
        opacity: 0.2
      });
      const line = new THREE.Line(lineGeo, lineMat);
      group.add(line);
      dataLines.push({ mesh: line, phase: l * Math.PI / 4 });
    }

    /* ── Core neutron sphere ── */
    const cGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const cMat = new THREE.MeshBasicMaterial({
      color: 0xaaaaaa,
      transparent: true,
      opacity: 0.8
    });
    core = new THREE.Mesh(cGeo, cMat);
    group.add(core);

    /* Core glow */
    const cgGeo = new THREE.SphereGeometry(0.25, 12, 12);
    const cgMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.05,
      side: THREE.BackSide
    });
    group.add(new THREE.Mesh(cgGeo, cgMat));

    group.position.set(0, 0, -1);
    scene.add(group);
    initialized = true;
  }

  function init(scene) {
    if (!initialized) buildBurst(scene);
    if (group) group.visible = true;
  }

  function update(t) {
    if (!initialized || !group) return;

    /* Animate stream particles — expand and reset */
    const posAttr = streamParticles.geometry.attributes.position;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      posAttr.array[i * 3]     += velocities[i * 3];
      posAttr.array[i * 3 + 1] += velocities[i * 3 + 1];
      posAttr.array[i * 3 + 2] += velocities[i * 3 + 2];

      /* Boundary reset */
      const dx = posAttr.array[i * 3];
      const dy = posAttr.array[i * 3 + 1];
      const dz = posAttr.array[i * 3 + 2];
      if (dx * dx + dy * dy + dz * dz > 9) {
        posAttr.array[i * 3]     = (Math.random() - 0.5) * 0.2;
        posAttr.array[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
        posAttr.array[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
      }
    }
    posAttr.needsUpdate = true;

    /* Burst rings expand/reset */
    burstRings.forEach((r, i) => {
      const progress = ((t * 0.5 + r.phase / (Math.PI * 2)) % 1);
      const radius   = progress * r.maxR;
      r.mesh.scale.setScalar(radius > 0.01 ? radius : 0.01);
      r.mesh.material.opacity = (1 - progress) * 0.5;
    });

    /* Data line flicker */
    dataLines.forEach(l => {
      l.mesh.material.opacity = 0.1 + Math.sin(t * 2 + l.phase) * 0.1;
    });

    /* Core pulse */
    if (core) {
      core.material.opacity = 0.5 + Math.sin(t * 5) * 0.3;
      const s = 0.9 + Math.sin(t * 5) * 0.15;
      core.scale.setScalar(s);
    }

    group.rotation.y += 0.004;
    streamParticles.material.opacity = 0.5 + Math.sin(t * 1.5) * 0.25;
  }

  function hide() {
    if (group) group.visible = false;
  }

  return { init, update, hide, get mesh() { return group; } };

})();

export default NeutronBurst;
