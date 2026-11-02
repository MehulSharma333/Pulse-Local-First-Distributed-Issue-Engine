import { wsProvider } from './sync';
import type { UserPresence } from '../types/issue';

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
];

const COLORS = ['#386641', '#6a994e', '#223d27', '#bc4749', '#8aad38', '#51935e'];

const randomId = 'user-' + Math.random().toString(36).substring(2, 7);
const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];

// Default local user state
export const localUser: UserPresence = {
  id: randomId,
  name: 'Me (' + randomId.toUpperCase() + ')',
  color: randomColor,
  avatar: randomAvatar,
  activeIssueId: null,
};

// Set local awareness state
wsProvider.awareness.setLocalStateField('user', localUser);

export function setActiveIssueFocus(issueId: string | null) {
  localUser.activeIssueId = issueId;
  wsProvider.awareness.setLocalStateField('user', { ...localUser });
}

export function subscribeToPeers(callback: (peers: UserPresence[]) => void) {
  const handler = () => {
    const states = wsProvider.awareness.getStates();
    const peers: UserPresence[] = [];
    states.forEach((state) => {
      if (state.user) {
        peers.push(state.user as UserPresence);
      }
    });
    callback(peers);
  };

  wsProvider.awareness.on('change', handler);
  handler();
  return () => {
    wsProvider.awareness.off('change', handler);
  };
}
