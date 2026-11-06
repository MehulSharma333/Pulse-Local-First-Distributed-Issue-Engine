import React, { useState, useEffect } from 'react';
import { X, Trash2, Lock, Tag, UserCheck, Flame, ArrowUp, ArrowRight, Minus } from 'lucide-react';
import type { Issue, IssueStatus, IssuePriority, Assignee } from '../types/issue';
import { DEFAULT_TEAM_MEMBERS, DEFAULT_WORKSPACE_TAGS } from '../types/issue';
import confetti from 'canvas-confetti';

interface IssueDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: Issue | null;
  initialStatus: IssueStatus;
  isStatusLocked?: boolean;
  onSave: (data: Partial<Issue> & { title: string; status: IssueStatus; assignee?: Assignee; labels: string[] }) => void;
  onDelete?: (id: string) => void;
  onFocusIssue?: (id: string | null) => void;
}

const PRIORITIES: { id: IssuePriority; label: string; icon: React.ReactNode; style: string }[] = [
  { id: 'urgent', label: 'Urgent', icon: <Flame className="w-3.5 h-3.5 text-[#bc4749]" />, style: 'text-[#73292b] bg-[#f2dadb] border-[#e5b6b6]' },
  { id: 'high', label: 'High', icon: <ArrowUp className="w-3.5 h-3.5 text-[#8d7027]" />, style: 'text-[#463813] bg-[#f4edd9] border-[#dfc688]' },
  { id: 'medium', label: 'Medium', icon: <ArrowRight className="w-3.5 h-3.5 text-[#386641]" />, style: 'text-[#223d27] bg-[#edf4dd] border-[#c9de99]' },
  { id: 'low', label: 'Low', icon: <Minus className="w-3.5 h-3.5 text-[#6a994e]" />, style: 'text-[#3f5b2f] bg-[#fcfaf5] border-[#d2e6d6]' },
];

