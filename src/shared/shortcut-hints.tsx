import { mod } from './platform';
import './shortcut-hints.css';

interface Hint {
  keys: string;
  label: string;
}

const navHint: Hint = { keys: `${mod}[ / ]`, label: 'Prev/next day' };

const dailyHints: Hint[] = [
  { keys: `${mod}2`, label: 'Weekly note' },
  { keys: `${mod}3`, label: 'Calendar' },
  navHint,
];

const dailyNotTodayHints: Hint[] = [
  ...dailyHints,
  { keys: `${mod}.`, label: 'Today' },
];

const weeklyHints: Hint[] = [
  { keys: `${mod}1`, label: 'Daily note' },
  { keys: `${mod}3`, label: 'Calendar' },
  navHint,
];

const defaultHints: Hint[] = [
  { keys: `${mod}1`, label: 'Daily note' },
  { keys: `${mod}2`, label: 'Weekly note' },
  { keys: `${mod}3`, label: 'Calendar' },
  navHint,
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
