import type { JSONContent } from '@tiptap/react';

import { format } from 'date-fns';
import { unzipSync } from 'fflate';

import { storeImage } from '../image/use-image-store';
import { getDatabase, NOTES_STORE } from '../storage/database';
import { markdownToJson } from './tiptap-markdown';

function pathToNoteId(path: string): string | null {
  const name = path.replace(/\.md$/, '');
  if (name.startsWith('daily/')) return `daily:${name.slice(6)}`;
  if (name.startsWith('weekly/')) return `weekly:${name.slice(7)}`;
  if (name.startsWith('permanent/')) return `permanent:${name.slice(10)}`;
  if (name.startsWith('templates/')) return `template:${name.slice(10)}`;
  return null;
}

function addPrefix(id: string, wsId: string): string {
  return wsId === 'personal' ? id : `ws:${wsId}:${id}`;
}

async function importNote(md: string, noteId: string, wsId: string): Promise<void> {
  const fullId = addPrefix(noteId, wsId);
  const db = await getDatabase();
  const parsed = markdownToJson(md);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- DB record shape
  const existing = await db.get(NOTES_STORE, fullId);
  if (existing && typeof existing === 'object' && 'content' in existing) {
    const old = existing as { content: JSONContent; id: string };
    const heading: JSONContent = {
      attrs: { level: 2 },
      content: [{ text: `Imported on ${format(new Date(), 'MMMM d, yyyy')}`, type: 'text' }],
      type: 'heading',
    };
    const merged: JSONContent = {
      content: [...(old.content.content ?? []), heading, ...(parsed.content ?? [])],
      type: 'doc',
    };
    await db.put(NOTES_STORE, { content: merged, id: fullId, updatedAt: Date.now() });
  } else {
    await db.put(NOTES_STORE, { content: parsed, id: fullId, updatedAt: Date.now() });
  }
}

async function importImages(files: Record<string, Uint8Array>): Promise<void> {
  for (const [path, data] of Object.entries(files)) {
    if (!path.startsWith('images/')) continue;
    const ext = path.split('.').pop() ?? 'png';
    const mimeMap: Record<string, string> = { gif: 'image/gif', jpeg: 'image/jpeg', jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
    const blob = new Blob([data as BlobPart], { type: mimeMap[ext] ?? 'image/png' });
    await storeImage(blob, mimeMap[ext] ?? 'image/png');
  }
}

export async function importWorkspace(file: File, workspaceId: string): Promise<number> {
  if (file.name.endsWith('.md')) {
    const text = await file.text();
    await importNote(text, `daily:${file.name.replace(/\.md$/, '')}`, workspaceId);
    return 1;
  }
  if (!file.name.endsWith('.zip')) {
    throw new Error('Invalid file format. Please select a .zip or .md file.');
  }
  let files: Record<string, Uint8Array>;
  try {
    files = unzipSync(new Uint8Array(await file.arrayBuffer()));
  } catch {
    throw new Error('Invalid zip file. The file may be corrupted.');
  }
  await importImages(files);
  let count = 0;
  for (const [path, data] of Object.entries(files)) {
    if (!path.endsWith('.md')) continue;
    const noteId = pathToNoteId(path);
    if (!noteId) continue;
    try {
      await importNote(new TextDecoder().decode(data), noteId, workspaceId);
      count++;
    } catch { /* skip unparseable files */ }
  }
  return count;
}
