import React from 'react';
import { Filter, X, Sparkles, Download, Layers } from 'lucide-react';
import type { ActiveFilters } from './Sidebar';

interface FilterBarProps {
  activeFilters: ActiveFilters;
  onClearFilters: () => void;
  onRemoveFilter: (key: keyof ActiveFilters) => void;
  filteredCount: number;
  totalCount: number;
  onSeedMoreIssues: () => void;
  onExportJson: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeFilters,
  onClearFilters,
  onRemoveFilter,
  filteredCount,
  totalCount,
  onSeedMoreIssues,
  onExportJson,
}) => {
  const hasActiveFilters = Boolean(
    activeFilters.priority || activeFilters.label || (activeFilters.view && activeFilters.view !== 'all')
  );

  return (
    <div className="px-6 py-2.5 border-b border-[#e1ecda] bg-[#fcfaf5]/70 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Left: Filter badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-[#3f5b2f] font-semibold">
          <Filter className="w-3.5 h-3.5 text-[#386641]" />
          <span>Showing {filteredCount} of {totalCount} issues</span>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {activeFilters.view && activeFilters.view !== 'all' && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#edf4dd] text-[#223d27] border border-[#c9de99] font-medium text-[11px]">
                <Layers className="w-3 h-3 text-[#386641]" />
                View: {activeFilters.view === 'my' ? 'My Issues' : 'Active Cycle'}
                <button
                  onClick={() => onRemoveFilter('view')}
                  className="hover:text-black ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {activeFilters.priority && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f2dadb] text-[#73292b] border border-[#e5b6b6] font-medium text-[11px]">
                Priority: {activeFilters.priority}
                <button
                  onClick={() => onRemoveFilter('priority')}
                  className="hover:text-black ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {activeFilters.label && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#edf4dd] text-[#223d27] border border-[#c9de99] font-medium text-[11px]">
                Tag: {activeFilters.label}
                <button
                  onClick={() => onRemoveFilter('label')}
                  className="hover:text-black ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={onClearFilters}
              className="text-[11px] text-[#bc4749] hover:underline font-semibold ml-1"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Right: Quick actions (Stress test 50 issues, Export CRDT state) */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSeedMoreIssues}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#d2e6d6] text-[#223d27] hover:border-[#6a994e] font-semibold text-[11px] transition-colors shadow-xs"
          title="Seed realistic engineering issues to test performance and virtualized scrolling"
        >
          <Sparkles className="w-3 h-3 text-[#6a994e]" />
          <span>+ Seed Batch Issues</span>
        </button>

        <button
          onClick={onExportJson}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#d2e6d6] text-[#223d27] hover:border-[#6a994e] font-semibold text-[11px] transition-colors shadow-xs"
          title="Export CRDT Snapshot to JSON"
        >
          <Download className="w-3 h-3 text-[#54793e]" />
          <span>Export Workspace</span>
        </button>
      </div>
    </div>
  );
};
