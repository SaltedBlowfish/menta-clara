import { useCallback, useEffect, useState } from 'react';

import { usePersistedState } from '../shared/use-persisted-state';
import { getDatabase, NOTES_STORE } from '../storage/database';

interface PermanentNote {
  id: string;
  name: string;
}

interface UsePermanentNotesResult {
  createNote: (name: string) => Promise<string>;
  deleteNote: (noteId: string) => Promise<void>;
  loading: boolean;
  notes: ReadonlyArray<PermanentNote>;
  selectedNoteId: string | null;
  selectNote: (noteId: string) => void;
}

export function usePermanentNotes(): UsePermanentNotesResult {
  const [names, setNames] = usePersistedState<Record<string, string>>(
    'setting:permanentNames',
    {},
  );
  const [selectedNoteId, setSelectedNoteId] =
    usePersistedState<string | null>('setting:selectedPermanentNote', null);
  const [loading, setLoading] = useState(true);
  const [noteIds, setNoteIds] = useState<ReadonlyArray<string>>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const db = await getDatabase();
      const range = IDBKeyRange.bound('permanent:', 'permanent:\uffff');
      const keys = await db.getAllKeys(NOTES_STORE, range);

      if (!cancelled) {
        setNoteIds(keys.map(String));
        setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const notes: ReadonlyArray<PermanentNote> = noteIds.map((id) => ({
    id,
    name: names[id] ?? 'Untitled',
  }));

  const createNote = useCallback(
    async (name: string): Promise<string> => {
      const uuid = crypto.randomUUID();
      const noteId = `permanent:${uuid}`;
      const db = await getDatabase();

      await db.put(NOTES_STORE, {
        content: { content: [{ content: [], type: 'paragraph' }], type: 'doc' },
        id: noteId,
        updatedAt: Date.now(),
      });

      setNoteIds((prev) => [...prev, noteId]);
      setNames({ ...names, [noteId]: name });
      setSelectedNoteId(noteId);

      return noteId;
    },
    [names, setNames, setSelectedNoteId],
  );

  const deleteNote = useCallback(
    async (noteId: string): Promise<void> => {
      const db = await getDatabase();
      await db.delete(NOTES_STORE, noteId);

      const updated = { ...names };
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- cleaning up deleted note entry
      delete updated[noteId];
      setNames(updated);
      setNoteIds((prev) => prev.filter((id) => id !== noteId));

      if (selectedNoteId === noteId) {
        const remaining = noteIds.filter((id) => id !== noteId);
        setSelectedNoteId(remaining.length > 0 ? (remaining[0] ?? null) : null);
      }
    },
    [names, noteIds, selectedNoteId, setNames, setSelectedNoteId],
  );

  const selectNote = useCallback(
    (noteId: string) => {
      setSelectedNoteId(noteId);
    },
    [setSelectedNoteId],
  );

  return { createNote, deleteNote, loading, notes, selectedNoteId, selectNote };
}
