import type { JSONContent } from '@tiptap/react';

import { useCallback, useRef, useState } from 'react';

import { getPreviousNoteContent } from '../storage/get-previous-note';

const BLANK_CONTENT: JSONContent = {
  content: [{ content: [], type: 'paragraph' }],
  type: 'doc',
};

interface UseCarryOverResult {
  carryOver: 'pending' | 'prompt' | 'resolved';
  handleCarryOver: () => void;
  handleStartBlank: () => void;
  resolvedContent: JSONContent | null;
}

export function useCarryOver(noteId: string, isNew: boolean): UseCarryOverResult {
  const [carryOver, setCarryOver] = useState<'pending' | 'prompt' | 'resolved'>('resolved');
  const [resolvedContent, setResolvedContent] = useState<JSONContent | null>(null);
  const previousContentRef = useRef<JSONContent | null>(null);
  const lastCheckedNoteId = useRef<string>('');
  const prevIsNew = useRef(isNew);

  if (prevIsNew.current && !isNew) {
    lastCheckedNoteId.current = '';
    setCarryOver('resolved');
    setResolvedContent(null);
  }
  prevIsNew.current = isNew;

  if (isNew && lastCheckedNoteId.current !== noteId) {
    lastCheckedNoteId.current = noteId;
    setCarryOver('pending');
    setResolvedContent(null);

    void getPreviousNoteContent(noteId).then((prev) => {
      if (lastCheckedNoteId.current !== noteId) return;
      if (prev) {
        previousContentRef.current = prev;
        setCarryOver('prompt');
      } else {
        setResolvedContent(BLANK_CONTENT);
        setCarryOver('resolved');
      }
    });
  }

  const handleCarryOver = useCallback(() => {
    if (previousContentRef.current) {
      setResolvedContent(previousContentRef.current);
    }
    setCarryOver('resolved');
  }, []);

  const handleStartBlank = useCallback(() => {
    setResolvedContent(BLANK_CONTENT);
    setCarryOver('resolved');
  }, []);

  return { carryOver, handleCarryOver, handleStartBlank, resolvedContent };
}
