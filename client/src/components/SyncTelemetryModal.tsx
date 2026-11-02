import React from 'react';
import { X, Activity, Database, Cpu, WifiOff, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useSyncStatus } from '../hooks/useSyncStatus';

interface SyncTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncTelemetryModal: React.FC<SyncTelemetryModalProps> = ({ isOpen, onClose }) => {
  const { stats, toggleSimulateOffline } = useSyncStatus();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-[#10131e] border border-[#23293b] shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#23293b] flex items-center justify-between bg-[#141826]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Local-First CRDT Telemetry & Sync Inspector
              </h2>
              <p className="text-xs text-zinc-400">
                Real-time metrics of the in-memory Yjs binary delta engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#161a29] border border-[#23293b]">
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Sync State</span>
              <div className="mt-1 flex items-center gap-1.5 font-mono text-sm font-semibold">
                <span
                  className={`w-2 h-2 rounded-full ${
                    stats.state === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span className="capitalize text-white">
                  {stats.isSimulatedOffline ? 'Simulated Offline' : stats.state}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#161a29] border border-[#23293b]">
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Deltas Sent</span>
              <div className="mt-1 font-mono text-lg font-semibold text-indigo-400">
                {stats.totalDeltasSent} pkts
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#161a29] border border-[#23293b]">
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Deltas Received</span>
              <div className="mt-1 font-mono text-lg font-semibold text-emerald-400">
                {stats.totalDeltasReceived} pkts
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#161a29] border border-[#23293b]">
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">CRDT Over-the-Wire</span>
              <div className="mt-1 font-mono text-lg font-semibold text-cyan-400">
                {(stats.totalBytes / 1024).toFixed(2)} KB
              </div>
            </div>
          </div>

          {/* Interactive Simulation Panel */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-purple-950/20 border border-indigo-900/40">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-indigo-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  Live Offline Resilience Demonstration
                </h3>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  Disconnect the WebSocket sync relay right now. Create or edit issues in this tab, open a second tab
                  or change network state, and then reconnect. Observe 0ms local mutation latency and zero-conflict convergence.
                </p>
              </div>
              <button
                onClick={toggleSimulateOffline}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
                  stats.isSimulatedOffline
                    ? 'bg-amber-500 hover:bg-amber-400 text-black'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {stats.isSimulatedOffline ? 'Reconnect Relay' : 'Simulate Cut Off'}
              </button>
            </div>
          </div>

          {/* Architecture Pipeline Explanation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              System Architecture Under the Hood
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-[#141826] border border-[#23293b] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  <span>1. In-Memory CRDT</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  Yjs structures data as a conflict-free causal tree. Every keystroke and drag applies at sub-1ms latency.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#141826] border border-[#23293b] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>2. IndexedDB Storage</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  Binary deltas are persisted locally via <code>y-indexeddb</code>, allowing 0ms cold reboot with zero network.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#141826] border border-[#23293b] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>3. Binary Delta Relay</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  WebSockets broadcast only cryptographic diffs (state vectors), keeping bandwidth microscopic.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#23293b] bg-[#141826] flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            No database locking or 409 conflict errors
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
