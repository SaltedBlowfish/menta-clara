import { IndexeddbPersistence } from 'y-indexeddb';
import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';

// ── Y.Doc management ──
// Each note gets its own Y.Doc. Documents are cached and reused.

const docs = new Map<string, Y.Doc>();
const persistence = new Map<string, IndexeddbPersistence>();
const providers = new Map<string, WebrtcProvider>();

const DB_PREFIX = 'menta-clara-yjs-';

export function getYDoc(noteId: string): Y.Doc {
  let doc = docs.get(noteId);
  if (doc) return doc;

  doc = new Y.Doc();
  docs.set(noteId, doc);

  // Persist to IndexedDB
  const idb = new IndexeddbPersistence(DB_PREFIX + noteId, doc);
  persistence.set(noteId, idb);

  // If we're in a sync room, connect this doc
  if (currentRoom) {
    connectDocToRoom(noteId, doc, currentRoom);
  }

  return doc;
}

/**
 * Check if a note has any content in its Yjs doc.
 * Returns true if the Y.XmlFragment has child nodes.
 */
export function hasYDocContent(noteId: string): boolean {
  const doc = docs.get(noteId);
  if (!doc) return false;
  const fragment = doc.getXmlFragment('prosemirror');
  return fragment.length > 0;
}

// ── Sync room management ──

let currentRoom: string | null = null;

export type SyncStatus = 'connected' | 'connecting' | 'disconnected';

const statusListeners = new Set<() => void>();
let currentStatus: SyncStatus = 'disconnected';
let currentCode = '';
let connectedPeers = 0;

function notifyStatus() {
  for (const cb of statusListeners) cb();
}

function setStatus(s: SyncStatus) {
  currentStatus = s;
  notifyStatus();
}

export function subscribeStatus(cb: () => void): () => void {
  statusListeners.add(cb);
  return () => { statusListeners.delete(cb); };
}

export function getStatus(): SyncStatus {
  return currentStatus;
}

export function getCode(): string {
  return currentCode;
}

export function getPeerCount(): number {
  return connectedPeers;
}

// ── Connect/disconnect docs to WebRTC room ──

const ROOM_PREFIX = 'menta-clara-';

function connectDocToRoom(noteId: string, doc: Y.Doc, room: string) {
  // Don't double-connect
  if (providers.has(noteId)) return;

  const provider = new WebrtcProvider(ROOM_PREFIX + room + '-' + noteId, doc, {
    signaling: [
      'wss://signaling.yjs.dev',
      'wss://y-webrtc-signaling-eu.herokuapp.com',
      'wss://y-webrtc-signaling-us.herokuapp.com',
    ],
  });

  provider.on('peers', (event: { webrtcPeers: string[] }) => {
    connectedPeers = event.webrtcPeers.length;
    setStatus(connectedPeers > 0 ? 'connected' : 'connecting');
  });

  providers.set(noteId, provider);
}

function disconnectDoc(noteId: string) {
  const provider = providers.get(noteId);
  if (provider) {
    provider.destroy();
    providers.delete(noteId);
  }
}

// ── Session persistence ──

const SESSION_KEY = 'menta-clara-sync-room';

function saveSession(room: string) {
  sessionStorage.setItem(SESSION_KEY, room);
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

function getSavedSession(): string | null {
  return sessionStorage.getItem(SESSION_KEY);
}

// ── Public API ──

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function startSync(existingCode?: string): string {
  disconnectSync();

  const code = existingCode ?? generateCode();
  currentRoom = code;
  currentCode = code;
  setStatus('connecting');
  saveSession(code);

  // Connect all existing docs to the room
  for (const [noteId, doc] of docs) {
    connectDocToRoom(noteId, doc, code);
  }

  return code;
}

export function joinSync(code: string): void {
  const normalized = code.toUpperCase().replace(/\s/g, '');
  startSync(normalized);
}

export function disconnectSync(): void {
  for (const noteId of providers.keys()) {
    disconnectDoc(noteId);
  }
  providers.clear();
  currentRoom = null;
  currentCode = '';
  connectedPeers = 0;
  clearSession();
  setStatus('disconnected');
}

export function restoreSession(): void {
  const room = getSavedSession();
  if (room) {
    startSync(room);
  }
}
