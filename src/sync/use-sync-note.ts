import type { JSONContent } from '@tiptap/react';

import { useCallback, useSyncExternalStore } from 'react';

import { getRecord, hasRecord, requestLoad, subscribe } from '../storage/db-cache';
import { getWorkspaceDoc } from './doc-store';
import { getSyncSnapshot, subscribeSyncState } from './sync-state';

interface LegacyNote {
  content: JSONContent;
}

function isLegacyNote(value: unknown): value is LegacyNote {
  return typeof value === 'object' && value !== null && 'content' in value;
}

interface SyncNoteResult {
  isNew: boolean;
  legacyContent: JSONContent | null;
  loading: boolean;
}

export function useSyncNote(noteId: string): SyncNoteResult {
  const { dbLoaded } = useSyncExternalStore(subscribeSyncState, getSyncSnapshot);
  const ydoc = getWorkspaceDoc();

  const fragmentSubscribe = useCallback(
    (cb: () => void) => {
      const fragment = ydoc.getXmlFragment(noteId);
      fragment.observe(cb);
      return () => fragment.unobserve(cb);
    },
    [noteId, ydoc],
  );

  const getFragmentLength = useCallback(
    () => ydoc.getXmlFragment(noteId).length,
    [noteId, ydoc],
  );

  const fragmentLength = useSyncExternalStore(fragmentSubscribe, getFragmentLength);

  // Check old IndexedDB for legacy content to migrate
  const legacyRaw = useSyncExternalStore(subscribe, () => getRecord(noteId));
  if (!hasRecord(noteId)) {
    requestLoad(noteId);
  }

  const fragmentEmpty = dbLoaded && fragmentLength === 0;
  const legacyContent = fragmentEmpty && isLegacyNote(legacyRaw) ? legacyRaw.content : null;

  return {
    isNew: fragmentEmpty && !legacyContent,
    legacyContent,
    loading: !dbLoaded,
  };
}
