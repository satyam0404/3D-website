import React from 'react';
import { CheckCircle2, Download, ExternalLink } from 'lucide-react';

interface SnapshotNotificationProps {
  imageSrc: string | null;
  onClose: () => void;
}

export const SnapshotNotification: React.FC<SnapshotNotificationProps> = ({
  imageSrc,
  onClose,
}) => {
  if (!imageSrc) return null;

  return (
    <div className="fixed bottom-24 right-6 z-40 max-w-sm bg-[#0e1017]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-white">4K Snapshot Exported</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Viewport rendered and downloaded to your local device.
          </p>
          <div className="mt-2 rounded-lg overflow-hidden border border-white/10 max-h-24">
            <img src={imageSrc} alt="3D Viewport Render" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-3 py-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};
