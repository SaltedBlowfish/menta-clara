import './daily-pane.css';
import { StorageWarning } from '../app/storage-warning';
import { NoteEditor } from '../editor/editor';
import { useDailyNote } from './use-daily-note';

interface DailyPaneProps {
  date: Date;
}

export function DailyPane(props: DailyPaneProps) {
  const { date } = props;
  const { content, dateLabel, error, loading, saveContent } = useDailyNote(date);

  return (
    <div className="daily-pane">
      <div className="daily-pane-header">
        <span className="daily-pane-date">{dateLabel}</span>
      </div>
      {loading ? null : (
        <div className="daily-pane-editor">
          <NoteEditor content={content} onUpdate={saveContent} />
        </div>
      )}
      {error ? <StorageWarning message={error} /> : null}
    </div>
  );
}
