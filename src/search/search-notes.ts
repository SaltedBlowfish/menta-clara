import type { JSONContent } from '@tiptap/react';
import { format, parseISO } from 'date-fns';

import { getDatabase, NOTES_STORE } from '../storage/database';

export interface SearchResult {
  noteId: string;
  noteType: 'daily' | 'permanent' | 'weekly';
  snippet: string;
  title: string;
}

function extractText(json: JSONContent): string {
  if (json.type === 'text' && json.text) {
    return json.text;
  }
  if (!json.content) {
    return '';
  }
  return json.content.map(extractText).join(' ');
}

function noteTitle(noteId: string, permanentNames: Record<string, string>): string {
  if (noteId.startsWith('daily:')) {
    const dateStr = noteId.slice('daily:'.length);
    return format(parseISO(dateStr), 'MMMM d, yyyy');
  }
  if (noteId.startsWith('weekly:')) {
    const weekStr = noteId.slice('weekly:'.length);
    const weekNum = weekStr.split('-W')[1] ?? weekStr;
    return `Week ${weekNum}`;
  }
  const uuid = noteId.startsWith('permanent:') ? noteId.slice('permanent:'.length) : noteId;
  return permanentNames[uuid] ?? 'Untitled';
}

function makeSnippet(text: string, query: string): string {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, 80);
  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + query.length + 40);
  return (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '');
}

function noteType(id: string): 'daily' | 'permanent' | 'weekly' {
  if (id.startsWith('daily:') || id.includes(':daily:')) return 'daily';
  if (id.startsWith('weekly:') || id.includes(':weekly:')) return 'weekly';
  return 'permanent';
}

function matchesWorkspace(key: string, workspaceId: string): boolean {
  if (workspaceId === 'personal') {
    return !key.startsWith('ws:') && !key.startsWith('setting:');
  }
  return key.startsWith(`ws:${workspaceId}:`);
}

export async function searchNotes(
  query: string,
  workspaceId: string,
): Promise<ReadonlyArray<SearchResult>> {
  if (!query.trim()) return [];
  const db = await getDatabase();
  const allKeys = await db.getAllKeys(NOTES_STORE);
  const results: SearchResult[] = [];
  const namesRecord = await db.get(NOTES_STORE, 'setting:permanentNames');
  const permanentNames: Record<string, string> =
    (namesRecord as { names?: Record<string, string> } | undefined)?.names ?? {};

  for (const key of allKeys) {
    const id = String(key);
    if (!matchesWorkspace(id, workspaceId)) continue;
    const note = await db.get(NOTES_STORE, id) as { content?: JSONContent } | undefined;
    if (!note?.content) continue;
    const text = extractText(note.content);
    if (!text.toLowerCase().includes(query.toLowerCase())) continue;
    const baseId = id.startsWith('ws:') ? id.split(':').slice(2).join(':') : id;
    results.push({
      noteId: id,
      noteType: noteType(baseId),
      snippet: makeSnippet(text, query),
      title: noteTitle(baseId, permanentNames),
    });
    if (results.length >= 20) break;
  }
  return results;
}
