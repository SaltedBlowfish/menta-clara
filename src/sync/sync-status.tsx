import { useSyncExternalStore } from 'react';

import { Tooltip } from '../shared/tooltip';
import { getSyncSnapshot, subscribeSyncState } from './sync-state';
import './sync-status.css';

export function SyncStatus() {
  const { connected, peerCount, syncId } = useSyncExternalStore(
    subscribeSyncState,
    getSyncSnapshot,
  );

  const shortId = syncId.slice(0, 8);
  const label = connected
    ? `Syncing with ${String(peerCount)} device${peerCount === 1 ? '' : 's'} (${shortId})`
    : `Offline \u2014 ID: ${shortId}`;

  return (
    <Tooltip label={label}>
      <button
        aria-label={label}
        className="toolbar-btn sync-status-btn"
        type="button"
      >
        <svg
          className={connected ? 'sync-icon connected' : 'sync-icon'}
          fill="none"
          height="20"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 20 20"
          width="20"
        >
          <path d="M4 10a6 6 0 0 1 10.3-4.1" />
          <path d="M16 10a6 6 0 0 1-10.3 4.1" />
          <path d="M13 3l1.7 2.9H11" />
          <path d="M7 17l-1.7-2.9H9" />
        </svg>
        {connected && <span className="sync-dot" />}
      </button>
    </Tooltip>
  );
}
