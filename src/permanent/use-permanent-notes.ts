import { useCallback, useMemo, useSyncExternalStore } from 'react';

import { usePersistedState } from '../shared/use-persisted-state';
import { deleteRecord, getRangeRecords, putRecord, requestRangeLoad, subscribe } from '../storage/db-cache';

interface PermanentNote {
  id: string;
  name: string;
}

interface UsePermanentNotesResult {
  createNote: (name: string) => void;
  deleteNote: (noteId: string) => void;
  loading: boolean;
  notes: ReadonlyArray<PermanentNote>;
  renameNote: (noteId: string, name: string) => void;
  selectedNoteId: string | null;
  selectNote: (noteId: string) => void;
}

const RANGE_PREFIX = 'permanent:';

export function usePermanentNotes(): UsePermanentNotesResult {
  const [names, setNames] = usePersistedState<Record<string, string>>(
    'setting:permanentNames',
    {},
  );
  const [selectedNoteId, setSelectedNoteId] =
    usePersistedState<string | null>('setting:selectedPermanentNote', null);

  const rangeRecords = useSyncExternalStore(subscribe, () => getRangeRecords(RANGE_PREFIX));
  if (rangeRecords === undefined) {
    requestRangeLoad(RANGE_PREFIX);
  }

  const loading = rangeRecords === undefined;

  const noteIds = useMemo(() => {
    if (!rangeRecords) return [];
    return rangeRecords
      .filter((r): r is { id: string } => typeof r === 'object' && r !== null && 'id' in r)
      .map((r) => r.id);
  }, [rangeRecords]);

  const notes: ReadonlyArray<PermanentNote> = useMemo(
    () => noteIds.map((id) => ({ id, name: names[id] ?? 'Untitled' })),
    [noteIds, names],
  );

  const createNote = useCallback(
    (name: string) => {
      const uuid = crypto.randomUUID();
      const noteId = `permanent:${uuid}`;

      putRecord({
        content: { content: [{ content: [], type: 'paragraph' }], type: 'doc' },
        id: noteId,
        updatedAt: Date.now(),
      });

      setNames({ ...names, [noteId]: name });
      setSelectedNoteId(noteId);
    },
    [names, setNames, setSelectedNoteId],
  );

  const deleteNote = useCallback(
    (noteId: string) => {
      deleteRecord(noteId);

      const updated = { ...names };
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- cleaning up deleted note entry
      delete updated[noteId];
      setNames(updated);

      if (selectedNoteId === noteId) {
        const remaining = noteIds.filter((id) => id !== noteId);
        setSelectedNoteId(remaining.length > 0 ? (remaining[0] ?? null) : null);
      }
    },
    [names, noteIds, selectedNoteId, setNames, setSelectedNoteId],
  );

  const renameNote = useCallback(
    (noteId: string, name: string) => {
      setNames({ ...names, [noteId]: name });
    },
    [names, setNames],
  );

  const selectNote = useCallback(
    (noteId: string) => {
      setSelectedNoteId(noteId);
    },
    [setSelectedNoteId],
  );

  return { createNote, deleteNote, loading, notes, renameNote, selectedNoteId, selectNote };
}
