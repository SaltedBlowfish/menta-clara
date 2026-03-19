import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';

import { getDatabase, NOTES_STORE } from '../storage/database';
import { putRecordSilent, putRecordsBatch, setOnRecordChange } from '../storage/db-cache';

// ── Types ──

interface SyncMessage {
  notes: SyncNote[];
  type: 'sync';
}

interface UpdateMessage {
  note: SyncNote;
  type: 'update';
}

type Message = SyncMessage | UpdateMessage;

interface SyncNote {
  [key: string]: unknown;
  id: string;
  updatedAt: number;
}

function isSyncNote(v: unknown): v is SyncNote {
  return typeof v === 'object' && v !== null && 'id' in v && 'updatedAt' in v;
}

// ── State ──

export type SyncStatus = 'connected' | 'connecting' | 'disconnected' | 'error' | 'waiting';

const statusListeners = new Set<() => void>();
let currentStatus: SyncStatus = 'disconnected';
let currentCode = '';
let peer: Peer | null = null;
let conn: DataConnection | null = null;

function setStatus(s: SyncStatus) {
  currentStatus = s;
  for (const cb of statusListeners) cb();
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

// ── Sync logic ──

async function getAllNotes(): Promise<SyncNote[]> {
  const db = await getDatabase();
  const all: unknown[] = await db.getAll(NOTES_STORE);
  return all.filter(isSyncNote).filter((n) => !n.id.startsWith('setting:'));
}

function handleMessage(data: unknown) {
  try {
    if (typeof data !== 'object' || data === null || !('type' in data)) return;
    const msg = data as Message;

    if (msg.type === 'sync') {
      // Bulk sync — apply all notes in one batch (single notify, single DB transaction)
      const notes = msg.notes.filter((n) => !n.id.startsWith('setting:'));
      putRecordsBatch(notes);
    } else if (msg.type === 'update') {
      if (msg.note.id.startsWith('setting:')) return;
      putRecordSilent(msg.note);
    }
  } catch (err) {
    console.error('Sync message error:', err);
  }
}

function setupConnection(connection: DataConnection) {
  conn = connection;

  connection.on('open', () => {
    setStatus('connected');

    // Send all our notes to the peer
    void getAllNotes().then((notes) => {
      const msg: SyncMessage = { notes, type: 'sync' };
      connection.send(msg);
    });

    // Broadcast local changes to peer in real time
    setOnRecordChange((value) => {
      if (!connection.open) return;
      if (value.id.startsWith('setting:')) return;
      const msg: UpdateMessage = { note: value as SyncNote, type: 'update' };
      connection.send(msg);
    });
  });

  connection.on('data', (data) => {
    handleMessage(data);
  });

  connection.on('close', () => {
    cleanup();
  });

  connection.on('error', (err) => {
    console.error('PeerJS connection error:', err);
    setStatus('error');
  });
}

// ── Public API ──

const PEER_PREFIX = 'menta-clara-';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function hostSync(): string {
  disconnect();

  const code = generateCode();
  currentCode = code;
  setStatus('waiting');

  peer = new Peer(PEER_PREFIX + code);

  peer.on('open', () => {
    setStatus('waiting');
  });

  peer.on('connection', (connection) => {
    setupConnection(connection);
  });

  peer.on('error', (err) => {
    console.error('PeerJS error:', err);
    setStatus('error');
  });

  return code;
}

export function joinSync(code: string): void {
  disconnect();

  const normalized = code.toUpperCase().replace(/\s/g, '');
  currentCode = normalized;
  setStatus('connecting');

  peer = new Peer();

  peer.on('open', () => {
    const connection = peer!.connect(PEER_PREFIX + normalized, { reliable: true });
    setupConnection(connection);
  });

  peer.on('error', (err) => {
    console.error('PeerJS error:', err);
    setStatus('error');
  });
}

function cleanup() {
  setOnRecordChange(null);
  conn = null;
  setStatus('disconnected');
}

export function disconnect(): void {
  if (conn) {
    conn.close();
    conn = null;
  }
  if (peer) {
    peer.destroy();
    peer = null;
  }
  setOnRecordChange(null);
  currentCode = '';
  setStatus('disconnected');
}
