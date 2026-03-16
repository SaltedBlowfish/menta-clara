import { format } from 'date-fns';
import { useCallback, useMemo, useState } from 'react';

import './app.css';
import { CalendarSection } from '../calendar/calendar-section';
import { DailyPane } from '../daily/daily-pane';
import { SplitPane } from '../layout/split-pane';
import { PermanentSection } from '../permanent/permanent-section';
import { LiveRegion } from '../shared/live-region';
import { useKeyboardShortcuts } from '../shared/use-keyboard-shortcuts';
import { ThemeToggle } from '../theme/theme-toggle';
import { WeeklySection } from '../weekly/weekly-section';

export function App() {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [announcement, setAnnouncement] = useState('');

  const handleSelectDay = useCallback((date: Date) => {
    setSelectedDate(date);
    setAnnouncement(`Viewing ${format(date, 'MMMM d, yyyy')}`);
  }, []);

  const shortcuts = useMemo(() => [
    {
      handler: () => {
        document.querySelector<HTMLElement>('#daily-pane .tiptap')?.focus();
      },
      key: '[',
      meta: true,
    },
    {
      handler: () => {
        document
          .querySelector<HTMLElement>(
            '#right-pane button, #right-pane [contenteditable="true"]',
          )
          ?.focus();
      },
      key: ']',
      meta: true,
    },
    // Phase 3: CMD+K for search, CMD+W for workspace switching
  ], []);

  useKeyboardShortcuts(shortcuts);

  return (
    <>
      <ThemeToggle />
      <SplitPane
        left={<DailyPane date={selectedDate} />}
        right={
          <>
            <WeeklySection date={selectedDate} />
            <PermanentSection />
            <CalendarSection
              onSelectDay={handleSelectDay}
              selectedDate={selectedDate}
            />
          </>
        }
      />
      <LiveRegion message={announcement} />
    </>
  );
}
