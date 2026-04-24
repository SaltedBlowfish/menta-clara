import { addDays, format, isSameDay, parseISO, subDays } from 'date-fns';
import { getISOWeek } from 'date-fns/getISOWeek';
// eslint-disable-next-line no-restricted-imports -- DOM event subscription
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import './app.css';
import { CalendarSection } from '../calendar/calendar-section';
import { DailyPane } from '../daily/daily-pane';
import { handleExport, handleImport } from '../export/export-actions';
import { MobileLayout } from '../layout/mobile-layout';
import { Pane } from '../layout/pane';
import { SplitPane } from '../layout/split-pane';
import { AboutDialog } from '../onboarding/about-dialog';
import { LiveRegion } from '../shared/live-region';
import { ShortcutHints } from '../shared/shortcut-hints';
import { Tooltip } from '../shared/tooltip';
import { useIsMobile } from '../shared/use-is-mobile';
import { useKeyboardShortcuts } from '../shared/use-keyboard-shortcuts';
import { ThemeToggle } from '../theme/theme-toggle';
import { WeeklySection } from '../weekly/weekly-section';
import { type ActiveNote, ActiveNoteContext } from './active-note-context';

export function App() {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [announcement, setAnnouncement] = useState('');
  const isMobile = useIsMobile();
  const mobilePanelRef = useRef<{ goToDaily: () => void } | null>(null);

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
    mobilePanelRef.current?.goToDaily();
    // Refocus the daily editor after navigating
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('#daily-pane .tiptap')?.focus();
    });
  }, [navigateToNote]);

  const handleToday = useCallback(() => {
    returnToToday();
    setAnnouncement('Viewing today');
    mobilePanelRef.current?.goToDaily();
  }, [returnToToday]);

  const shortcuts = useMemo(() => [
    {
      handler: () => {
        document.querySelector<HTMLElement>('#daily-pane .tiptap')?.focus();
      },
      key: '1',
      meta: true,
    },
    {
      handler: () => {
        document.querySelector<HTMLElement>('#right-pane .tiptap')?.focus();
      },
      key: '2',
      meta: true,
    },
    {
      handler: () => {
        const selected = document.querySelector<HTMLButtonElement>('.calendar-day[data-selected]');
        if (selected) {
          selected.focus();
        }
      },
      key: '3',
      meta: true,
    },
    {
      handler: handleToday,
      key: '.',
      meta: true,
    },
    {
      handler: () => { handleSelectDay(subDays(selectedDate, 1)); },
      key: '[',
      meta: true,
    },
    {
      handler: () => { handleSelectDay(addDays(selectedDate, 1)); },
      key: ']',
      meta: true,
    },
  ], [handleToday, handleSelectDay, selectedDate]);

  useKeyboardShortcuts(shortcuts);

  const [focusedPane, setFocusedPane] = useState<'daily' | 'weekly' | undefined>(undefined);

  const handleFocusCapture = useCallback((e: React.FocusEvent) => {
    const target = e.target;
    if (target instanceof HTMLElement) {
      if (target.closest('#daily-pane')) {
        setFocusedPane('daily');
      } else if (target.closest('#right-pane')) {
        setFocusedPane('weekly');
      }
    }
  }, []);

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
      <AboutDialog />
      <Tooltip label="View on GitHub">
        <a
          aria-label="View source on GitHub"
          className="toolbar-btn"
          href="https://github.com/SaltedBlowfish/menta-clara"
          rel="noreferrer noopener"
          target="_blank"
        >
          <svg fill="currentColor" height="20" viewBox="0 0 16 16" width="20">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </a>
      </Tooltip>
    </>
  );

  const dailyContent = (
    <DailyPane
      actions={isMobile ? weeklyActions : undefined}
      date={selectedDate}
    />
  );
  const weeklyContent = (
    <Pane actions={weeklyActions} title={`Weekly Note \u203a ${weekLabel}`}>
      <div className="right-pane-sections">
        <WeeklySection date={selectedDate} />
      </div>
      {!isMobile && (
        <div className="right-pane-calendar">
          <CalendarSection onSelectDay={handleSelectDay} onToday={handleToday} selectedDate={selectedDate} />
        </div>
      )}
    </Pane>
  );
  const calendarContent = (
    <Pane actions={weeklyActions} title="Calendar">
      <CalendarSection onSelectDay={handleSelectDay} onToday={handleToday} selectedDate={selectedDate} />
    </Pane>
  );

  return (
    <ActiveNoteContext.Provider value={activeNoteValue}>
      {isMobile ? (
        <MobileLayout
          calendar={calendarContent}
          daily={dailyContent}
          onTodayTab={handleToday}
          panelRef={mobilePanelRef}
          weekly={weeklyContent}
        />
      ) : (
        <div className="app-shell" onFocusCapture={handleFocusCapture}>
          <SplitPane left={dailyContent} right={weeklyContent} />
          <ShortcutHints context={focusedPane} isToday={isSameDay(selectedDate, new Date())} />
        </div>
      )}
      <LiveRegion message={announcement} />
    </ActiveNoteContext.Provider>
  );
}
