import { format, parseISO } from 'date-fns';
import { useCallback, useContext, useMemo, useRef, useState } from 'react';

import './app.css';
import { type ActiveNote, ActiveNoteContext } from './active-note-context';
import { CalendarSection } from '../calendar/calendar-section';
import { type CommandPaletteHandle, CommandPalette } from '../command-palette/command-palette';
import { DailyPane } from '../daily/daily-pane';
import { SplitPane } from '../layout/split-pane';
import { PermanentSection } from '../permanent/permanent-section';
import { LiveRegion } from '../shared/live-region';
import { useKeyboardShortcuts } from '../shared/use-keyboard-shortcuts';
import { ThemeToggle } from '../theme/theme-toggle';
import { WeeklySection } from '../weekly/weekly-section';
import { WorkspaceContext } from '../workspace/workspace-context';

const EMPTY_COMMANDS: ReadonlyArray<never> = [];

export function App() {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [announcement, setAnnouncement] = useState('');
  const { activeWorkspaceId } = useContext(WorkspaceContext);
  const paletteRef = useRef<CommandPaletteHandle>(null);

  const workspaceName =
    activeWorkspaceId === 'personal' ? 'Personal' : activeWorkspaceId;

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
    {
      handler: () => {
        paletteRef.current?.open();
        setAnnouncement('Command palette opened');
      },
      key: 'k',
      meta: true,
    },
  ], []);

  useKeyboardShortcuts(shortcuts);

  const handleNavigateDaily = useCallback((dateStr: string) => {
    setSelectedDate(parseISO(dateStr));
  }, []);

  return (
    <>
      <span className="workspace-label" aria-label="Current workspace">
        {workspaceName}
      </span>
      <ActiveNoteContext.Provider value={activeNoteValue}>
        <SplitPane
          left={<DailyPane activeNote={activeNote} date={selectedDate} />}
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
        <CommandPalette
          commands={EMPTY_COMMANDS}
          onAnnounce={setAnnouncement}
          onNavigateDaily={handleNavigateDaily}
          ref={paletteRef}
        />
      </ActiveNoteContext.Provider>
    </>
  );
}
