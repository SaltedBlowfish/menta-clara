import { mod } from './platform';
import './shortcut-hints.css';

interface Hint {
  keys: string;
  label: string;
}

const dailyHints: Hint[] = [
  { keys: `${mod} ]`, label: 'Go to weekly note' },
  { keys: `${mod} B`, label: 'Bold' },
  { keys: `${mod} I`, label: 'Italic' },
];

const weeklyHints: Hint[] = [
  { keys: `${mod} [`, label: 'Go to daily note' },
  { keys: `${mod} B`, label: 'Bold' },
  { keys: `${mod} I`, label: 'Italic' },
];

const defaultHints: Hint[] = [
  { keys: `${mod} [`, label: 'Daily note' },
  { keys: `${mod} ]`, label: 'Weekly note' },
  { keys: `${mod} .`, label: 'Today' },
  { keys: `${mod} K`, label: 'Calendar' },
];

interface ShortcutHintsProps {
  context?: 'daily' | 'weekly' | undefined;
}

export function ShortcutHints({ context }: ShortcutHintsProps) {
  const hints = context === 'daily' ? dailyHints
    : context === 'weekly' ? weeklyHints
    : defaultHints;

  return (
    <div className="shortcut-hints">
      {hints.map((hint) => (
        <span className="shortcut-hint" key={hint.label}>
          <kbd className="shortcut-kbd">{hint.keys}</kbd>
          {hint.label}
        </span>
      ))}
    </div>
  );
}
