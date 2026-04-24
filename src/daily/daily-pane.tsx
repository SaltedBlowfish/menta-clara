import { useCallback } from 'react';

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
  const { content, dateLabel, isNew, noteId, saveContent } = useDailyNote(date);
  const { carryOver, handleCarryOver, handleStartBlank, resolvedContent } = useCarryOver(noteId, isNew);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      e.preventDefault();
      e.currentTarget.querySelector<HTMLElement>('.tiptap')?.focus();
    }
  }, []);

  const initialContent = isNew ? resolvedContent : content;
  const showPrompt = isNew && carryOver === 'prompt';

  return (
    <Pane actions={actions} title={`Daily Note › ${dateLabel}`}>
      {showPrompt ? (
        <CarryOverPrompt
          label="your most recent daily note"
          onCarryOver={handleCarryOver}
          onStartBlank={handleStartBlank}
        />
      ) : (
        <PaneContent onMouseDown={handleMouseDown}>
          <NoteEditor initialContent={initialContent} noteId={noteId} onUpdate={saveContent} />
        </PaneContent>
      )}
    </Pane>
  );
}
