import type { JSONContent } from '@tiptap/react';

import { getDatabase, HISTORY_STORE } from '../storage/database';

export interface HistoryEntry {
  content: JSONContent;
  id: number;
  noteId: string;
  timestamp: number;
}

const SNAPSHOT_INTERVAL_MS = 30_000;
const MAX_ENTRIES_PER_NOTE = 100;

const lastSnapshotTime = new Map<string, number>();

export function maybeSnapshot(noteId: string, content: JSONContent): void {
  const now = Date.now();
  const last = lastSnapshotTime.get(noteId) ?? 0;
  if (now - last < SNAPSHOT_INTERVAL_MS) return;

  lastSnapshotTime.set(noteId, now);

  void (async () => {
    const db = await getDatabase();
    await db.add(HISTORY_STORE, { content, noteId, timestamp: now });

    // Prune old entries beyond max
    const tx = db.transaction(HISTORY_STORE, 'readwrite');
    const index = tx.store.index('noteId');
    const range = IDBKeyRange.only(noteId);
    const allKeys = await index.getAllKeys(range);
    if (allKeys.length > MAX_ENTRIES_PER_NOTE) {
      const toDelete = allKeys.slice(0, allKeys.length - MAX_ENTRIES_PER_NOTE);
      for (const key of toDelete) {
        await tx.store.delete(key);
      }
    }
    await tx.done;
  })();
}

export async function getHistory(noteId: string): Promise<Array<HistoryEntry>> {
  const db = await getDatabase();
  const index = db
    .transaction(HISTORY_STORE, 'readonly')
    .store.index('noteId');
  const range = IDBKeyRange.only(noteId);
  const raw: Array<unknown> = await index.getAll(range);
  const entries = raw.filter(isHistoryEntry);
  return entries.sort((a, b) => b.timestamp - a.timestamp);
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  return (
    typeof value === 'object' && value !== null &&
    'content' in value && 'noteId' in value && 'timestamp' in value
  );
}
