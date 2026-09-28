import React from 'react';
import { Hotspot } from '../types/three-types';
import { HotspotScreenPos } from './ThreeCanvas';
import { soundManager } from '../utils/audio';

interface HotspotOverlayProps {
  hotspots: Hotspot[];
  screenPositions: HotspotScreenPos[];
  activeHotspotId: string | null;
  onSelectHotspot: (hotspot: Hotspot | null) => void;
}

export const HotspotOverlay: React.FC<HotspotOverlayProps> = ({
  hotspots,
  screenPositions,
  activeHotspotId,
  onSelectHotspot,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {hotspots.map((spot) => {
        const screenPos = screenPositions.find((p) => p.id === spot.id);
        if (!screenPos || !screenPos.visible) return null;

        const isActive = activeHotspotId === spot.id;

        return (
          <div
            key={spot.id}
            style={{
              transform: `translate3d(${screenPos.x}px, ${screenPos.y}px, 0)`,
            }}
            className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out"
          >
            {/* Interactive button trigger */}
            <div className="relative group pointer-events-auto">
              {/* Outer pulsing ring */}
              <span
                style={{ borderColor: spot.accentColor }}
                className={`absolute -inset-2.5 rounded-full border border-dashed animate-spin [animation-duration:8s] opacity-70 transition-transform ${
                  isActive ? 'scale-125 opacity-100' : 'group-hover:scale-110'
                }`}
              />

              {/* Pulsing beacon glow */}
              <span
                style={{ backgroundColor: spot.accentColor }}
                className="absolute inset-0 rounded-full animate-ping opacity-40 [animation-duration:2.5s]"
              />

              {/* Center interactive button */}
              <button
                onClick={() => {
                  soundManager.playChime(580, 'sine');
                  onSelectHotspot(isActive ? null : spot);
                }}
                title={spot.title}
                style={{
                  backgroundColor: isActive ? spot.accentColor : '#0f172a',
                  borderColor: spot.accentColor,
                  color: isActive ? '#000000' : '#ffffff',
                }}
                className={`relative flex items-center justify-center w-7 h-7 rounded-full border shadow-lg backdrop-blur-md transition-all duration-200 cursor-pointer ${
                  isActive ? 'scale-115 ring-4 ring-white/20' : 'hover:scale-110 hover:border-white'
                }`}
              >
                <div
                  style={{ backgroundColor: isActive ? '#000000' : spot.accentColor }}
                  className="w-2 h-2 rounded-full"
                />
              </button>

              {/* Hover / Active Leader Callout Tag */}
              <div
                className={`absolute left-8 top-1/2 -translate-y-1/2 min-w-44 whitespace-nowrap bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-md p-2 shadow-2xl transition-all duration-150 ${
                  isActive
                    ? 'opacity-100 translate-x-0 pointer-events-auto scale-100 ring-1 ring-white/30'
                    : 'opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 scale-95 group-hover:scale-100'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-white tracking-wide">{spot.title}</span>
                  <span
                    style={{ color: spot.accentColor }}
                    className="font-mono text-[10px] tabular-nums tracking-widest uppercase"
                  >
                    Inspect
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{spot.subtitle}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
