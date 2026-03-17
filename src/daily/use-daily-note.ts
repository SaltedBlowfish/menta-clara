import type { JSONContent } from '@tiptap/react';

import { format } from 'date-fns';
import { useMemo } from 'react';

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

export function useDailyNote(date: Date, defaultContent?: JSONContent): UseDailyNoteResult {
  const noteId = 'daily:' + format(date, 'yyyy-MM-dd');
  const dateLabel = formatDateLabel(date);
  const { content, error, loading, saveContent } = useNote(noteId);

  const displayContent = useMemo(() => {
    if (content !== null) return content;
    if (loading) return null;
    const heading = formatDateHeading(date);
    if (defaultContent) {
      return {
        content: [...(heading.content ?? []), ...(defaultContent.content ?? [])],
        type: 'doc',
      } as JSONContent;
    }
    return heading;
  }, [content, date, defaultContent, loading]);

  return { content: displayContent, dateLabel, error, loading, noteId, saveContent };
}
