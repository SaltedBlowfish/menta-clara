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
      <SplitPane
        left={<DailyPane date={selectedDate} />}
        right={
          <div className="right-pane-layout">
            <div className="right-pane-toolbar">
              <ThemeToggle />
            </div>
            <div className="right-pane-sections">
              <div className="right-pane-section">
                <WeeklySection date={selectedDate} />
              </div>
              <div className="right-pane-section">
                <PermanentSection />
              </div>
            </div>
            <div className="right-pane-calendar">
              <CalendarSection
                onSelectDay={handleSelectDay}
                selectedDate={selectedDate}
              />
            </div>
          </div>
        }
      />
      <LiveRegion message={announcement} />
    </>
  );
}
