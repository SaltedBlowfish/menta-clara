import './weekly-section.css';
import type { JSONContent } from '@tiptap/react';

import { StorageWarning } from '../app/storage-warning';
import { NoteEditor } from '../editor/editor';
import { useWeeklyNote } from './use-weekly-note';

interface WeeklySectionProps {
  date: Date;
  defaultContent?: JSONContent;
}

export function WeeklySection({ date, defaultContent }: WeeklySectionProps) {
  const { content, error, loading, saveContent, weekNoteId } =
    useWeeklyNote(date, defaultContent);

  return (
    <>
      <div className="weekly-editor-area">
        {loading ? null : (
          <NoteEditor content={content} noteId={weekNoteId} onUpdate={saveContent} />
        )}
      </div>
      {error ? <StorageWarning message={error} /> : null}
    </>
  );
}
