/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ExhibitId,
  LightingPreset,
  CameraPreset,
  Hotspot,
} from './types/three-types';
import { EXHIBITS } from './data/exhibits';
import { ThreeCanvas, HotspotScreenPos } from './components/ThreeCanvas';
import { HotspotOverlay } from './components/HotspotOverlay';
import { TopBar } from './components/TopBar';
import { StudioControlBar } from './components/StudioControlBar';
import { TelemetryDrawer } from './components/TelemetryDrawer';
import { KeyboardGuideModal } from './components/KeyboardGuideModal';
import { SnapshotNotification } from './components/SnapshotNotification';
import { soundManager } from './utils/audio';
import { Activity, Sliders, ChevronLeft } from 'lucide-react';

export default function App() {
  const [currentExhibitId, setCurrentExhibitId] = useState<ExhibitId>('orrery');
  const [lighting, setLighting] = useState<LightingPreset>('cosmos');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('perspective');
  const [explodeFactor, setExplodeFactor] = useState<number>(0);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1.0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isCinematic, setIsCinematic] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Hotspots
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [screenHotspots, setScreenHotspots] = useState<HotspotScreenPos[]>([]);

  // Telemetry & Modals
  const [isTelemetryOpen, setIsTelemetryOpen] = useState<boolean>(true);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const [fps, setFps] = useState<number>(60);

  const exportCanvasRef = useRef<(() => string) | null>(null);
  const activeExhibitConfig = EXHIBITS[currentExhibitId];

  // Initialize ambient audio on first user click anywhere
  useEffect(() => {
    const handleFirstUserGesture = () => {
      soundManager.startAmbient();
      window.removeEventListener('pointerdown', handleFirstUserGesture);
    };
    window.addEventListener('pointerdown', handleFirstUserGesture);
    return () => {
      window.removeEventListener('pointerdown', handleFirstUserGesture);
    };
  }, []);

  // Handle Snapshot Capture
  const handleCaptureSnapshot = useCallback(() => {
    if (exportCanvasRef.current) {
      const dataUrl = exportCanvasRef.current();
      if (dataUrl) {
        setSnapshotUrl(dataUrl);
        // Trigger automatic browser download
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `aetheria-render-${currentExhibitId}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }
  }, [currentExhibitId]);

  // Handle Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPaused((prev) => !prev);
        soundManager.playClick();
      } else if (e.key === 'x' || e.key === 'X') {
        setWireframe((prev) => !prev);
        soundManager.playClick();
      } else if (e.key === 'e' || e.key === 'E') {
        setExplodeFactor((prev) => (prev < 0.3 ? 0.6 : prev < 0.8 ? 1.0 : 0));
        soundManager.playExplodeWoosh(0.5);
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted((prev) => {
          const next = !prev;
          soundManager.setMuted(next);
          return next;
        });
      } else if (e.key === 'c' || e.key === 'C') {
        const presets: CameraPreset[] = ['perspective', 'top', 'side', 'macro'];
        const currentIdx = presets.indexOf(cameraPreset);
        const nextPreset = presets[(currentIdx + 1) % presets.length];
        setCameraPreset(nextPreset);
        soundManager.playClick();
      } else if (e.key === '1') {
        setCurrentExhibitId('orrery');
        soundManager.playClick();
      } else if (e.key === '2') {
        setCurrentExhibitId('hypercar');
        soundManager.playClick();
      } else if (e.key === '3') {
        setCurrentExhibitId('quantum');
        soundManager.playClick();
      } else if (e.key === '4') {
        setCurrentExhibitId('pavilion');
        soundManager.playClick();
      } else if (e.key === 'Escape') {
        setActiveHotspot(null);
        setIsHelpOpen(false);
      } else if (e.key === '?') {
        setIsHelpOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cameraPreset]);

  // Toggle Mute
  const handleToggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      soundManager.setMuted(next);
      return next;
    });
  };

  // Toggle Cinematic Tour
  const handleToggleCinematic = () => {
    setIsCinematic((prev) => {
      const next = !prev;
      if (next) {
        setIsPaused(false);
        setRotationSpeed(0.6);
        setCameraPreset('perspective');
        setIsTelemetryOpen(false);
      } else {
        setRotationSpeed(1.0);
        setIsTelemetryOpen(true);
      }
      return next;
    });
  };

  // Switch material accent color
  const handleColorChange = (hex: string) => {
    activeExhibitConfig.materials.color = hex;
    // Force rerender by toggling wireframe briefly or reloading model
    setCurrentExhibitId((prev) => prev);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#08090D] flex flex-col font-sans select-none">
      {/* 1. Universal Top Navigation Bar */}
      <TopBar
        currentExhibit={currentExhibitId}
        onSelectExhibit={(id) => {
          setCurrentExhibitId(id);
          setActiveHotspot(null);
          setExplodeFactor(0);
        }}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onCaptureSnapshot={handleCaptureSnapshot}
        onToggleCinematic={handleToggleCinematic}
        isCinematic={isCinematic}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* 2. Main 3D Viewport Area */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        {/* Three.js Canvas */}
        <ThreeCanvas
          exhibitId={currentExhibitId}
          lighting={lighting}
          cameraPreset={cameraPreset}
          explodeFactor={explodeFactor}
          wireframe={wireframe}
          rotationSpeed={rotationSpeed}
          isPaused={isPaused}
          activeHotspotId={activeHotspot?.id || null}
          onHotspotClick={(id) => {
            const spot = activeExhibitConfig.hotspots.find((h) => h.id === id);
            setActiveHotspot(spot || null);
            if (spot) setIsTelemetryOpen(true);
          }}
          onHotspotsUpdate={setScreenHotspots}
          onFpsUpdate={setFps}
          onCanvasReady={(exportFn) => {
            exportCanvasRef.current = exportFn;
          }}
        />

        {/* 3D Interactive Hotspot Pins Layer */}
        {!isCinematic && (
          <HotspotOverlay
            hotspots={activeExhibitConfig.hotspots}
            screenPositions={screenHotspots}
            activeHotspotId={activeHotspot?.id || null}
            onSelectHotspot={(spot) => {
              setActiveHotspot(spot);
              if (spot) setIsTelemetryOpen(true);
            }}
          />
        )}

        {/* Exhibit Brand Title & Breadcrumb Overlay (Top Left) */}
        <div className="absolute top-6 left-6 z-20 pointer-events-none">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-amber-400">0{Object.keys(EXHIBITS).indexOf(currentExhibitId) + 1}</span>
            <span aria-hidden="true">/</span>
            <span>04</span>
            <span aria-hidden="true">·</span>
            <span className="uppercase tracking-wider text-slate-300">
              {activeExhibitConfig.category}
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1 [text-wrap:balance]">
            {activeExhibitConfig.name}
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Dimensions: {activeExhibitConfig.dimensions.x} × {activeExhibitConfig.dimensions.y} × {activeExhibitConfig.dimensions.z} {activeExhibitConfig.dimensions.unit}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-mono tabular-nums">{fps} FPS WebGL</span>
          </div>
        </div>

        {/* Telemetry Drawer Toggle Button (When drawer is closed) */}
        {!isTelemetryOpen && !isCinematic && (
          <button
            onClick={() => {
              soundManager.playClick();
              setIsTelemetryOpen(true);
            }}
            title="Open Technical Telemetry & Specifications"
            className="absolute top-6 right-6 z-20 flex items-center gap-2 px-3 py-2 bg-[#0c0e14]/90 backdrop-blur-md border border-white/10 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors shadow-lg cursor-pointer"
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Telemetry & Specs</span>
          </button>
        )}

        {/* Right Side Telemetry & Engineering Drawer */}
        <TelemetryDrawer
          exhibit={activeExhibitConfig}
          activeHotspot={activeHotspot}
          onCloseHotspot={() => setActiveHotspot(null)}
          fps={fps}
          isOpen={isTelemetryOpen && !isCinematic}
          onToggleOpen={() => setIsTelemetryOpen((prev) => !prev)}
          onColorChange={handleColorChange}
        />

        {/* Bottom Floating Studio Controls Dock */}
        {!isCinematic && (
          <StudioControlBar
            explodeFactor={explodeFactor}
            onExplodeChange={setExplodeFactor}
            wireframe={wireframe}
            onToggleWireframe={() => setWireframe((prev) => !prev)}
            lighting={lighting}
            onSelectLighting={setLighting}
            cameraPreset={cameraPreset}
            onSelectCameraPreset={setCameraPreset}
            rotationSpeed={rotationSpeed}
            onSpeedChange={setRotationSpeed}
            isPaused={isPaused}
            onTogglePause={() => setIsPaused((prev) => !prev)}
          />
        )}
      </main>

      {/* Snapshot Toast Feedback */}
      <SnapshotNotification
        imageSrc={snapshotUrl}
        onClose={() => setSnapshotUrl(null)}
      />

      {/* Keyboard Shortcuts & Gesture Guide Modal */}
      <KeyboardGuideModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
