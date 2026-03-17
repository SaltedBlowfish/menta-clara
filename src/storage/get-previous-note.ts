import type { JSONContent } from '@tiptap/react';

import type { Note } from '../types/note';

import { getDatabase, NOTES_STORE } from './database';

/**
 * Finds the most recent note before the given noteId within the same prefix (daily: or weekly:).
 * Returns the content if found, null otherwise.
 */
export async function getPreviousNoteContent(
  noteId: string,
): Promise<JSONContent | null> {
  const prefix = noteId.split(':')[0] + ':';
  const db = await getDatabase();
  const range = IDBKeyRange.bound(prefix, noteId, false, true);
  const cursor = await db
    .transaction(NOTES_STORE, 'readonly')
    .store.openCursor(range, 'prev');

  if (!cursor) return null;

  const note = cursor.value as Note;
  return note.content;
}
