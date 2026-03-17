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
  // Only empty if every node is a blank paragraph (no text, no other node types).
  // Headings, lists, blockquotes etc. are never considered empty — even without
  // text — because their presence means the user intentionally created them.
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
    if (isEmptyContent(newContent)) {
      deleteRecord(noteId);
    } else {
      putRecord({ content: newContent, id: noteId, updatedAt: Date.now() });
    }
  }, [noteId]);

  return { content, error: null, loading, saveContent };
}
