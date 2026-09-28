import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ExhibitId, LightingPreset, CameraPreset } from '../types/three-types';
import { EXHIBITS } from '../data/exhibits';
import {
  buildOrreryModel,
  buildHypercarModel,
  buildQuantumModel,
  buildPavilionModel,
  createGridTexture,
  BuiltModel,
} from '../three/builder';

export interface HotspotScreenPos {
  id: string;
  x: number;
  y: number;
  visible: boolean;
  distance: number;
}

interface ThreeCanvasProps {
  exhibitId: ExhibitId;
  lighting: LightingPreset;
  cameraPreset: CameraPreset;
  explodeFactor: number;
  wireframe: boolean;
  rotationSpeed: number;
  isPaused: boolean;
  activeHotspotId: string | null;
  onHotspotClick: (id: string) => void;
  onHotspotsUpdate: (hotspots: HotspotScreenPos[]) => void;
  onFpsUpdate: (fps: number) => void;
  onCanvasReady?: (exportFn: () => string) => void;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  exhibitId,
  lighting,
  cameraPreset,
  explodeFactor,
  wireframe,
  rotationSpeed,
  isPaused,
  activeHotspotId,
  onHotspotClick,
  onHotspotsUpdate,
  onFpsUpdate,
  onCanvasReady,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js instances refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const currentModelRef = useRef<BuiltModel | null>(null);
  const lightsGroupRef = useRef<THREE.Group | null>(null);
  const floorGridRef = useRef<THREE.Mesh | null>(null);
  const starfieldRef = useRef<THREE.Points | null>(null);

  // Camera Orbit State
  const cameraControlRef = useRef({
    radius: 7.5,
    theta: Math.PI / 4,
    phi: Math.PI / 3,
    target: new THREE.Vector3(0, 0, 0),
    desiredRadius: 7.5,
    desiredTheta: Math.PI / 4,
    desiredPhi: Math.PI / 3,
    desiredTarget: new THREE.Vector3(0, 0, 0),
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    prevDrag: { x: 0, y: 0 },
  });

  const pointerRef = useRef(new THREE.Vector2(0, 0));
  const animationFrameId = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(performance.now());
  const [webglError, setWebglError] = useState<string | null>(null);

  // Export screenshot function
  const exportSnapshot = useCallback(() => {
    if (!rendererRef.current) return '';
    return rendererRef.current.domElement.toDataURL('image/png');
  }, []);

  useEffect(() => {
    if (onCanvasReady) {
      onCanvasReady(exportSnapshot);
    }
  }, [onCanvasReady, exportSnapshot]);

