import * as THREE from 'three';
import { ExhibitId } from '../types/three-types';

/**
 * Creates procedural canvas-based textures (carbon fiber, brushed metal, circuit grid)
 * completely locally with zero external network dependencies.
 */
export function createGridTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#08090d';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
  ctx.lineWidth = 1;

  const step = 32;
  for (let x = 0; x <= 512; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Accent intersections
  ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
  for (let x = 0; x <= 512; x += step * 2) {
    for (let y = 0; y <= 512; y += step * 2) {
      ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  return texture;
}

export function createCarbonFiberTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#18181b';
  ctx.fillRect(0, 0, 64, 64);

  ctx.fillStyle = '#27272a';
  for (let i = 0; i < 64; i += 8) {
    for (let j = 0; j < 64; j += 8) {
      if ((i / 8 + j / 8) % 2 === 0) {
        ctx.fillRect(i, j, 8, 8);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

export interface ExplodablePart {
  mesh: THREE.Object3D;
  initialPos: THREE.Vector3;
  initialRot: THREE.Euler;
  explodeOffset: THREE.Vector3;
  explodeRotation?: THREE.Euler;
}

export interface BuiltModel {
  group: THREE.Group;
  parts: ExplodablePart[];
  update: (time: number, delta: number, speed: number, explodeFactor: number, pointer: THREE.Vector2) => void;
  dispose: () => void;
  getMainMaterials: () => THREE.MeshStandardMaterial[];
}

/**
 * 1. EXHIBIT: CELESTIAL ARMILLARY ORRERY
 */
export function buildOrreryModel(accentColor = '#d4af37', isWireframe = false): BuiltModel {
  const group = new THREE.Group();
  const parts: ExplodablePart[] = [];
  const materialsToTrack: THREE.MeshStandardMaterial[] = [];

  const goldMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accentColor),
    metalness: 0.95,
    roughness: 0.22,
    wireframe: isWireframe,
  });
  materialsToTrack.push(goldMat);

  const bronzeMat = new THREE.MeshStandardMaterial({
    color: 0x8a6231,
    metalness: 0.9,
    roughness: 0.35,
    wireframe: isWireframe,
  });
  materialsToTrack.push(bronzeMat);

  const darkSteelMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.85,
    roughness: 0.3,
    wireframe: isWireframe,
  });
  materialsToTrack.push(darkSteelMat);

  // Stellar Core (Sun / Fusion Reactor)
  const coreGroup = new THREE.Group();
  const sunGeo = new THREE.SphereGeometry(0.65, 48, 48);
  const sunMat = new THREE.MeshStandardMaterial({
    color: 0xffaa00,
    emissive: 0xff6600,
    emissiveIntensity: 1.6,
    roughness: 0.1,
    metalness: 0.1,
  });
  const sunMesh = new THREE.Mesh(sunGeo, sunMat);
  coreGroup.add(sunMesh);

  // Corona glow ring
  const coronaGeo = new THREE.TorusGeometry(0.72, 0.04, 16, 64);
  const coronaMat = new THREE.MeshBasicMaterial({
    color: 0xffdd44,
    transparent: true,
    opacity: 0.8,
    wireframe: true,
  });
  const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
  coronaMesh.rotation.x = Math.PI / 4;
  coreGroup.add(coronaMesh);

  // Dynamic Point Light at core
  const coreLight = new THREE.PointLight(0xffaa33, 4, 15);
  coreGroup.add(coreLight);

  group.add(coreGroup);
  parts.push({
    mesh: coreGroup,
    initialPos: new THREE.Vector3(0, 0, 0),
    initialRot: new THREE.Euler(0, 0, 0),
    explodeOffset: new THREE.Vector3(0, 0, 0),
  });

  // Concentric Gimbal Rings
  // Ring 1: Inner ring
  const ring1Group = new THREE.Group();
  const ring1Geo = new THREE.TorusGeometry(1.2, 0.06, 24, 100);
  const ring1Mesh = new THREE.Mesh(ring1Geo, goldMat);
  ring1Group.add(ring1Mesh);
  group.add(ring1Group);
  parts.push({
    mesh: ring1Group,
    initialPos: new THREE.Vector3(0, 0, 0),
    initialRot: new THREE.Euler(0, 0, 0),
    explodeOffset: new THREE.Vector3(0, 1.4, 0),
  });

  // Ring 2: Equinoctial Precession Ring (Middle)
  const ring2Group = new THREE.Group();
  const ring2Geo = new THREE.TorusGeometry(1.8, 0.07, 24, 120);
  const ring2Mesh = new THREE.Mesh(ring2Geo, bronzeMat);
  ring2Group.add(ring2Mesh);

  // Notches on ring 2
  const notchGeo = new THREE.BoxGeometry(0.04, 0.12, 0.04);
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const notch = new THREE.Mesh(notchGeo, goldMat);
    notch.position.set(Math.cos(angle) * 1.8, Math.sin(angle) * 1.8, 0);
    notch.rotation.z = angle;
    ring2Group.add(notch);
  }
  group.add(ring2Group);
  parts.push({
    mesh: ring2Group,
    initialPos: new THREE.Vector3(0, 0, 0),
    initialRot: new THREE.Euler(Math.PI / 6, 0, 0),
    explodeOffset: new THREE.Vector3(0, -1.2, 0),
  });

  // Ring 3: Outer Horizon Ring
  const ring3Group = new THREE.Group();
  const ring3Geo = new THREE.TorusGeometry(2.4, 0.08, 24, 140);
  const ring3Mesh = new THREE.Mesh(ring3Geo, darkSteelMat);
  ring3Group.add(ring3Mesh);
  group.add(ring3Group);
  parts.push({
    mesh: ring3Group,
    initialPos: new THREE.Vector3(0, 0, 0),
    initialRot: new THREE.Euler(0, Math.PI / 4, 0),
    explodeOffset: new THREE.Vector3(0, 2.6, 0),
  });

  // Gear Escapement Sub-assembly (Top)
  const escapementGroup = new THREE.Group();
  escapementGroup.position.set(0, 1.4, 0);

  const gearGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.06, 18);
  const gearMesh = new THREE.Mesh(gearGeo, goldMat);
  gearMesh.rotation.x = Math.PI / 2;
  escapementGroup.add(gearMesh);

  // Gear teeth
  for (let t = 0; t < 18; t++) {
    const angle = (t / 18) * Math.PI * 2;
    const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.06), goldMat);
    tooth.position.set(Math.cos(angle) * 0.48, Math.sin(angle) * 0.48, 0);
    tooth.rotation.z = angle;
    escapementGroup.add(tooth);
  }
  group.add(escapementGroup);
  parts.push({
    mesh: escapementGroup,
    initialPos: new THREE.Vector3(0, 1.4, 0),
    initialRot: new THREE.Euler(0, 0, 0),
    explodeOffset: new THREE.Vector3(0, 2.0, 0),
  });

  // Orbiting Planetary Bodies
  const planet1Group = new THREE.Group();
  const planet1Mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3, metalness: 0.6 })
  );
  planet1Mesh.position.set(1.4, 0, 0);
  planet1Group.add(planet1Mesh);

  // Orbital spline track line
  const orbit1Pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    orbit1Pts.push(new THREE.Vector3(Math.cos(a) * 1.4, 0, Math.sin(a) * 1.4));
  }
  const orbit1Line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(orbit1Pts),
    new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 })
  );
  planet1Group.add(orbit1Line);
  group.add(planet1Group);

  const planet2Group = new THREE.Group();
  const planet2Mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.2, metalness: 0.7 })
  );
  planet2Mesh.position.set(2.0, 0, 0);
  planet2Group.add(planet2Mesh);

  const orbit2Pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    orbit2Pts.push(new THREE.Vector3(Math.cos(a) * 2.0, 0, Math.sin(a) * 2.0));
  }
  const orbit2Line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(orbit2Pts),
    new THREE.LineBasicMaterial({ color: 0xec4899, transparent: true, opacity: 0.35 })
  );
  planet2Group.add(orbit2Line);
  group.add(planet2Group);

  return {
    group,
    parts,
    getMainMaterials: () => materialsToTrack,
    update: (time, _delta, speed, explodeFactor) => {
      // Rotate nested gimbals at harmonic ratios
      ring1Group.rotation.x = time * 0.4 * speed;
      ring1Group.rotation.y = time * 0.3 * speed;

      ring2Group.rotation.y = -time * 0.25 * speed;
      ring2Group.rotation.z = time * 0.15 * speed;

      ring3Group.rotation.z = time * 0.1 * speed;
      ring3Group.rotation.x = -time * 0.15 * speed;

      escapementGroup.rotation.z = time * 2.2 * speed;
      coreGroup.rotation.y = time * 0.8 * speed;

      planet1Group.rotation.y = time * 0.7 * speed;
      planet2Group.rotation.y = time * 0.35 * speed;

      // Pulsing stellar core
      const pulse = 1 + Math.sin(time * 3.5) * 0.05;
      sunMesh.scale.set(pulse, pulse, pulse);

      // Lerp exploded offsets
      parts.forEach((p) => {
        p.mesh.position.lerpVectors(p.initialPos, p.initialPos.clone().add(p.explodeOffset), explodeFactor);
      });
    },
    dispose: () => {
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    },
  };
}

