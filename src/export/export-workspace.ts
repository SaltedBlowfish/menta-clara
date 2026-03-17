import type { JSONContent } from '@tiptap/react';

import { strToU8, zipSync } from 'fflate';

import { getDatabase, IMAGES_STORE, NOTES_STORE } from '../storage/database';
import { jsonToMarkdown } from './tiptap-markdown';

interface NoteRecord {
  content: JSONContent;
  id: string;
}

function isNoteRecord(v: unknown): v is NoteRecord {
  return typeof v === 'object' && v !== null && 'id' in v && 'content' in v;
}

function mimeToExt(mime: string): string {
  const map: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp' };
  return map[mime] ?? 'png';
}

function noteToPath(id: string, names: Record<string, string>): string | null {
  if (id.startsWith('daily:')) return `daily/${id.slice(6)}.md`;
  if (id.startsWith('weekly:')) return `weekly/${id.slice(7)}.md`;
  if (id.startsWith('permanent:')) {
    const key = id.slice(10);
    const name = names[key] ?? key;
    return `permanent/${name}.md`;
  }
  if (id.startsWith('template:')) return `templates/${id.slice(9)}.md`;
  return null;
}

function stripWorkspacePrefix(id: string, workspaceId: string): string {
  if (workspaceId === 'personal') return id;
  const prefix = `ws:${workspaceId}:`;
  return id.startsWith(prefix) ? id.slice(prefix.length) : id;
}

export async function exportWorkspace(workspaceId: string): Promise<Blob> {
  const db = await getDatabase();
  const allNotes = await db.getAll(NOTES_STORE);
  const allImages = await db.getAll(IMAGES_STORE);

  const prefix = workspaceId === 'personal' ? '' : `ws:${workspaceId}:`;
  const notes = allNotes.filter(isNoteRecord).filter((n) =>
    prefix ? n.id.startsWith(prefix) : !n.id.startsWith('ws:'),
  );

  const namesRec = notes.find((n) => stripWorkspacePrefix(n.id, workspaceId) === 'setting:permanentNames');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- DB record shape
  const names: Record<string, string> = namesRec ? (namesRec.content as unknown as Record<string, string>) : {};
  const imageMap = new Map<string, string>();
  const files: Record<string, Uint8Array> = {};

  // Process images
  for (const img of allImages) {
    if (typeof img !== 'object' || img === null || !('id' in img) || !('blob' in img) || !('mimeType' in img)) continue;
    const rec = img as { blob: Blob; id: string; mimeType: string };
    if (prefix && !rec.id.startsWith(prefix) && rec.id.startsWith('ws:')) continue;
    if (!prefix && rec.id.startsWith('ws:')) continue;
    const ext = mimeToExt(rec.mimeType);
    const filename = `${rec.id.replace(/[^a-zA-Z0-9-_:]/g, '_')}.${ext}`;
    imageMap.set(rec.id, filename);
    const buf = await rec.blob.arrayBuffer();
    files[`images/${filename}`] = new Uint8Array(buf);
  }

  // Process notes
  for (const note of notes) {
    const bareId = stripWorkspacePrefix(note.id, workspaceId);
    if (bareId.startsWith('setting:')) continue;
    const path = noteToPath(bareId, names);
    if (!path) continue;
    let md = jsonToMarkdown(note.content);
    // Rewrite image references to relative paths
    for (const [imgId, filename] of imageMap) {
      md = md.replaceAll(imgId, `../images/${filename}`);
    }
    files[path] = strToU8(md);
  }

  files['settings.json'] = strToU8(JSON.stringify({ permanentNames: names }, null, 2));
  const zipped = zipSync(files);
  const blob = new Blob([zipped], { type: 'application/zip' });

  // Trigger download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${workspaceId}-export.zip`;
  a.click();
  URL.revokeObjectURL(url);

  return blob;
}
