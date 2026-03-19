import './carry-over-prompt.css';

interface CarryOverPromptProps {
  label: string; // e.g. "previous day's note" or "last week's note"
  onCarryOver: () => void;
  onStartBlank: () => void;
}

export function CarryOverPrompt({ label, onCarryOver, onStartBlank }: CarryOverPromptProps) {
  return (
    <div className="carry-over-prompt">
      <p className="carry-over-text">Bring over content from {label}?</p>
      <div className="carry-over-actions">
        <button className="btn btn-primary" onClick={onCarryOver} type="button">
          Carry over
        </button>
        <button className="btn btn-secondary" onClick={onStartBlank} type="button">
          Start blank
        </button>
      </div>
    </div>
  );
}
