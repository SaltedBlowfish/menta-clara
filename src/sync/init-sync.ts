import { getOrCreateSyncId, getSignalingUrl } from './create-sync-id';
import { getWorkspaceDoc } from './doc-store';
import { updateSyncState } from './sync-state';

const DEFAULT_SIGNALING = 'wss://yjs-signaling.onrender.com';

let initialized = false;

function updatePeerCount(awareness: { getStates: () => Map<number, unknown>; clientID: number }) {
  const states = awareness.getStates();
  const peerCount = states.size - 1;
  updateSyncState({
    connected: peerCount > 0,
    peerCount,
  });
}

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

    const custom = getSignalingUrl();
    const signalingUrl = custom || DEFAULT_SIGNALING;

    const { WebrtcProvider } = await import('y-webrtc');
    const provider = new WebrtcProvider(`paneful:${syncId}`, ydoc, {
      signaling: [signalingUrl],
    });

    provider.awareness.setLocalState({ active: true });
    provider.awareness.on('update', () => updatePeerCount(provider.awareness));

    window.addEventListener('beforeunload', () => {
      provider.destroy();
    });
  })();
}
