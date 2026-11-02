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
    <header className="sticky top-0 z-30 border-b border-[#d2e6d6] bg-[#fcfaf5]/90 backdrop-blur-md px-5 py-2.5 flex items-center justify-between gap-4 shadow-xs">
      {/* Brand & View Switcher */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-[#e1ecda] border border-[#a4cdac] text-[#16291a] shadow-xs">
            <Zap className="w-4 h-4 fill-[#6a994e] text-[#223d27]" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#386641] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinzel font-bold text-[#16291a] tracking-wider text-base">PULSE</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#edf4dd] text-[#2d5234] border border-[#c9de99] font-semibold">
                CRDT ENGINE
              </span>
            </div>
            <p className="text-[11px] text-[#3f5b2f] font-medium">Local-First Issue Architecture</p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-[#f4edd9]/80 border border-[#d2e6d6]">
          <button
            onClick={() => onViewChange('board')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              currentView === 'board'
                ? 'bg-white text-[#16291a] shadow-xs'
                : 'text-[#3f5b2f] hover:text-[#16291a]'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            Board
          </button>
          <button
            onClick={() => onViewChange('list')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              currentView === 'list'
                ? 'bg-white text-[#16291a] shadow-xs'
                : 'text-[#3f5b2f] hover:text-[#16291a]'
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
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-white border border-[#d2e6d6] text-[#3f5b2f] hover:text-[#16291a] hover:border-[#6a994e] text-xs transition-all shadow-xs"
        >
          <div className="flex items-center gap-2">
            <Command className="w-3.5 h-3.5 text-[#54793e]" />
            <span className="font-medium text-[#3f5b2f]">Search or jump to...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#edf4dd] text-[#223d27] border border-[#c9de99] rounded-md font-semibold">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Sync indicator, Peers, New Issue */}
      <div className="flex items-center gap-3">
        {/* Undo / Redo */}
        <div className="hidden lg:flex items-center gap-1 text-[#3f5b2f]">
          <button
            onClick={() => undo()}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded-lg hover:bg-[#e1ecda] text-[#3f5b2f] hover:text-[#16291a] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => redo()}
            title="Redo (Ctrl+Shift+Z)"
            className="p-1.5 rounded-lg hover:bg-[#e1ecda] text-[#3f5b2f] hover:text-[#16291a] transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sync Telemetry Button */}
        <button
          onClick={onToggleTelemetry}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
            isTelemetryOpen
              ? 'bg-[#e1ecda] border-[#6a994e] text-[#16291a]'
              : 'bg-white border-[#d2e6d6] text-[#223d27] hover:border-[#6a994e]'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-[#386641] animate-pulse" />
          <span className="hidden xl:inline">CRDT Telemetry</span>
        </button>

        {/* Offline Simulation Toggle Button */}
        <button
          onClick={toggleSimulateOffline}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
            stats.isSimulatedOffline
              ? 'bg-[#f2dadb] border-[#ca6c6e] text-[#73292b] animate-pulse'
              : 'bg-[#edf4dd] border-[#a4cdac] text-[#223d27] hover:bg-[#dbe9bb]'
          }`}
          title="Toggle offline state to demonstrate zero-latency local mutations"
        >
          {stats.isSimulatedOffline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-[#bc4749]" />
              <span>Offline Sim Active</span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5 text-[#386641]" />
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
            <div className="w-6 h-6 rounded-full bg-[#edf4dd] ring-2 ring-white flex items-center justify-center text-[9px] font-bold text-[#223d27]">
              +{peers.length - 4}
            </div>
          )}
        </div>

        {/* New Issue Button */}
        <button
          onClick={onOpenCreateIssue}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#223d27] hover:bg-[#16291a] text-white font-semibold text-xs shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Issue</span>
        </button>
      </div>
    </header>
  );
};
