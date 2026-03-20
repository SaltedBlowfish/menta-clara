import { useCallback, useRef, useState, useSyncExternalStore } from 'react';

import { setSyncId } from './create-sync-id';
import { getSyncSnapshot, subscribeSyncState } from './sync-state';
import './sync-dialog.css';

interface SyncDialogProps {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
}

export function SyncDialog(props: SyncDialogProps) {
  const { dialogRef } = props;
  const { connected, peerCount, syncId } = useSyncExternalStore(
    subscribeSyncState,
    getSyncSnapshot,
  );
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(syncId);
    setCopied(true);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  }, [syncId]);

  const handleJoin = useCallback(() => {
    const code = joinCode.trim().toLowerCase();
    if (!code || code === syncId) return;

    const confirmed = window.confirm(
      'Join this sync code? Your existing notes will merge with the other device.',
    );
    if (!confirmed) return;

    setSyncId(code);
    window.location.reload();
  }, [joinCode, syncId]);

  const status = connected
    ? `Connected to ${String(peerCount)} device${peerCount === 1 ? '' : 's'}`
    : 'No devices connected';

  return (
    <dialog className="sync-dialog" ref={dialogRef}>
      <h3>Device Sync</h3>

      <div className="sync-section">
        <div className="sync-section-label">Your sync code</div>
        <div className="sync-code-row">
          <div className="sync-code">{syncId}</div>
          <button className="btn btn-secondary" onClick={handleCopy} type="button">
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p className="sync-hint">Share this code with your other devices to sync notes.</p>
      </div>

      <hr className="sync-divider" />

      <div className="sync-section">
        <div className="sync-section-label">Join another device</div>
        <div className="sync-code-row">
          <input
            className="sync-join-input"
            onChange={(e) => setJoinCode(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleJoin(); }}
            placeholder="Paste sync code here"
            type="text"
            value={joinCode}
          />
          <button
            className="btn btn-primary"
            disabled={!joinCode.trim() || joinCode.trim() === syncId}
            onClick={handleJoin}
            type="button"
          >
            Join
          </button>
        </div>
        <p className="sync-hint">Your notes will merge with the other device's notes.</p>
      </div>

      <div className="sync-actions">
        <span style={{ color: 'var(--color-text-secondary)', flex: 1, fontSize: 13 }}>
          {status}
        </span>
        <button
          className="btn btn-secondary"
          onClick={() => dialogRef.current?.close()}
          type="button"
        >
          Close
        </button>
      </div>
    </dialog>
  );
}
