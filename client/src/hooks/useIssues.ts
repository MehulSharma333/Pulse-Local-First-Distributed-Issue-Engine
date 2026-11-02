import { useEffect, useState, useMemo, useCallback } from 'react';
import { issuesMap, doc } from '../engine/ydoc';
import type { Issue, IssueStatus } from '../types/issue';

export function useIssues() {
  const [issuesList, setIssuesList] = useState<Issue[]>(() => Array.from(issuesMap.values()));

  useEffect(() => {
    const updateHandler = () => {
      setIssuesList(Array.from(issuesMap.values()));
    };

    issuesMap.observe(updateHandler);
    // Initial sync
    updateHandler();

    return () => {
      issuesMap.unobserve(updateHandler);
    };
  }, []);

  const issuesByStatus = useMemo(() => {
    const grouped: Record<IssueStatus, Issue[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
      cancelled: [],
    };

    issuesList.forEach((issue) => {
      if (grouped[issue.status]) {
        grouped[issue.status].push(issue);
      } else {
        grouped.backlog.push(issue);
      }
    });

    // Sort deterministically by fractional index 'order'
    Object.keys(grouped).forEach((status) => {
      grouped[status as IssueStatus].sort((a, b) => a.order - b.order);
    });

    return grouped;
  }, [issuesList]);

  // Mutation: Create Issue
  const createIssue = useCallback((params: Partial<Issue> & { title: string; status: IssueStatus }) => {
    const id = 'issue-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5);
    const issueCount = issuesMap.size + 1;
    const key = `PUL-${100 + issueCount}`;

    const newIssue: Issue = {
      id,
      key,
      title: params.title,
      description: params.description || '',
      status: params.status,
      priority: params.priority || 'medium',
      estimate: params.estimate || 3,
      assignee: params.assignee,
      labels: params.labels || ['Feature'],
      order: Date.now(), // default timestamp order
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    doc.transact(() => {
      issuesMap.set(id, newIssue);
    });

    return newIssue;
  }, []);

  // Mutation: Update Issue (Fine-grained field update)
  const updateIssue = useCallback((id: string, patch: Partial<Issue>) => {
    const current = issuesMap.get(id);
    if (!current) return;

    doc.transact(() => {
      issuesMap.set(id, {
        ...current,
        ...patch,
        updatedAt: Date.now(),
      });
    });
  }, []);

  // Mutation: Delete Issue
  const deleteIssue = useCallback((id: string) => {
    doc.transact(() => {
      issuesMap.delete(id);
    });
  }, []);

  // Mutation: Move Issue status and order (Optimistic, atomic)
  const moveIssue = useCallback((id: string, newStatus: IssueStatus, targetOrder: number) => {
    const current = issuesMap.get(id);
    if (!current) return;

    doc.transact(() => {
      issuesMap.set(id, {
        ...current,
        status: newStatus,
        order: targetOrder,
        updatedAt: Date.now(),
      });
    });
  }, []);

  return {
    issues: issuesList,
    issuesByStatus,
    createIssue,
    updateIssue,
    deleteIssue,
    moveIssue,
  };
}
