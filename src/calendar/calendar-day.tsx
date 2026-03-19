import { format, getDate } from 'date-fns';

interface CalendarDayProps {
  date: Date;
  hasNote: boolean;
  isOtherMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  onSelect: (date: Date) => void;
}

export function CalendarDay({
  date,
  hasNote,
  isOtherMonth,
  isSelected,
  isToday,
  onSelect,
}: CalendarDayProps) {
  const className =
    'calendar-day' +
    (isToday ? ' calendar-day-today' : '') +
    (isSelected ? ' calendar-day-selected' : '') +
    (isOtherMonth ? ' calendar-day-other' : '');

  return (
    <button
      aria-label={format(date, 'MMMM d, yyyy')}
      className={className}
      data-selected={isSelected ? '' : undefined}
      onClick={() => { onSelect(date); }}
      tabIndex={isSelected ? 0 : -1}
      type="button"
    >
      <span className="calendar-day-number">{getDate(date)}</span>
      {hasNote ? <span aria-hidden="true" className="calendar-day-dot" /> : null}
    </button>
  );
}
