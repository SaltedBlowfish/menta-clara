import './daily-pane.css';
import type { JSONContent } from '@tiptap/react';
import { useCallback } from 'react';

import { type ActiveNote } from '../app/active-note-context';
import { useActiveNote } from '../app/use-active-note';
import { StorageWarning } from '../app/storage-warning';
import { NoteEditor } from '../editor/editor';
import { useDailyNote } from './use-daily-note';

interface DailyPaneProps {
  activeNote: ActiveNote;
  date: Date;
  defaultContent?: JSONContent;
}

export function DailyPane(props: DailyPaneProps) {
  const { date, defaultContent } = props;
  const { content, dateLabel, error, loading, saveContent } = useDailyNote(date, defaultContent);
  const { isViewingToday, returnToToday } = useActiveNote();

  const handleEditorAreaClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      const tiptap = e.currentTarget.querySelector<HTMLElement>('.tiptap');
      tiptap?.focus();
    }
  }, []);

  return (
    <div className="daily-pane">
      <div className="daily-pane-header">
        <span className="section-title">Daily Note</span>
        <span className="daily-pane-date">{dateLabel}</span>
        {!isViewingToday ? (
          <button className="back-to-today" onClick={returnToToday} type="button">
            &lt; Back to today
          </button>
        ) : null}
      </div>
      {loading ? null : (
        <div className="daily-pane-editor" onClick={handleEditorAreaClick} role="presentation">
          <NoteEditor content={content} onUpdate={saveContent} />
        </div>
      )}
      {error ? <StorageWarning message={error} /> : null}
    </div>
  );
}
