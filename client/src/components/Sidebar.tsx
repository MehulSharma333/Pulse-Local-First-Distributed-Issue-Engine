import React from 'react';
import { 
  Inbox, 
  User, 
  Layers, 
  Flame, 
  Tag, 
  Database, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  TrendingUp
} from 'lucide-react';
import type { IssuePriority } from '../types/issue';

export interface ActiveFilters {
  view?: 'all' | 'my' | 'cycle';
  priority?: IssuePriority;
  label?: string;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeFilters: ActiveFilters;
  onFilterChange: (filters: ActiveFilters) => void;
  totalIssues: number;
  myIssuesCount: number;
  urgentCount: number;
  completedPoints: number;
  totalPoints: number;
  labels: string[];
  onOpenCreateIssue: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  activeFilters,
  onFilterChange,
  totalIssues,
  myIssuesCount,
  urgentCount,
  completedPoints,
  totalPoints,
  labels,
  onOpenCreateIssue,
}) => {
  const sprintProgress = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  return (
    <aside
      className={`relative border-r border-[#d2e6d6] bg-[#fcfaf5] flex flex-col transition-all duration-300 z-20 shrink-0 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Workspace Header */}
      <div className="p-3.5 border-b border-[#e1ecda] flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#223d27] text-white flex items-center justify-center font-cinzel font-bold text-xs shadow-xs shrink-0">
              P
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-[#16291a] truncate tracking-tight">
                Pulse Core Engine
              </h3>
              <p className="text-[10px] text-[#54793e] font-medium truncate">
                Local-First Workspace
              </p>
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-[#3f5b2f] hover:text-[#16291a] hover:bg-[#edf4dd] transition-colors mx-auto"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Action Button */}
      <div className="p-3 border-b border-[#e1ecda]">
        <button
          onClick={onOpenCreateIssue}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#edf4dd] hover:bg-[#dbe9bb] text-[#16291a] font-semibold text-xs border border-[#c9de99] transition-all shadow-xs ${
            isCollapsed ? 'px-0' : 'px-3'
          }`}
          title="New Issue"
        >
          <Plus className="w-4 h-4 text-[#223d27]" />
          {!isCollapsed && <span>New Issue</span>}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-5">
        {/* Primary Views */}
        <div className="space-y-1">
          {!isCollapsed && (
            <span className="px-2 text-[10px] font-bold text-[#54793e] uppercase tracking-wider">
              Views
            </span>
          )}

          <button
            onClick={() => onFilterChange({ ...activeFilters, view: 'all' })}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              (activeFilters.view === 'all' || !activeFilters.view) && !activeFilters.priority && !activeFilters.label
                ? 'bg-[#223d27] text-white shadow-xs'
                : 'text-[#3f5b2f] hover:bg-[#f4edd9]'
            }`}
            title="All Issues"
          >
            <div className="flex items-center gap-2.5">
              <Inbox className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>All Issues</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/20 text-current">
                {totalIssues}
              </span>
            )}
          </button>

          <button
            onClick={() => onFilterChange({ ...activeFilters, view: 'my' })}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeFilters.view === 'my'
                ? 'bg-[#223d27] text-white shadow-xs'
                : 'text-[#3f5b2f] hover:bg-[#f4edd9]'
            }`}
            title="My Issues"
          >
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>My Issues</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/20 text-current">
                {myIssuesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onFilterChange({ ...activeFilters, view: 'cycle' })}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeFilters.view === 'cycle'
                ? 'bg-[#223d27] text-white shadow-xs'
                : 'text-[#3f5b2f] hover:bg-[#f4edd9]'
            }`}
            title="Active Cycle (Sprint)"
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Current Cycle</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] font-bold text-[#6a994e]">
                {sprintProgress}%
              </span>
            )}
          </button>
        </div>

        {/* Sprint / Cycle Burndown Widget (Linear style) */}
        {!isCollapsed && (
          <div className="p-3 rounded-xl bg-[#f4edd9]/70 border border-[#d2e6d6] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#16291a]">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#386641]" />
                Cycle 12 Velocity
              </span>
              <span className="font-mono text-[11px] text-[#223d27]">
                {completedPoints}/{totalPoints} pts
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#e1ecda] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#6a994e] to-[#386641] transition-all duration-500 rounded-full"
                style={{ width: `${sprintProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#54793e] font-medium">
              <span>{totalIssues - myIssuesCount} pending</span>
              <span>{sprintProgress}% Velocity</span>
            </div>
          </div>
        )}

        {/* Priority Filters */}
        <div className="space-y-1">
          {!isCollapsed && (
            <span className="px-2 text-[10px] font-bold text-[#54793e] uppercase tracking-wider">
              Priority Filters
            </span>
          )}

          <button
            onClick={() =>
              onFilterChange({
                ...activeFilters,
                priority: activeFilters.priority === 'urgent' ? undefined : 'urgent',
              })
            }
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeFilters.priority === 'urgent'
                ? 'bg-[#bc4749] text-white shadow-xs'
                : 'text-[#73292b] hover:bg-[#f2dadb]'
            }`}
            title="Urgent Issues"
          >
            <div className="flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 text-[#bc4749] shrink-0" />
              {!isCollapsed && <span>Urgent</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] font-mono px-1.5 rounded-full bg-white/20">
                {urgentCount}
              </span>
            )}
          </button>

          <button
            onClick={() =>
              onFilterChange({
                ...activeFilters,
                priority: activeFilters.priority === 'high' ? undefined : 'high',
              })
            }
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeFilters.priority === 'high'
                ? 'bg-[#223d27] text-white shadow-xs'
                : 'text-[#3f5b2f] hover:bg-[#f4edd9]'
            }`}
            title="High Priority"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8d7027]" />
              {!isCollapsed && <span>High</span>}
            </div>
          </button>
        </div>

        {/* Labels & Tags */}
        <div className="space-y-1">
          {!isCollapsed && (
            <span className="px-2 text-[10px] font-bold text-[#54793e] uppercase tracking-wider">
              Tags & Modules
            </span>
          )}

          {labels.slice(0, 5).map((label) => (
            <button
              key={label}
              onClick={() =>
                onFilterChange({
                  ...activeFilters,
                  label: activeFilters.label === label ? undefined : label,
                })
              }
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                activeFilters.label === label
                  ? 'bg-[#223d27] text-white shadow-xs font-semibold'
                  : 'text-[#3f5b2f] hover:bg-[#f4edd9]'
              }`}
              title={label}
            >
              <div className="flex items-center gap-2 truncate">
                <Tag className="w-3 h-3 text-[#6a994e] shrink-0" />
                {!isCollapsed && <span className="truncate">{label}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Storage Health & Local-First Indicator at Bottom */}
      {!isCollapsed ? (
        <div className="p-3 border-t border-[#e1ecda] bg-[#f4edd9]/50 space-y-1.5 text-[11px] text-[#3f5b2f]">
          <div className="flex items-center justify-between font-bold text-[#16291a]">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#386641]" />
              Storage Engine
            </span>
            <span className="text-[10px] font-mono text-[#0f763e] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> IndexedDB Active
            </span>
          </div>
          <p className="text-[10px] text-[#54793e] leading-tight">
            0ms local cache • Persistent binary delta tier enabled.
          </p>
        </div>
      ) : (
        <div className="p-3 border-t border-[#e1ecda] flex justify-center" title="IndexedDB Storage Tier Active">
          <Database className="w-4 h-4 text-[#386641]" />
        </div>
      )}
    </aside>
  );
};
