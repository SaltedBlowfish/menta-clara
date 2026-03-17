import type { JSONContent } from '@tiptap/react';

import { useNote } from '../storage/use-note';
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
  const { content, error, loading, saveContent } = useNote(weekNoteId);

  const isNew = !loading && content === null;

  return { content, error, isNew, loading, saveContent, weekLabel, weekNoteId };
}
