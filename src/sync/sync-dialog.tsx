import { useCallback, useRef, useState, useSyncExternalStore } from 'react';

import { Tooltip } from '../shared/tooltip';
import {
  disconnectSync,
  getCode,
  getPeerCount,
  getStatus,
  joinSync,
  restoreSession,
  startSync,
  subscribeStatus,
} from './yjs-provider';
import './sync-dialog.css';

// Auto-reconnect if there was an active session before page refresh
restoreSession();

export function SyncDialog() {
  const status = useSyncExternalStore(subscribeStatus, getStatus);
  const code = useSyncExternalStore(subscribeStatus, getCode);
  const peers = useSyncExternalStore(subscribeStatus, getPeerCount);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState<'idle' | 'join' | 'started'>('idle');

  const handleOpen = useCallback(() => {
    dialogRef.current?.showModal();
  }, []);

  const handleClose = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const handleStart = useCallback(() => {
    startSync();
    setMode('started');
  }, []);

  const handleJoin = useCallback(() => {
    if (joinCode.trim().length >= 4) {
      joinSync(joinCode);
      setMode('started');
    }
  }, [joinCode]);

  const handleDisconnect = useCallback(() => {
    disconnectSync();
    setJoinCode('');
    setMode('idle');
  }, []);

  const isActive = status !== 'disconnected';

  const statusDot = status === 'connected' ? 'sync-dot-connected'
    : status === 'connecting' ? 'sync-dot-waiting'
    : '';

  const statusText = status === 'connected'
    ? `Connected — ${String(peers)} other ${peers === 1 ? 'device' : 'devices'}`
    : status === 'connecting' ? 'Waiting for other devices...'
    : '';

  return (
    <>
      <Tooltip label="Sync devices">
        <button
          aria-label="Sync with another device"
          className="toolbar-btn"
          onClick={handleOpen}
          type="button"
        >
          <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" viewBox="0 0 20 20" width="20">
            <path d="M4 10a6 6 0 0 1 6-6m6 6a6 6 0 0 1-6 6" />
            <path d="M10 1v6M10 13v6" />
            {isActive && <circle cx="10" cy="10" fill="#22c55e" r="2" stroke="none" />}
          </svg>
        </button>
      </Tooltip>

      <dialog className="sync-dialog" ref={dialogRef}>
        <h2 className="sync-title">Sync Devices</h2>

        {!isActive && mode === 'idle' ? (
          <>
            <p className="sync-description">
              Connect your devices for real-time collaborative sync.
              Edits merge automatically — no conflicts, no data loss.
              All data transfers peer-to-peer.
            </p>

            <p className="sync-hint">
              Start a new sync room, or enter a code from another device.
            </p>

            <input
              className="sync-code-input"
              maxLength={6}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Enter code to join..."
              type="text"
              value={joinCode}
            />

            <div className="sync-actions">
              <button className="btn btn-secondary" onClick={handleClose} type="button">Cancel</button>
              {joinCode.trim().length >= 4 ? (
                <button className="btn btn-primary" onClick={handleJoin} type="button">Join room</button>
              ) : (
                <button className="btn btn-primary" onClick={handleStart} type="button">New room</button>
              )}
            </div>
          </>
        ) : (
          <>
            {code && (
              <>
                <div className="sync-code-display">{code}</div>
                <p className="sync-hint">
                  Enter this code on your other devices to sync.
                  Edits sync instantly across all connected devices.
                </p>
              </>
            )}

            <div className="sync-status">
              <span className={`sync-dot ${statusDot}`} />
              {statusText}
            </div>

            {status === 'connected' && (
              <p className="sync-hint">
                All devices are synced. You can edit on any device — changes
                merge automatically in real time.
              </p>
            )}

            <div className="sync-actions">
              <button className="btn btn-danger" onClick={handleDisconnect} type="button">
                Disconnect
              </button>
              <button className="btn btn-secondary" onClick={handleClose} type="button">
                Close
              </button>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
