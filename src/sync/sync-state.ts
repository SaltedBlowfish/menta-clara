export interface SyncSnapshot {
  connected: boolean;
  dbLoaded: boolean;
  peerCount: number;
  syncId: string;
}

const listeners = new Set<() => void>();

let state: SyncSnapshot = {
  connected: false,
  dbLoaded: false,
  peerCount: 0,
  syncId: '',
};

function notify() {
  for (const cb of listeners) cb();
}

export function getSyncSnapshot(): SyncSnapshot {
  return state;
}

export function subscribeSyncState(cb: () => void): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

export function updateSyncState(partial: Partial<SyncSnapshot>): void {
  state = { ...state, ...partial };
  notify();
}
