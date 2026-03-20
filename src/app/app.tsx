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
import { SyncStatus } from '../sync/sync-status';
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
      key: '[',
      meta: true,
    },
    {
      handler: () => {
        document.querySelector<HTMLElement>('#right-pane .tiptap')?.focus();
      },
      key: ']',
      meta: true,
    },
    {
      handler: handleToday,
      key: '.',
      meta: true,
    },
    {
      handler: () => {
        const selected = document.querySelector<HTMLButtonElement>('.calendar-day[data-selected]');
        if (selected) {
          selected.focus();
        }
      },
      key: 'k',
      meta: true,
    },
    {
      handler: () => { handleSelectDay(subDays(selectedDate, 1)); },
      key: 'ArrowLeft',
      meta: true,
      shift: true,
    },
    {
      handler: () => { handleSelectDay(addDays(selectedDate, 1)); },
      key: 'ArrowRight',
      meta: true,
      shift: true,
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
      <SyncStatus />
      <ThemeToggle />
      <AboutDialog />
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
