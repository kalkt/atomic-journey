/* ═══════════════════════════════════════════════
   REACTOR-CORE.JS — Procedural Three.js module
   Glowing reactor core with pulsing rings
   ═══════════════════════════════════════════════ */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';

const ReactorCore = (() => {

  let group;
  let coreMesh, coreMesh2;
  let rings = [];
  let glowMesh;
  let particles;
  let initialized = false;

  function buildCore(scene) {
    group = new THREE.Group();

    /* ── Core sphere ── */
    const coreGeo = new THREE.SphereGeometry(0.6, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xff4400,
      transparent: true,
      opacity: 0.9
    });
    coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    /* ── Inner bright core ── */
    const innerGeo = new THREE.SphereGeometry(0.35, 24, 24);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xffaa44,
      transparent: true,
      opacity: 0.8
    });
    coreMesh2 = new THREE.Mesh(innerGeo, innerMat);
    group.add(coreMesh2);

    /* ── Glow sphere (large, transparent) ── */
    const glowGeo = new THREE.SphereGeometry(1.1, 24, 24);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xff2200,
      transparent: true,
      opacity: 0.07,
      side: THREE.BackSide
    });
    glowMesh = new THREE.Mesh(glowGeo, glowMat);
    group.add(glowMesh);

    /* ── Containment rings ── */
    const ringColors = [0xff6600, 0xff4400, 0xcc2200, 0xff8800];
    const ringRadii  = [1.2, 1.6, 2.0, 2.5];
    const ringTilts  = [0, Math.PI / 3, Math.PI * 2 / 3, Math.PI / 6];

    ringRadii.forEach((radius, i) => {
      const ringGeo = new THREE.TorusGeometry(radius, 0.015, 8, 80);
      const ringMat = new THREE.MeshBasicMaterial({
        color: ringColors[i],
        transparent: true,
        opacity: 0.6 - i * 0.1
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = ringTilts[i];
      ring.rotation.z = ringTilts[i] * 0.5;
      group.add(ring);
      rings.push({ mesh: ring, speed: 0.4 + i * 0.15, tiltX: ringTilts[i] });
    });

    /* ── Particle field ── */
    const partCount = 300;
    const partGeo   = new THREE.BufferGeometry();
    const positions  = new Float32Array(partCount * 3);
    const colors     = new Float32Array(partCount * 3);

    for (let i = 0; i < partCount; i++) {
      const r     = 1.5 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      /* Orange-to-yellow color range */
      colors[i * 3]     = 1.0;
      colors[i * 3 + 1] = 0.2 + Math.random() * 0.5;
      colors[i * 3 + 2] = 0.0;
    }

    partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    partGeo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

    const partMat = new THREE.PointsMaterial({
      size:         0.04,
      vertexColors: true,
      transparent:  true,
      opacity:      0.7,
      blending:     THREE.AdditiveBlending,
      depthWrite:   false
    });

    particles = new THREE.Points(partGeo, partMat);
    group.add(particles);

    /* Position group to right side of scene */
    group.position.set(2.5, 0, -1);
    scene.add(group);
    initialized = true;
  }

  function init(scene) {
    if (!initialized) buildCore(scene);
    if (group) group.visible = true;
  }

  function update(t) {
    if (!initialized || !group) return;

    /* Pulse core */
    const pulse = Math.sin(t * 2.4) * 0.5 + 0.5;
    if (coreMesh)  coreMesh.material.opacity  = 0.7 + pulse * 0.3;
    if (coreMesh2) coreMesh2.material.opacity = 0.6 + pulse * 0.4;
    if (glowMesh)  glowMesh.material.opacity  = 0.04 + pulse * 0.08;

    /* Rotate rings */
    rings.forEach((r, i) => {
      r.mesh.rotation.y += r.speed * 0.01;
      r.mesh.rotation.x = r.tiltX + Math.sin(t * 0.5 + i) * 0.05;
    });

    /* Rotate particle field */
    if (particles) particles.rotation.y += 0.003;

    /* Slow group bob */
    group.position.y = Math.sin(t * 0.4) * 0.15;
    group.rotation.y += 0.004;
  }

  function hide() {
    if (group) group.visible = false;
  }

  return { init, update, hide, get mesh() { return group; } };

})();

export default ReactorCore;
