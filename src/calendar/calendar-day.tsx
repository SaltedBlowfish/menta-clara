import { format, getDate } from 'date-fns';

interface CalendarDayProps {
  date: Date;
  hasNote: boolean;
  isSelected: boolean;
  isToday: boolean;
  onSelect: (date: Date) => void;
}

export function CalendarDay({
  date,
  hasNote,
  isSelected,
  isToday,
  onSelect,
}: CalendarDayProps) {
  const className =
    'calendar-day' +
    (isToday ? ' calendar-day-today' : '') +
    (isSelected ? ' calendar-day-selected' : '');

  return (
    <button
      aria-label={format(date, 'MMMM d, yyyy')}
      className={className}
      onClick={() => { onSelect(date); }}
      type="button"
    >
      <span className="calendar-day-number">{getDate(date)}</span>
      {hasNote ? <span aria-hidden="true" className="calendar-day-dot" /> : null}
    </button>
  );
}
