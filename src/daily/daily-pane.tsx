import './daily-pane.css';
import { format } from 'date-fns';
import { useCallback, useState } from 'react';

import { StorageWarning } from '../app/storage-warning';
import { NoteEditor } from '../editor/editor';
import { CardStack } from './card-stack';
import { useDailyNote } from './use-daily-note';
import { useDailyNotesList } from './use-daily-notes-list';

interface DailyPaneProps {
  date: Date;
  onSelectDate?: (dateStr: string) => void;
}

export function DailyPane(props: DailyPaneProps) {
  const { date, onSelectDate } = props;
  const { content, dateLabel, error, loading, noteId, saveContent } = useDailyNote(date);
  const [showStack, setShowStack] = useState(false);
  const { entries, refresh: refreshEntries } = useDailyNotesList();

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      e.preventDefault();
      e.currentTarget.querySelector<HTMLElement>('.tiptap')?.focus();
    }
  }, []);

  const handleToggleStack = useCallback(() => {
    setShowStack((prev) => {
      if (!prev) refreshEntries();
      return !prev;
    });
  }, [refreshEntries]);

  const handleSelectCard = useCallback((dateStr: string) => {
    setShowStack(false);
    onSelectDate?.(dateStr);
  }, [onSelectDate]);

  const handleCloseStack = useCallback(() => {
    setShowStack(false);
  }, []);

  const currentDateStr = format(date, 'yyyy-MM-dd');

  return (
    <div className="daily-pane">
      <div className="daily-pane-header">
        <span className="section-title">Daily Note &rsaquo; {dateLabel}</span>
        <button
          aria-label={showStack ? 'Close card stack' : 'Browse daily notes'}
          className="toolbar-btn daily-stack-btn"
          onClick={handleToggleStack}
          type="button"
        >
          <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="18">
            {showStack ? (
              <path d="M18 6 6 18M6 6l12 12" />
            ) : (
              <>
                <rect height="6" rx="1" width="16" x="4" y="14" />
                <rect height="6" rx="1" width="14" x="5" y="9" opacity="0.6" />
                <rect height="6" rx="1" width="12" x="6" y="4" opacity="0.3" />
              </>
            )}
          </svg>
        </button>
      </div>
      {showStack ? (
        <CardStack
          currentDate={currentDateStr}
          entries={entries}
          onClose={handleCloseStack}
          onSelect={handleSelectCard}
        />
      ) : (
        <>
          {loading ? null : (
            <div className="daily-pane-editor" onMouseDown={handleMouseDown}>
              <NoteEditor content={content} noteId={noteId} onUpdate={saveContent} />
            </div>
          )}
          {error ? <StorageWarning message={error} /> : null}
        </>
      )}
    </div>
  );
}
