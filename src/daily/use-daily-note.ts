import type { JSONContent } from '@tiptap/react';

import { format } from 'date-fns';
import { useMemo } from 'react';

import { useNote } from '../storage/use-note';
import { formatDateLabel } from './format-date-heading';

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

  const displayContent = useMemo(() => {
    if (content !== null) return content;
    if (loading) return null;
    return { content: [{ content: [], type: 'paragraph' }], type: 'doc' } as JSONContent;
  }, [content, loading]);

  return { content: displayContent, dateLabel, error, loading, noteId, saveContent };
}
