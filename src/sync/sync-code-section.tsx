interface SyncCodeSectionProps {
  copied: boolean;
  onCopy: () => void;
  syncId: string;
}

export function SyncCodeSection(props: SyncCodeSectionProps) {
  const { copied, onCopy, syncId } = props;

  return (
    <div className="sync-section">
      <div className="sync-section-label">Your sync code</div>
      <div className="sync-code-row">
        <div className="sync-code">{syncId}</div>
        <button className="btn btn-secondary" onClick={onCopy} type="button">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="sync-hint">Share this code with your other devices.</p>
    </div>
  );
}
