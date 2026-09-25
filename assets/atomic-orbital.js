/* ═══════════════════════════════════════════════
   ATOMIC-ORBITAL.JS — Procedural Three.js module
   Nucleus + animated electron orbital paths
   Used for command / pathway world
   ═══════════════════════════════════════════════ */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';

const AtomicOrbital = (() => {

  let group;
  let nucleus, nucleusGlow;
  let orbitals = [];
  let electrons = [];
  let nucleusPulse;
  let initialized = false;

  /* ── Build an orbital path ── */
  function makeOrbital(a, b, tiltX, tiltY, tiltZ, color, speed) {
    /* Orbital ellipse as line loop */
    const points = [];
    const N = 128;
    for (let i = 0; i <= N; i++) {
      const theta = (i / N) * Math.PI * 2;
      points.push(new THREE.Vector3(
        Math.cos(theta) * a,
        Math.sin(theta) * b,
        0
      ));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.35
    });
    const line = new THREE.LineLoop(geo, mat);
    line.rotation.x = tiltX;
    line.rotation.y = tiltY;
    line.rotation.z = tiltZ;

    /* Electron sphere that travels the orbit */
    const eGeo = new THREE.SphereGeometry(0.055, 10, 10);
    const eMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 });
    const electron = new THREE.Mesh(eGeo, eMat);

    /* Electron glow */
    const egGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const egMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide
    });
    electron.add(new THREE.Mesh(egGeo, egMat));

    return {
      line,
      electron,
      a, b,
      tiltX, tiltY, tiltZ,
      speed,
      angle: Math.random() * Math.PI * 2
    };
  }

  function buildOrbital(scene) {
    group = new THREE.Group();

    /* ── Nucleus ── */
    const nGeo = new THREE.SphereGeometry(0.22, 24, 24);
    const nMat = new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.9 });
    nucleus = new THREE.Mesh(nGeo, nMat);
    group.add(nucleus);

    /* Nucleus sub-particles */
    const npCount = 12;
    for (let i = 0; i < npCount; i++) {
      const np = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 8, 8),
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0xff4400 : 0xaaaaaa,
          transparent: true,
          opacity: 0.7
        })
      );
      np.position.set(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3
      );
      nucleus.add(np);
    }

    /* Nucleus glow */
    const ngGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const ngMat = new THREE.MeshBasicMaterial({
      color: 0xffcc00,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide
    });
    nucleusGlow = new THREE.Mesh(ngGeo, ngMat);
    group.add(nucleusGlow);

    /* ── U-235 orbital configuration ── */
    /* 7 electron shells approximated */
    const orbitalDefs = [
      { a: 0.65, b: 0.65, tx: 0,             ty: 0,             tz: 0,            color: 0xffcc00, speed: 1.8  },
      { a: 0.65, b: 0.65, tx: Math.PI/2,     ty: 0,             tz: 0,            color: 0xffaa00, speed: 1.5  },
      { a: 1.0,  b: 0.85, tx: Math.PI/6,     ty: Math.PI/4,     tz: 0,            color: 0xffcc00, speed: 1.1  },
      { a: 1.0,  b: 0.85, tx: -Math.PI/6,    ty: -Math.PI/4,    tz: 0,            color: 0xff8800, speed: 0.9  },
      { a: 1.4,  b: 1.1,  tx: Math.PI/3,     ty: 0,             tz: Math.PI/6,    color: 0xffcc44, speed: 0.7  },
      { a: 1.4,  b: 1.1,  tx: -Math.PI/3,    ty: Math.PI/3,     tz: -Math.PI/6,   color: 0xff9900, speed: 0.6  },
      { a: 1.8,  b: 1.4,  tx: Math.PI/4,     ty: Math.PI/2,     tz: Math.PI/4,    color: 0xffdd44, speed: 0.45 },
    ];

    orbitalDefs.forEach(def => {
      const orb = makeOrbital(def.a, def.b, def.tx, def.ty, def.tz, def.color, def.speed);
      group.add(orb.line);
      group.add(orb.electron);
      orbitals.push(orb);
      electrons.push(orb.electron);
    });

    /* ── Atom symbol label as geometry line (cross) ── */
    const crossMat = new THREE.LineBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.15 });
    const crossGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-2.2, 0, 0),
      new THREE.Vector3(2.2, 0, 0)
    ]);
    group.add(new THREE.Line(crossGeo, crossMat));
    const crossGeo2 = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -2.2, 0),
      new THREE.Vector3(0, 2.2, 0)
    ]);
    group.add(new THREE.Line(crossGeo2, crossMat));

    group.position.set(-2, 0.2, -1.5);
    scene.add(group);
    initialized = true;
  }

  function init(scene) {
    if (!initialized) buildOrbital(scene);
    if (group) group.visible = true;
  }

  function update(t) {
    if (!initialized || !group) return;

    /* Nucleus pulse */
    if (nucleus) {
      const p = Math.sin(t * 2.5) * 0.5 + 0.5;
      nucleus.material.opacity = 0.7 + p * 0.3;
      const s = 0.9 + p * 0.15;
      nucleus.scale.setScalar(s);
    }

    if (nucleusGlow) {
      nucleusGlow.material.opacity = 0.04 + Math.sin(t * 2.5) * 0.04;
    }

    /* Advance electrons along orbits */
    orbitals.forEach(orb => {
      orb.angle += orb.speed * 0.012;
      const cosA = Math.cos(orb.angle);
      const sinA = Math.sin(orb.angle);

      /* Local position on ellipse */
      const lx = cosA * orb.a;
      const ly = sinA * orb.b;
      const lz = 0;

      /* Apply orbital tilts */
      const cx = Math.cos(orb.tiltX), sx = Math.sin(orb.tiltX);
      const cy = Math.cos(orb.tiltY), sy = Math.sin(orb.tiltY);
      const cz = Math.cos(orb.tz),   sz = Math.sin(orb.tz);

      /* Rotate around Z first */
      const rx = lx * cz - ly * sz;
      const ry = lx * sz + ly * cz;
      const rz = lz;

      /* Then X */
      const rx2 = rx;
      const ry2 = ry * cx - rz * sx;
      const rz2 = ry * sx + rz * cx;

      /* Then Y */
      const rx3 = rx2 * cy + rz2 * sy;
      const ry3 = ry2;
      const rz3 = -rx2 * sy + rz2 * cy;

      orb.electron.position.set(rx3, ry3, rz3);
      orb.electron.material.opacity = 0.7 + Math.sin(orb.angle * 3) * 0.3;
    });

    /* Slow rotation of whole atom */
    group.rotation.y += 0.004;
    group.rotation.x  = Math.sin(t * 0.2) * 0.08;
    group.position.y  = 0.2 + Math.sin(t * 0.35) * 0.15;
  }

  function hide() {
    if (group) group.visible = false;
  }

  return { init, update, hide, get mesh() { return group; } };

})();

export default AtomicOrbital;
