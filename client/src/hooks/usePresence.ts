import { useState, useEffect } from 'react';
import { subscribeToPeers, setActiveIssueFocus, localUser } from '../engine/presence';
import type { UserPresence } from '../types/issue';

export function usePresence() {
  const [peers, setPeers] = useState<UserPresence[]>([]);

  useEffect(() => {
    return subscribeToPeers(setPeers);
  }, []);

  return {
    peers,
    localUser,
    setActiveIssueFocus,
  };
}

