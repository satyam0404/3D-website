import { ExhibitConfig } from '../types/three-types';

export const EXHIBITS: Record<string, ExhibitConfig> = {
  orrery: {
    id: 'orrery',
    name: 'Celestial Armillary Orrery',
    category: 'Kinetic Horology & Astronomy',
    year: '2026 Edition',
    description:
      'A multi-tier astronomical apparatus engineered with nested titanium-bronze gimbal rings, harmonic reduction gear trains, and a self-luminous stellar core modeled after solar coronal plasma dynamics.',
    dimensions: { x: 3.2, y: 3.2, z: 3.2, unit: 'm' },
    metrics: [
      { label: 'Gimbal Precision', value: '0.002°', unit: 'arc-sec' },
      { label: 'Escapement Beat', value: '28,800', unit: 'vph' },
      { label: 'Orbital Period Ratio', value: '1 : 2.618' },
      { label: 'Core Temp Equiv.', value: '5,800', unit: 'K' },
    ],
    materials: {
      color: '#d4af37', // Polished warm gold / brass
      roughness: 0.28,
      metalness: 0.92,
      wireframe: false,
    },
    cameraDefaultDistance: 7.5,
    hotspots: [
      {
        id: 'core',
        title: 'Solar Fusion Dynamo',
        subtitle: 'Core Energy Transducer',
        position: [0, 0, 0],
        accentColor: '#F59E0B',
        description:
          'Luminous electromagnetic core synthesizing high-frequency radiation into kinetic gyroscopic momentum with zero friction magnetic levitation.',
        specifications: [
          { label: 'Flux Density', value: '4.8 Tesla' },
          { label: 'Thermal Equilibrium', value: 'Dynamic Radiative' },
          { label: 'Rotational Frequency', value: '120 rpm' },
        ],
      },
      {
        id: 'escapement',
        title: 'Harmonic Tourbillon Escapement',
        subtitle: 'Tri-Axial Kinetic Regulator',
        position: [0, 1.4, 0],
        accentColor: '#38BDF8',
        description:
          'Constant-force balance assembly compensating for gravitational micro-variations across multi-dimensional coordinate planes.',
        specifications: [
          { label: 'Jeweled Bearings', value: '64 Synthetic Sapphires' },
          { label: 'Inertia Index', value: '14.2 mg·cm²' },
          { label: 'Hairspring Alloy', value: 'Silicium-Beryllium' },
        ],
      },
      {
        id: 'ring-equator',
        title: 'Equinoctial Precession Ring',
        subtitle: 'Celestial Coordinate Tracker',
        position: [2.2, 0, 0],
        accentColor: '#10B981',
        description:
          'Engraved with 360-degree vernier graduations tracking the 25,772-year astronomical axial precession of celestial bodies.',
        specifications: [
          { label: 'Bezel Material', value: 'Titanium-Aluminide' },
          { label: 'Division Scale', value: 'Arc-minute vernier' },
          { label: 'Bearing Type', value: 'Ceramic Mag-Lev' },
        ],
      },
      {
        id: 'orbit-satellite',
        title: 'Orbital Epicycle Node',
        subtitle: 'Elliptical Satellite Carrier',
        position: [-1.6, 0.9, 1.2],
        accentColor: '#EC4899',
        description:
          'Secondary Keplerian orbital arm tracking retrograde planetary trajectories with planetary gear reduction.',
        specifications: [
          { label: 'Gear Ratio', value: '19:235 Harmonic' },
          { label: 'Eccentricity', value: 'e = 0.048' },
          { label: 'Luminescence', value: 'Phosphor Matrix' },
        ],
      },
    ],
  },
  hypercar: {
    id: 'hypercar',
    name: 'Apex Hyperion Monocoque',
    category: 'Spatial Automotive Prototyping',
    year: 'Mk. IV Chassis',
    description:
      'Ultra-aerodynamic electric hypercar monocoque architecture with active vortex ground-effect tunnels, structural graphene battery spine, and ventilated ceramic matrix braking assemblies.',
    dimensions: { x: 4.8, y: 1.15, z: 2.1, unit: 'm' },
    metrics: [
      { label: 'Peak Downforce', value: '1,280', unit: 'kg' },
      { label: 'Drag Coefficient', value: '0.218', unit: 'Cd' },
      { label: 'Power-to-Weight', value: '1.42', unit: 'hp/kg' },
      { label: 'Torsional Rigidity', value: '68,000', unit: 'Nm/deg' },
    ],
    materials: {
      color: '#0ea5e9', // Cyber blue / metallic cyan
      roughness: 0.15,
      metalness: 0.95,
      wireframe: false,
    },
    cameraDefaultDistance: 7.0,
    hotspots: [
      {
        id: 'active-wing',
        title: 'Vortex Active Aerofoil',
        subtitle: 'Dynamic Angle-of-Attack Actuator',
        position: [0, 0.9, -2.1],
        accentColor: '#EF4444',
        description:
          'Dual carbon-weave aerofoil modulating between high-downforce cornering trim and low-drag DRS mode in under 120 milliseconds.',
        specifications: [
          { label: 'Adjustment Range', value: '-4° to +36°' },
          { label: 'Actuator Response', value: '85 ms hydraulic' },
          { label: 'Max Airbrake Load', value: '620 kg' },
        ],
      },
      {
        id: 'powertrain',
        title: 'Quad Axial-Flux Powertrain',
        subtitle: 'Independent Torque Vectoring Core',
        position: [0, 0.1, 0.6],
        accentColor: '#38BDF8',
        description:
          'Direct-drive electric motor pod delivering instantaneous torque modulation to each contact patch with microsecond slip detection.',
        specifications: [
          { label: 'Combined Output', value: '1,450 kW (1,945 hp)' },
          { label: 'Motor Mass', value: '28.5 kg each' },
          { label: 'Max Rotor Speed', value: '26,000 rpm' },
        ],
      },
      {
        id: 'cockpit',
        title: 'Aeronautical Canopy Cell',
        subtitle: 'Polycarbonate Structural Shell',
        position: [0, 0.7, 0.1],
        accentColor: '#A855F7',
        description:
          'Formed from fighter-jet grade stretched acrylic and carbon-fiber roll protection structure with heads-up optical display coating.',
        specifications: [
          { label: 'Optical Distortion', value: '< 0.05%' },
          { label: 'UV Rejection', value: '99.8%' },
          { label: 'Impact Rating', value: 'FIA Homologated' },
        ],
      },
      {
        id: 'ceramic-brake',
        title: 'Carbon-Silicon Carbide Rotors',
        subtitle: 'Extreme Thermal Dissipation Disc',
        position: [1.1, -0.15, 1.4],
        accentColor: '#F59E0B',
        description:
          '420mm drilled composite disc clamped by monobloc 8-piston titanium caliper with integrated cooling duct vanes.',
        specifications: [
          { label: 'Operating Window', value: '150°C to 1,200°C' },
          { label: 'Weight Reduction', value: '52% vs cast iron' },
          { label: 'Caliper Material', value: 'Additively Printed Ti-6Al-4V' },
        ],
      },
    ],
  },
  quantum: {
    id: 'quantum',
    name: 'Quantum Attractor Nexus',
    category: 'Nonlinear Dynamic Systems',
    year: 'Mathematical Sim',
    description:
      'A real-time GPU particle simulation of chaotic attractors and phase-space manifolds. Over 18,000 discrete points governed by nonlinear differential equations with pointer interaction fields.',
    dimensions: { x: 5.0, y: 5.0, z: 5.0, unit: 'm' },
    metrics: [
      { label: 'Active Particle Count', value: '18,400', unit: 'nodes' },
      { label: 'Lyapunov Exponent', value: 'λ = +0.9056' },
      { label: 'Phase Dimension', value: 'Fractal D = 2.06' },
      { label: 'Vector Field Rate', value: '120', unit: 'Hz' },
    ],
    materials: {
      color: '#8b5cf6', // Electric violet
      roughness: 0.1,
      metalness: 0.8,
      wireframe: true,
    },
    cameraDefaultDistance: 8.0,
    hotspots: [
      {
        id: 'strange-attractor',
        title: 'Lorenz Butterfly Node',
        subtitle: 'Chaotic Orbital Singularity',
        position: [0, 0, 0],
        accentColor: '#EC4899',
        description:
          'Bifurcation manifold where infinitesimal differences in initial coordinate states diverge exponentially into dual spiral lobes.',
        specifications: [
          { label: 'Prandtl Number (σ)', value: '10.0' },
          { label: 'Rayleigh Number (ρ)', value: '28.0' },
          { label: 'Geometric Factor (β)', value: '8/3' },
        ],
      },
      {
        id: 'singularity-cusp',
        title: 'Phase-Space Trajectory Cusp',
        subtitle: 'High Velocity Curvature Point',
        position: [1.8, 1.5, -0.6],
        accentColor: '#38BDF8',
        description:
          'Locus of maximal kinetic acceleration where particle streams fold back into the attractor basin with deterministic unpredictability.',
        specifications: [
          { label: 'Drift Velocity', value: '34.2 m/s' },
          { label: 'Curvature Radius', value: '0.12 m' },
          { label: 'Local Divergence', value: 'Zero (Conservative)' },
        ],
      },
      {
        id: 'magnetic-flux',
        title: 'Interactive Pointer Well',
        subtitle: 'Dynamic Gravitational Attractor',
        position: [-1.4, -1.2, 1.5],
        accentColor: '#10B981',
        description:
          'Cursor-reactive spatial attractor generating magnetic vortex turbulence and ripples across the particle boundary layer.',
        specifications: [
          { label: 'Influence Radius', value: '2.5 m' },
          { label: 'Field Topology', value: 'Inverse-Square Dipole' },
          { label: 'Damping Coefficient', value: '0.94' },
        ],
      },
    ],
  },
  pavilion: {
    id: 'pavilion',
    name: 'Solaria Kinetic Pavilion',
    category: 'Biophilic Spatial Architecture',
    year: 'Conceptual Design',
    description:
      'A responsive parametric architectural pavilion composed of 36 radial kinetic louvers that oscillate with environmental solar geometry, shading internal glass meditation galleries.',
    dimensions: { x: 6.4, y: 5.2, z: 6.4, unit: 'm' },
    metrics: [
      { label: 'Radial Kinetic Ribs', value: '36', unit: 'segments' },
      { label: 'Daylight Autonomy', value: '94%', unit: 'illuminance' },
      { label: 'Structural Span', value: '18.4', unit: 'm' },
      { label: 'Carbon Offset', value: 'Net Negative' },
    ],
    materials: {
      color: '#f8fafc', // Travertine alabaster white
      roughness: 0.35,
      metalness: 0.2,
      wireframe: false,
    },
    cameraDefaultDistance: 9.5,
    hotspots: [
      {
        id: 'oculus',
        title: 'Zenith Solar Oculus',
        subtitle: 'Geometric Light Funnel',
        position: [0, 2.6, 0],
        accentColor: '#F59E0B',
        description:
          'Hyperbolic structural ring directing diffused natural daylight onto central reflective water basin without thermal heat gain.',
        specifications: [
          { label: 'Aperture Diameter', value: '2.8 m' },
          { label: 'Glass Composition', value: 'Low-E Electrochromic' },
          { label: 'Rainwater Capture', value: 'Integrated V-Drain' },
        ],
      },
      {
        id: 'louvers',
        title: 'Parametric Kinetic Fins',
        subtitle: 'Shape-Memory Composite Facade',
        position: [2.5, 0.4, 1.2],
        accentColor: '#10B981',
        description:
          'Individually articulated aerofoil fins twisting in sinusoidal waves to balance solar shading and panoramic ventilation.',
        specifications: [
          { label: 'Kinetic Articulation', value: '0° to 90° Continuous' },
          { label: 'Substrate', value: 'Cross-Laminated Timber & Carbon' },
          { label: 'Actuation Method', value: 'Piezoelectric Polymer' },
        ],
      },
      {
        id: 'podium',
        title: 'Floating Cantilever Podium',
        subtitle: 'Prestressed Foundation Deck',
        position: [0, -1.2, 0],
        accentColor: '#6366F1',
        description:
          'Post-tensioned ultra-high performance concrete slab creating the illusion of weightless suspension above reflecting pools.',
        specifications: [
          { label: 'Compressive Strength', value: '180 MPa' },
          { label: 'Cantilever Reach', value: '4.2 m unsupported' },
          { label: 'Acoustic Dampening', value: 'Micro-perforated subfloor' },
        ],
      },
    ],
  },
};
