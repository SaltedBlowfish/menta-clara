import type { JSONContent } from '@tiptap/react';

import { format } from 'date-fns';

import { useNote } from '../storage/use-note';
import { formatDateLabel } from './format-date-heading';

interface UseDailyNoteResult {
  content: JSONContent | null;
  dateLabel: string;
  isNew: boolean;
  loading: boolean;
  noteId: string;
  saveContent: (content: JSONContent) => void;
}

export function useDailyNote(date: Date): UseDailyNoteResult {
  const noteId = 'daily:' + format(date, 'yyyy-MM-dd');
  const dateLabel = formatDateLabel(date);
  const { content, loading, saveContent } = useNote(noteId);

  return {
    content,
    dateLabel,
    isNew: !loading && content === null,
    loading,
    noteId,
    saveContent,
  };
}