const STATUSES: { id: IssueStatus; label: string }[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'todo', label: 'Todo' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'in_review', label: 'In Review' },
  { id: 'done', label: 'Done' },
  { id: 'cancelled', label: 'Cancelled' },
];

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  isOpen,
  onClose,
  issue,
  initialStatus,
  isStatusLocked = false,
  onSave,
  onDelete,
  onFocusIssue,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<IssueStatus>(initialStatus);
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [estimate, setEstimate] = useState<number>(3);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('unassigned');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (issue) {
      setTitle(issue.title);
      setDescription(issue.description);
      setStatus(issue.status);
      setPriority(issue.priority);
      setEstimate(issue.estimate || 3);
      setSelectedAssigneeId(issue.assignee ? issue.assignee.id : 'unassigned');
      setSelectedTags(issue.labels || []);
      onFocusIssue?.(issue.id);
    } else {
      setTitle('');
      setDescription('');
      setStatus(initialStatus);
      setPriority('medium');
      setEstimate(3);
      setSelectedAssigneeId('me'); // Default to "Me" so creating "My Issues" is natural!
      setSelectedTags(['Engine']);
      onFocusIssue?.(null);
    }
    setShowDeleteConfirm(false);

    return () => {
      onFocusIssue?.(null);
    };
  }, [issue, isOpen, initialStatus, onFocusIssue]);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = customTagInput.trim();
      if (trimmed && !selectedTags.includes(trimmed)) {
        setSelectedTags([...selectedTags, trimmed]);
        setCustomTagInput('');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let assignee: Assignee | undefined = undefined;
    if (selectedAssigneeId !== 'unassigned') {
      assignee = DEFAULT_TEAM_MEMBERS.find((m) => m.id === selectedAssigneeId);
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      status: isStatusLocked ? initialStatus : status,
      priority,
      estimate,
      assignee,
      labels: selectedTags,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl bg-white border border-[#d2e6d6] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#d2e6d6] flex items-center justify-between bg-[#f4edd9]">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-white text-[#223d27] border border-[#d2e6d6] shadow-xs">
              {issue ? issue.key : 'NEW ISSUE'}
            </span>
            <span className="text-xs text-[#3f5b2f] font-semibold">
              {issue ? 'Edit Issue Details' : 'Create Local-First Issue'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {issue && onDelete && (
              <>
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-1.5 bg-[#f2dadb] px-2 py-1 rounded-lg border border-[#e5b6b6]">
                    <span className="text-[11px] text-[#73292b] font-bold">Delete permanently?</span>
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(issue.id);
                        onClose();
                      }}
                      className="px-2 py-0.5 rounded bg-[#bc4749] text-white text-[11px] font-bold hover:bg-[#993739]"
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-1.5 py-0.5 text-[11px] text-[#73292b] font-semibold hover:underline"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-1.5 rounded-lg text-[#bc4749] hover:bg-[#f2dadb] transition-colors"
                    title="Delete Issue"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#3f5b2f] hover:text-[#16291a] hover:bg-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto bg-white flex-1">
          {/* Title input */}
          <div>
            <label className="block text-xs font-bold text-[#223d27] mb-1.5">Issue Title</label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement optimistic mutation rollback"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf6ec] border border-[#d2e6d6] text-sm font-semibold text-[#16291a] placeholder-[#54793e] focus:outline-none focus:border-[#386641]"
            />
          </div>

          {/* Description input */}
          <div>
            <label className="block text-xs font-bold text-[#223d27] mb-1.5">Description & Architecture Notes</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, acceptance criteria, or architectural notes..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf6ec] border border-[#d2e6d6] text-xs font-medium text-[#16291a] placeholder-[#54793e] focus:outline-none focus:border-[#386641]"
            />
          </div>

          {/* Primary Properties Grid: Status & Priority */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Status (with Lock indicator if opened from column) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#223d27]">Status</label>
                {isStatusLocked && (
                  <span className="flex items-center gap-1 text-[10px] text-[#73292b] bg-[#f2dadb] px-1.5 py-0.2 rounded font-semibold">
                    <Lock className="w-2.5 h-2.5" /> Locked to column
                  </span>
                )}
              </div>
              {isStatusLocked ? (
                <div className="w-full px-3 py-2 rounded-xl bg-[#f4edd9]/80 border border-[#d2e6d6] text-xs font-bold text-[#16291a] flex items-center justify-between">
                  <span className="capitalize">{initialStatus.replace('_', ' ')}</span>
                  <Lock className="w-3.5 h-3.5 text-[#54793e]" />
                </div>
              ) : (
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as IssueStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-[#faf6ec] border border-[#d2e6d6] text-xs font-bold text-[#16291a] focus:outline-none focus:border-[#386641]"
                >
                  {STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Priority (Professional format) */}
            <div>
              <label className="block text-xs font-bold text-[#223d27] mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as IssuePriority)}
                className="w-full px-3 py-2 rounded-xl bg-[#faf6ec] border border-[#d2e6d6] text-xs font-bold text-[#16291a] focus:outline-none focus:border-[#386641]"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee & Story Points Grid */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Assignee */}
            <div>
              <label className="block text-xs font-bold text-[#223d27] mb-1.5 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-[#386641]" />
                Assignee
              </label>
              <select
                value={selectedAssigneeId}
                onChange={(e) => setSelectedAssigneeId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#faf6ec] border border-[#d2e6d6] text-xs font-bold text-[#16291a] focus:outline-none focus:border-[#386641]"
              >
                <option value="unassigned">— Unassigned —</option>
                {DEFAULT_TEAM_MEMBERS.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Story Points Estimate */}
            <div>
              <label className="block text-xs font-bold text-[#223d27] mb-1.5">Story Estimate</label>
              <select
                value={estimate}
                onChange={(e) => setEstimate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#faf6ec] border border-[#d2e6d6] text-xs font-bold text-[#16291a] focus:outline-none focus:border-[#386641]"
              >
                <option value={1}>1 Story Point (Trivial)</option>
                <option value={2}>2 Story Points (Small)</option>
                <option value={3}>3 Story Points (Medium)</option>
                <option value={5}>5 Story Points (Complex)</option>
                <option value={8}>8 Story Points (Epic)</option>
              </select>
            </div>
          </div>

          {/* Integrated Tags & Labels Section */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#223d27] flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#386641]" />
                Module Tags (Click to toggle)
              </label>
              <span className="text-[10px] text-[#54793e] font-medium">
                {selectedTags.length} selected
              </span>
            </div>

            {/* Clickable Tag Chips */}
            <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-[#faf6ec] border border-[#d2e6d6]">
              {DEFAULT_WORKSPACE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#223d27] text-white shadow-xs scale-102'
                        : 'bg-white text-[#3f5b2f] border border-[#d2e6d6] hover:bg-[#edf4dd]'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Custom Tag Input */}
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={handleAddCustomTag}
                placeholder="Type custom tag and press Enter..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#faf6ec] border border-[#d2e6d6] text-xs text-[#16291a] placeholder-[#54793e] focus:outline-none focus:border-[#386641]"
              />
              <button
                type="button"
                onClick={() => {
                  const trimmed = customTagInput.trim();
                  if (trimmed && !selectedTags.includes(trimmed)) {
                    setSelectedTags([...selectedTags, trimmed]);
                    setCustomTagInput('');
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-[#edf4dd] hover:bg-[#dbe9bb] text-[#16291a] font-bold text-xs border border-[#c9de99]"
              >
                Add Tag
              </button>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 flex items-center justify-between border-t border-[#d2e6d6]">
            <span className="text-[11px] text-[#54793e] font-medium">
              ⚡ Instant 0ms local mutation
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#f4edd9] hover:bg-[#e1ecda] text-xs font-semibold text-[#223d27] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#223d27] hover:bg-[#16291a] text-xs font-bold text-white shadow-xs transition-all active:scale-95"
              >
                
                <span>{issue ? 'Save Changes' : 'Create Issue'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
