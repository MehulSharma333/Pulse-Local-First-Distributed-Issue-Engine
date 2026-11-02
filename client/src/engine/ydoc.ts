import * as Y from 'yjs';
import type { Issue } from '../types/issue';

// 1. Singleton Yjs Document representing the entire distributed state tree
export const doc = new Y.Doc();

// 2. Core Shared Types
// issuesMap: Keyed by Issue.id for instant O(1) mutations and fine-grained CRDT merging
export const issuesMap = doc.getMap<Issue>('pulse-issues');

// 3. Seed realistic default issues if cold boot on an empty client
export function seedDefaultIssuesIfEmpty() {
  if (issuesMap.size > 0) return;

  const sampleIssues: Issue[] = [
    {
      id: 'issue-1',
      key: 'PUL-101',
      title: 'Implement Yjs CRDT delta compression for WebSocket payloads',
      description: 'Optimize binary delta encoding to reduce network footprint across multi-tab sync.',
      status: 'in_progress',
      priority: 'urgent',
      estimate: 5,
      assignee: { id: 'u1', name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
      labels: ['Engine', 'CRDT', 'Performance'],
      order: 1000,
      createdAt: Date.now() - 1000 * 60 * 120,
      updatedAt: Date.now() - 1000 * 60 * 15,
    },
    {
      id: 'issue-2',
      key: 'PUL-102',
      title: 'Deterministic fractional indexing for cross-column drag and drop',
      description: 'Avoid list re-indexing collisions when two clients reorder tasks concurrently.',
      status: 'in_progress',
      priority: 'high',
      estimate: 3,
      assignee: { id: 'u2', name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
      labels: ['UI/UX', 'Algorithms'],
      order: 2000,
      createdAt: Date.now() - 1000 * 60 * 90,
      updatedAt: Date.now() - 1000 * 60 * 45,
    },
    {
      id: 'issue-3',
      key: 'PUL-103',
      title: 'Linear-style command palette (Cmd+K) with fuzzy filter',
      description: 'Keyboard navigation engine enabling instant issue creation, tag filtering, and assignee swap.',
      status: 'todo',
      priority: 'high',
      estimate: 5,
      assignee: { id: 'u3', name: 'Marcus Vance', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
      labels: ['Accessibility', 'Keyboard'],
      order: 1000,
      createdAt: Date.now() - 1000 * 60 * 40,
      updatedAt: Date.now() - 1000 * 60 * 10,
    },
    {
      id: 'issue-4',
      key: 'PUL-104',
      title: 'IndexedDB persistent storage tier with automatic delta compaction',
      description: 'Ensure 0ms offline boot latency with y-indexeddb cache pre-warming.',
      status: 'done',
      priority: 'urgent',
      estimate: 8,
      assignee: { id: 'u1', name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
      labels: ['Storage', 'IndexedDB'],
      order: 1000,
      createdAt: Date.now() - 1000 * 60 * 300,
      updatedAt: Date.now() - 1000 * 60 * 60,
    },
    {
      id: 'issue-5',
      key: 'PUL-105',
      title: 'Multi-peer awareness indicators and live cursor sync',
      description: 'Broadcast active user avatars and focused card highlights via Yjs awareness protocol.',
      status: 'backlog',
      priority: 'medium',
      estimate: 3,
      assignee: { id: 'u2', name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
      labels: ['Multiplayer', 'WebSocket'],
      order: 1000,
      createdAt: Date.now() - 1000 * 60 * 500,
      updatedAt: Date.now() - 1000 * 60 * 500,
    },
    {
      id: 'issue-6',
      key: 'PUL-106',
      title: 'Virtualize high-density table view with TanStack Virtual',
      description: 'Support 10,000+ issues rendered at 60 FPS without memory leaks or DOM thrashing.',
      status: 'todo',
      priority: 'low',
      estimate: 2,
      labels: ['Performance', 'Virtualization'],
      order: 2000,
      createdAt: Date.now() - 1000 * 60 * 180,
      updatedAt: Date.now() - 1000 * 60 * 20,
    }
  ];

  doc.transact(() => {
    for (const issue of sampleIssues) {
      issuesMap.set(issue.id, issue);
    }
  });
}

