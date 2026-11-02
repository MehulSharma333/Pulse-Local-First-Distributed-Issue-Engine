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
  icon: React.ReactNode 
}[] = [
  { 
    id: 'backlog', 
    title: 'Backlog', 
    icon: <HelpCircle className="w-3.5 h-3.5 text-[#54793e]" /> 
  },
  { 
    id: 'todo', 
    title: 'Todo', 
    icon: <Circle className="w-3.5 h-3.5 text-[#386641]" /> 
  },
  { 
    id: 'in_progress', 
    title: 'In Progress', 
    icon: <Clock className="w-3.5 h-3.5 text-[#6a994e]" /> 
  },
  { 
    id: 'in_review', 
    title: 'In Review', 
    icon: <ArrowRight className="w-3.5 h-3.5 text-[#8aad38]" /> 
  },
  { 
    id: 'done', 
    title: 'Done', 
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#223d27]" /> 
  },
];

function PriorityBadge({ priority }: { priority: IssuePriority }) {
  switch (priority) {
    case 'urgent':
      return (
        <span className="flex items-center gap-1 text-[10px] font-semibold text-[#73292b] bg-[#f2dadb] border border-[#e5b6b6] px-2 py-0.5 rounded-full">
          <Flame className="w-3 h-3 text-[#bc4749]" />
          Urgent
        </span>
      );
    case 'high':
      return (
        <span className="flex items-center gap-1 text-[10px] font-semibold text-[#463813] bg-[#f4edd9] border border-[#dfc688] px-2 py-0.5 rounded-full">
          <ArrowUp className="w-3 h-3 text-[#8d7027]" />
          High
        </span>
      );
    case 'medium':
      return (
        <span className="flex items-center gap-1 text-[10px] font-semibold text-[#223d27] bg-[#edf4dd] border border-[#c9de99] px-2 py-0.5 rounded-full">
          <ArrowRight className="w-3 h-3 text-[#386641]" />
          Med
        </span>
      );
    default:
      return (
        <span className="flex items-center gap-1 text-[10px] font-medium text-[#3f5b2f] bg-[#fcfaf5] border border-[#d2e6d6] px-2 py-0.5 rounded-full">
          <Minus className="w-3 h-3 text-[#6a994e]" />
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
    <div className="flex-1 p-6 overflow-x-auto flex gap-5 items-start min-h-[calc(100vh-65px)] bg-gradient-to-br from-[#faf6ec] via-[#f4edd9]/50 to-[#edf4dd]/60">
      {COLUMNS.map((column) => {
        const columnIssues = issuesByStatus[column.id] || [];

        return (
          <div
            key={column.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
            className="w-80 shrink-0 flex flex-col max-h-[calc(100vh-100px)] rounded-2xl bg-[#fcfaf5] border border-[#d2e6d6] shadow-xl backdrop-blur-sm transition-all"
          >
            {/* Generic Column Header */}
            <div className="p-3.5 border-b border-[#e1ecda] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-white border border-[#d2e6d6] shadow-xs">
                  {column.icon}
                </span>
                <span className="text-xs font-bold text-[#16291a] tracking-tight">
                  {column.title}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#edf4dd] text-[11px] font-mono font-bold text-[#223d27] border border-[#c9de99]">
                  {columnIssues.length}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onOpenCreateWithStatus(column.id)}
                  className="p-1 rounded-lg text-[#386641] hover:text-[#16291a] hover:bg-[#edf4dd] transition-colors"
                  title="Add issue to this column"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Column Cards Container */}
            <div className="flex-1 p-3 space-y-2.5 overflow-y-auto min-h-[160px]">
              {columnIssues.length === 0 ? (
                <div className="h-32 border-2 border-dashed border-[#d2e6d6] rounded-xl flex items-center justify-center text-xs font-medium text-[#6a994e]">
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
                      className={`group relative p-4 rounded-xl bg-white hover:bg-[#fcfaf5] border cursor-grab active:cursor-grabbing transition-all shadow-xs hover:shadow-md hover:border-[#6a994e] ${
                        viewingPeers.length > 0
                          ? 'border-[#386641] ring-2 ring-[#a4cdac]'
                          : 'border-[#e1ecda]'
                      }`}
                    >
                      {/* Peer Viewing Indicator */}
                      {viewingPeers.length > 0 && (
                        <div className="absolute -top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#edf4dd] border border-[#77b483] text-[10px] font-semibold text-[#223d27] shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#386641] animate-ping" />
                          <span>{viewingPeers[0].name} viewing</span>
                        </div>
                      )}

                      {/* Key & Priority */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-[11px] font-bold text-[#2d5234] group-hover:text-[#16291a] transition-colors">
                          {issue.key}
                        </span>
                        <PriorityBadge priority={issue.priority} />
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-normal text-[#16291a] line-clamp-2 leading-relaxed">
                        {issue.title}
                      </h4>

                      {/* Labels */}
                      {issue.labels.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {issue.labels.map((label, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#edf4dd] text-[#223d27] border border-[#d2e6d6]"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer: Estimate & Assignee */}
                      <div className="mt-3 pt-2.5 border-t border-[#f4edd9] flex items-center justify-between text-xs text-[#3f5b2f]">
                        {issue.estimate ? (
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#e1ecda] text-[#16291a] border border-[#a4cdac]">
                            {issue.estimate} pts
                          </span>
                        ) : (
                          <span />
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
