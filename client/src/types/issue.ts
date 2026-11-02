export type IssueStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'cancelled';

export type IssuePriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

export interface Assignee {
  id: string;
  name: string;
  avatar: string;
}

export const DEFAULT_TEAM_MEMBERS: Assignee[] = [
  { id: 'me', name: 'Me (Current User)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
  { id: 'u1', name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
  { id: 'u2', name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
  { id: 'u3', name: 'Marcus Vance', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
];

export const DEFAULT_WORKSPACE_TAGS = [
  'Engine',
  'CRDT',
  'Storage',
  'UI/UX',
  'Performance',
  'Algorithms',
  'Multiplayer',
  'Accessibility',
];

export interface Issue {
  id: string;
  key: string; // e.g. "PUL-102"
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  estimate?: number;
  assignee?: Assignee;
  labels: string[];
  order: number; // Fractional index for column placement
  createdAt: number;
  updatedAt: number;
}

export interface UserPresence {
  id: string;
  name: string;
  color: string;
  avatar: string;
  activeIssueId: string | null;
  cursor?: { x: number; y: number } | null;
}

export type SyncState = 'connected' | 'connecting' | 'disconnected';

export interface SyncStats {
  state: SyncState;
  isSimulatedOffline: boolean;
  peerCount: number;
  lastDeltaTime: number | null;
  totalDeltasReceived: number;
  totalDeltasSent: number;
  totalBytes: number;
}
