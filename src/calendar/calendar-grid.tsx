import './calendar-grid.css';

import {
  addDays,
  eachDayOfInterval,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  startOfMonth,
  subDays,
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
const TOTAL_CELLS = 42; // 6 rows x 7 columns

export function CalendarGrid({
  daysWithNotes,
  displayedMonth,
  onSelectDay,
  selectedDate,
  today,
}: CalendarGridProps) {
  const firstDay = startOfMonth(displayedMonth);
  const leadingCount = (getDay(firstDay) + 6) % 7;

  const gridStart = leadingCount > 0 ? subDays(firstDay, leadingCount) : firstDay;
  const gridEnd = addDays(gridStart, TOTAL_CELLS - 1);
  const days = eachDayOfInterval({ end: gridEnd, start: gridStart });

  return (
    <nav aria-label="Calendar">
      <div className="calendar-grid">
        {WEEKDAYS.map((day) => (
          <div className="calendar-weekday" key={day}>{day}</div>
        ))}
        {days.map((date) => (
          <CalendarDay
            date={date}
            hasNote={daysWithNotes.has(format(date, 'yyyy-MM-dd'))}
            isOtherMonth={!isSameMonth(date, displayedMonth)}
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
