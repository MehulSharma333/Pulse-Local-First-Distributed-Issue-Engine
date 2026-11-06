import { WebsocketProvider } from 'y-websocket';
import { doc } from './ydoc';
import type { SyncState, SyncStats } from '../types/issue';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:1234';
const ROOM_NAME = 'pulse-default-room';

export const wsProvider = new WebsocketProvider(WS_URL, ROOM_NAME, doc, {
  connect: true,
});

// Sync Telemetry & Stats State
export const syncStats: SyncStats = {
  state: 'connected',
  isSimulatedOffline: false,
  peerCount: 1,
  lastDeltaTime: null,
  totalDeltasReceived: 0,
  totalDeltasSent: 0,
  totalBytes: 0,
};

type Listener = (stats: SyncStats) => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  const snapshot = { ...syncStats };
  listeners.forEach((listener) => listener(snapshot));
}

export function subscribeToSyncStats(listener: Listener) {
  listeners.add(listener);
  listener({ ...syncStats });
  return () => {
    listeners.delete(listener);
  };
}

// Track connection status
wsProvider.on('status', (event: { status: string }) => {
  if (syncStats.isSimulatedOffline) return;
  syncStats.state = event.status as SyncState;
  notifyListeners();
});

// Track peer count from awareness
wsProvider.awareness.on('change', () => {
  const states = wsProvider.awareness.getStates();
  syncStats.peerCount = Math.max(1, states.size);
  notifyListeners();
});

// Track local updates sent
doc.on('update', (update: Uint8Array, origin: unknown) => {
  if (origin !== wsProvider) {
    syncStats.totalDeltasSent += 1;
    syncStats.totalBytes += update.byteLength;
    syncStats.lastDeltaTime = Date.now();
    notifyListeners();
  } else {
    syncStats.totalDeltasReceived += 1;
    syncStats.totalBytes += update.byteLength;
    syncStats.lastDeltaTime = Date.now();
    notifyListeners();
  }
});

/**
 * Recruiter Feature: Offline Simulation Toggle
 * Disconnects the WebSocket on demand to show that all edits work locally,
 * and then merges state seamlessly upon re-connection.
 */
export function toggleSimulateOffline() {
  syncStats.isSimulatedOffline = !syncStats.isSimulatedOffline;
  if (syncStats.isSimulatedOffline) {
    wsProvider.disconnect();
    syncStats.state = 'disconnected';
    syncStats.peerCount = 1;
  } else {
    wsProvider.connect();
    syncStats.state = 'connecting';
  }
  notifyListeners();
  return syncStats.isSimulatedOffline;
}

