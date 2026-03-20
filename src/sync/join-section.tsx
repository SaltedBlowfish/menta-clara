interface JoinSectionProps {
  joinCode: string;
  onJoin: () => void;
  onSetCode: (code: string) => void;
  syncId: string;
}

export function JoinSection(props: JoinSectionProps) {
  const { joinCode, onJoin, onSetCode, syncId } = props;

  return (
    <div className="sync-section">
      <div className="sync-section-label">Join another device</div>
      <div className="sync-code-row">
        <input
          className="sync-join-input"
          onChange={(e) => onSetCode(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onJoin(); }}
          placeholder="Paste sync code here"
          type="text"
          value={joinCode}
        />
        <button
          className="btn btn-primary"
          disabled={!joinCode.trim() || joinCode.trim() === syncId}
          onClick={onJoin}
          type="button"
        >
          Join
        </button>
      </div>
      <p className="sync-hint">Your notes will merge with the other device's notes.</p>
    </div>
  );
}
