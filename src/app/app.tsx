import { format, parseISO } from 'date-fns';
import { getISOWeek } from 'date-fns/getISOWeek';
// eslint-disable-next-line no-restricted-imports -- DOM event subscription
import { useCallback, useEffect, useMemo, useState } from 'react';

import './app.css';
import { type ActiveNote, ActiveNoteContext } from './active-note-context';
import { CalendarSection } from '../calendar/calendar-section';
import { DailyPane } from '../daily/daily-pane';
import { handleExport, handleImport } from '../export/export-actions';
import { Pane } from '../layout/pane';
import { SplitPane } from '../layout/split-pane';
import { LiveRegion } from '../shared/live-region';
import { Tooltip } from '../shared/tooltip';
import { useKeyboardShortcuts } from '../shared/use-keyboard-shortcuts';
import { ThemeToggle } from '../theme/theme-toggle';
import { WeeklySection } from '../weekly/weekly-section';

export function App() {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [announcement, setAnnouncement] = useState('');

  const todayNoteId = `daily:${format(new Date(), 'yyyy-MM-dd')}`;
  const [activeNote, setActiveNote] = useState<ActiveNote>({
    id: todayNoteId,
    type: 'daily',
  });

  const navigateToNote = useCallback((note: ActiveNote) => {
    setActiveNote(note);
  }, []);

  const returnToToday = useCallback(() => {
    const today = new Date();
    setActiveNote({
      id: `daily:${format(today, 'yyyy-MM-dd')}`,
      type: 'daily',
    });
    setSelectedDate(today);
  }, []);

  const activeNoteValue = useMemo(
    () => ({ activeNote, navigateToNote, returnToToday }),
    [activeNote, navigateToNote, returnToToday],
  );

  const handleSelectDay = useCallback((date: Date) => {
    setSelectedDate(date);
    setAnnouncement(`Viewing ${format(date, 'MMMM d, yyyy')}`);
    navigateToNote({
      id: `daily:${format(date, 'yyyy-MM-dd')}`,
      type: 'daily',
    });
  }, [navigateToNote]);

  const handleSelectDayFromStack = useCallback((dateStr: string) => {
    const date = parseISO(dateStr);
    setSelectedDate(date);
    setAnnouncement(`Viewing ${format(date, 'MMMM d, yyyy')}`);
    navigateToNote({ id: `daily:${dateStr}`, type: 'daily' });
  }, [navigateToNote]);

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
  ], []);

  useKeyboardShortcuts(shortcuts);

  useEffect(() => {
    const handler = (e: Event) => {
      const dateStr = (e as CustomEvent<string>).detail;
      const date = parseISO(dateStr);
      setSelectedDate(date);
      navigateToNote({ id: `daily:${dateStr}`, type: 'daily' });
    };
    window.addEventListener('date-reference-click', handler);
    return () => window.removeEventListener('date-reference-click', handler);
  }, [navigateToNote]);

  const weekLabel = `Week ${String(getISOWeek(selectedDate))}`;

  const weeklyActions = (
    <>
      <Tooltip label="Import">
        <button
          aria-label="Import data"
          className="toolbar-btn"
          onClick={() => handleImport(setAnnouncement)}
          type="button"
        >
          <svg fill="none" height="20" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 20 20" width="20">
            <path d="M3 14v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2M10 3v10M6 9l4 4 4-4" />
          </svg>
        </button>
      </Tooltip>
      <Tooltip label="Export">
        <button
          aria-label="Export data"
          className="toolbar-btn"
          onClick={() => handleExport(setAnnouncement)}
          type="button"
        >
          <svg fill="none" height="20" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 20 20" width="20">
            <path d="M3 14v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2M10 13V3M6 7l4-4 4 4" />
          </svg>
        </button>
      </Tooltip>
      <ThemeToggle />
    </>
  );

  return (
    <ActiveNoteContext.Provider value={activeNoteValue}>
      <SplitPane
        left={<DailyPane date={selectedDate} onSelectDate={handleSelectDayFromStack} />}
        right={
          <Pane actions={weeklyActions} title={`Weekly Note \u203a ${weekLabel}`}>
            <div className="right-pane-sections">
              <WeeklySection date={selectedDate} />
            </div>
            <div className="right-pane-calendar">
              <CalendarSection
                onSelectDay={handleSelectDay}
                selectedDate={selectedDate}
              />
            </div>
          </Pane>
        }
      />
      <LiveRegion message={announcement} />
    </ActiveNoteContext.Provider>
  );
}
