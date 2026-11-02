import { useState, useEffect } from 'react';
import { subscribeToSyncStats, toggleSimulateOffline, syncStats } from '../engine/sync';
import type { SyncStats } from '../types/issue';

export function useSyncStatus() {
  const [stats, setStats] = useState<SyncStats>(() => ({ ...syncStats }));

  useEffect(() => {
    return subscribeToSyncStats(setStats);
  }, []);

  return {
    stats,
    toggleSimulateOffline,
  };
}

