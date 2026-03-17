import { format } from 'date-fns';
import { useCallback, useState } from 'react';

import { StorageWarning } from '../app/storage-warning';
import { NoteEditor } from '../editor/editor';
import { Pane, PaneContent } from '../layout/pane';
import { CarryOverPrompt } from '../shared/carry-over-prompt';
import { Tooltip } from '../shared/tooltip';
import { useCarryOver } from '../shared/use-carry-over';
import { CardStack } from './card-stack';
import { useDailyNote } from './use-daily-note';
import { useDailyNotesList } from './use-daily-notes-list';

interface DailyPaneProps {
  date: Date;
  onSelectDate?: (dateStr: string) => void;
}

export function DailyPane(props: DailyPaneProps) {
  const { date, onSelectDate } = props;
  const { content, dateLabel, error, isNew, loading, noteId, saveContent } = useDailyNote(date);
  const [showStack, setShowStack] = useState(false);
  const { entries } = useDailyNotesList();
  const { carryOver, handleCarryOver, handleStartBlank, resolvedContent } = useCarryOver(noteId, isNew);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      e.preventDefault();
      e.currentTarget.querySelector<HTMLElement>('.tiptap')?.focus();
    }
  }, []);

  const handleToggleStack = useCallback(() => {
    setShowStack((prev) => !prev);
  }, []);

  const handleSelectCard = useCallback((dateStr: string) => {
    setShowStack(false);
    onSelectDate?.(dateStr);
  }, [onSelectDate]);

  const handleCloseStack = useCallback(() => {
    setShowStack(false);
  }, []);

  const currentDateStr = format(date, 'yyyy-MM-dd');
  const editorContent = isNew ? resolvedContent : content;
  const showPrompt = isNew && carryOver === 'prompt';
  const showEditor = !showPrompt && !loading && editorContent !== null;

  const stackLabel = showStack ? 'Close' : 'Browse notes';
  const stackButton = entries.length > 0 ? (
    <Tooltip label={stackLabel}>
      <button
        aria-label={showStack ? 'Close card stack' : 'Browse daily notes'}
        className="toolbar-btn"
        onClick={handleToggleStack}
        type="button"
      >
        <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="18">
          {showStack ? (
            <path d="M18 6 6 18M6 6l12 12" />
          ) : (
            <>
              <rect height="6" rx="1" width="16" x="4" y="14" />
              <rect height="6" opacity="0.6" rx="1" width="14" x="5" y="9" />
              <rect height="6" opacity="0.3" rx="1" width="12" x="6" y="4" />
            </>
          )}
        </svg>
      </button>
    </Tooltip>
  ) : null;

  return (
    <Pane actions={stackButton} title={`Daily Note \u203a ${dateLabel}`}>
      {showStack ? (
        <CardStack
          currentDate={currentDateStr}
          entries={entries}
          onClose={handleCloseStack}
          onSelect={handleSelectCard}
        />
      ) : showPrompt ? (
        <CarryOverPrompt
          label="your most recent daily note"
          onCarryOver={handleCarryOver}
          onStartBlank={handleStartBlank}
        />
      ) : (
        <>
          {showEditor && (
            <PaneContent onMouseDown={handleMouseDown}>
              <NoteEditor content={editorContent} noteId={noteId} onUpdate={saveContent} />
            </PaneContent>
          )}
          {error ? <StorageWarning message={error} /> : null}
        </>
      )}
    </Pane>
  );
}
