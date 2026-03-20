import { useCallback, useMemo } from 'react';

import { NoteEditor } from '../editor/editor';
import { Pane, PaneContent } from '../layout/pane';
import { CarryOverPrompt } from '../shared/carry-over-prompt';
import { useCarryOver } from '../shared/use-carry-over';
import { createShadowWrite } from '../sync/shadow-write';
import { useDailyNote } from './use-daily-note';

interface DailyPaneProps {
  actions?: React.ReactNode;
  date: Date;
}

export function DailyPane(props: DailyPaneProps) {
  const { actions, date } = props;
  const { dateLabel, isNew, legacyContent, noteId } = useDailyNote(date);
  const { carryOver, handleCarryOver, handleStartBlank, resolvedContent } = useCarryOver(noteId, isNew);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      e.preventDefault();
      e.currentTarget.querySelector<HTMLElement>('.tiptap')?.focus();
    }
  }, []);

  const onUpdate = useMemo(() => createShadowWrite(noteId), [noteId]);
  const initialContent = legacyContent ?? (isNew ? resolvedContent : undefined);

  const showPrompt = isNew && carryOver === 'prompt';

  return (
    <Pane actions={actions} title={`Daily Note \u203a ${dateLabel}`}>
      {showPrompt ? (
        <CarryOverPrompt
          label="your most recent daily note"
          onCarryOver={handleCarryOver}
          onStartBlank={handleStartBlank}
        />
      ) : (
        <PaneContent onMouseDown={handleMouseDown}>
          <NoteEditor initialContent={initialContent} noteId={noteId} onUpdate={onUpdate} />
        </PaneContent>
      )}
    </Pane>
  );
}
