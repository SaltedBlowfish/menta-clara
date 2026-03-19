import { getDatabase, NOTES_STORE } from './database';

// ── single-record cache ──
const cache = new Map<string, unknown>();
const pendingLoads = new Set<string>();
const listeners = new Set<() => void>();

function notify() {
  for (const cb of listeners) cb();
}

export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

export function getRecord(key: string): unknown {
  return cache.get(key);
}

export function hasRecord(key: string): boolean {
  return cache.has(key);
}

export function requestLoad(key: string): void {
  if (cache.has(key) || pendingLoads.has(key)) return;
  pendingLoads.add(key);
  void (async () => {
    try {
      const db = await getDatabase();
      const raw: unknown = await db.get(NOTES_STORE, key);
      cache.set(key, raw ?? null);
    } finally {
      pendingLoads.delete(key);
    }
    notify();
  })();
}

// Optional hook for broadcasting changes to sync peers
let onRecordChange: ((value: { [key: string]: unknown; id: string }) => void) | null = null;

export function setOnRecordChange(cb: ((value: { [key: string]: unknown; id: string }) => void) | null): void {
  onRecordChange = cb;
}

let suppressBroadcast = false;

export function putRecord(value: { [key: string]: unknown; id: string; }): void {
  cache.set(value.id, value);
  invalidateRanges(value.id);
  notify();
  if (!suppressBroadcast && onRecordChange) {
    onRecordChange(value);
  }
  void (async () => {
    const db = await getDatabase();
    await db.put(NOTES_STORE, value);
  })();
}

/** Apply a remote record without triggering the broadcast hook (prevents echo). */
export function putRecordSilent(value: { [key: string]: unknown; id: string }): void {
  suppressBroadcast = true;
  putRecord(value);
  suppressBroadcast = false;
}

export function deleteRecord(key: string): void {
  cache.set(key, null);
  invalidateRanges(key);
  notify();
  void (async () => {
    const db = await getDatabase();
    await db.delete(NOTES_STORE, key);
  })();
}

// ── range cache ──
const rangeCache = new Map<string, unknown[]>();
const pendingRanges = new Set<string>();

function invalidateRanges(key: string) {
  for (const prefix of rangeCache.keys()) {
    if (key.startsWith(prefix)) {
      rangeCache.delete(prefix);
    }
  }
  pendingRanges.delete(key);
}

export function getRangeRecords(prefix: string): unknown[] | undefined {
  return rangeCache.get(prefix);
}

export function requestRangeLoad(prefix: string): void {
  if (rangeCache.has(prefix) || pendingRanges.has(prefix)) return;
  pendingRanges.add(prefix);
  void (async () => {
    try {
      const db = await getDatabase();
      const range = IDBKeyRange.bound(prefix, prefix + '\uffff');
      const results = await db.getAll(NOTES_STORE, range);
      rangeCache.set(prefix, results);
    } finally {
      pendingRanges.delete(prefix);
    }
    notify();
  })();
}

// ── generic record cache (for settings stored as {id, value, updatedAt}) ──

export function putGenericRecord(record: { id: string; updatedAt: number; value: unknown }): void {
  cache.set(record.id, record);
  notify();
  void (async () => {
    const db = await getDatabase();
    await db.put(NOTES_STORE, record);
  })();
}
