import { IndexeddbPersistence } from 'y-indexeddb';
import { doc, seedDefaultIssuesIfEmpty } from './ydoc';

export const indexeddbProvider = new IndexeddbPersistence('pulse-workspace-v1', doc);

export const whenIndexedDbSynced = new Promise<void>((resolve) => {
  indexeddbProvider.on('synced', () => {
    // If local IndexedDB is completely empty, populate with initial sample issues
    seedDefaultIssuesIfEmpty();
    resolve();
  });
});
