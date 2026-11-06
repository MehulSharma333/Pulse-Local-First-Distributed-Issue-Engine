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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-white border border-[#d2e6d6] shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#d2e6d6] flex items-center justify-between bg-[#f4edd9]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white text-[#223d27] border border-[#d2e6d6] shadow-xs">
              <Activity className="w-5 h-5 animate-pulse text-[#386641]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#16291a] tracking-tight">
                Local-First CRDT Telemetry & Sync Inspector
              </h2>
              <p className="text-xs text-[#3f5b2f] font-medium">
                Real-time metrics of the in-memory Yjs binary delta engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#3f5b2f] hover:text-[#16291a] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto bg-white">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#faf6ec] border border-[#d2e6d6]">
              <span className="text-[11px] font-bold text-[#3f5b2f] uppercase tracking-wider">Sync State</span>
              <div className="mt-1 flex items-center gap-1.5 font-mono text-xs font-bold text-[#16291a]">
                <span
                  className={`w-2 h-2 rounded-full ${
                    !stats.isSimulatedOffline ? 'bg-[#386641]' : 'bg-[#bc4749]'
                  }`}
                />
                <span className="capitalize">
                  {stats.isSimulatedOffline ? 'Simulated Offline' : 'Connected (0ms)'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#faf6ec] border border-[#d2e6d6]">
              <span className="text-[11px] font-bold text-[#3f5b2f] uppercase tracking-wider">Deltas Sent</span>
              <div className="mt-1 font-mono text-base font-bold text-[#223d27]">
                {stats.totalDeltasSent} pkts
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#faf6ec] border border-[#d2e6d6]">
              <span className="text-[11px] font-bold text-[#3f5b2f] uppercase tracking-wider">Deltas Received</span>
              <div className="mt-1 font-mono text-base font-bold text-[#386641]">
                {stats.totalDeltasReceived} pkts
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#faf6ec] border border-[#d2e6d6]">
              <span className="text-[11px] font-bold text-[#3f5b2f] uppercase tracking-wider">CRDT Over-the-Wire</span>
              <div className="mt-1 font-mono text-base font-bold text-[#6a994e]">
                {(stats.totalBytes / 1024).toFixed(2)} KB
              </div>
            </div>
          </div>

          {/* Interactive Simulation Panel */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#faf6ec] via-[#f4edd9] to-[#edf4dd] border border-[#a4cdac] shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-[#16291a] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#386641]" />
                  Live Offline Resilience Demonstration
                </h3>
                <p className="mt-1 text-xs text-[#3f5b2f] leading-relaxed">
                  Disconnect the WebSocket sync relay right now. Create or edit issues in this tab, open a second tab
                  or change network state, and then reconnect. Observe 0ms local mutation latency and zero-conflict convergence.
                </p>
              </div>
              <button
                onClick={toggleSimulateOffline}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                  stats.isSimulatedOffline
                    ? 'bg-[#f2dadb] border border-[#ca6c6e] text-[#73292b] hover:bg-[#e5b6b6]'
                    : 'bg-[#223d27] text-white hover:bg-[#16291a]'
                }`}
              >
                {stats.isSimulatedOffline ? 'Reconnect Relay' : 'Simulate Cut Off'}
              </button>
            </div>
          </div>

          {/* Architecture Pipeline Explanation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#16291a] uppercase tracking-wider">
              System Architecture Under the Hood
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#faf6ec] border border-[#d2e6d6] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#16291a]">
                  <Cpu className="w-3.5 h-3.5 text-[#386641]" />
                  <span>1. In-Memory CRDT</span>
                </div>
                <p className="text-[11px] text-[#3f5b2f] leading-normal">
                  Yjs structures data as a conflict-free causal tree. Every keystroke and drag applies at sub-1ms latency.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#faf6ec] border border-[#d2e6d6] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#16291a]">
                  <Database className="w-3.5 h-3.5 text-[#6a994e]" />
                  <span>2. IndexedDB Storage</span>
                </div>
                <p className="text-[11px] text-[#3f5b2f] leading-normal">
                  Binary deltas are persisted locally via <code>y-indexeddb</code>, allowing 0ms cold reboot with zero network.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#faf6ec] border border-[#d2e6d6] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#16291a]">
                  <WifiOff className="w-3.5 h-3.5 text-[#bc4749]" />
                  <span>3. Binary Delta Relay</span>
                </div>
                <p className="text-[11px] text-[#3f5b2f] leading-normal">
                  WebSockets broadcast only cryptographic diffs (state vectors), keeping bandwidth microscopic.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#d2e6d6] bg-[#f4edd9] flex items-center justify-between text-xs text-[#3f5b2f]">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#386641]" />
            No database locking or 409 conflict errors
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-[#d2e6d6] hover:bg-[#faf6ec] text-[#16291a] font-semibold transition-colors shadow-xs"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