/**
 * 2. EXHIBIT: APEX HYPERION AERODYNAMIC MONOCOQUE
 */
export function buildHypercarModel(accentColor = '#0ea5e9', isWireframe = false): BuiltModel {
  const group = new THREE.Group();
  const parts: ExplodablePart[] = [];
  const materialsToTrack: THREE.MeshStandardMaterial[] = [];

  const bodyMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accentColor),
    metalness: 0.92,
    roughness: 0.18,
    wireframe: isWireframe,
  });
  materialsToTrack.push(bodyMat);

  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    metalness: 0.5,
    roughness: 0.4,
    wireframe: isWireframe,
  });
  materialsToTrack.push(carbonMat);

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    transmission: 0.85,
    opacity: 1,
    transparent: true,
    roughness: 0.05,
    ior: 1.52,
    thickness: 0.5,
    wireframe: isWireframe,
  });

  const alloyMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.12,
    wireframe: isWireframe,
  });
  materialsToTrack.push(alloyMat);

  const rubberMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    roughness: 0.85,
    metalness: 0.05,
  });

  const lightCyanMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const lightRedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

  // 1. Lower Chassis & Battery Skid Plate (Base)
  const chassisGroup = new THREE.Group();
  const chassisGeo = new THREE.BoxGeometry(2.1, 0.22, 4.4);
  const chassisMesh = new THREE.Mesh(chassisGeo, carbonMat);
  chassisMesh.position.y = 0.1;
  chassisGroup.add(chassisMesh);

  // Powertrain Dual Turbine Motors
  const motor1 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.8, 24), alloyMat);
  motor1.rotation.z = Math.PI / 2;
  motor1.position.set(0, 0.25, -1.2);
  chassisGroup.add(motor1);

  const motor2 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.8, 24), alloyMat);
  motor2.rotation.z = Math.PI / 2;
  motor2.position.set(0, 0.22, 1.2);
  chassisGroup.add(motor2);

  group.add(chassisGroup);
  parts.push({
    mesh: chassisGroup,
    initialPos: new THREE.Vector3(0, 0, 0),
    initialRot: new THREE.Euler(0, 0, 0),
    explodeOffset: new THREE.Vector3(0, -0.6, 0),
  });

  // 2. Upper Sculpted Body Shell
  const bodyGroup = new THREE.Group();

  // Nose / Hood
  const hoodGeo = new THREE.ConeGeometry(1.05, 1.8, 4);
  const hoodMesh = new THREE.Mesh(hoodGeo, bodyMat);
  hoodMesh.rotation.y = Math.PI / 4;
  hoodMesh.rotation.x = Math.PI / 2;
  hoodMesh.scale.set(1.0, 0.35, 1.0);
  hoodMesh.position.set(0, 0.35, 1.4);
  bodyGroup.add(hoodMesh);

  // Main Cockpit Center Section
  const centerGeo = new THREE.BoxGeometry(1.9, 0.45, 2.0);
  const centerMesh = new THREE.Mesh(centerGeo, bodyMat);
  centerMesh.position.set(0, 0.42, 0);
  bodyGroup.add(centerMesh);

  // Aerodynamic Side Pods / Air Intakes
  const sidePodLeft = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.4, 2.4), carbonMat);
  sidePodLeft.position.set(-1.05, 0.35, -0.1);
  bodyGroup.add(sidePodLeft);

  const sidePodRight = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.4, 2.4), carbonMat);
  sidePodRight.position.set(1.05, 0.35, -0.1);
  bodyGroup.add(sidePodRight);

  // Rear Haunches / Diffuser Base
  const rearGeo = new THREE.BoxGeometry(1.95, 0.5, 1.4);
  const rearMesh = new THREE.Mesh(rearGeo, bodyMat);
  rearMesh.position.set(0, 0.48, -1.35);
  bodyGroup.add(rearMesh);

  // Headlight Lightbars
  const headlightLeft = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.1), lightCyanMat);
  headlightLeft.position.set(-0.7, 0.38, 2.15);
  bodyGroup.add(headlightLeft);

  const headlightRight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.1), lightCyanMat);
  headlightRight.position.set(0.7, 0.38, 2.15);
  bodyGroup.add(headlightRight);

  // Full-width Taillight Blade
  const taillight = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, 0.08), lightRedMat);
  taillight.position.set(0, 0.55, -2.06);
  bodyGroup.add(taillight);

  group.add(bodyGroup);
  parts.push({
    mesh: bodyGroup,
    initialPos: new THREE.Vector3(0, 0, 0),
    initialRot: new THREE.Euler(0, 0, 0),
    explodeOffset: new THREE.Vector3(0, 1.8, 0),
  });

  // 3. Canopy / Glass Cell
  const canopyGroup = new THREE.Group();
  const canopyGeo = new THREE.CylinderGeometry(0.75, 0.9, 1.6, 24, 1, false, 0, Math.PI);
  const canopyMesh = new THREE.Mesh(canopyGeo, glassMat);
  canopyMesh.rotation.z = Math.PI / 2;
  canopyMesh.rotation.x = Math.PI;
  canopyMesh.position.set(0, 0.72, 0.1);
  canopyGroup.add(canopyMesh);

  // Steering wheel & seats inside
  const wheelMesh = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.03, 16, 32), carbonMat);
  wheelMesh.position.set(-0.35, 0.58, 0.4);
  wheelMesh.rotation.x = -Math.PI / 4;
  canopyGroup.add(wheelMesh);

  group.add(canopyGroup);
  parts.push({
    mesh: canopyGroup,
    initialPos: new THREE.Vector3(0, 0, 0),
    initialRot: new THREE.Euler(0, 0, 0),
    explodeOffset: new THREE.Vector3(0, 2.6, 0.2),
  });

  // 4. Active Rear Wing Assembly
  const wingGroup = new THREE.Group();
  const wingBlade = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.06, 0.38), carbonMat);
  wingBlade.position.set(0, 0.92, -2.05);
  wingGroup.add(wingBlade);

  const pylonLeft = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.2), alloyMat);
  pylonLeft.position.set(-0.55, 0.7, -2.0);
  pylonLeft.rotation.x = -0.2;
  wingGroup.add(pylonLeft);

  const pylonRight = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.2), alloyMat);
  pylonRight.position.set(0.55, 0.7, -2.0);
  pylonRight.rotation.x = -0.2;
  wingGroup.add(pylonRight);

  group.add(wingGroup);
  parts.push({
    mesh: wingGroup,
    initialPos: new THREE.Vector3(0, 0, 0),
    initialRot: new THREE.Euler(0, 0, 0),
    explodeOffset: new THREE.Vector3(0, 1.4, -1.0),
  });

  // 5. Four Wheel Assemblies (Left/Right Front/Rear)
  const wheelMeshes: THREE.Group[] = [];
  const wheelOffsets = [
    { x: -1.15, z: 1.35, name: 'FL' },
    { x: 1.15, z: 1.35, name: 'FR' },
    { x: -1.2, z: -1.25, name: 'RL' },
    { x: 1.2, z: -1.25, name: 'RR' },
  ];

  wheelOffsets.forEach((cfg) => {
    const wGroup = new THREE.Group();
    wGroup.position.set(cfg.x, 0.35, cfg.z);

    // Tire
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.32, 32), rubberMat);
    tire.rotation.z = Math.PI / 2;
    wGroup.add(tire);

    // Rim
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.33, 24), alloyMat);
    rim.rotation.z = Math.PI / 2;
    wGroup.add(rim);

    // Brake Disc
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.04, 32), alloyMat);
    disc.rotation.z = Math.PI / 2;
    disc.position.x = cfg.x > 0 ? -0.1 : 0.1;
    wGroup.add(disc);

    // Brake Caliper
    const caliper = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.14, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 })
    );
    caliper.position.set(cfg.x > 0 ? -0.1 : 0.1, 0.15, 0);
    wGroup.add(caliper);

    group.add(wGroup);
    wheelMeshes.push(wGroup);

    parts.push({
      mesh: wGroup,
      initialPos: new THREE.Vector3(cfg.x, 0.35, cfg.z),
      initialRot: new THREE.Euler(0, 0, 0),
      explodeOffset: new THREE.Vector3(cfg.x > 0 ? 1.4 : -1.4, 0, 0),
    });
  });

  return {
    group,
    parts,
    getMainMaterials: () => materialsToTrack,
    update: (time, _delta, speed, explodeFactor) => {
      // Spin wheels
      wheelMeshes.forEach((w) => {
        w.children[0].rotation.y += 0.08 * speed;
        w.children[1].rotation.y += 0.08 * speed;
      });

      // Active aerodynamic wing modulation
      wingBlade.rotation.x = Math.sin(time * 2) * 0.15 * speed;

      // Lerp exploded parts
      parts.forEach((p) => {
        p.mesh.position.lerpVectors(p.initialPos, p.initialPos.clone().add(p.explodeOffset), explodeFactor);
      });
    },
    dispose: () => {
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    },
  };
}

