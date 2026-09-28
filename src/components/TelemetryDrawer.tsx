import React from 'react';
import {
  X,
  ChevronRight,
  Maximize2,
  Sliders,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ExhibitConfig, Hotspot } from '../types/three-types';
import { soundManager } from '../utils/audio';

interface TelemetryDrawerProps {
  exhibit: ExhibitConfig;
  activeHotspot: Hotspot | null;
  onCloseHotspot: () => void;
  fps: number;
  isOpen: boolean;
  onToggleOpen: () => void;
  onColorChange: (hex: string) => void;
}

export const TelemetryDrawer: React.FC<TelemetryDrawerProps> = ({
  exhibit,
  activeHotspot,
  onCloseHotspot,
  fps,
  isOpen,
  onToggleOpen,
  onColorChange,
}) => {
  const colorPresets = [
    { label: 'Obsidian Gold', hex: '#d4af37' },
    { label: 'Cyber Cyan', hex: '#0ea5e9' },
    { label: 'Violet Nebula', hex: '#8b5cf6' },
    { label: 'Solar Amber', hex: '#f59e0b' },
    { label: 'Travertine White', hex: '#f8fafc' },
    { label: 'Emerald Flux', hex: '#10b981' },
  ];

  return (
    <aside
      className={`fixed top-20 right-6 z-25 w-84 sm:w-96 max-h-[calc(100vh-8.5rem)] flex flex-col bg-[#0b0d13]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden select-none ${
        isOpen ? 'translate-x-0 opacity-100' : 'translate-x-[110%] opacity-0 pointer-events-none'
      }`}
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div>
          <h2 className="font-display text-base font-bold text-white tracking-wide">
            {activeHotspot ? activeHotspot.title : exhibit.name}
          </h2>
          {/* Zero-Pill Unboxed Metadata with · separator */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
            <span>{activeHotspot ? activeHotspot.subtitle : exhibit.category}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono tabular-nums">{exhibit.year}</span>
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            if (activeHotspot) {
              onCloseHotspot();
            } else {
              onToggleOpen();
            }
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Hotspot Active Inspection Mode */}
        {activeHotspot ? (
          <div className="space-y-4">
            <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
                Sub-Assembly Analysis
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                {activeHotspot.description}
              </p>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Technical Specifications
              </div>
              <div className="space-y-2">
                {activeHotspot.specifications.map((spec, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-white/5"
                  >
                    <span className="text-slate-400">{spec.label}</span>
                    <span className="font-mono font-medium text-white tabular-nums">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playClick();
                onCloseHotspot();
              }}
              className="w-full py-2 px-3 text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors cursor-pointer text-center"
            >
              Exit Component Inspection
            </button>
          </div>
        ) : (
          /* General Exhibit Telemetry */
          <div className="space-y-5">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Architectural Overview
              </div>
              <p className="text-xs leading-relaxed text-slate-300 [text-wrap:balance]">
                {exhibit.description}
              </p>
            </div>

            {/* Core Metrics Grid */}
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Physical Kinetics & Metrics
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {exhibit.metrics.map((m, i) => (
                  <div key={i} className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-[11px] text-slate-400 truncate">{m.label}</div>
                    <div className="font-mono text-sm font-semibold text-white mt-0.5 tabular-nums">
                      {m.value}{' '}
                      {m.unit && <span className="text-[10px] text-amber-400 font-normal">{m.unit}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Material & Finish Atelier */}
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Material Atelier</span>
                <span className="text-[11px] text-amber-400 font-mono">PBR Shaders</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.hex}
                    onClick={() => {
                      soundManager.playClick();
                      onColorChange(preset.hex);
                    }}
                    className="flex flex-col items-center p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all cursor-pointer text-center"
                  >
                    <div
                      style={{ backgroundColor: preset.hex }}
                      className="w-4 h-4 rounded-full border border-white/20 mb-1"
                    />
                    <span className="text-[10px] text-slate-300 truncate w-full">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Real-time WebGL Telemetry */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Spatial Telemetry</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-[10px] text-slate-500">Render FPS</div>
                  <div className="font-mono text-xs font-semibold text-emerald-400 tabular-nums">
                    {fps || 60}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">Bounding Box</div>
                  <div className="font-mono text-xs font-semibold text-slate-200 tabular-nums">
                    {exhibit.dimensions.x}×{exhibit.dimensions.y}m
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">Precision</div>
                  <div className="font-mono text-xs font-semibold text-sky-400 tabular-nums">
                    32-bit Float
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drawer Footer Callout */}
      <div className="px-5 py-3 border-t border-white/10 bg-black/20 flex items-center justify-between text-xs text-slate-400">
        <span className="truncate">Drag to rotate · Scroll to zoom</span>
        <span className="font-mono text-[10px] text-amber-400">Aether 3D Engine</span>
      </div>
    </aside>
  );
};
