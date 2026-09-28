import React from 'react';
import { X, Command, Eye, Compass, Volume2, Layers, Box } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface KeyboardGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardGuideModal: React.FC<KeyboardGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Pause or resume kinetic 3D rotation', icon: <Compass className="w-4 h-4 text-amber-400" /> },
    { key: 'X', desc: 'Toggle holographic wireframe / X-ray mesh', icon: <Box className="w-4 h-4 text-sky-400" /> },
    { key: 'E', desc: 'Step exploded view kinematics (0% → 50% → 100%)', icon: <Layers className="w-4 h-4 text-emerald-400" /> },
    { key: '1 – 4', desc: 'Switch exhibits (Orrery, Hypercar, Quantum, Pavilion)', icon: <Eye className="w-4 h-4 text-purple-400" /> },
    { key: 'M', desc: 'Toggle synthesized spatial drone soundscape', icon: <Volume2 className="w-4 h-4 text-pink-400" /> },
    { key: 'C', desc: 'Cycle camera viewpoints (Perspective, Top, Side, Macro)', icon: <Compass className="w-4 h-4 text-amber-400" /> },
    { key: 'Esc', desc: 'Deselect active component inspection', icon: <Command className="w-4 h-4 text-slate-400" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md select-none">
      <div className="w-full max-w-lg bg-[#0e1017] border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="font-display text-lg font-bold text-white tracking-wide">
              Spatial Interaction Guide
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive 3D navigation & keyboard accelerator shortcuts
            </p>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pointer gestures */}
        <div className="my-5 p-3.5 bg-white/5 rounded-xl border border-white/5 grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xs font-semibold text-white">Left Click + Drag</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Orbit Camera</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Right Click / Shift</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Pan Camera</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Scroll Wheel</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Dolly Zoom</div>
          </div>
        </div>

        {/* Shortcuts list */}
        <div className="space-y-2.5">
          {shortcuts.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="text-xs text-slate-200">{item.desc}</span>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 bg-white/10 text-amber-300 rounded border border-white/10 font-semibold tabular-nums">
                {item.key}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-4 py-2 text-xs font-medium text-slate-900 bg-white hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
