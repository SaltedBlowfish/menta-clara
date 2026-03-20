import { type ReactNode, useMemo, useSyncExternalStore } from 'react';

import { getWorkspaceDoc } from './doc-store';
import { initSync } from './init-sync';
import { SyncContext, type SyncState } from './sync-context';
import { getSyncSnapshot, subscribeSyncState } from './sync-state';

interface SyncProviderProps {
  children: ReactNode;
}

export function SyncProvider(props: SyncProviderProps) {
  const { children } = props;

  initSync();

  const snapshot = useSyncExternalStore(subscribeSyncState, getSyncSnapshot);
  const ydoc = getWorkspaceDoc();

  const value = useMemo<SyncState>(
    () => ({ ...snapshot, ydoc }),
    [snapshot, ydoc],
  );

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  );
}
