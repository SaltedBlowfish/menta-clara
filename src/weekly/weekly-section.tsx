import './weekly-section.css';
import { StorageWarning } from '../app/storage-warning';
import { NoteEditor } from '../editor/editor';
import { CollapsibleSection } from '../shared/collapsible-section';
import { useWeeklyNote } from './use-weekly-note';

interface WeeklySectionProps {
  date: Date;
}

export function WeeklySection({ date }: WeeklySectionProps) {
  const { content, error, loading, saveContent, weekLabel } =
    useWeeklyNote(date);

  return (
    <CollapsibleSection sectionId="weekly" title={weekLabel}>
      {loading ? null : (
        <NoteEditor content={content} onUpdate={saveContent} />
      )}
      {error ? <StorageWarning message={error} /> : null}
    </CollapsibleSection>
  );
}
