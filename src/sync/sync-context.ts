import type { Doc as YDoc } from 'yjs';

import { createContext } from 'react';

export interface SyncState {
  connected: boolean;
  dbLoaded: boolean;
  peerCount: number;
  syncId: string;
  ydoc: YDoc | null;
}

export const SyncContext = createContext<SyncState>({
  connected: false,
  dbLoaded: false,
  peerCount: 0,
  syncId: '',
  ydoc: null,
});
