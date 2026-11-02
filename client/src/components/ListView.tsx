import React, { useRef, useState, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search, Flame, ArrowUp, ArrowRight, Minus, Circle, CheckCircle2, Clock } from 'lucide-react';
import type { Issue, IssuePriority, IssueStatus } from '../types/issue';

interface ListViewProps {
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
  onUpdateStatus: (id: string, newStatus: IssueStatus) => void;
}

function StatusIcon({ status }: { status: IssueStatus }) {
  switch (status) {
    case 'done':
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    case 'in_progress':
      return <Clock className="w-3.5 h-3.5 text-amber-400" />;
    case 'in_review':
      return <ArrowRight className="w-3.5 h-3.5 text-purple-400" />;
    default:
      return <Circle className="w-3.5 h-3.5 text-zinc-500" />;
  }
}

function PriorityIcon({ priority }: { priority: IssuePriority }) {
  switch (priority) {
    case 'urgent':
      return <Flame className="w-3.5 h-3.5 text-red-400" />;
    case 'high':
      return <ArrowUp className="w-3.5 h-3.5 text-amber-400" />;
    case 'medium':
      return <ArrowRight className="w-3.5 h-3.5 text-blue-400" />;
    default:
      return <Minus className="w-3.5 h-3.5 text-zinc-500" />;
  }
}

export const ListView: React.FC<ListViewProps> = ({ issues, onSelectIssue, onUpdateStatus }) => {
  const [filterQuery, setFilterQuery] = useState('');
  const parentRef = useRef<HTMLDivElement>(null);

  const filteredIssues = useMemo(() => {
    if (!filterQuery.trim()) return issues;
    const q = filterQuery.toLowerCase();
    return issues.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.key.toLowerCase().includes(q) ||
        i.labels.some((l) => l.toLowerCase().includes(q))
    );
  }, [issues, filterQuery]);

  const rowVirtualizer = useVirtualizer({
    count: filteredIssues.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  return (
    <div className="flex-1 flex flex-col p-6 min-h-[calc(100vh-65px)] bg-[#090b12]">
      {/* Top filter bar & metrics */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter issues in virtualized table..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#121522] border border-[#23293b] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="font-mono text-indigo-400 font-bold">{filteredIssues.length}</span>
          <span>issues indexed</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
            @tanstack/react-virtual
          </span>
        </div>
      </div>

      {/* Virtualized Table Container */}
      <div className="flex-1 rounded-xl bg-[#10131e] border border-[#1e2333] shadow-lg flex flex-col overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 px-4 py-2.5 bg-[#141826] border-b border-[#1e2333] text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Key</div>
          <div className="col-span-6">Title</div>
          <div className="col-span-1">Priority</div>
          <div className="col-span-1">Estimate</div>
          <div className="col-span-2">Assignee</div>
        </div>

        {/* Virtualized Rows */}
        <div ref={parentRef} className="flex-1 overflow-y-auto">
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const issue = filteredIssues[virtualRow.index];
              if (!issue) return null;

              return (
                <div
                  key={issue.id}
                  onClick={() => onSelectIssue(issue)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="grid grid-cols-12 items-center px-4 border-b border-[#1b1f2e] hover:bg-[#151928] cursor-pointer text-xs text-zinc-300 transition-colors"
                >
                  {/* Status Toggle */}
                  <div
                    className="col-span-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextStatus: IssueStatus =
                        issue.status === 'done' ? 'todo' : 'done';
                      onUpdateStatus(issue.id, nextStatus);
                    }}
                  >
                    <button className="p-1 rounded hover:bg-zinc-800 transition-colors">
                      <StatusIcon status={issue.status} />
                    </button>
                  </div>

                  {/* Key */}
                  <div className="col-span-1 font-mono text-[11px] font-semibold text-zinc-400">
                    {issue.key}
                  </div>

                  {/* Title & Labels */}
                  <div className="col-span-6 flex items-center gap-2 pr-4 truncate">
                    <span className="font-medium text-white truncate">{issue.title}</span>
                    {issue.labels.slice(0, 2).map((l, idx) => (
                      <span
                        key={idx}
                        className="shrink-0 text-[10px] px-1.5 py-0.2 rounded bg-[#1c2235] text-zinc-400 border border-zinc-800"
                      >
                        {l}
                      </span>
                    ))}
                  </div>

                  {/* Priority */}
                  <div className="col-span-1 flex items-center gap-1.5">
                    <PriorityIcon priority={issue.priority} />
                    <span className="capitalize text-[11px] text-zinc-400">{issue.priority}</span>
                  </div>

                  {/* Estimate */}
                  <div className="col-span-1 text-[11px] font-mono text-zinc-400">
                    {issue.estimate ? `${issue.estimate} pts` : '-'}
                  </div>

                  {/* Assignee */}
                  <div className="col-span-2 flex items-center gap-2 truncate">
                    {issue.assignee ? (
                      <>
                        <img
                          src={issue.assignee.avatar}
                          alt={issue.assignee.name}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span className="truncate text-[11px] text-zinc-300">
                          {issue.assignee.name}
                        </span>
                      </>
                    ) : (
                      <span className="text-[11px] text-zinc-600">Unassigned</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
