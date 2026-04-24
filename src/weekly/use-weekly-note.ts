import type { JSONContent } from '@tiptap/react';

import { useNote } from '../storage/use-note';
import { getWeekId, getWeekNumber } from './get-week-id';

interface UseWeeklyNoteResult {
  content: JSONContent | null;
  isNew: boolean;
  loading: boolean;
  saveContent: (content: JSONContent) => void;
  weekLabel: string;
  weekNoteId: string;
}

export function useWeeklyNote(date: Date): UseWeeklyNoteResult {
  const weekNoteId = getWeekId(date);
  const weekLabel = `Week ${String(getWeekNumber(date))}`;
  const { content, loading, saveContent } = useNote(weekNoteId);

  return {
    content,
    isNew: !loading && content === null,
    loading,
    saveContent,
    weekLabel,
    weekNoteId,
  };
}
