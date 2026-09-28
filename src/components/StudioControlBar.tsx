import React from 'react';
import {
  Play,
  Pause,
  Layers,
  Box,
  Sun,
  Eye,
  RotateCcw,
  Compass,
} from 'lucide-react';
import { LightingPreset, CameraPreset } from '../types/three-types';
import { soundManager } from '../utils/audio';

interface StudioControlBarProps {
  explodeFactor: number;
  onExplodeChange: (val: number) => void;
  wireframe: boolean;
  onToggleWireframe: () => void;
  lighting: LightingPreset;
  onSelectLighting: (preset: LightingPreset) => void;
  cameraPreset: CameraPreset;
  onSelectCameraPreset: (preset: CameraPreset) => void;
  rotationSpeed: number;
  onSpeedChange: (val: number) => void;
  isPaused: boolean;
  onTogglePause: () => void;
}

export const StudioControlBar: React.FC<StudioControlBarProps> = ({
  explodeFactor,
  onExplodeChange,
  wireframe,
  onToggleWireframe,
  lighting,
  onSelectLighting,
  cameraPreset,
  onSelectCameraPreset,
  rotationSpeed,
  onSpeedChange,
  isPaused,
  onTogglePause,
}) => {
  const lightingOptions: { id: LightingPreset; label: string }[] = [
    { id: 'cosmos', label: 'Cosmos' },
    { id: 'cyber', label: 'Cyber' },
    { id: 'atelier', label: 'Atelier' },
    { id: 'studio', label: 'Studio' },
  ];

  const cameraOptions: { id: CameraPreset; label: string }[] = [
    { id: 'perspective', label: 'Orbit' },
    { id: 'top', label: 'Top' },
    { id: 'side', label: 'Elevation' },
    { id: 'macro', label: 'Macro' },
  ];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-5xl pointer-events-none select-none">
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 sm:p-3 bg-[#0c0e14]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl pointer-events-auto">
        {/* Play/Pause & Rotation Speed Control */}
        <div className="flex items-center gap-2 pr-3 border-r border-white/10 shrink-0">
          <button
            onClick={() => {
              soundManager.playClick();
              onTogglePause();
            }}
            title={isPaused ? 'Resume 3D Rotation (Space)' : 'Pause 3D Rotation (Space)'}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
          >
            {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono tabular-nums w-8">
              {isPaused ? '0.0x' : `${rotationSpeed.toFixed(1)}x`}
            </span>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={rotationSpeed}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onSpeedChange(val);
                soundManager.setAmbientModulation(val);
              }}
              title="Rotation velocity"
              className="w-16 sm:w-20 accent-amber-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Exploded View Slider */}
        <div className="flex items-center gap-2.5 px-2 border-r border-white/10 shrink-0">
          <Layers className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-medium text-slate-300 whitespace-nowrap">Explode</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={explodeFactor}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onExplodeChange(val);
              soundManager.playExplodeWoosh(val);
            }}
            title="Separation factor along kinematics axis"
            className="w-20 sm:w-28 accent-amber-400 cursor-pointer"
          />
          <span className="text-xs font-mono tabular-nums text-amber-400 w-9">
            {Math.round(explodeFactor * 100)}%
          </span>
        </div>

        {/* Wireframe / X-Ray Mode */}
        <button
          onClick={() => {
            soundManager.playClick();
            onToggleWireframe();
          }}
          title="Toggle structural wireframe mesh (Key: X)"
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer shrink-0 ${
            wireframe
              ? 'bg-sky-500/20 border-sky-400 text-sky-300'
              : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>Wireframe</span>
        </button>

        {/* Camera Views Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/5 shrink-0">
          <Compass className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5 hidden lg:block" />
          {cameraOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                soundManager.playClick();
                onSelectCameraPreset(opt.id);
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                cameraPreset === opt.id
                  ? 'bg-white text-slate-950 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Studio Lighting Environment Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/5 shrink-0">
          <Sun className="w-3.5 h-3.5 text-amber-400 ml-1.5 mr-0.5 hidden lg:block" />
          {lightingOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                soundManager.playClick();
                onSelectLighting(opt.id);
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                lighting === opt.id
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
