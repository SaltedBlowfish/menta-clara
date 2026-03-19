import type { JSONContent } from '@tiptap/react';

import { putRecord } from '../storage/db-cache';

export interface Conflict {
  id: string;
  incoming: JSONContent;
  incomingTime: number;
  local: JSONContent;
  localTime: number;
  noteId: string;
}

// ── State ──

const queue: Conflict[] = [];
const listeners = new Set<() => void>();
let nextId = 1;

function notify() {
  for (const cb of listeners) cb();
}

export function subscribeConflicts(cb: () => void): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

export function getConflicts(): ReadonlyArray<Conflict> {
  return queue;
}

export function addConflict(
  noteId: string,
  local: JSONContent,
  localTime: number,
  incoming: JSONContent,
  incomingTime: number,
): void {
  queue.push({ id: `conflict-${String(nextId++)}`, incoming, incomingTime, local, localTime, noteId });
  notify();
}

// ── Resolution ──

function mergeContent(a: JSONContent, b: JSONContent): JSONContent {
  const aNodes = a.content ?? [];
  const divider: JSONContent = {
    content: [{ text: '── synced from another device ──', type: 'text' }],
    type: 'paragraph',
  };
  const bNodes = b.content ?? [];
  return { content: [...aNodes, divider, ...bNodes], type: 'doc' };
}

export function resolveConflict(conflictId: string, resolution: 'incoming' | 'keep' | 'merge'): void {
  const idx = queue.findIndex((c) => c.id === conflictId);
  if (idx === -1) return;
  const conflict = queue[idx]!;
  queue.splice(idx, 1);

  if (resolution === 'incoming') {
    putRecord({ content: conflict.incoming, id: conflict.noteId, updatedAt: Date.now() });
  } else if (resolution === 'merge') {
    const merged = mergeContent(conflict.local, conflict.incoming);
    putRecord({ content: merged, id: conflict.noteId, updatedAt: Date.now() });
  }
  // 'keep' → do nothing, local version stays

  notify();
}
