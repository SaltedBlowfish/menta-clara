import type { JSONContent } from '@tiptap/react';

import { format } from 'date-fns';
import { useEffect, useRef } from 'react';

import { useNote } from '../storage/use-note';
import { formatDateHeading, formatDateLabel } from './format-date-heading';

interface UseDailyNoteResult {
  content: JSONContent | null;
  dateLabel: string;
  error: string | null;
  loading: boolean;
  noteId: string;
  saveContent: (content: JSONContent) => void;
}

export function useDailyNote(date: Date): UseDailyNoteResult {
  const noteId = 'daily:' + format(date, 'yyyy-MM-dd');
  const dateLabel = formatDateLabel(date);
  const { content, error, loading, saveContent } = useNote(noteId);
  const autoCreatedRef = useRef(false);

  useEffect(() => {
    if (!loading && content === null && !autoCreatedRef.current) {
      autoCreatedRef.current = true;
      saveContent(formatDateHeading(date));
    }
  }, [content, date, loading, saveContent]);

  useEffect(() => {
    autoCreatedRef.current = false;
  }, [noteId]);

  return { content, dateLabel, error, loading, noteId, saveContent };
}