/**
 * 3. EXHIBIT: QUANTUM ATTRACTOR NEXUS (18,000 GPU Particles)
 */
export function buildQuantumModel(accentColor = '#8b5cf6'): BuiltModel {
  const group = new THREE.Group();
  const parts: ExplodablePart[] = [];

  const PARTICLE_COUNT = 18000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const basePositions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = new Float32Array(PARTICLE_COUNT * 3);

  const baseCol = new THREE.Color(accentColor);
  const secondaryCol = new THREE.Color('#38bdf8');
  const tempCol = new THREE.Color();

  // Generate Lorenz Attractor & Torus Knot trajectories
  let x = 0.1, y = 0, z = 0;
  const dt = 0.005;
  const sigma = 10;
  const rho = 28;
  const beta = 8 / 3;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Lorenz chaotic differential equations
    const dx = sigma * (y - x) * dt;
    const dy = (x * (rho - z) - y) * dt;
    const dz = (x * y - beta * z) * dt;

    x += dx;
    y += dy;
    z += dz;

    const scale = 0.11;
    const px = x * scale;
    const py = (z - 25) * scale;
    const pz = y * scale;

    positions[i * 3] = px + (Math.random() - 0.5) * 0.15;
    positions[i * 3 + 1] = py + (Math.random() - 0.5) * 0.15;
    positions[i * 3 + 2] = pz + (Math.random() - 0.5) * 0.15;

    basePositions[i * 3] = positions[i * 3];
    basePositions[i * 3 + 1] = positions[i * 3 + 1];
    basePositions[i * 3 + 2] = positions[i * 3 + 2];

    velocities[i * 3] = (Math.random() - 0.5) * 0.02;
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

    const t = i / PARTICLE_COUNT;
    tempCol.copy(baseCol).lerp(secondaryCol, t);
    colors[i * 3] = tempCol.r;
    colors[i * 3 + 1] = tempCol.g;
    colors[i * 3 + 2] = tempCol.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const pMaterial = new THREE.PointsMaterial({
    size: 0.038,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
  });

  const particleSystem = new THREE.Points(geometry, pMaterial);
  group.add(particleSystem);

  // Add 3 guiding orbital rings around attractor
  const ringGeo = new THREE.TorusGeometry(2.4, 0.02, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.3, wireframe: true });
  const r1 = new THREE.Mesh(ringGeo, ringMat);
  r1.rotation.x = Math.PI / 3;
  group.add(r1);

  const r2 = new THREE.Mesh(ringGeo, ringMat);
  r2.rotation.y = Math.PI / 4;
  group.add(r2);

  parts.push({
    mesh: particleSystem,
    initialPos: new THREE.Vector3(0, 0, 0),
    initialRot: new THREE.Euler(0, 0, 0),
    explodeOffset: new THREE.Vector3(0, 0, 0),
  });

  return {
    group,
    parts,
    getMainMaterials: () => [],
    update: (time, _delta, speed, explodeFactor, pointer) => {
      group.rotation.y = time * 0.15 * speed;
      r1.rotation.z = time * 0.2 * speed;
      r2.rotation.x = -time * 0.18 * speed;

      const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      // Pointer magnetic field in 3D space
      const pointerX = pointer.x * 2.5;
      const pointerY = pointer.y * 2.5;

      for (let i = 0; i < PARTICLE_COUNT; i += 4) {
        const idx = i * 3;
        const bx = basePositions[idx];
        const by = basePositions[idx + 1];
        const bz = basePositions[idx + 2];

        // Explode expansion outward
        const explodeMult = 1 + explodeFactor * 2.5;

        // Interactive pointer turbulence
        const dx = posArray[idx] - pointerX;
        const dy = posArray[idx + 1] - pointerY;
        const distSq = dx * dx + dy * dy;

        let force = 0;
        if (distSq < 4.0 && distSq > 0.05) {
          force = (4.0 - distSq) * 0.06;
        }

        posArray[idx] = bx * explodeMult + Math.sin(time * 2 + i) * 0.04 + dx * force;
        posArray[idx + 1] = by * explodeMult + Math.cos(time * 2 + i) * 0.04 + dy * force;
        posArray[idx + 2] = bz * explodeMult;
      }
      posAttr.needsUpdate = true;
    },
    dispose: () => {
      geometry.dispose();
      pMaterial.dispose();
      ringGeo.dispose();
      ringMat.dispose();
    },
  };
}

