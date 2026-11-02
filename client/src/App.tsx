import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
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
  const { issues, issuesByStatus, createIssue, updateIssue, deleteIssue, moveIssue } = useIssues();
  const { setActiveIssueFocus } = usePresence();

  const [currentView, setCurrentView] = useState<'board' | 'list'>('board');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [initialStatusForNew, setInitialStatusForNew] = useState<IssueStatus>('todo');

  // Ensure IndexedDB persistence is pre-warmed
  useEffect(() => {
    whenIndexedDbSynced.then(() => {
      console.log('⚡ [Pulse Engine] IndexedDB storage hydrated with 0ms cold-boot guarantee.');
    });
  }, []);

  // Global Keyboard shortcuts: Cmd+K / Ctrl+K, Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }

      // Undo: Ctrl+Z / Cmd+Z (without shift)
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'z') {
        // If not typing in input
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenCreateIssue = useCallback((status: IssueStatus = 'todo') => {
    setSelectedIssue(null);
    setInitialStatusForNew(status);
    setIsIssueModalOpen(true);
  }, []);

  const handleSelectIssue = useCallback((issue: Issue) => {
    setSelectedIssue(issue);
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

  return (
    <div className="min-h-screen bg-[#f7f5fa] text-[#2b1a36] flex flex-col font-sans antialiased selection:bg-[#ffc8dd] selection:text-[#5b0023]">
      {/* Top Application Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenCreateIssue={() => handleOpenCreateIssue('todo')}
        onToggleTelemetry={() => setIsTelemetryOpen((prev) => !prev)}
        isTelemetryOpen={isTelemetryOpen}
      />

      {/* Main Board or Virtualized List View */}
      <main className="flex-1 flex flex-col">
        {currentView === 'board' ? (
          <BoardView
            issuesByStatus={issuesByStatus}
            onSelectIssue={handleSelectIssue}
            onMoveIssue={moveIssue}
            onOpenCreateWithStatus={handleOpenCreateIssue}
          />
        ) : (
          <ListView
            issues={issues}
            onSelectIssue={handleSelectIssue}
            onUpdateStatus={(id, newStatus) => updateIssue(id, { status: newStatus })}
          />
        )}
      </main>

      {/* Cmd+K Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        issues={issues}
        onSelectIssue={handleSelectIssue}
        onOpenCreateIssue={() => handleOpenCreateIssue('todo')}
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
        onSave={handleSaveIssue}
        onDelete={deleteIssue}
        onFocusIssue={setActiveIssueFocus}
      />
    </div>
  );
}

export default App;