  // Setup Scene, Renderer & Camera
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    try {
      const width = container.clientWidth;
      const height = container.clientHeight;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x08090d);
      scene.fog = new THREE.FogExp2(0x08090d, 0.035);
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 150);
      camera.position.set(5, 4, 7);
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      // Lights Group
      const lightsGroup = new THREE.Group();
      scene.add(lightsGroup);
      lightsGroupRef.current = lightsGroup;

      // Floor Grid
      const gridTex = createGridTexture();
      const floorGeo = new THREE.PlaneGeometry(35, 35);
      const floorMat = new THREE.MeshStandardMaterial({
        map: gridTex,
        roughness: 0.8,
        metalness: 0.2,
        transparent: true,
        opacity: 0.4,
      });
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.position.y = -0.05;
      floorMesh.receiveShadow = true;
      scene.add(floorMesh);
      floorGridRef.current = floorMesh;

      // Starfield / Deep Space Dust
      const starGeo = new THREE.BufferGeometry();
      const starCount = 1200;
      const starPositions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount * 3; i += 3) {
        starPositions[i] = (Math.random() - 0.5) * 80;
        starPositions[i + 1] = (Math.random() - 0.5) * 60;
        starPositions[i + 2] = (Math.random() - 0.5) * 80;
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      const starMat = new THREE.PointsMaterial({
        color: 0x94a3b8,
        size: 0.08,
        transparent: true,
        opacity: 0.6,
      });
      const starfield = new THREE.Points(starGeo, starMat);
      scene.add(starfield);
      starfieldRef.current = starfield;

      // WebGL Context loss handler
      const handleContextLost = (e: Event) => {
        e.preventDefault();
        setWebglError('WebGL context lost. Restoring graphics pipeline...');
      };
      const handleContextRestored = () => {
        setWebglError(null);
      };
      canvas.addEventListener('webglcontextlost', handleContextLost);
      canvas.addEventListener('webglcontextrestored', handleContextRestored);

      // Resize Observer
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width: newW, height: newH } = entry.contentRect;
          if (newW > 0 && newH > 0 && cameraRef.current && rendererRef.current) {
            cameraRef.current.aspect = newW / newH;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(newW, newH);
          }
        }
      });
      resizeObserver.observe(container);

      return () => {
        resizeObserver.disconnect();
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
        renderer.dispose();
      };
    } catch (err) {
      setWebglError('Failed to initialize WebGL 3D context. Please check hardware acceleration.');
    }
  }, []);

  // Update Lighting Presets
  useEffect(() => {
    const lightsGroup = lightsGroupRef.current;
    const scene = sceneRef.current;
    if (!lightsGroup || !scene) return;

    // Clear existing lights
    while (lightsGroup.children.length > 0) {
      lightsGroup.remove(lightsGroup.children[0]);
    }

    if (lighting === 'cosmos') {
      scene.background = new THREE.Color(0x06070a);
      if (scene.fog instanceof THREE.FogExp2) scene.fog.color = new THREE.Color(0x06070a);

      const amb = new THREE.AmbientLight(0x1e293b, 0.8);
      lightsGroup.add(amb);

      const keyLight = new THREE.DirectionalLight(0x60a5fa, 2.8);
      keyLight.position.set(6, 9, 5);
      keyLight.castShadow = true;
      lightsGroup.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0xc084fc, 2.2);
      rimLight.position.set(-6, -4, -6);
      lightsGroup.add(rimLight);
    } else if (lighting === 'cyber') {
      scene.background = new THREE.Color(0x040810);
      if (scene.fog instanceof THREE.FogExp2) scene.fog.color = new THREE.Color(0x040810);

      const amb = new THREE.AmbientLight(0x0c4a6e, 0.7);
      lightsGroup.add(amb);

      const keyLight = new THREE.DirectionalLight(0x38bdf8, 3.4);
      keyLight.position.set(7, 8, 4);
      lightsGroup.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0xf43f5e, 2.8);
      rimLight.position.set(-7, 3, -6);
      lightsGroup.add(rimLight);

      const underGlow = new THREE.PointLight(0x06b6d4, 3.0, 12);
      underGlow.position.set(0, 0.1, 0);
      lightsGroup.add(underGlow);
    } else if (lighting === 'atelier') {
      scene.background = new THREE.Color(0x0c0b0a);
      if (scene.fog instanceof THREE.FogExp2) scene.fog.color = new THREE.Color(0x0c0b0a);

      const amb = new THREE.AmbientLight(0x451a03, 0.6);
      lightsGroup.add(amb);

      const keyLight = new THREE.DirectionalLight(0xfef08a, 2.6);
      keyLight.position.set(5, 10, 6);
      lightsGroup.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0xfb923c, 1.8);
      rimLight.position.set(-5, 4, -5);
      lightsGroup.add(rimLight);
    } else {
      // Studio
      scene.background = new THREE.Color(0x111318);
      if (scene.fog instanceof THREE.FogExp2) scene.fog.color = new THREE.Color(0x111318);

      const amb = new THREE.AmbientLight(0xffffff, 1.2);
      lightsGroup.add(amb);

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
      keyLight.position.set(6, 8, 5);
      keyLight.castShadow = true;
      lightsGroup.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0x94a3b8, 1.4);
      fillLight.position.set(-6, 5, 4);
      lightsGroup.add(fillLight);
    }
  }, [lighting]);

  // Build / Switch 3D Model
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clean up current model
    if (currentModelRef.current) {
      scene.remove(currentModelRef.current.group);
      currentModelRef.current.dispose();
      currentModelRef.current = null;
    }

    const config = EXHIBITS[exhibitId];
    let newModel: BuiltModel;

    if (exhibitId === 'orrery') {
      newModel = buildOrreryModel(config.materials.color, wireframe);
    } else if (exhibitId === 'hypercar') {
      newModel = buildHypercarModel(config.materials.color, wireframe);
    } else if (exhibitId === 'quantum') {
      newModel = buildQuantumModel(config.materials.color);
    } else {
      newModel = buildPavilionModel(config.materials.color, wireframe);
    }

    scene.add(newModel.group);
    currentModelRef.current = newModel;

    // Reset camera desired distance
    const ctrl = cameraControlRef.current;
    ctrl.desiredRadius = config.cameraDefaultDistance;
    ctrl.desiredTarget.set(0, 0, 0);
  }, [exhibitId, wireframe]);

  // Camera Presets handler
  useEffect(() => {
    const ctrl = cameraControlRef.current;
    const config = EXHIBITS[exhibitId];

    if (cameraPreset === 'perspective') {
      ctrl.desiredPhi = Math.PI / 3;
      ctrl.desiredTheta = Math.PI / 4;
      ctrl.desiredRadius = config.cameraDefaultDistance;
      ctrl.desiredTarget.set(0, 0, 0);
    } else if (cameraPreset === 'top') {
      ctrl.desiredPhi = 0.05; // Almost direct top-down
      ctrl.desiredRadius = config.cameraDefaultDistance * 1.1;
      ctrl.desiredTarget.set(0, 0, 0);
    } else if (cameraPreset === 'side') {
      ctrl.desiredPhi = Math.PI / 2.05;
      ctrl.desiredTheta = Math.PI / 2;
      ctrl.desiredRadius = config.cameraDefaultDistance * 0.95;
      ctrl.desiredTarget.set(0, 0, 0);
    } else if (cameraPreset === 'macro') {
      ctrl.desiredPhi = Math.PI / 2.6;
      ctrl.desiredRadius = config.cameraDefaultDistance * 0.55;
    }
  }, [cameraPreset, exhibitId]);

  // Focus on active hotspot if clicked
  useEffect(() => {
    if (!activeHotspotId) return;
    const config = EXHIBITS[exhibitId];
    const spot = config.hotspots.find((h) => h.id === activeHotspotId);
    if (spot) {
      const ctrl = cameraControlRef.current;
      ctrl.desiredTarget.set(spot.position[0], spot.position[1], spot.position[2]);
      ctrl.desiredRadius = config.cameraDefaultDistance * 0.6;
    }
  }, [activeHotspotId, exhibitId]);

  // Animation Loop
  useEffect(() => {
    const renderLoop = (time: number) => {
      animationFrameId.current = requestAnimationFrame(renderLoop);

      const delta = (time - lastTimeRef.current) * 0.001;
      lastTimeRef.current = time;

      // FPS tracking
      frameCountRef.current++;
      if (time - lastFpsUpdateRef.current >= 500) {
        const currentFps = Math.round((frameCountRef.current * 1000) / (time - lastFpsUpdateRef.current));
        onFpsUpdate(currentFps);
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = time;
      }

      const ctrl = cameraControlRef.current;

      // Auto rotation when not dragging and not paused
      if (!ctrl.isDragging && !isPaused && rotationSpeed > 0) {
        ctrl.desiredTheta += 0.008 * rotationSpeed;
      }

      // Smooth camera lerping
      const lerpSpeed = 0.08;
      ctrl.radius += (ctrl.desiredRadius - ctrl.radius) * lerpSpeed;
      ctrl.theta += (ctrl.desiredTheta - ctrl.theta) * lerpSpeed;
      ctrl.phi += (ctrl.desiredPhi - ctrl.phi) * lerpSpeed;
      ctrl.target.lerp(ctrl.desiredTarget, lerpSpeed);

      // Clamp phi to avoid pole flipping
      ctrl.phi = Math.max(0.05, Math.min(Math.PI - 0.05, ctrl.phi));

      // Calculate camera position in Cartesian coords
      if (cameraRef.current) {
        const cx = ctrl.target.x + ctrl.radius * Math.sin(ctrl.phi) * Math.sin(ctrl.theta);
        const cy = ctrl.target.y + ctrl.radius * Math.cos(ctrl.phi);
        const cz = ctrl.target.z + ctrl.radius * Math.sin(ctrl.phi) * Math.cos(ctrl.theta);
        cameraRef.current.position.set(cx, cy, cz);
        cameraRef.current.lookAt(ctrl.target);
      }

      // Starfield subtle rotation
      if (starfieldRef.current) {
        starfieldRef.current.rotation.y = time * 0.00005;
      }

      // Update active 3D Model
      if (currentModelRef.current) {
        const activeSpeed = isPaused ? 0 : rotationSpeed;
        currentModelRef.current.update(
          time * 0.001,
          delta,
          activeSpeed,
          explodeFactor,
          pointerRef.current
        );
      }

      // Project hotspots to 2D screen positions
      if (cameraRef.current && containerRef.current) {
        const config = EXHIBITS[exhibitId];
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        const projected: HotspotScreenPos[] = config.hotspots.map((spot) => {
          const worldPos = new THREE.Vector3(spot.position[0], spot.position[1], spot.position[2]);

          // Offset position if in exploded mode
          if (explodeFactor > 0 && currentModelRef.current) {
            // Apply slight vertical offset to track parts
            worldPos.y += explodeFactor * 0.6;
          }

          const screenPos = worldPos.clone().project(cameraRef.current!);
          const isFront = screenPos.z < 1;
          const sx = ((screenPos.x + 1) * width) / 2;
          const sy = ((-screenPos.y + 1) * height) / 2;
          const dist = cameraRef.current!.position.distanceTo(worldPos);

          return {
            id: spot.id,
            x: sx,
            y: sy,
            visible: isFront && sx >= 0 && sx <= width && sy >= 0 && sy <= height,
            distance: dist,
          };
        });

        onHotspotsUpdate(projected);
      }

      // Render Scene
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animationFrameId.current = requestAnimationFrame(renderLoop);
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [
    exhibitId,
    explodeFactor,
    isPaused,
    rotationSpeed,
    onHotspotsUpdate,
    onFpsUpdate,
  ]);

  // Mouse & Touch Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctrl = cameraControlRef.current;
    ctrl.isDragging = true;
    ctrl.dragStart = { x: e.clientX, y: e.clientY };
    ctrl.prevDrag = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const container = containerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      pointerRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    }

    const ctrl = cameraControlRef.current;
    if (!ctrl.isDragging) return;

    const deltaX = e.clientX - ctrl.prevDrag.x;
    const deltaY = e.clientY - ctrl.prevDrag.y;
    ctrl.prevDrag = { x: e.clientX, y: e.clientY };

    // Pan vs Orbit
    if (e.buttons === 2 || e.shiftKey) {
      // Pan
      const panSpeed = ctrl.radius * 0.0018;
      const forward = new THREE.Vector3();
      cameraRef.current?.getWorldDirection(forward);
      const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
      const up = new THREE.Vector3(0, 1, 0);

      ctrl.desiredTarget.addScaledVector(right, -deltaX * panSpeed);
      ctrl.desiredTarget.addScaledVector(up, deltaY * panSpeed);
    } else {
      // Orbit
      const rotSpeed = 0.007;
      ctrl.desiredTheta -= deltaX * rotSpeed;
      ctrl.desiredPhi -= deltaY * rotSpeed;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctrl = cameraControlRef.current;
    ctrl.isDragging = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if already released
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const ctrl = cameraControlRef.current;
    const zoomFactor = e.deltaY * 0.005;
    ctrl.desiredRadius = Math.max(2.5, Math.min(25, ctrl.desiredRadius + zoomFactor));
  };

  return (
    <div ref={containerRef} className="relative w-full h-full select-none overflow-hidden">
      {webglError && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-6 text-center">
          <div className="max-w-md bg-slate-900/90 border border-red-500/30 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Graphics Pipeline Notice</h3>
            <p className="text-sm text-slate-300">{webglError}</p>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-grab active:cursor-grabbing outline-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
};
