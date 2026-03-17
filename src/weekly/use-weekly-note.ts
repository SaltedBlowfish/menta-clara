import type { JSONContent } from '@tiptap/react';

import { useEffect, useRef } from 'react';

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
  const autoCreated = useRef(false);

  useEffect(() => {
    if (!loading && content === null && !autoCreated.current) {
      autoCreated.current = true;
      saveContent(defaultContent ?? DEFAULT_CONTENT);
    }
  }, [content, defaultContent, loading, saveContent]);

  return { content, error, loading, saveContent, weekLabel, weekNoteId };
}
