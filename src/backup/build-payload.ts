import type { JSONContent } from '@tiptap/react';

import { getDatabase, HISTORY_STORE, IMAGES_STORE, NOTES_STORE } from '../storage/database';
import { jsonToMarkdown } from '../export/tiptap-markdown';

export interface BackupPayload {
  timestamp: string;
  notes: Array<{
    id: string;
    markdown: string;
    json: JSONContent;
    updatedAt?: number;
    history: Array<{
      timestamp: number;
      markdown: string;
      json: JSONContent;
    }>;
  }>;
  images: Array<{
    id: string;
    mimeType: string;
    base64: string;
  }>;
  meta: { noteCount: number; imageCount: number };
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

export async function buildPayload(): Promise<BackupPayload> {
  const db = await getDatabase();

  const [rawNotes, rawHistory, rawImages] = await Promise.all([
    db.getAll(NOTES_STORE),
    db.getAll(HISTORY_STORE),
    db.getAll(IMAGES_STORE),
  ]);

  const historyByNote = new Map<string, Array<{ timestamp: number; markdown: string; json: JSONContent }>>();
  for (const h of rawHistory) {
    const noteId = h.noteId as string;
    if (!historyByNote.has(noteId)) historyByNote.set(noteId, []);
    historyByNote.get(noteId)!.push({
      timestamp: h.timestamp as number,
      markdown: jsonToMarkdown(h.content as JSONContent),
      json: h.content as JSONContent,
    });
  }

  const notes = rawNotes.map((n) => {
    const base = {
      id: n.id as string,
      markdown: n.content ? jsonToMarkdown(n.content as JSONContent) : '',
      json: (n.content ?? {}) as JSONContent,
      history: historyByNote.get(n.id as string) ?? [],
    };
    return n.updatedAt != null ? { ...base, updatedAt: n.updatedAt as number } : base;
  });

  const images = rawImages.map((img) => ({
    id: img.id as string,
    mimeType: (img.mimeType ?? 'application/octet-stream') as string,
    base64: arrayBufferToBase64(img.data as ArrayBuffer),
  }));

  return {
    timestamp: new Date().toISOString(),
    notes,
    images,
    meta: { noteCount: notes.length, imageCount: images.length },
  };
}
