import type { JSONContent } from '@tiptap/react';

import { format } from 'date-fns';

import { useSyncNote } from '../sync/use-sync-note';
import { formatDateLabel } from './format-date-heading';

interface UseDailyNoteResult {
  dateLabel: string;
  isNew: boolean;
  legacyContent: JSONContent | null;
  loading: boolean;
  noteId: string;
}

export function useDailyNote(date: Date): UseDailyNoteResult {
  const noteId = 'daily:' + format(date, 'yyyy-MM-dd');
  const dateLabel = formatDateLabel(date);
  const { isNew, legacyContent, loading } = useSyncNote(noteId);

  return { dateLabel, isNew, legacyContent, loading, noteId };
}
