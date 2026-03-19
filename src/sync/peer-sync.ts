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

// ── Session persistence ──

const SESSION_KEY = 'menta-clara-sync';

interface SyncSession {
  code: string;
  role: 'host' | 'join';
}

function saveSession(role: 'host' | 'join', code: string) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ code, role }));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

function getSavedSession(): SyncSession | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null && 'role' in parsed && 'code' in parsed) {
      return parsed as SyncSession;
    }
  } catch { /* ignore */ }
  return null;
}

// ── State ──

export type SyncStatus = 'connected' | 'connecting' | 'disconnected' | 'error' | 'waiting';

const statusListeners = new Set<() => void>();
let currentStatus: SyncStatus = 'disconnected';
let currentCode = '';
let deviceCount = 0;
let peer: Peer | null = null;
const connections = new Set<DataConnection>();

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
        if (localCount > 5 && remoteCount === 0) {
          return;
        }

        if (localCount > 10 && remoteCount > 0 && remoteCount < localCount / 2) {
          pendingApproval = {
            accept: () => { applyNotes(remoteNotes); },
            localCount,
            reject: () => { /* keep local data */ },
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
    if (connections.size === 0 && currentStatus === 'connected') {
      // Lost all connections — go back to waiting (host) or reconnect (joiner)
      const session = getSavedSession();
      if (session?.role === 'host') {
        setStatus('waiting');
      } else if (session) {
        // Joiner lost connection — auto-retry
        attemptReconnect(session.code);
      } else {
        cleanup();
      }
    }
  });

  connection.on('error', (err) => {
    console.error('PeerJS connection error:', err);
    connections.delete(connection);
    updateDeviceCount();
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

// ── Reconnect ──

const RECONNECT_DELAY = 2000;
const MAX_RETRIES = 5;
let retryCount = 0;
let retryTimer: ReturnType<typeof setTimeout> | undefined;

function attemptReconnect(code: string) {
  if (retryCount >= MAX_RETRIES) {
    console.warn('Max reconnect retries reached');
    cleanup();
    return;
  }
  retryCount++;
  setStatus('connecting');

  retryTimer = setTimeout(() => {
    if (!peer || peer.destroyed) {
      peer = new Peer();
      peer.on('open', () => {
        installBroadcastHook();
        const connection = peer!.connect(PEER_PREFIX + code, { reliable: true });
        setupConnection(connection);
        connection.on('open', () => { retryCount = 0; });
      });
      peer.on('error', () => {
        attemptReconnect(code);
      });
    } else {
      const connection = peer.connect(PEER_PREFIX + code, { reliable: true });
      setupConnection(connection);
      connection.on('open', () => { retryCount = 0; });
    }
  }, RECONNECT_DELAY);
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

export function hostSync(existingCode?: string): string {
  disconnect();

  const code = existingCode ?? generateCode();
  currentCode = code;
  setStatus('waiting');
  saveSession('host', code);

  peer = new Peer(PEER_PREFIX + code);

  peer.on('open', () => {
    setStatus('waiting');
    installBroadcastHook();
  });

  peer.on('connection', (connection) => {
    setupConnection(connection);
  });

  peer.on('error', (err) => {
    console.error('PeerJS error:', err);
    // If the peer ID is taken (host refreshed too fast), retry with same code
    if (String(err).includes('unavailable')) {
      setTimeout(() => {
        if (currentCode === code) {
          peer = new Peer(PEER_PREFIX + code);
          peer.on('open', () => { setStatus('waiting'); installBroadcastHook(); });
          peer.on('connection', (c) => { setupConnection(c); });
          peer.on('error', () => { setStatus('error'); });
        }
      }, RECONNECT_DELAY);
    } else {
      setStatus('error');
    }
  });

  return code;
}

export function joinSync(code: string): void {
  disconnect();

  const normalized = code.toUpperCase().replace(/\s/g, '');
  currentCode = normalized;
  setStatus('connecting');
  saveSession('join', normalized);
  retryCount = 0;

  peer = new Peer();

  peer.on('open', () => {
    installBroadcastHook();
    const connection = peer!.connect(PEER_PREFIX + normalized, { reliable: true });
    setupConnection(connection);
  });

  peer.on('error', (err) => {
    console.error('PeerJS error:', err);
    attemptReconnect(normalized);
  });
}

function cleanup() {
  clearTimeout(retryTimer);
  setOnRecordChange(null);
  connections.clear();
  deviceCount = 0;
  pendingApproval = null;
  clearSession();
  setStatus('disconnected');
}

export function disconnect(): void {
  clearTimeout(retryTimer);
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
  retryCount = 0;
  pendingApproval = null;
  clearSession();
  setStatus('disconnected');
}

// ── Auto-reconnect on page load ──

export function restoreSession(): void {
  const session = getSavedSession();
  if (!session) return;

  if (session.role === 'host') {
    hostSync(session.code);
  } else {
    joinSync(session.code);
  }
}
