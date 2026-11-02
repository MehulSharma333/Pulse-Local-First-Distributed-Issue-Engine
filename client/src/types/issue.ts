export type IssueStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'cancelled';

export type IssuePriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

export interface Assignee {
  id: string;
  name: string;
  avatar: string;
}

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
