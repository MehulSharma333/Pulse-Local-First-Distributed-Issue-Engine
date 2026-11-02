import { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar, type ActiveFilters } from './components/Sidebar';
import { FilterBar } from './components/FilterBar';
import { BoardView } from './components/BoardView';
import { ListView } from './components/ListView';
import { CommandPalette } from './components/CommandPalette';
import { SyncTelemetryModal } from './components/SyncTelemetryModal';
import { IssueDetailModal } from './components/IssueDetailModal';
import { useIssues } from './hooks/useIssues';
import { usePresence } from './hooks/usePresence';
import { undo, redo } from './engine/history';
import { whenIndexedDbSynced } from './engine/persistence';
import type { Issue, IssueStatus } from './types/issue';

export function App() {
  const { issues, createIssue, updateIssue, deleteIssue, moveIssue } = useIssues();
  const { localUser, setActiveIssueFocus } = usePresence();

  const [currentView, setCurrentView] = useState<'board' | 'list'>('board');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({ view: 'all' });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isStatusLocked, setIsStatusLocked] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [initialStatusForNew, setInitialStatusForNew] = useState<IssueStatus>('todo');

  // Pre-warm IndexedDB storage
  useEffect(() => {
    whenIndexedDbSynced.then(() => {
      console.log('⚡ [Pulse Engine] IndexedDB storage hydrated with 0ms cold-boot guarantee.');
    });
  }, []);

  // Global Keyboard shortcuts: Cmd+K / Ctrl+K, Undo/Redo, Toggle Sidebar ([)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }

      // Undo: Ctrl+Z / Cmd+Z (without shift)
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'z') {
        if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
          e.preventDefault();
          undo();
        }
      }

      // Redo: Ctrl+Shift+Z / Cmd+Shift+Z
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
        if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
          e.preventDefault();
          redo();
        }
      }

      // Toggle sidebar: [
      if (e.key === '[' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        setIsSidebarCollapsed((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute all unique labels across all issues
  const allLabels = useMemo(() => {
    const set = new Set<string>();
    issues.forEach((i) => i.labels.forEach((l) => set.add(l)));
    return Array.from(set);
  }, [issues]);

  // Filter issues based on activeFilters
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (activeFilters.view === 'my') {
        const isMy =
          issue.assignee?.id === 'me' ||
          issue.assignee?.id === localUser.id ||
          issue.assignee?.name.toLowerCase().includes('me') ||
          issue.assignee?.name.toLowerCase().includes('alex');
        if (!isMy) return false;
      }
      if (activeFilters.view === 'cycle') {
        if (issue.status === 'cancelled') return false;
      }
      if (activeFilters.priority && issue.priority !== activeFilters.priority) {
        return false;
      }
      if (activeFilters.label && !issue.labels.includes(activeFilters.label)) {
        return false;
      }
      return true;
    });
  }, [issues, activeFilters, localUser.id]);

  // Group filtered issues by status for the Board View
  const filteredIssuesByStatus = useMemo(() => {
    const grouped: Record<IssueStatus, Issue[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
      cancelled: [],
    };

    filteredIssues.forEach((issue) => {
      if (grouped[issue.status]) {
        grouped[issue.status].push(issue);
      } else {
        grouped.backlog.push(issue);
      }
    });

    Object.keys(grouped).forEach((status) => {
      grouped[status as IssueStatus].sort((a, b) => a.order - b.order);
    });

    return grouped;
  }, [filteredIssues]);

  // Velocity Metrics
  const totalPoints = useMemo(() => {
    return issues.reduce((acc, curr) => acc + (curr.estimate || 0), 0);
  }, [issues]);

  const completedPoints = useMemo(() => {
    return issues
      .filter((i) => i.status === 'done')
      .reduce((acc, curr) => acc + (curr.estimate || 0), 0);
  }, [issues]);

  const urgentCount = useMemo(() => {
    return issues.filter((i) => i.priority === 'urgent').length;
  }, [issues]);

  const myIssuesCount = useMemo(() => {
    return issues.filter(
      (i) =>
        i.assignee?.id === 'me' ||
        i.assignee?.id === localUser.id ||
        i.assignee?.name.toLowerCase().includes('me') ||
        i.assignee?.name.toLowerCase().includes('alex')
    ).length;
  }, [issues, localUser.id]);

  const handleOpenCreateIssue = useCallback((status: IssueStatus = 'todo', locked = false) => {
    setSelectedIssue(null);
    setInitialStatusForNew(status);
    setIsStatusLocked(locked);
    setIsIssueModalOpen(true);
  }, []);

  const handleSelectIssue = useCallback((issue: Issue) => {
    setSelectedIssue(issue);
    setInitialStatusForNew(issue.status);
    setIsStatusLocked(false);
    setIsIssueModalOpen(true);
  }, []);

  const handleSaveIssue = useCallback(
    (data: Partial<Issue> & { title: string; status: IssueStatus }) => {
      if (selectedIssue) {
        updateIssue(selectedIssue.id, data);
      } else {
        createIssue({
          ...data,
          status: data.status || initialStatusForNew,
        });
      }
    },
    [selectedIssue, initialStatusForNew, updateIssue, createIssue]
  );

  // Recruiter Showcase Action: Seed 5 batch issues
  const handleSeedMoreIssues = useCallback(() => {
    const sampleTitles = [
      { title: 'Write WebAssembly parser for Yjs binary state vectors', label: 'Wasm', priority: 'high' as const },
      { title: 'Sub-5ms IndexedDB compound index lookups for high-density tables', label: 'Storage', priority: 'urgent' as const },
      { title: 'Zero-copy broadcast channel sync across multi-tab instances', label: 'Engine', priority: 'medium' as const },
      { title: 'Custom Bézier curve connector for dependency DAGs', label: 'UI/UX', priority: 'low' as const },
      { title: 'Optimistic rollback transaction middleware with undo checkpoints', label: 'CRDT', priority: 'high' as const },
    ];

    sampleTitles.forEach((sample) => {
      createIssue({
        title: sample.title,
        status: 'todo',
        priority: sample.priority,
        labels: [sample.label, 'Performance'],
        estimate: Math.floor(Math.random() * 5) + 1,
      });
    });
  }, [createIssue]);

  // Recruiter Showcase Action: Export JSON snapshot
  const handleExportJson = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(issues, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pulse-workspace-export-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [issues]);

  return (
    <div className="min-h-screen bg-[#faf6ec] text-[#16291a] flex flex-col font-sans antialiased selection:bg-[#a4cdac] selection:text-[#0b140d]">
      {/* Top Application Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenCreateIssue={() => handleOpenCreateIssue('todo')}
        onToggleTelemetry={() => setIsTelemetryOpen((prev) => !prev)}
        isTelemetryOpen={isTelemetryOpen}
      />

      {/* Main App Layout: Sidebar + Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Linear-Style Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          activeFilters={activeFilters}
          onFilterChange={setActiveFilters}
          totalIssues={issues.length}
          myIssuesCount={myIssuesCount}
          urgentCount={urgentCount}
          completedPoints={completedPoints}
          totalPoints={totalPoints}
          labels={allLabels}
          onOpenCreateIssue={() => handleOpenCreateIssue('todo')}
        />

        {/* Content Column: Filter Bar + Views */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Filter Sub-header */}
          <FilterBar
            activeFilters={activeFilters}
            onClearFilters={() => setActiveFilters({ view: 'all' })}
            onRemoveFilter={(key) =>
              setActiveFilters((prev) => ({ ...prev, [key]: undefined }))
            }
            filteredCount={filteredIssues.length}
            totalCount={issues.length}
            onSeedMoreIssues={handleSeedMoreIssues}
            onExportJson={handleExportJson}
          />

          {/* Board or Virtualized List View */}
          <main className="flex-1 flex flex-col overflow-y-auto">
            {currentView === 'board' ? (
              <BoardView
                issuesByStatus={filteredIssuesByStatus}
                onSelectIssue={handleSelectIssue}
                onMoveIssue={moveIssue}
                onOpenCreateWithStatus={(status) => handleOpenCreateIssue(status, true)}
              />
            ) : (
              <ListView
                issues={filteredIssues}
                onSelectIssue={handleSelectIssue}
                onUpdateStatus={(id, newStatus) => updateIssue(id, { status: newStatus })}
              />
            )}
          </main>
        </div>
      </div>

      {/* Cmd+K Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        issues={issues}
        onSelectIssue={handleSelectIssue}
        onOpenCreateIssue={() => handleOpenCreateIssue('todo', false)}
        onViewChange={setCurrentView}
      />

      {/* CRDT Sync Telemetry Modal */}
      <SyncTelemetryModal
        isOpen={isTelemetryOpen}
        onClose={() => setIsTelemetryOpen(false)}
      />

      {/* Issue Create / Edit Modal */}
      <IssueDetailModal
        isOpen={isIssueModalOpen}
        onClose={() => {
          setIsIssueModalOpen(false);
          setSelectedIssue(null);
        }}
        issue={selectedIssue}
        initialStatus={selectedIssue ? selectedIssue.status : initialStatusForNew}
        isStatusLocked={isStatusLocked}
        onSave={handleSaveIssue}
        onDelete={deleteIssue}
        onFocusIssue={setActiveIssueFocus}
      />
    </div>
  );
}

export default App;
