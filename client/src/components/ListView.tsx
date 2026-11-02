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
      return <CheckCircle2 className="w-3.5 h-3.5 text-[#223d27]" />;
    case 'in_progress':
      return <Clock className="w-3.5 h-3.5 text-[#6a994e]" />;
    case 'in_review':
      return <ArrowRight className="w-3.5 h-3.5 text-[#8aad38]" />;
    default:
      return <Circle className="w-3.5 h-3.5 text-[#a4cdac]" />;
  }
}

function PriorityIcon({ priority }: { priority: IssuePriority }) {
  switch (priority) {
    case 'urgent':
      return <Flame className="w-3.5 h-3.5 text-[#bc4749]" />;
    case 'high':
      return <ArrowUp className="w-3.5 h-3.5 text-[#8d7027]" />;
    case 'medium':
      return <ArrowRight className="w-3.5 h-3.5 text-[#386641]" />;
    default:
      return <Minus className="w-3.5 h-3.5 text-[#6a994e]" />;
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
    <div className="flex-1 flex flex-col p-6 min-h-[calc(100vh-65px)] bg-gradient-to-br from-[#faf6ec] via-[#f4edd9]/40 to-[#edf4dd]/50">
      {/* Top filter bar & metrics */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#54793e]" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter issues in virtualized table..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#d2e6d6] text-xs text-[#16291a] placeholder-[#54793e] focus:outline-none focus:border-[#386641] shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-[#3f5b2f]">
          <span className="font-mono text-[#223d27] font-bold">{filteredIssues.length}</span>
          <span className="font-medium">issues indexed</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#edf4dd] text-[#223d27] border border-[#c9de99] font-semibold">
            @tanstack/react-virtual
          </span>
        </div>
      </div>

      {/* Virtualized Table Container */}
      <div className="flex-1 rounded-2xl bg-white border border-[#d2e6d6] shadow-sm flex flex-col overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 px-5 py-3 bg-[#f4edd9] border-b border-[#d2e6d6] text-[11px] font-bold text-[#223d27] uppercase tracking-wider">
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
                  className="grid grid-cols-12 items-center px-5 border-b border-[#f4edd9]/60 hover:bg-[#faf6ec] cursor-pointer text-xs text-[#16291a] transition-colors"
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
                    <button className="p-1 rounded-md hover:bg-[#e1ecda] transition-colors">
                      <StatusIcon status={issue.status} />
                    </button>
                  </div>

                  {/* Key */}
                  <div className="col-span-1 font-mono text-[11px] font-bold text-[#2d5234]">
                    {issue.key}
                  </div>

                  {/* Title & Labels */}
                  <div className="col-span-6 flex items-center gap-2 pr-4 truncate">
                    <span className="font-semibold text-[#16291a] truncate">{issue.title}</span>
                    {issue.labels.slice(0, 2).map((l, idx) => (
                      <span
                        key={idx}
                        className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#edf4dd] text-[#223d27] border border-[#d2e6d6]"
                      >
                        {l}
                      </span>
                    ))}
                  </div>

                  {/* Priority */}
                  <div className="col-span-1 flex items-center gap-1.5">
                    <PriorityIcon priority={issue.priority} />
                    <span className="capitalize text-[11px] font-medium text-[#3f5b2f]">{issue.priority}</span>
                  </div>

                  {/* Estimate */}
                  <div className="col-span-1 text-[11px] font-mono font-medium text-[#3f5b2f]">
                    {issue.estimate ? `${issue.estimate} pts` : '-'}
                  </div>

                  {/* Assignee */}
                  <div className="col-span-2 flex items-center gap-2 truncate">
                    {issue.assignee ? (
                      <>
                        <img
                          src={issue.assignee.avatar}
                          alt={issue.assignee.name}
                          className="w-4 h-4 rounded-full object-cover ring-1 ring-[#d2e6d6]"
                        />
                        <span className="truncate text-[11px] font-medium text-[#16291a]">
                          {issue.assignee.name}
                        </span>
                      </>
                    ) : (
                      <span className="text-[11px] text-[#6a994e] italic">Unassigned</span>
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
