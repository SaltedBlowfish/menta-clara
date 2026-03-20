import { useCallback, useRef, useState, useSyncExternalStore } from 'react';

import { getSignalingUrl, setSignalingUrl, setSyncId } from './create-sync-id';
import { JoinSection } from './join-section';
import { SyncCodeSection } from './sync-code-section';
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
  const [serverUrl, setServerUrl] = useState(getSignalingUrl);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hasServer = serverUrl.trim().length > 0;

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

  const handleSaveServer = useCallback(() => {
    setSignalingUrl(serverUrl.trim());
    window.location.reload();
  }, [serverUrl]);

  const status = !hasServer
    ? 'No signaling server configured'
    : connected
      ? `Connected to ${String(peerCount)} device${peerCount === 1 ? '' : 's'}`
      : 'Waiting for devices\u2026';

  return (
    <dialog className="sync-dialog" ref={dialogRef}>
      <h3>Device Sync</h3>

      <div className="sync-section">
        <div className="sync-section-label">Signaling server</div>
        <div className="sync-code-row">
          <input
            className="sync-join-input"
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="wss://your-server.example.com"
            type="text"
            value={serverUrl}
          />
          <button className="btn btn-secondary" onClick={handleSaveServer} type="button">
            {hasServer ? 'Update' : 'Save'}
          </button>
        </div>
        <p className="sync-hint">
          Required for sync. Run the included signaling-server/ on any host.
        </p>
      </div>

      {hasServer && (
        <>
          <hr className="sync-divider" />
          <SyncCodeSection copied={copied} onCopy={handleCopy} syncId={syncId} />
          <hr className="sync-divider" />
          <JoinSection joinCode={joinCode} onJoin={handleJoin} onSetCode={setJoinCode} syncId={syncId} />
        </>
      )}

      <div className="sync-actions">
        <span style={{ color: 'var(--color-text-secondary)', flex: 1, fontSize: 13 }}>
          {status}
        </span>
        <button className="btn btn-secondary" onClick={() => dialogRef.current?.close()} type="button">
          Close
        </button>
      </div>
    </dialog>
  );
}
