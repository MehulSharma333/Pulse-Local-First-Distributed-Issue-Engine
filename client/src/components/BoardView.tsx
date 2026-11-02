import React, { useState } from 'react';
import { 
  Circle, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  Plus, 
  Flame,
  ArrowUp,
  ArrowRight,
  Minus
} from 'lucide-react';
import type { Issue, IssueStatus, IssuePriority } from '../types/issue';
import { usePresence } from '../hooks/usePresence';

interface BoardViewProps {
  issuesByStatus: Record<IssueStatus, Issue[]>;
  onSelectIssue: (issue: Issue) => void;
  onMoveIssue: (id: string, newStatus: IssueStatus, targetOrder: number) => void;
  onOpenCreateWithStatus: (status: IssueStatus) => void;
}

const COLUMNS: { id: IssueStatus; title: string; color: string; icon: React.ReactNode }[] = [
  { id: 'backlog', title: 'Backlog', color: 'border-zinc-700/60', icon: <HelpCircle className="w-3.5 h-3.5 text-zinc-400" /> },
  { id: 'todo', title: 'Todo', color: 'border-blue-500/40', icon: <Circle className="w-3.5 h-3.5 text-blue-400" /> },
  { id: 'in_progress', title: 'In Progress', color: 'border-amber-500/40', icon: <Clock className="w-3.5 h-3.5 text-amber-400" /> },
  { id: 'in_review', title: 'In Review', color: 'border-purple-500/40', icon: <ArrowRight className="w-3.5 h-3.5 text-purple-400" /> },
  { id: 'done', title: 'Done', color: 'border-emerald-500/40', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> },
];

function PriorityBadge({ priority }: { priority: IssuePriority }) {
  switch (priority) {
    case 'urgent':
      return (
        <span className="flex items-center gap-1 text-[10px] font-semibold text-red-400 bg-red-950/50 border border-red-800/40 px-1.5 py-0.5 rounded">
          <Flame className="w-3 h-3 text-red-400" />
          Urgent
        </span>
      );
    case 'high':
      return (
        <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-950/50 border border-amber-800/40 px-1.5 py-0.5 rounded">
          <ArrowUp className="w-3 h-3 text-amber-400" />
          High
        </span>
      );
    case 'medium':
      return (
        <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-400 bg-blue-950/50 border border-blue-800/40 px-1.5 py-0.5 rounded">
          <ArrowRight className="w-3 h-3 text-blue-400" />
          Med
        </span>
      );
    default:
      return (
        <span className="flex items-center gap-1 text-[10px] font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
          <Minus className="w-3 h-3 text-zinc-500" />
          Low
        </span>
      );
  }
}

export const BoardView: React.FC<BoardViewProps> = ({
  issuesByStatus,
  onSelectIssue,
  onMoveIssue,
  onOpenCreateWithStatus,
}) => {
  const { peers } = usePresence();
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedIssueId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: IssueStatus) => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData('text/plain') || draggedIssueId;
    if (issueId) {
      const targetList = issuesByStatus[targetStatus] || [];
      const newOrder = targetList.length > 0 ? targetList[targetList.length - 1].order + 1000 : 1000;
      onMoveIssue(issueId, targetStatus, newOrder);
    }
    setDraggedIssueId(null);
  };

  return (
    <div className="flex-1 p-6 overflow-x-auto flex gap-5 items-start min-h-[calc(100vh-65px)] bg-[#090b12]">
      {COLUMNS.map((column) => {
        const columnIssues = issuesByStatus[column.id] || [];

        return (
          <div
            key={column.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
            className="w-80 shrink-0 flex flex-col max-h-[calc(100vh-100px)] rounded-xl bg-[#10131e] border border-[#1e2333] shadow-lg shadow-black/20"
          >
            {/* Column Header */}
            <div className="p-3.5 border-b border-[#1e2333] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-[#161a29] border border-zinc-800/80">
                  {column.icon}
                </span>
                <span className="text-xs font-semibold text-zinc-200 tracking-tight">
                  {column.title}
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-[#1b2030] text-[11px] font-mono text-zinc-400">
                  {columnIssues.length}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onOpenCreateWithStatus(column.id)}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#1a1f30] transition-colors"
                  title="Add issue to this column"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Column Cards Container */}
            <div className="flex-1 p-2 space-y-2.5 overflow-y-auto min-h-[150px]">
              {columnIssues.length === 0 ? (
                <div className="h-32 border border-dashed border-[#23293b] rounded-lg flex items-center justify-center text-xs text-zinc-500">
                  Drop card here
                </div>
              ) : (
                columnIssues.map((issue) => {
                  // Find if any remote peer is focused on this card
                  const viewingPeers = peers.filter((p) => p.activeIssueId === issue.id);

                  return (
                    <div
                      key={issue.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, issue.id)}
                      onClick={() => onSelectIssue(issue)}
                      className={`group relative p-3.5 rounded-lg bg-[#141824] hover:bg-[#181d2c] border cursor-grab active:cursor-grabbing transition-all shadow-sm hover:shadow-md hover:border-indigo-500/40 ${
                        viewingPeers.length > 0
                          ? 'border-indigo-500 ring-1 ring-indigo-500/50'
                          : 'border-[#222738]'
                      }`}
                    >
                      {/* Peer Viewing Indicator */}
                      {viewingPeers.length > 0 && (
                        <div className="absolute -top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-700 text-[10px] text-indigo-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                          <span>{viewingPeers[0].name} viewing</span>
                        </div>
                      )}

                      {/* Key & Priority */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-[11px] font-semibold text-zinc-400 group-hover:text-indigo-400 transition-colors">
                          {issue.key}
                        </span>
                        <PriorityBadge priority={issue.priority} />
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-medium text-zinc-200 line-clamp-2 leading-relaxed">
                        {issue.title}
                      </h4>

                      {/* Labels */}
                      {issue.labels.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {issue.labels.map((label, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-[#1c2235] text-zinc-400 border border-zinc-800"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer: Estimate & Assignee */}
                      <div className="mt-3 pt-2 border-t border-[#1e2334] flex items-center justify-between text-xs text-zinc-400">
                        {issue.estimate ? (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                            {issue.estimate} pts
                          </span>
                        ) : (
                          <span />
                        )}

                        {issue.assignee ? (
                          <div
                            title={issue.assignee.name}
                            className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-zinc-700"
                          >
                            <img
                              src={issue.assignee.avatar}
                              alt={issue.assignee.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-600">Unassigned</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
