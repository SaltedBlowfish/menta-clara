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

function rewriteImageSrcs(json: JSONContent, imageMap: Map<string, string>): JSONContent {
  if (json.type === 'image') {
    const imageId = json.attrs?.['data-image-id'] as string | undefined;
    if (imageId && imageMap.has(imageId)) {
      return { ...json, attrs: { ...json.attrs, src: imageMap.get(imageId) } };
    }
  }
  if (json.content) {
    return { ...json, content: json.content.map((c) => rewriteImageSrcs(c, imageMap)) };
  }
  return json;
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

  const images = await Promise.all(rawImages.map(async (img) => {
    const blob = img.blob as Blob | undefined;
    const buffer = blob ? await blob.arrayBuffer() : new ArrayBuffer(0);
    const mimeType = (img.mimeType ?? 'application/octet-stream') as string;
    return {
      id: img.id as string,
      mimeType,
      base64: arrayBufferToBase64(buffer),
    };
  }));

  // Map image IDs to filenames so markdown can reference them
  const imageMap = new Map<string, string>();
  for (const img of images) {
    const ext = img.mimeType.split('/')[1] ?? 'bin';
    imageMap.set(img.id, `images/${img.id}.${ext}`);
  }

  // Re-convert markdown with image paths instead of blob URLs
  for (const note of notes) {
    const json = (rawNotes.find((n) => (n.id as string) === note.id)?.content ?? {}) as JSONContent;
    note.markdown = json.type ? jsonToMarkdown(rewriteImageSrcs(json, imageMap)) : '';
  }

  return {
    timestamp: new Date().toISOString(),
    notes,
    images,
    meta: { noteCount: notes.length, imageCount: images.length },
  };
}
