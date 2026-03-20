const SYNC_ID_KEY = 'paneful-sync-id';
const SIGNALING_KEY = 'paneful-signaling-url';

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

export function getSignalingUrl(): string {
  return localStorage.getItem(SIGNALING_KEY) ?? '';
}

export function setSignalingUrl(url: string): void {
  if (url) {
    localStorage.setItem(SIGNALING_KEY, url);
  } else {
    localStorage.removeItem(SIGNALING_KEY);
  }
}
