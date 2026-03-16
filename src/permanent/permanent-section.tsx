import './permanent-section.css';
import { NoteEditor } from '../editor/editor';
import { CollapsibleSection } from '../shared/collapsible-section';
import { useNote } from '../storage/use-note';
import { NoteDropdown } from './note-dropdown';
import { usePermanentNotes } from './use-permanent-notes';

export function PermanentSection() {
  const { createNote, notes, selectedNoteId, selectNote } =
    usePermanentNotes();
  const { content, saveContent } = useNote(selectedNoteId ?? '__unused__');

  const handleCreate = (name: string) => {
    void createNote(name);
  };

  return (
    <CollapsibleSection sectionId="permanent" title="Notes">
      <NoteDropdown
        notes={notes}
        onCreateNote={handleCreate}
        onSelectNote={selectNote}
        selectedNoteId={selectedNoteId}
      />
      {selectedNoteId ? (
        <NoteEditor content={content} onUpdate={saveContent} />
      ) : (
        <div className="permanent-empty">
          <p className="permanent-empty-heading">No permanent notes yet</p>
          <p className="permanent-empty-body">
            Create a note to keep content that isn&apos;t tied to a date.
          </p>
        </div>
      )}
    </CollapsibleSection>
  );
}
