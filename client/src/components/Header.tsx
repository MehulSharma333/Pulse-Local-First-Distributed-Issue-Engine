import React from 'react';
import { 
  Wifi, 
  WifiOff, 
  Activity, 
  Command, 
  Kanban, 
  ListFilter, 
  RotateCcw, 
  RotateCw,
  Zap,
  Plus
} from 'lucide-react';
import { useSyncStatus } from '../hooks/useSyncStatus';
import { usePresence } from '../hooks/usePresence';
import { undo, redo } from '../engine/history';

interface HeaderProps {
  currentView: 'board' | 'list';
  onViewChange: (view: 'board' | 'list') => void;
  onOpenCommandPalette: () => void;
  onOpenCreateIssue: () => void;
  onToggleTelemetry: () => void;
  isTelemetryOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onOpenCommandPalette,
  onOpenCreateIssue,
  onToggleTelemetry,
  isTelemetryOpen,
}) => {
  const { stats, toggleSimulateOffline } = useSyncStatus();
  const { peers, localUser } = usePresence();

  return (
    <header className="sticky top-0 z-30 border-b border-[#e0d2e9] bg-white/80 backdrop-blur-md px-4 py-2.5 flex items-center justify-between gap-4 shadow-xs">
      {/* Brand & View Switcher */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-[#f5f0f8] border border-[#cdb4db] text-[#824ea1] shadow-xs">
            <Zap className="w-4 h-4 fill-[#cdb4db] text-[#824ea1]" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#ff5895] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinzel font-bold text-[#2b1a36] tracking-wider text-sm">PULSE</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[#f5f0f8] text-[#824ea1] border border-[#d6c2e2] font-semibold">
                CRDT ENGINE
              </span>
            </div>
            <p className="text-[11px] text-[#824ea1] font-medium">Local-First Issue Architecture</p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-[#ebe1f0]/60 border border-[#d6c2e2]">
          <button
            onClick={() => onViewChange('board')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              currentView === 'board'
                ? 'bg-white text-[#2b1a36] shadow-xs'
                : 'text-[#824ea1] hover:text-[#2b1a36]'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            Board
          </button>
          <button
            onClick={() => onViewChange('list')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              currentView === 'list'
                ? 'bg-white text-[#2b1a36] shadow-xs'
                : 'text-[#824ea1] hover:text-[#2b1a36]'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            List
          </button>
        </div>
      </div>

      {/* Middle: Command Palette trigger */}
      <div className="flex-1 max-w-md hidden md:block">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-white border border-[#e0d2e9] text-[#824ea1] hover:text-[#2b1a36] hover:border-[#cdb4db] text-xs transition-all shadow-xs"
        >
          <div className="flex items-center gap-2">
            <Command className="w-3.5 h-3.5 text-[#a87ec1]" />
            <span className="font-medium text-[#824ea1]">Search or jump to...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#f5f0f8] text-[#57346b] border border-[#d6c2e2] rounded-md font-semibold">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Sync indicator, Peers, New Issue */}
      <div className="flex items-center gap-3">
        {/* Undo / Redo */}
        <div className="hidden lg:flex items-center gap-1 text-[#824ea1]">
          <button
            onClick={() => undo()}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded-lg hover:bg-[#f5f0f8] text-[#824ea1] hover:text-[#2b1a36] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => redo()}
            title="Redo (Ctrl+Shift+Z)"
            className="p-1.5 rounded-lg hover:bg-[#f5f0f8] text-[#824ea1] hover:text-[#2b1a36] transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sync Telemetry Button */}
        <button
          onClick={onToggleTelemetry}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
            isTelemetryOpen
              ? 'bg-[#ebe1f0] border-[#a87ec1] text-[#2b1a36]'
              : 'bg-white border-[#e0d2e9] text-[#57346b] hover:border-[#cdb4db]'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-[#824ea1] animate-pulse" />
          <span className="hidden xl:inline">CRDT Telemetry</span>
        </button>

        {/* Offline Simulation Toggle Button */}
        <button
          onClick={toggleSimulateOffline}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
            stats.isSimulatedOffline
              ? 'bg-[#ffe9f1] border-[#ff6ca4] text-[#b60046] animate-pulse'
              : 'bg-[#e5f3ff] border-[#bde0fe] text-[#035eaf] hover:bg-[#d8ecfe]'
          }`}
          title="Toggle offline state to demonstrate zero-latency local mutations"
        >
          {stats.isSimulatedOffline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-[#ff116c]" />
              <span>Offline Sim Active</span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5 text-[#035eaf]" />
              <span>{stats.state === 'connected' ? 'Synced (0ms)' : 'Connecting...'}</span>
            </>
          )}
        </button>

        {/* Active Peers Presence */}
        <div className="flex items-center -space-x-1.5">
          {peers.slice(0, 4).map((peer, idx) => (
            <div
              key={peer.id || idx}
              title={`${peer.name} (${peer.id === localUser.id ? 'You' : 'Remote Peer'})`}
              className="relative w-6 h-6 rounded-full overflow-hidden ring-2 ring-white shadow-xs"
            >
              <img src={peer.avatar} alt={peer.name} className="w-full h-full object-cover" />
            </div>
          ))}
          {peers.length > 4 && (
            <div className="w-6 h-6 rounded-full bg-[#f5f0f8] ring-2 ring-white flex items-center justify-center text-[9px] font-bold text-[#824ea1]">
              +{peers.length - 4}
            </div>
          )}
        </div>

        {/* New Issue Button */}
        <button
          onClick={onOpenCreateIssue}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2b1a36] hover:bg-[#57346b] text-white font-semibold text-xs shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Issue</span>
        </button>
      </div>
    </header>
  );
};
