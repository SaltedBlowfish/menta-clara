import './calendar-grid.css';

import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  startOfMonth,
} from 'date-fns';

import { CalendarDay } from './calendar-day';

interface CalendarGridProps {
  daysWithNotes: ReadonlySet<string>;
  displayedMonth: Date;
  onSelectDay: (date: Date) => void;
  selectedDate: Date;
  today: Date;
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export function CalendarGrid({
  daysWithNotes,
  displayedMonth,
  onSelectDay,
  selectedDate,
  today,
}: CalendarGridProps) {
  const firstDay = startOfMonth(displayedMonth);
  const lastDay = endOfMonth(displayedMonth);
  const days = eachDayOfInterval({ end: lastDay, start: firstDay });
  const leadingEmpty = (getDay(firstDay) + 6) % 7;

  return (
    <nav aria-label="Calendar">
      <div className="calendar-grid">
        {WEEKDAYS.map((day) => (
          <div className="calendar-weekday" key={day}>{day}</div>
        ))}
        {Array.from({ length: leadingEmpty }, (_, i) => (
          <div key={`empty-${String(i)}`} />
        ))}
        {days.map((date) => (
          <CalendarDay
            date={date}
            hasNote={daysWithNotes.has(format(date, 'yyyy-MM-dd'))}
            isSelected={isSameDay(date, selectedDate)}
            isToday={isSameDay(date, today)}
            key={date.toISOString()}
            onSelect={onSelectDay}
          />
        ))}
      </div>
    </nav>
  );
}
