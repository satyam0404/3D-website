import React from 'react';
import { Camera, Volume2, VolumeX, Sparkles, HelpCircle } from 'lucide-react';
import { ExhibitId } from '../types/three-types';
import { EXHIBITS } from '../data/exhibits';
import { soundManager } from '../utils/audio';

interface TopBarProps {
  currentExhibit: ExhibitId;
  onSelectExhibit: (id: ExhibitId) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onCaptureSnapshot: () => void;
  onToggleCinematic: () => void;
  isCinematic: boolean;
  onOpenHelp: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentExhibit,
  onSelectExhibit,
  isMuted,
  onToggleMute,
  onCaptureSnapshot,
  onToggleCinematic,
  isCinematic,
  onOpenHelp,
}) => {
  const exhibitsList = Object.values(EXHIBITS);

  return (
    <header className="relative z-30 flex items-center justify-between px-6 py-4 bg-[#08090d]/85 backdrop-blur-md border-b border-white/10 select-none">
      {/* Zone 1: Single text element wordmark in display face */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onSelectExhibit('orrery');
        }}
        className="font-display text-xl font-bold tracking-tight text-white hover:text-amber-400 transition-colors shrink-0"
      >
        AETHERIA
      </a>

      {/* Zone 2: 4 clean text navigation links with subtle hover underlines */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
        {exhibitsList.map((exhibit) => {
          const isSelected = currentExhibit === exhibit.id;
          return (
            <button
              key={exhibit.id}
              onClick={() => {
                soundManager.playClick();
                onSelectExhibit(exhibit.id);
              }}
              className={`relative py-1 transition-colors whitespace-nowrap cursor-pointer ${
                isSelected ? 'text-white font-semibold' : 'hover:text-white text-slate-400'
              }`}
            >
              <span>{exhibit.name.split(' ')[0]} {exhibit.name.split(' ')[1]}</span>
              {isSelected && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-sky-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Help shortcuts trigger */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenHelp();
          }}
          title="Keyboard shortcuts & interaction guide"
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={() => {
            onToggleMute();
            if (isMuted) {
              soundManager.playChime(520);
            }
          }}
          title={isMuted ? 'Unmute Spatial Audio Drone' : 'Mute Spatial Audio Drone'}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
            !isMuted
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
              : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          {!isMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{!isMuted ? 'Sound Active' : 'Sound Muted'}</span>
        </button>

        {/* Cinematic Auto-Tour */}
        <button
          onClick={() => {
            soundManager.playClick();
            onToggleCinematic();
          }}
          title="Toggle smooth cinematic auto-orbit mode"
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
            isCinematic
              ? 'bg-sky-500/15 border-sky-400 text-sky-300'
              : 'border-white/10 text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Cinematic Tour</span>
        </button>

        {/* Snapshot Capture */}
        <button
          onClick={() => {
            soundManager.playClick();
            onCaptureSnapshot();
          }}
          title="Export high-resolution screenshot"
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 rounded-lg transition-colors shadow-md cursor-pointer whitespace-nowrap"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Capture 4K</span>
        </button>
      </div>
    </header>
  );
};
