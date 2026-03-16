import './permanent-section.css';
import { useCallback, useRef } from 'react';

import { NoteEditor } from '../editor/editor';
import { CollapsibleSection } from '../shared/collapsible-section';
import { useNote } from '../storage/use-note';
import { InlineTitle } from './inline-title';
import { NoteDropdown } from './note-dropdown';
import { usePermanentNotes } from './use-permanent-notes';

export function PermanentSection() {
  const { createNote, notes, renameNote, selectedNoteId, selectNote } =
    usePermanentNotes();
  const { content, saveContent } = useNote(selectedNoteId ?? '__unused__');

  const handleCreate = useCallback(() => {
    void createNote('Untitled');
  }, [createNote]);

  const selectedName = selectedNoteId
    ? (notes.find((n) => n.id === selectedNoteId)?.name ?? 'Untitled')
    : '';

  const handleRename = useCallback(
    (name: string) => {
      if (selectedNoteId) {
        renameNote(selectedNoteId, name);
      }
    },
    [renameNote, selectedNoteId],
  );

  return (
    <>
      <span className="section-title">Permanent Notes</span>
      <CollapsibleSection sectionId="permanent" title="Notes">
        <NoteDropdown
          notes={notes}
          onCreateNote={handleCreate}
          onSelectNote={selectNote}
          selectedNoteId={selectedNoteId}
        />
        {selectedNoteId ? (
          <div
            className="permanent-editor-area"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                const tiptap = e.currentTarget.querySelector<HTMLElement>('.tiptap');
                tiptap?.focus();
              }
            }}
            role="presentation"
          >
            <InlineTitle name={selectedName} onRename={handleRename} />
            <NoteEditor content={content} onUpdate={saveContent} />
          </div>
        ) : (
          <div className="permanent-empty">
            <p className="permanent-empty-heading">No permanent notes yet</p>
            <p className="permanent-empty-body">
              Create a note to keep content that isn&apos;t tied to a date.
            </p>
          </div>
        )}
      </CollapsibleSection>
    </>
  );
}
