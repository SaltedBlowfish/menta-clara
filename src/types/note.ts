import type { JSONContent } from '@tiptap/react';

export interface Note {
  content: JSONContent;
  id: string;
  updatedAt: number;
}
