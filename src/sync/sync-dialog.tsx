import { useState, useSyncExternalStore } from 'react';

import { BackupTab } from '../backup/backup-tab';
import { getSyncSnapshot, subscribeSyncState } from './sync-state';
import { SyncTabContent } from './sync-tab-content';
import './sync-dialog.css';

type Tab = 'sync' | 'backup';

interface SyncDialogProps {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
}

export function SyncDialog(props: SyncDialogProps) {
  const { dialogRef } = props;
  const { connected, peerCount, syncId } = useSyncExternalStore(
    subscribeSyncState,
    getSyncSnapshot,
  );
  const [activeTab, setActiveTab] = useState<Tab>('sync');

  return (
    <dialog className={`sync-dialog ${activeTab === 'backup' ? 'sync-dialog--wide' : ''}`} ref={dialogRef}>
      <div className="sync-tab-bar">
        <button
          className={`sync-tab ${activeTab === 'sync' ? 'sync-tab--active' : ''}`}
          onClick={() => setActiveTab('sync')}
          type="button"
        >
          Device Sync
        </button>
        <button
          className={`sync-tab ${activeTab === 'backup' ? 'sync-tab--active' : ''}`}
          onClick={() => setActiveTab('backup')}
          type="button"
        >
          Backup
        </button>
      </div>

      {activeTab === 'sync' && (
        <SyncTabContent connected={connected} peerCount={peerCount} syncId={syncId} />
      )}
      {activeTab === 'backup' && <BackupTab />}

      <div className="sync-actions">
        <button className="btn btn-secondary" onClick={() => dialogRef.current?.close()} type="button">
          Close
        </button>
      </div>
    </dialog>
  );
}
