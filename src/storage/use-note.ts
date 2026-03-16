import type { JSONContent } from '@tiptap/react';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { Note } from '../types/note';

import { getDatabase, NOTES_STORE } from './database';

function isNote(value: unknown): value is Note {
  return typeof value === 'object' && value !== null && 'content' in value;
}

const SAVE_DEBOUNCE_MS = 300;
const SAVE_ERROR_MESSAGE =
  'Could not save your note. Check that your browser has available storage space.';

interface UseNoteResult {
  content: JSONContent | null;
  error: string | null;
  loading: boolean;
  saveContent: (content: JSONContent) => void;
}

export function useNote(noteId = 'current'): UseNoteResult {
  const [content, setContent] = useState<JSONContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<JSONContent | null>(null);

  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;

    try {
      const db = await getDatabase();
      const note: Note = { content: pending, id: noteId, updatedAt: Date.now() };
      await db.put(NOTES_STORE, note);
      setError(null);
    } catch {
      setError(SAVE_ERROR_MESSAGE);
    }
  }, [noteId]);

  const saveContent = useCallback(
    (newContent: JSONContent) => {
      pendingRef.current = newContent;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        void flush();
      }, SAVE_DEBOUNCE_MS);
    },
    [flush],
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const db = await getDatabase();
        const raw: unknown = await db.get(NOTES_STORE, noteId);
        if (!cancelled) {
          setContent(isNote(raw) ? raw.content : null);
        }
      } catch {
        if (!cancelled) setError(SAVE_ERROR_MESSAGE);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [noteId]);

  useEffect(() => {
    const handleBlur = () => { void flush(); };
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') void flush();
    };
    const handleUnload = () => { void flush(); };

    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [flush]);

  return { content, error, loading, saveContent };
}
