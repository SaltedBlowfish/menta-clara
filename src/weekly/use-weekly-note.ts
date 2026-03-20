import type { JSONContent } from '@tiptap/react';

import { useSyncNote } from '../sync/use-sync-note';
import { getWeekId, getWeekNumber } from './get-week-id';

interface UseWeeklyNoteResult {
  isNew: boolean;
  legacyContent: JSONContent | null;
  loading: boolean;
  weekLabel: string;
  weekNoteId: string;
}

export function useWeeklyNote(date: Date): UseWeeklyNoteResult {
  const weekNoteId = getWeekId(date);
  const weekLabel = `Week ${String(getWeekNumber(date))}`;
  const { isNew, legacyContent, loading } = useSyncNote(weekNoteId);

  return { isNew, legacyContent, loading, weekLabel, weekNoteId };
}
