const SYNC_ID_KEY = 'paneful-sync-id';

export function getOrCreateSyncId(): string {
  const existing = localStorage.getItem(SYNC_ID_KEY);
  if (existing) return existing;

  const id = crypto.randomUUID();
  localStorage.setItem(SYNC_ID_KEY, id);
  return id;
}

export function setSyncId(id: string): void {
  localStorage.setItem(SYNC_ID_KEY, id);
}
