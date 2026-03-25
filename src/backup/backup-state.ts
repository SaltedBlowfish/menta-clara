export interface BackupSnapshot {
  code: string;
  enabled: boolean;
  intervalMinutes: number;
  lastRunAt: number | null;
  lastRunOk: boolean | null;
  lastRunError: string | null;
  running: boolean;
}

const LS_CODE = 'backup:code';
const LS_ENABLED = 'backup:enabled';
const LS_INTERVAL = 'backup:interval';

const listeners = new Set<() => void>();

let state: BackupSnapshot = {
  code: localStorage.getItem(LS_CODE) ?? '',
  enabled: localStorage.getItem(LS_ENABLED) === 'true',
  intervalMinutes: Number(localStorage.getItem(LS_INTERVAL)) || 0,
  lastRunAt: null,
  lastRunOk: null,
  lastRunError: null,
  running: false,
};

function notify() {
  for (const cb of listeners) cb();
}

export function getBackupSnapshot(): BackupSnapshot {
  return state;
}

export function subscribeBackupState(cb: () => void): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

export function updateBackupState(partial: Partial<BackupSnapshot>): void {
  state = { ...state, ...partial };

  if ('code' in partial) localStorage.setItem(LS_CODE, state.code);
  if ('enabled' in partial) localStorage.setItem(LS_ENABLED, String(state.enabled));
  if ('intervalMinutes' in partial) localStorage.setItem(LS_INTERVAL, String(state.intervalMinutes));

  notify();
}
