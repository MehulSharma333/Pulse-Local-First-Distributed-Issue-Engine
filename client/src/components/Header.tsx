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
    <header className="sticky top-0 z-30 border-b border-[#242938] bg-[#0c0e17]/90 backdrop-blur-md px-4 py-2.5 flex items-center justify-between gap-4">
      {/* Brand & View Switcher */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <Zap className="w-4 h-4 fill-indigo-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white tracking-tight text-sm">Pulse</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-400 border border-indigo-800/40">
                CRDT ENGINE
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium">Local-First Issue Architecture</p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-[#141824] border border-[#23293b]">
          <button
            onClick={() => onViewChange('board')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              currentView === 'board'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            Board
          </button>
          <button
            onClick={() => onViewChange('list')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              currentView === 'list'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
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
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#141824] border border-[#23293b] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 text-xs transition-colors"
        >
          <div className="flex items-center gap-2">
            <Command className="w-3.5 h-3.5 text-zinc-500" />
            <span>Search or jump to...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#1c2233] text-zinc-400 border border-zinc-700/60 rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Sync indicator, Peers, New Issue */}
      <div className="flex items-center gap-3">
        {/* Undo / Redo */}
        <div className="hidden lg:flex items-center gap-1 text-zinc-400">
          <button
            onClick={() => undo()}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => redo()}
            title="Redo (Ctrl+Shift+Z)"
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sync Telemetry Button */}
        <button
          onClick={onToggleTelemetry}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
            isTelemetryOpen
              ? 'bg-indigo-950/60 border-indigo-700/60 text-indigo-300'
              : 'bg-[#141824] border-[#23293b] text-zinc-300 hover:border-zinc-700'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span className="hidden xl:inline">CRDT Telemetry</span>
        </button>

        {/* Offline Simulation Toggle Button (Recruiter Wow Factor) */}
        <button
          onClick={toggleSimulateOffline}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
            stats.isSimulatedOffline
              ? 'bg-amber-950/80 border-amber-600/70 text-amber-300 animate-pulse'
              : 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400 hover:bg-emerald-950/60'
          }`}
          title="Toggle offline state to demonstrate zero-latency local mutations"
        >
          {stats.isSimulatedOffline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span>Offline Sim Active</span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
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
              className="relative w-6 h-6 rounded-full overflow-hidden ring-2 ring-[#0c0e17] bg-zinc-800"
            >
              <img src={peer.avatar} alt={peer.name} className="w-full h-full object-cover" />
            </div>
          ))}
          {peers.length > 4 && (
            <div className="w-6 h-6 rounded-full bg-zinc-800 ring-2 ring-[#0c0e17] flex items-center justify-center text-[9px] font-bold text-zinc-300">
              +{peers.length - 4}
            </div>
          )}
        </div>

        {/* New Issue Button */}
        <button
          onClick={onOpenCreateIssue}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-sm shadow-indigo-600/30 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Issue</span>
        </button>
      </div>
    </header>
  );
};
