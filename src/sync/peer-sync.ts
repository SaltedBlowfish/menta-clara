import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';

import { getDatabase, NOTES_STORE } from '../storage/database';
import { putRecordSilent, putRecordsBatch, setOnRecordChange } from '../storage/db-cache';

// ── Types ──

interface SyncMessage {
  noteCount: number;
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
let deviceCount = 0;
let peer: Peer | null = null;
const connections = new Set<DataConnection>();

// Pending sync approval
let pendingApproval: { accept: () => void; localCount: number; reject: () => void; remoteCount: number } | null = null;

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

export function getDeviceCount(): number {
  return deviceCount;
}

export function getPendingApproval(): { localCount: number; remoteCount: number } | null {
  if (!pendingApproval) return null;
  return { localCount: pendingApproval.localCount, remoteCount: pendingApproval.remoteCount };
}

export function approvePendingSync(): void {
  pendingApproval?.accept();
  pendingApproval = null;
  notifyStatus();
}

export function rejectPendingSync(): void {
  pendingApproval?.reject();
  pendingApproval = null;
  notifyStatus();
}

// ── Sync logic ──

async function getAllNotes(): Promise<SyncNote[]> {
  const db = await getDatabase();
  const all: unknown[] = await db.getAll(NOTES_STORE);
  return all.filter(isSyncNote).filter((n) => !n.id.startsWith('setting:'));
}

async function getLocalNoteCount(): Promise<number> {
  const notes = await getAllNotes();
  return notes.length;
}

function applyNotes(notes: SyncNote[]) {
  const filtered = notes.filter((n) => !n.id.startsWith('setting:'));
  if (filtered.length > 0) {
    putRecordsBatch(filtered);
  }
}

function broadcastToOthers(sender: DataConnection, msg: Message) {
  for (const c of connections) {
    if (c !== sender && c.open) {
      c.send(msg);
    }
  }
}

function handleMessage(data: unknown, sender: DataConnection) {
  try {
    if (typeof data !== 'object' || data === null || !('type' in data)) return;
    const msg = data as Message;

    if (msg.type === 'sync') {
      const remoteNotes = msg.notes.filter((n) => !n.id.startsWith('setting:'));
      const remoteCount = remoteNotes.length;

      void getLocalNoteCount().then((localCount) => {
        // Safety check: warn if local device has notes but the remote has
        // significantly fewer (could mean the remote was reset/wiped)
        if (localCount > 5 && remoteCount === 0) {
          // Remote is empty — safe, just send our notes, don't apply theirs
          return;
        }

        if (localCount > 10 && remoteCount > 0 && remoteCount < localCount / 2) {
          // Remote has much fewer notes — ask user before applying
          pendingApproval = {
            accept: () => { applyNotes(remoteNotes); },
            localCount,
            reject: () => { /* do nothing — keep local data */ },
            remoteCount,
          };
          notifyStatus();
          return;
        }

        applyNotes(remoteNotes);
      });
    } else if (msg.type === 'update') {
      if (msg.note.id.startsWith('setting:')) return;
      putRecordSilent(msg.note);

      // Relay to all other connected devices
      broadcastToOthers(sender, msg);
    }
  } catch (err) {
    console.error('Sync message error:', err);
  }
}

function updateDeviceCount() {
  let count = 0;
  for (const c of connections) {
    if (c.open) count++;
  }
  deviceCount = count;
  notifyStatus();
}

function setupConnection(connection: DataConnection) {
  connections.add(connection);

  connection.on('open', () => {
    updateDeviceCount();
    setStatus('connected');

    // Send all our notes to the new peer
    void getAllNotes().then((notes) => {
      const msg: SyncMessage = { noteCount: notes.length, notes, type: 'sync' };
      connection.send(msg);
    });
  });

  connection.on('data', (data) => {
    handleMessage(data, connection);
  });

  connection.on('close', () => {
    connections.delete(connection);
    updateDeviceCount();
    if (connections.size === 0) {
      cleanup();
    }
  });

  connection.on('error', (err) => {
    console.error('PeerJS connection error:', err);
    connections.delete(connection);
    updateDeviceCount();
    if (connections.size === 0) {
      setStatus('error');
    }
  });
}

// ── Broadcast hook ──

function installBroadcastHook() {
  setOnRecordChange((value) => {
    if (value.id.startsWith('setting:')) return;
    const msg: UpdateMessage = { note: value as SyncNote, type: 'update' };
    for (const c of connections) {
      if (c.open) c.send(msg);
    }
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
    installBroadcastHook();
  });

  // Accept multiple incoming connections
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
    installBroadcastHook();
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
  connections.clear();
  deviceCount = 0;
  pendingApproval = null;
  setStatus('disconnected');
}

export function disconnect(): void {
  for (const c of connections) {
    c.close();
  }
  connections.clear();
  if (peer) {
    peer.destroy();
    peer = null;
  }
  setOnRecordChange(null);
  currentCode = '';
  deviceCount = 0;
  pendingApproval = null;
  setStatus('disconnected');
}
