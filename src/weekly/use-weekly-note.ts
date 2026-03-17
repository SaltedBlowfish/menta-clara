import type { JSONContent } from '@tiptap/react';

import { useRef } from 'react';

import { cleanupIfEmpty, useNote } from '../storage/use-note';
import { getWeekId, getWeekNumber } from './get-week-id';

interface UseWeeklyNoteResult {
  content: JSONContent | null;
  error: string | null;
  isNew: boolean;
  loading: boolean;
  saveContent: (content: JSONContent) => void;
  weekLabel: string;
  weekNoteId: string;
}

export function useWeeklyNote(date: Date): UseWeeklyNoteResult {
  const weekNoteId = getWeekId(date);
  const weekLabel = `Week ${String(getWeekNumber(date))}`;
  const prevNoteId = useRef(weekNoteId);

  if (prevNoteId.current !== weekNoteId) {
    cleanupIfEmpty(prevNoteId.current);
    prevNoteId.current = weekNoteId;
  }

  const { content, error, loading, saveContent } = useNote(weekNoteId);
  const isNew = !loading && content === null;

  return { content, error, isNew, loading, saveContent, weekLabel, weekNoteId };
}
