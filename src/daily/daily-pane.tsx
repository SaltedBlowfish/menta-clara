import { useCallback } from 'react';

import { StorageWarning } from '../app/storage-warning';
import { NoteEditor } from '../editor/editor';
import { Pane, PaneContent } from '../layout/pane';
import { CarryOverPrompt } from '../shared/carry-over-prompt';
import { useCarryOver } from '../shared/use-carry-over';
import { useDailyNote } from './use-daily-note';

interface DailyPaneProps {
  actions?: React.ReactNode;
  date: Date;
}

export function DailyPane(props: DailyPaneProps) {
  const { actions, date } = props;
  const { content, dateLabel, error, isNew, loading, noteId, saveContent } = useDailyNote(date);
  const { carryOver, handleCarryOver, handleStartBlank, resolvedContent } = useCarryOver(noteId, isNew);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      e.preventDefault();
      e.currentTarget.querySelector<HTMLElement>('.tiptap')?.focus();
    }
  }, []);

  const editorContent = isNew ? resolvedContent : content;
  const showPrompt = isNew && carryOver === 'prompt';
  const showEditor = !showPrompt && !loading && editorContent !== null;

  return (
    <Pane actions={actions} title={`Daily Note \u203a ${dateLabel}`}>
      {showPrompt ? (
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
