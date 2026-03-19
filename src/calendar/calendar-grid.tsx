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
import { getISOWeek } from 'date-fns/getISOWeek';
import { useCallback } from 'react';

import { CalendarDay } from './calendar-day';

interface CalendarGridProps {
  daysWithNotes: ReadonlySet<string>;
  displayedMonth: Date;
  onSelectDay: (date: Date) => void;
  selectedDate: Date;
  today: Date;
  weeksWithNotes: ReadonlySet<number>;
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const TOTAL_CELLS = 42; // 6 rows x 7 columns

export function CalendarGrid({
  daysWithNotes,
  displayedMonth,
  onSelectDay,
  selectedDate,
  today,
  weeksWithNotes,
}: CalendarGridProps) {
  const firstDay = startOfMonth(displayedMonth);
  const leadingCount = (getDay(firstDay) + 6) % 7;

  const gridStart = leadingCount > 0 ? subDays(firstDay, leadingCount) : firstDay;
  const gridEnd = addDays(gridStart, TOTAL_CELLS - 1);
  const days = eachDayOfInterval({ end: gridEnd, start: gridStart });

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const target = e.target;
    if (!(target instanceof HTMLButtonElement)) return;

    let offset = 0;
    if (e.key === 'ArrowRight') offset = 1;
    else if (e.key === 'ArrowLeft') offset = -1;
    else if (e.key === 'ArrowDown') offset = 7;
    else if (e.key === 'ArrowUp') offset = -7;
    else return;

    e.preventDefault();
    const buttons = Array.from(
      (e.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('button.calendar-day'),
    );
    const idx = buttons.indexOf(target);
    if (idx === -1) return;
    const next = buttons[idx + offset];
    if (next) next.focus();
  }, []);

  return (
    <nav aria-label="Calendar" onKeyDown={handleKeyDown}>
      <div className="calendar-grid">
        <div className="calendar-weeknumber-header" />
        {WEEKDAYS.map((day) => (
          <div className="calendar-weekday" key={day}>{day}</div>
        ))}
        {days.flatMap((date, i) => {
          const cells = [];
          if (i % 7 === 0) {
            const week = getISOWeek(date);
            cells.push(
              <div className={`calendar-weeknumber${weeksWithNotes.has(week) ? ' has-note' : ''}`} key={`w${i}`}>
                {week}
              </div>,
            );
          }
          cells.push(
            <CalendarDay
              date={date}
              hasNote={daysWithNotes.has(format(date, 'yyyy-MM-dd'))}
              isOtherMonth={!isSameMonth(date, displayedMonth)}
              isSelected={isSameDay(date, selectedDate)}
              isToday={isSameDay(date, today)}
              key={date.toISOString()}
              onSelect={onSelectDay}
            />,
          );
          return cells;
        })}
      </div>
    </nav>
  );
}
