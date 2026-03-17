import type { JSONContent } from '@tiptap/react';

import { useCallback, useSyncExternalStore } from 'react';

import type { Note } from '../types/note';

import { deleteRecord, getRecord, hasRecord, putRecord, requestLoad, subscribe } from './db-cache';

function isNote(value: unknown): value is Note {
  return typeof value === 'object' && value !== null && 'content' in value;
}

function isEmptyContent(content: JSONContent): boolean {
  const nodes = content.content;
  if (!nodes || nodes.length === 0) return true;
  return nodes.every((node) =>
    node.type === 'paragraph' && (!node.content || node.content.length === 0),
  );
}

interface UseNoteResult {
  content: JSONContent | null;
  error: string | null;
  loading: boolean;
  saveContent: (content: JSONContent) => void;
}

export function useNote(noteId = 'current'): UseNoteResult {
  const raw = useSyncExternalStore(subscribe, () => getRecord(noteId));

  if (!hasRecord(noteId)) {
    requestLoad(noteId);
  }

  const loading = !hasRecord(noteId);
  const content = isNote(raw) ? raw.content : null;

  const saveContent = useCallback((newContent: JSONContent) => {
    // Always save, even if empty. Deleting notes on keystroke causes the
    // editor to unmount via the carry-over flow. Cleanup of genuinely
    // abandoned empty notes happens on navigation instead.
    putRecord({ content: newContent, id: noteId, updatedAt: Date.now() });
  }, [noteId]);

  return { content, error: null, loading, saveContent };
}

/**
 * Delete a note if its content is empty. Call this on navigation
 * (e.g. when the user switches to a different day) — never during typing.
 */
export function cleanupIfEmpty(noteId: string): void {
  const raw = getRecord(noteId);
  if (isNote(raw) && isEmptyContent(raw.content)) {
    deleteRecord(noteId);
  }
}
