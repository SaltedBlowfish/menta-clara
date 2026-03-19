import { useCallback, useRef, useState, useSyncExternalStore } from 'react';

import { Tooltip } from '../shared/tooltip';
import {
  approvePendingSync,
  disconnect,
  getCode,
  getDeviceCount,
  getPendingApproval,
  getStatus,
  hostSync,
  joinSync,
  rejectPendingSync,
  restoreSession,
  subscribeStatus,
} from './peer-sync';
import './sync-dialog.css';

// Auto-reconnect if there was an active session before page refresh
restoreSession();

type Tab = 'host' | 'join';

export function SyncDialog() {
  const status = useSyncExternalStore(subscribeStatus, getStatus);
  const code = useSyncExternalStore(subscribeStatus, getCode);
  const devices = useSyncExternalStore(subscribeStatus, getDeviceCount);
  const pending = useSyncExternalStore(subscribeStatus, getPendingApproval);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState<Tab>('host');
  const [joinCode, setJoinCode] = useState('');

  const handleOpen = useCallback(() => {
    dialogRef.current?.showModal();
  }, []);

  const handleClose = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const handleHost = useCallback(() => {
    hostSync();
  }, []);

  const handleJoin = useCallback(() => {
    if (joinCode.trim().length >= 4) {
      joinSync(joinCode);
    }
  }, [joinCode]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setJoinCode('');
  }, []);

  const isActive = status !== 'disconnected';

  const statusDot = status === 'connected' ? 'sync-dot-connected'
    : status === 'waiting' || status === 'connecting' ? 'sync-dot-waiting'
    : status === 'error' ? 'sync-dot-error'
    : '';

  const statusText = status === 'connected'
    ? `Connected — ${String(devices)} ${devices === 1 ? 'device' : 'devices'} syncing`
    : status === 'waiting' ? 'Waiting for devices to connect...'
    : status === 'connecting' ? 'Connecting...'
    : status === 'error' ? 'Connection failed — try again'
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

        {pending ? (
          <>
            <div className="sync-warning">
              <p>
                <strong>Heads up:</strong> The connecting device has
                significantly fewer notes ({pending.remoteCount}) than this
                device ({pending.localCount}). This could mean the other
                device was recently reset.
              </p>
              <p>
                Accepting will merge its notes into yours. Your existing
                notes are safe — only newer versions will overwrite older
                ones.
              </p>
            </div>
            <div className="sync-actions">
              <button className="btn btn-danger" onClick={rejectPendingSync} type="button">
                Reject sync
              </button>
              <button className="btn btn-primary" onClick={approvePendingSync} type="button">
                Accept & merge
              </button>
            </div>
          </>
        ) : !isActive ? (
          <>
            <p className="sync-description">
              Connect your devices directly over the internet.
              Notes transfer peer-to-peer — nothing passes through our
              servers. Multiple devices can join the same code.
            </p>

            <div className="sync-tabs">
              <button className={`sync-tab${tab === 'host' ? ' active' : ''}`} onClick={() => setTab('host')} type="button">
                This device has notes
              </button>
              <button className={`sync-tab${tab === 'join' ? ' active' : ''}`} onClick={() => setTab('join')} type="button">
                I have a code
              </button>
            </div>

            {tab === 'host' ? (
              <>
                <p className="sync-hint">
                  Generate a code, then enter it on your other devices.
                  This device stays as the host — all others connect to it.
                </p>
                <div className="sync-actions">
                  <button className="btn btn-secondary" onClick={handleClose} type="button">Cancel</button>
                  <button className="btn btn-primary" onClick={handleHost} type="button">Generate code</button>
                </div>
              </>
            ) : (
              <>
                <input
                  className="sync-code-input"
                  maxLength={6}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Enter 6-character code"
                  type="text"
                  value={joinCode}
                />
                <div className="sync-actions">
                  <button className="btn btn-secondary" onClick={handleClose} type="button">Cancel</button>
                  <button
                    className="btn btn-primary"
                    disabled={joinCode.trim().length < 4}
                    onClick={handleJoin}
                    type="button"
                  >
                    Connect
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {code && status === 'waiting' && (
              <>
                <div className="sync-code-display">{code}</div>
                <p className="sync-hint">
                  Enter this code on your other devices. Multiple devices
                  can connect using the same code.
                </p>
              </>
            )}

            <div className="sync-status">
              <span className={`sync-dot ${statusDot}`} />
              {statusText}
            </div>

            {status === 'connected' && (
              <p className="sync-hint">
                All connected devices are synced. Edits appear on every
                device instantly. Keep this tab open on all devices.
                {devices > 1 ? ` More devices can still join using code ${code}.` : ''}
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
