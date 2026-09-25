/* ═══════════════════════════════════════════════
   THREE-ASSETS.JS — 3D Asset Loader & Registrar
   Imports procedural Three.js modules and
   registers them with ThreeSetup
   ═══════════════════════════════════════════════ */

import ThreeSetup from './three-setup.js';
import ReactorCore   from '../assets/reactor-core.js';
import TokamakRing   from '../assets/tokamak-ring.js';
import FusionTower   from '../assets/fusion-tower.js';
import NeutronBurst  from '../assets/neutron-burst.js';
import AtomicOrbital from '../assets/atomic-orbital.js';

document.addEventListener('DOMContentLoaded', () => {

  /* ── Register each asset under world key ── */
  ThreeSetup.registerAsset('reactor',   ReactorCore);
  ThreeSetup.registerAsset('signals',   NeutronBurst);
  ThreeSetup.registerAsset('cityscape', FusionTower);
  ThreeSetup.registerAsset('fusion',    TokamakRing);
  ThreeSetup.registerAsset('command',   AtomicOrbital);

  /* ── Init Three engine ── */
  ThreeSetup.init();

  /* ── Show initial asset ── */
  ThreeSetup.showAsset('reactor');

});
