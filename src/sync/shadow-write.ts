import type { JSONContent } from '@tiptap/react';

import { putRecord } from '../storage/db-cache';
import { maybeSnapshot } from './note-history';

export function createShadowWrite(noteId: string) {
  return (content: JSONContent) => {
    putRecord({ content, id: noteId, updatedAt: Date.now() });
    maybeSnapshot(noteId, content);
  };
}
