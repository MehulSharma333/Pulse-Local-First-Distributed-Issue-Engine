import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Plus, Kanban, ListFilter, WifiOff, Wifi, Sparkles } from 'lucide-react';
import type { Issue } from '../types/issue';
import { useSyncStatus } from '../hooks/useSyncStatus';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
  onOpenCreateIssue: () => void;
  onViewChange: (view: 'board' | 'list') => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  issues,
  onSelectIssue,
  onOpenCreateIssue,
  onViewChange,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { stats, toggleSimulateOffline } = useSyncStatus();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const actions = useMemo(() => {
    return [
      {
        id: 'action-create',
        title: 'Create new issue',
        subtitle: 'Add a new task to your local-first workspace',
        icon: <Plus className="w-4 h-4 text-[#824ea1]" />,
        run: () => {
          onClose();
          onOpenCreateIssue();
        },
      },
      {
        id: 'action-toggle-offline',
        title: stats.isSimulatedOffline ? 'Reconnect sync relay' : 'Simulate offline mode',
        subtitle: stats.isSimulatedOffline ? 'Resume WebSocket data stream' : 'Cut network to test local mutations',
        icon: stats.isSimulatedOffline ? (
          <Wifi className="w-4 h-4 text-[#035eaf]" />
        ) : (
          <WifiOff className="w-4 h-4 text-[#ff116c]" />
        ),
        run: () => {
          toggleSimulateOffline();
          onClose();
        },
      },
      {
        id: 'action-view-board',
        title: 'Switch to Kanban Board',
        subtitle: 'Deterministic column transitions',
        icon: <Kanban className="w-4 h-4 text-[#824ea1]" />,
        run: () => {
          onViewChange('board');
          onClose();
        },
      },
      {
        id: 'action-view-list',
        title: 'Switch to Virtualized List',
        subtitle: 'High-density table for 10k+ issues',
        icon: <ListFilter className="w-4 h-4 text-[#824ea1]" />,
        run: () => {
          onViewChange('list');
          onClose();
        },
      },
    ];
  }, [stats.isSimulatedOffline, toggleSimulateOffline, onClose, onOpenCreateIssue, onViewChange]);

  const filteredIssues = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return issues
      .filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.key.toLowerCase().includes(q) ||
          i.labels.some((l) => l.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [issues, query]);

  const allItems = useMemo(() => {
    return [
      ...actions.filter((a) => a.title.toLowerCase().includes(query.toLowerCase())),
      ...filteredIssues.map((issue) => ({
        id: issue.id,
        title: `${issue.key} • ${issue.title}`,
        subtitle: `${issue.status.toUpperCase()} • Priority: ${issue.priority}`,
        icon: <Sparkles className="w-4 h-4 text-[#ff5895]" />,
        run: () => {
          onClose();
          onSelectIssue(issue);
        },
      })),
    ];
  }, [actions, filteredIssues, query, onClose, onSelectIssue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (allItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (allItems.length || 1)) % (allItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].run();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/35 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white border border-[#e0d2e9] shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-[#e0d2e9] bg-[#f5f0f8]">
          <Search className="w-4 h-4 text-[#824ea1]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search issues..."
            className="w-full px-3 py-3.5 bg-transparent text-sm text-[#2b1a36] placeholder-[#a87ec1] focus:outline-none font-medium"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-white text-[#57346b] border border-[#d6c2e2] rounded-md font-semibold">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {allItems.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-[#824ea1]">
              No matching commands or issues found
            </div>
          ) : (
            allItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={item.run}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                  idx === selectedIndex
                    ? 'bg-[#f5f0f8] text-[#2b1a36] border border-[#cdb4db]'
                    : 'text-[#57346b] hover:bg-[#faf8fd]'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-white border border-[#e0d2e9] text-[#824ea1] shadow-xs">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#2b1a36] truncate">{item.title}</div>
                  <div className="text-[11px] text-[#824ea1] truncate">{item.subtitle}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-[#e0d2e9] bg-[#f5f0f8] flex items-center justify-between text-[11px] text-[#57346b]">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono bg-white border border-[#d6c2e2] px-1.5 py-0.5 rounded text-[10px] text-[#2b1a36] font-semibold">↑↓</kbd> navigate
            </span>
            <span>
              <kbd className="font-mono bg-white border border-[#d6c2e2] px-1.5 py-0.5 rounded text-[10px] text-[#2b1a36] font-semibold">↵</kbd> select
            </span>
          </div>
          <span className="font-mono text-[10px] font-bold text-[#824ea1]">0ms local lookup</span>
        </div>
      </div>
    </div>
  );
};