/**
 * 4. EXHIBIT: SOLARIA KINETIC ARCHITECTURAL PAVILION
 */
export function buildPavilionModel(accentColor = '#f8fafc', isWireframe = false): BuiltModel {
  const group = new THREE.Group();
  const parts: ExplodablePart[] = [];
  const materialsToTrack: THREE.MeshStandardMaterial[] = [];

  const alabasterMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accentColor),
    roughness: 0.3,
    metalness: 0.15,
    wireframe: isWireframe,
  });
  materialsToTrack.push(alabasterMat);

  const timberMat = new THREE.MeshStandardMaterial({
    color: 0x8a6231,
    roughness: 0.6,
    metalness: 0.1,
    wireframe: isWireframe,
  });
  materialsToTrack.push(timberMat);

  const glassFloorMat = new THREE.MeshPhysicalMaterial({
    color: 0x0284c7,
    transmission: 0.8,
    opacity: 0.95,
    transparent: true,
    roughness: 0.1,
    ior: 1.45,
    wireframe: isWireframe,
  });

  // Base Cantilever Podium
  const podiumGroup = new THREE.Group();
  const podiumGeo = new THREE.CylinderGeometry(3.6, 4.0, 0.4, 48);
  const podiumMesh = new THREE.Mesh(podiumGeo, alabasterMat);
  podiumMesh.position.y = -0.2;
  podiumGroup.add(podiumMesh);

  // Reflecting pool ring
  const poolGeo = new THREE.RingGeometry(3.8, 4.8, 48);
  const poolMesh = new THREE.Mesh(poolGeo, glassFloorMat);
  poolMesh.rotation.x = -Math.PI / 2;
  poolMesh.position.y = -0.19;
  podiumGroup.add(poolMesh);

  group.add(podiumGroup);
  parts.push({
    mesh: podiumGroup,
    initialPos: new THREE.Vector3(0, 0, 0),
    initialRot: new THREE.Euler(0, 0, 0),
    explodeOffset: new THREE.Vector3(0, -1.2, 0),
  });

  // 36 Parametric Radial Louvers / Fins
  const finsGroup = new THREE.Group();
  const finMeshes: THREE.Mesh[] = [];
  const FIN_COUNT = 36;
  const finGeo = new THREE.BoxGeometry(0.12, 3.2, 0.8);

  for (let i = 0; i < FIN_COUNT; i++) {
    const angle = (i / FIN_COUNT) * Math.PI * 2;
    const radius = 2.4;
    const fin = new THREE.Mesh(finGeo, i % 2 === 0 ? alabasterMat : timberMat);
    fin.position.set(Math.cos(angle) * radius, 1.6, Math.sin(angle) * radius);
    fin.rotation.y = angle;
    finsGroup.add(fin);
    finMeshes.push(fin);
  }
  group.add(finsGroup);
  parts.push({
    mesh: finsGroup,
    initialPos: new THREE.Vector3(0, 0, 0),
    initialRot: new THREE.Euler(0, 0, 0),
    explodeOffset: new THREE.Vector3(0, 0.8, 0),
  });

  // Central Glass Oculus and Spiral Column
  const oculusGroup = new THREE.Group();
  const colGeo = new THREE.CylinderGeometry(0.4, 0.6, 3.6, 24);
  const colMesh = new THREE.Mesh(colGeo, alabasterMat);
  colMesh.position.y = 1.8;
  oculusGroup.add(colMesh);

  // Floating Roof Canopy Ring
  const roofGeo = new THREE.TorusGeometry(2.6, 0.22, 24, 64);
  const roofMesh = new THREE.Mesh(roofGeo, alabasterMat);
  roofMesh.rotation.x = Math.PI / 2;
  roofMesh.position.y = 3.3;
  oculusGroup.add(roofMesh);

  // Oculus Glass Dome
  const oculusGlass = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    glassFloorMat
  );
  oculusGlass.position.y = 3.3;
  oculusGroup.add(oculusGlass);

  group.add(oculusGroup);
  parts.push({
    mesh: oculusGroup,
    initialPos: new THREE.Vector3(0, 0, 0),
    initialRot: new THREE.Euler(0, 0, 0),
    explodeOffset: new THREE.Vector3(0, 2.4, 0),
  });

  return {
    group,
    parts,
    getMainMaterials: () => materialsToTrack,
    update: (time, _delta, speed, explodeFactor) => {
      // Oscillate fins like living organic louvers
      finMeshes.forEach((fin, idx) => {
        const wave = Math.sin(time * 1.5 * speed + idx * 0.25) * 0.45;
        fin.rotation.y = (idx / FIN_COUNT) * Math.PI * 2 + wave;
        // In exploded mode, bloom fins radially outward
        const radAngle = (idx / FIN_COUNT) * Math.PI * 2;
        const extraRad = explodeFactor * 1.6;
        fin.position.x = Math.cos(radAngle) * (2.4 + extraRad);
        fin.position.z = Math.sin(radAngle) * (2.4 + extraRad);
      });

      // Slowly rotate pavilion
      group.rotation.y = time * 0.08 * speed;

      parts.forEach((p) => {
        if (p.mesh !== finsGroup) {
          p.mesh.position.lerpVectors(p.initialPos, p.initialPos.clone().add(p.explodeOffset), explodeFactor);
        }
      });
    },
    dispose: () => {
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    },
  };
}
