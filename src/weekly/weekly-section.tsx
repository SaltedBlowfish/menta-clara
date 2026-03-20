import { useCallback, useMemo } from 'react';

import { NoteEditor } from '../editor/editor';
import { PaneContent } from '../layout/pane';
import { CarryOverPrompt } from '../shared/carry-over-prompt';
import { useCarryOver } from '../shared/use-carry-over';
import { createShadowWrite } from '../sync/shadow-write';
import { useWeeklyNote } from './use-weekly-note';

interface WeeklySectionProps {
  date: Date;
}

export function WeeklySection({ date }: WeeklySectionProps) {
  const { isNew, legacyContent, loading, weekNoteId } = useWeeklyNote(date);
  const { carryOver, handleCarryOver, handleStartBlank, resolvedContent } = useCarryOver(weekNoteId, isNew);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      e.preventDefault();
      e.currentTarget.querySelector<HTMLElement>('.tiptap')?.focus();
    }
  }, []);

  const onUpdate = useMemo(() => createShadowWrite(weekNoteId), [weekNoteId]);
  const initialContent = legacyContent ?? (isNew ? resolvedContent : undefined);

  const showPrompt = isNew && carryOver === 'prompt';
  const showEditor = !showPrompt && !loading;

  return showPrompt ? (
    <CarryOverPrompt
      label="last week's note"
      onCarryOver={handleCarryOver}
      onStartBlank={handleStartBlank}
    />
  ) : showEditor ? (
    <PaneContent onMouseDown={handleMouseDown}>
      <NoteEditor initialContent={initialContent} noteId={weekNoteId} onUpdate={onUpdate} />
    </PaneContent>
  ) : null;
}
