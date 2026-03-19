import { alt, mod } from './platform';
import './shortcut-hints.css';

interface Hint {
  keys: string;
  label: string;
}

const navHint: Hint = { keys: `${mod}${alt}\u2190/\u2192`, label: 'Prev/next day' };

const dailyHints: Hint[] = [
  { keys: `${mod}]`, label: 'Weekly note' },
  navHint,
  { keys: `${mod}K`, label: 'Calendar' },
];

const dailyNotTodayHints: Hint[] = [
  ...dailyHints,
  { keys: `${mod}.`, label: 'Today' },
];

const weeklyHints: Hint[] = [
  { keys: `${mod}[`, label: 'Daily note' },
  navHint,
  { keys: `${mod}K`, label: 'Calendar' },
];

const defaultHints: Hint[] = [
  { keys: `${mod}[`, label: 'Daily note' },
  { keys: `${mod}]`, label: 'Weekly note' },
  navHint,
  { keys: `${mod}K`, label: 'Calendar' },
];

interface ShortcutHintsProps {
  context?: 'daily' | 'weekly' | undefined;
  isToday?: boolean;
}

export function ShortcutHints({ context, isToday }: ShortcutHintsProps) {
  const hints = context === 'daily'
    ? (isToday ? dailyHints : dailyNotTodayHints)
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
