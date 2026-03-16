import './weekly-section.css';
import { useCallback } from 'react';

import { StorageWarning } from '../app/storage-warning';
import { NoteEditor } from '../editor/editor';
import { useWeeklyNote } from './use-weekly-note';

interface WeeklySectionProps {
  date: Date;
}

export function WeeklySection({ date }: WeeklySectionProps) {
  const { content, error, loading, saveContent, weekLabel } =
    useWeeklyNote(date);

  const handleEditorAreaClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      const tiptap = e.currentTarget.querySelector<HTMLElement>('.tiptap');
      tiptap?.focus();
    }
  }, []);

  return (
    <>
      <span className="section-title">Weekly Note &rsaquo; {weekLabel}</span>
      <div className="weekly-editor-area" onClick={handleEditorAreaClick} role="presentation">
        {loading ? null : (
          <NoteEditor content={content} onUpdate={saveContent} />
        )}
      </div>
      {error ? <StorageWarning message={error} /> : null}
    </>
  );
}
