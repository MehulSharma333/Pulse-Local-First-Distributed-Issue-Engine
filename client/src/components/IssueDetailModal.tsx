import React, { useState, useEffect } from 'react';
import { X, Trash2, Sparkles } from 'lucide-react';
import type { Issue, IssueStatus, IssuePriority } from '../types/issue';
import confetti from 'canvas-confetti';

interface IssueDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: Issue | null;
  onSave: (data: Partial<Issue> & { title: string; status: IssueStatus }) => void;
  onDelete?: (id: string) => void;
  onFocusIssue?: (id: string | null) => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  isOpen,
  onClose,
  issue,
  onSave,
  onDelete,
  onFocusIssue,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<IssueStatus>('todo');
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [estimate, setEstimate] = useState<number>(3);
  const [labelsInput, setLabelsInput] = useState('');

  useEffect(() => {
    if (issue) {
      setTitle(issue.title);
      setDescription(issue.description);
      setStatus(issue.status);
      setPriority(issue.priority);
      setEstimate(issue.estimate || 3);
      setLabelsInput(issue.labels.join(', '));
      onFocusIssue?.(issue.id);
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setEstimate(3);
      setLabelsInput('Frontend, Feature');
      onFocusIssue?.(null);
    }

    return () => {
      onFocusIssue?.(null);
    };
  }, [issue, isOpen, onFocusIssue]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const labels = labelsInput
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);

    onSave({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      estimate,
      labels,
    });

    if (status === 'done' && issue?.status !== 'done') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl bg-[#121522] border border-[#23293b] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#23293b] flex items-center justify-between bg-[#151929]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-950/70 text-indigo-400 border border-indigo-800/40">
              {issue ? issue.key : 'NEW ISSUE'}
            </span>
            <span className="text-xs text-zinc-400">
              {issue ? 'Editing stored task' : 'Creating local-first issue'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {issue && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(issue.id);
                  onClose();
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                title="Delete Issue"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Issue Title</label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement optimistic mutation rollback"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#181c2d] border border-[#262c40] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, acceptance criteria, or architectural notes..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#181c2d] border border-[#262c40] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as IssueStatus)}
                className="w-full px-3 py-2 rounded-lg bg-[#181c2d] border border-[#262c40] text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as IssuePriority)}
                className="w-full px-3 py-2 rounded-lg bg-[#181c2d] border border-[#262c40] text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 High</option>
                <option value="medium">🔵 Medium</option>
                <option value="low">⚪ Low</option>
                <option value="none">None</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Story Estimate</label>
              <select
                value={estimate}
                onChange={(e) => setEstimate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-[#181c2d] border border-[#262c40] text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={1}>1 Point</option>
                <option value={2}>2 Points</option>
                <option value={3}>3 Points</option>
                <option value={5}>5 Points</option>
                <option value={8}>8 Points</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Labels (comma-separated)</label>
              <input
                type="text"
                value={labelsInput}
                onChange={(e) => setLabelsInput(e.target.value)}
                placeholder="CRDT, Engine, UI"
                className="w-full px-3 py-2 rounded-lg bg-[#181c2d] border border-[#262c40] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#23293b]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{issue ? 'Update Issue (0ms)' : 'Create Issue (0ms)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
