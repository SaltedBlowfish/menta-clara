import { useCallback, useRef, useState } from 'react';

import { getSignalingUrl, setSignalingUrl, setSyncId } from './create-sync-id';
import { JoinSection } from './join-section';
import { SyncCodeSection } from './sync-code-section';

interface SyncTabContentProps {
  connected: boolean;
  peerCount: number;
  syncId: string;
}

export function SyncTabContent(props: SyncTabContentProps) {
  const { connected, peerCount, syncId } = props;
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [serverUrl, setServerUrl] = useState(getSignalingUrl);
  const [showAdvanced, setShowAdvanced] = useState(false);
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

  const handleSaveServer = useCallback(() => {
    setSignalingUrl(serverUrl.trim());
    window.location.reload();
  }, [serverUrl]);

  const status = connected
    ? `Connected to ${String(peerCount)} device${peerCount === 1 ? '' : 's'}`
    : 'Waiting for devices\u2026';

  return (
    <>
      <SyncCodeSection copied={copied} onCopy={handleCopy} syncId={syncId} />
      <hr className="sync-divider" />
      <JoinSection joinCode={joinCode} onJoin={handleJoin} onSetCode={setJoinCode} syncId={syncId} />

      <button
        className="sync-advanced-toggle"
        onClick={() => setShowAdvanced(!showAdvanced)}
        type="button"
      >
        {showAdvanced ? 'Hide' : 'Advanced'} settings
      </button>

      {showAdvanced && (
        <div className="sync-section">
          <div className="sync-section-label">Custom signaling server</div>
          <div className="sync-code-row">
            <input
              className="sync-join-input"
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="Default: yjs-signaling.onrender.com"
              type="text"
              value={serverUrl}
            />
            <button className="btn btn-secondary" onClick={handleSaveServer} type="button">
              Save
            </button>
          </div>
          <p className="sync-hint">
            Override the default server. Run signaling-server/ on any host.
          </p>
        </div>
      )}

      <div className="sync-actions">
        <span style={{ color: 'var(--color-text-secondary)', flex: 1, fontSize: 13 }}>
          {status}
        </span>
      </div>
    </>
  );
}
