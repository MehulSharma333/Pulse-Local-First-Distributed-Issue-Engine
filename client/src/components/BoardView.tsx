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

const COLUMNS: { 
  id: IssueStatus; 
  title: string; 
  bg: string;
  border: string;
  accent: string;
  icon: React.ReactNode 
}[] = [
  { 
    id: 'backlog', 
    title: 'Backlog', 
    bg: 'bg-[#f5f0f8]/90', 
    border: 'border-[#e0d2e9]', 
    accent: 'text-[#824ea1]',
    icon: <HelpCircle className="w-3.5 h-3.5 text-[#824ea1]" /> 
  },
  { 
    id: 'todo', 
    title: 'Todo', 
    bg: 'bg-[#f2f9ff]/90', 
    border: 'border-[#d8ecfe]', 
    accent: 'text-[#035eaf]',
    icon: <Circle className="w-3.5 h-3.5 text-[#035eaf]" /> 
  },
  { 
    id: 'in_progress', 
    title: 'In Progress', 
    bg: 'bg-[#edf6ff]/90', 
    border: 'border-[#c8e4ff]', 
    accent: 'text-[#0056a7]',
    icon: <Clock className="w-3.5 h-3.5 text-[#0056a7]" /> 
  },
  { 
    id: 'in_review', 
    title: 'In Review', 
    bg: 'bg-[#fff4f8]/90', 
    border: 'border-[#ffddea]', 
    accent: 'text-[#b60046]',
    icon: <ArrowRight className="w-3.5 h-3.5 text-[#b60046]" /> 
  },
  { 
    id: 'done', 
    title: 'Done', 
    bg: 'bg-[#f4faf6]/90', 
    border: 'border-[#d2edd9]', 
    accent: 'text-[#0f763e]',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#0f763e]" /> 
  },
];

function PriorityBadge({ priority }: { priority: IssuePriority }) {
  switch (priority) {
    case 'urgent':
      return (
        <span className="flex items-center gap-1 text-[10px] font-semibold text-[#5b0023] bg-[#ffe9f1] border border-[#ffd2e3] px-2 py-0.5 rounded-full">
          <Flame className="w-3 h-3 text-[#ff116c]" />
          Urgent
        </span>
      );
    case 'high':
      return (
        <span className="flex items-center gap-1 text-[10px] font-semibold text-[#56001f] bg-[#ffdeea] border border-[#ffbed6] px-2 py-0.5 rounded-full">
          <ArrowUp className="w-3 h-3 text-[#ab003f]" />
          High
        </span>
      );
    case 'medium':
      return (
        <span className="flex items-center gap-1 text-[10px] font-semibold text-[#012f57] bg-[#e5f3ff] border border-[#cbe6fe] px-2 py-0.5 rounded-full">
          <ArrowRight className="w-3 h-3 text-[#035eaf]" />
          Med
        </span>
      );
    default:
      return (
        <span className="flex items-center gap-1 text-[10px] font-medium text-[#57346b] bg-[#f5f0f8] border border-[#e0d2e9] px-2 py-0.5 rounded-full">
          <Minus className="w-3 h-3 text-[#824ea1]" />
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
    <div className="flex-1 p-6 overflow-x-auto flex gap-5 items-start min-h-[calc(100vh-65px)] bg-[#f7f5fa]">
      {COLUMNS.map((column) => {
        const columnIssues = issuesByStatus[column.id] || [];

        return (
          <div
            key={column.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
            className={`w-80 shrink-0 flex flex-col max-h-[calc(100vh-100px)] rounded-2xl ${column.bg} border ${column.border} shadow-sm backdrop-blur-xs`}
          >
            {/* Column Header */}
            <div className={`p-3.5 border-b ${column.border} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-white/90 border border-white shadow-xs">
                  {column.icon}
                </span>
                <span className="text-xs font-bold text-[#2b1a36] tracking-tight">
                  {column.title}
                </span>
                <span className={`px-2 py-0.5 rounded-full bg-white text-[11px] font-mono font-bold ${column.accent} shadow-xs`}>
                  {columnIssues.length}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onOpenCreateWithStatus(column.id)}
                  className="p-1 rounded-lg text-[#824ea1] hover:text-[#2b1a36] hover:bg-white/80 transition-colors"
                  title="Add issue to this column"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Column Cards Container */}
            <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto min-h-[160px]">
              {columnIssues.length === 0 ? (
                <div className="h-32 border-2 border-dashed border-[#e0d2e9]/70 rounded-xl flex items-center justify-center text-xs font-medium text-[#a87ec1]">
                  Drop card here
                </div>
              ) : (
                columnIssues.map((issue) => {
                  const viewingPeers = peers.filter((p) => p.activeIssueId === issue.id);

                  return (
                    <div
                      key={issue.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, issue.id)}
                      onClick={() => onSelectIssue(issue)}
                      className={`group relative p-4 rounded-xl bg-white hover:bg-[#fffdfd] border cursor-grab active:cursor-grabbing transition-all shadow-xs hover:shadow-md hover:border-[#a87ec1] ${
                        viewingPeers.length > 0
                          ? 'border-[#ff116c] ring-2 ring-[#ffd2e3]'
                          : 'border-[#ebe1f0]'
                      }`}
                    >
                      {/* Peer Viewing Indicator */}
                      {viewingPeers.length > 0 && (
                        <div className="absolute -top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ffe9f1] border border-[#ff6ca4] text-[10px] font-semibold text-[#b60046] shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ff116c] animate-ping" />
                          <span>{viewingPeers[0].name} viewing</span>
                        </div>
                      )}

                      {/* Key & Priority */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-[11px] font-bold text-[#824ea1] group-hover:text-[#57346b] transition-colors">
                          {issue.key}
                        </span>
                        <PriorityBadge priority={issue.priority} />
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-semibold text-[#2b1a36] line-clamp-2 leading-relaxed">
                        {issue.title}
                      </h4>

                      {/* Labels */}
                      {issue.labels.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {issue.labels.map((label, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#f5f0f8] text-[#57346b] border border-[#e0d2e9]"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer: Estimate & Assignee */}
                      <div className="mt-3 pt-2.5 border-t border-[#f2edf5] flex items-center justify-between text-xs text-[#824ea1]">
                        {issue.estimate ? (
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#e5f3ff] text-[#035eaf] border border-[#cbe6fe]">
                            {issue.estimate} pts
                          </span>
                        ) : (
                          <span />
                        )}

                        {issue.assignee ? (
                          <div
                            title={issue.assignee.name}
                            className="w-5 h-5 rounded-full overflow-hidden ring-2 ring-[#e0d2e9]"
                          >
                            <img
                              src={issue.assignee.avatar}
                              alt={issue.assignee.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#a87ec1] italic">Unassigned</span>
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
