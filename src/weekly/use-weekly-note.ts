import type { JSONContent } from '@tiptap/react';

import { useMemo } from 'react';

import { useNote } from '../storage/use-note';
import { getWeekId, getWeekNumber } from './get-week-id';

const DEFAULT_CONTENT: JSONContent = {
  content: [{ content: [], type: 'paragraph' }],
  type: 'doc',
};

interface UseWeeklyNoteResult {
  content: JSONContent | null;
  error: string | null;
  loading: boolean;
  saveContent: (content: JSONContent) => void;
  weekLabel: string;
  weekNoteId: string;
}

export function useWeeklyNote(date: Date, defaultContent?: JSONContent): UseWeeklyNoteResult {
  const weekNoteId = getWeekId(date);
  const weekLabel = `Week ${String(getWeekNumber(date))}`;
  const { content, error, loading, saveContent } = useNote(weekNoteId);

  const displayContent = useMemo(() => {
    if (content !== null) return content;
    if (loading) return null;
    return defaultContent ?? DEFAULT_CONTENT;
  }, [content, defaultContent, loading]);

  return { content: displayContent, error, loading, saveContent, weekLabel, weekNoteId };
}
