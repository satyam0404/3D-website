export type ExhibitId = 'orrery' | 'hypercar' | 'quantum' | 'pavilion';

export type LightingPreset = 'cosmos' | 'cyber' | 'atelier' | 'studio';

export type CameraPreset = 'perspective' | 'top' | 'side' | 'macro' | 'cinematic';

export interface Hotspot {
  id: string;
  title: string;
  subtitle: string;
  position: [number, number, number];
  description: string;
  specifications: { label: string; value: string }[];
  accentColor: string;
}

export interface ExhibitConfig {
  id: ExhibitId;
  name: string;
  category: string;
  year: string;
  description: string;
  dimensions: { x: number; y: number; z: number; unit: string };
  metrics: { label: string; value: string; unit?: string }[];
  hotspots: Hotspot[];
  materials: {
    color: string;
    roughness: number;
    metalness: number;
    wireframe: boolean;
  };
  cameraDefaultDistance: number;
}
