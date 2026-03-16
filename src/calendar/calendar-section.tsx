import './calendar-section.css';

import { format } from 'date-fns';
import { useMemo } from 'react';

import { CollapsibleSection } from '../shared/collapsible-section';
import { CalendarGrid } from './calendar-grid';
import { useCalendar } from './use-calendar';

interface CalendarSectionProps {
  onSelectDay: (date: Date) => void;
  selectedDate: Date;
}

export function CalendarSection({ onSelectDay, selectedDate }: CalendarSectionProps) {
  const { daysWithNotes, displayedMonth, goToNextMonth, goToPreviousMonth, monthLabel } =
    useCalendar(selectedDate);

  const today = useMemo(() => new Date(), []);
  const sectionTitle = format(displayedMonth, 'MMM yyyy');

  return (
    <CollapsibleSection sectionId="calendar" title={sectionTitle}>
      <div className="calendar-nav">
        <button
          aria-label="Previous month"
          className="calendar-nav-button"
          onClick={goToPreviousMonth}
          type="button"
        >
          &#9664;
        </button>
        <span className="calendar-nav-label">{monthLabel}</span>
        <button
          aria-label="Next month"
          className="calendar-nav-button"
          onClick={goToNextMonth}
          type="button"
        >
          &#9654;
        </button>
      </div>
      <CalendarGrid
        daysWithNotes={daysWithNotes}
        displayedMonth={displayedMonth}
        onSelectDay={onSelectDay}
        selectedDate={selectedDate}
        today={today}
      />
    </CollapsibleSection>
  );
}
