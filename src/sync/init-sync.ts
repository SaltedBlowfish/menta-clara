import { getOrCreateSyncId, getSignalingUrl } from './create-sync-id';
import { getWorkspaceDoc } from './doc-store';
import { updateSyncState } from './sync-state';

let initialized = false;

export function initSync(): void {
  if (initialized) return;
  initialized = true;

  const syncId = getOrCreateSyncId();
  const ydoc = getWorkspaceDoc();
  updateSyncState({ syncId });

  void (async () => {
    const { IndexeddbPersistence } = await import('y-indexeddb');
    const persistence = new IndexeddbPersistence(`paneful-sync-${syncId}`, ydoc);
    persistence.on('synced', () => {
      updateSyncState({ dbLoaded: true });
    });

    const signalingUrl = getSignalingUrl();
    if (!signalingUrl) return;

    const { WebrtcProvider } = await import('y-webrtc');
    const provider = new WebrtcProvider(`paneful:${syncId}`, ydoc, {
      signaling: [signalingUrl],
    });

    provider.on('peers', (event: { webrtcPeers: Array<string> }) => {
      updateSyncState({
        connected: event.webrtcPeers.length > 0,
        peerCount: event.webrtcPeers.length,
      });
    });
  })();
}
