import './daily-pane.css';
import type { JSONContent } from '@tiptap/react';

import { StorageWarning } from '../app/storage-warning';
import { NoteEditor } from '../editor/editor';
import { useDailyNote } from './use-daily-note';

interface DailyPaneProps {
  date: Date;
  defaultContent?: JSONContent;
}

export function DailyPane(props: DailyPaneProps) {
  const { date, defaultContent } = props;
  const { content, dateLabel, error, loading, noteId, saveContent } = useDailyNote(date, defaultContent);

  return (
    <div className="daily-pane">
      <span className="section-title">Daily Note &rsaquo; {dateLabel}</span>
      {loading ? null : (
        <div className="daily-pane-editor">
          <NoteEditor content={content} noteId={noteId} onUpdate={saveContent} />
        </div>
      )}
      {error ? <StorageWarning message={error} /> : null}
    </div>
  );
}
