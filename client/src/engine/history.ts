import * as Y from 'yjs';
import { issuesMap } from './ydoc';

// UndoManager tracking changes on the issues map
export const undoManager = new Y.UndoManager(issuesMap, {
  trackedOrigins: new Set([null]), // Track local user changes
});

export function undo() {
  if (undoManager.canUndo()) {
    undoManager.undo();
    return true;
  }
  return false;
}

export function redo() {
  if (undoManager.canRedo()) {
    undoManager.redo();
    return true;
  }
  return false;
}
