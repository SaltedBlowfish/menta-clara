import { useCallback } from 'react';

import { NoteEditor } from '../editor/editor';
import { PaneContent } from '../layout/pane';
import { CarryOverPrompt } from '../shared/carry-over-prompt';
import { useCarryOver } from '../shared/use-carry-over';
import { useWeeklyNote } from './use-weekly-note';

interface WeeklySectionProps {
  date: Date;
}

export function WeeklySection({ date }: WeeklySectionProps) {
  const { content, isNew, saveContent, weekNoteId } = useWeeklyNote(date);
  const { carryOver, handleCarryOver, handleStartBlank, resolvedContent } = useCarryOver(weekNoteId, isNew);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      e.preventDefault();
      e.currentTarget.querySelector<HTMLElement>('.tiptap')?.focus();
    }
  }, []);

  const initialContent = isNew ? resolvedContent : content;
  const showPrompt = isNew && carryOver === 'prompt';

  return showPrompt ? (
    <CarryOverPrompt
      label="last week's note"
      onCarryOver={handleCarryOver}
      onStartBlank={handleStartBlank}
    />
  ) : (
    <PaneContent onMouseDown={handleMouseDown}>
      <NoteEditor initialContent={initialContent} noteId={weekNoteId} onUpdate={saveContent} />
    </PaneContent>
  );
}
