import React from 'react';
import { Monitor, Smartphone, Sparkles } from 'lucide-react';

interface DeviceGuardProps {
  children: React.ReactNode;
}

export const DeviceGuard: React.FC<DeviceGuardProps> = ({ children }) => {
  return (
    <>
      {/* Mobile Screen Barrier (< 768px / Tailwind md) */}
      <div className="flex md:hidden min-h-screen w-full bg-[#faf6ec] text-[#16291a] p-6 flex-col items-center justify-center text-center">
        <div className="max-w-sm rounded-3xl bg-white border border-[#d2e6d6] p-7 shadow-xl space-y-5">
          {/* Brand & Icons */}
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-2xl bg-[#edf4dd] border border-[#c9de99] text-[#223d27] shadow-xs">
              <Monitor className="w-6 h-6 text-[#386641]" />
            </div>
            <div className="text-zinc-400">→</div>
            <div className="p-3 rounded-2xl bg-[#f2dadb] border border-[#e5b6b6] text-[#bc4749] opacity-60">
              <Smartphone className="w-5 h-5 text-[#bc4749]" />
            </div>
          </div>

          <div>
            <span className="font-cinzel text-lg font-bold text-[#16291a] tracking-wider block mb-1">
              PULSE ENGINE
            </span>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#edf4dd] text-[#2d5234] border border-[#c9de99] font-bold">
              DESKTOP & TABLET ONLY
            </span>
          </div>

          <div className="space-y-2 text-xs text-[#3f5b2f] leading-relaxed">
            <p className="font-semibold text-[#16291a]">
              Optimized for Medium & Large Displays
            </p>
            <p>
              Pulse is engineered as a high-density, keyboard-first distributed engine with CRDT sync, multi-column Kanban matrices, and virtualized data tables.
            </p>
            <p className="text-[11px] text-[#54793e] bg-[#f4edd9] p-3 rounded-xl border border-[#d2e6d6]">
              <strong>Note:</strong> Please open this application on a tablet, laptop, or desktop monitor (minimum <strong>768px</strong> viewport) to experience the full workspace.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] font-mono font-bold text-[#386641]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>0ms Local-First Architecture</span>
          </div>
        </div>
      </div>

      {/* Medium & Large Viewport (>= 768px / md+) */}
      <div className="hidden md:flex md:flex-col min-h-screen">
        {children}
      </div>
    </>
  );
};

