import './permanent-section.css';
import { useCallback } from 'react';

import { useActiveNote } from '../app/use-active-note';
import { Tooltip } from '../shared/tooltip';
import { NoteBrowserItem } from './note-browser-item';
import { PermanentEditor } from './permanent-editor';
import { usePermanentNotes } from './use-permanent-notes';

export function PermanentSection() {
  const { createNote, notes, selectedNoteId, selectNote } =
    usePermanentNotes();
  const { navigateToNote } = useActiveNote();

  const handleCreate = useCallback(() => {
    createNote('Untitled');
  }, [createNote]);

  const handleOpenInEditor = useCallback(
    (noteId: string) => {
      navigateToNote({ id: noteId, type: 'permanent' });
    },
    [navigateToNote],
  );

  if (notes.length === 0) {
    return (
      <>
        <div className="note-browser-header">
          <span className="section-title">Notes</span>
          <Tooltip label="New note">
            <button
              aria-label="Create new note"
              className="note-browser-create"
              onClick={handleCreate}
              type="button"
            >
              +
            </button>
          </Tooltip>
        </div>
        <div className="permanent-empty">
          <p className="permanent-empty-heading">No notes yet</p>
          <p className="permanent-empty-body">
            Create a note from the editor to get started.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="note-browser-header">
        <span className="section-title">Notes</span>
        <button
          aria-label="Create new note"
          className="note-browser-create"
          onClick={handleCreate}
          type="button"
        >
          +
        </button>
      </div>
      <div aria-label="Permanent notes" className="note-browser-list" role="listbox">
        {notes.map((note) => (
          <NoteBrowserItem
            isSelected={note.id === selectedNoteId}
            key={note.id}
            name={note.name}
            noteId={note.id}
            onOpenInEditor={handleOpenInEditor}
            onSelect={selectNote}
          />
        ))}
      </div>
      {selectedNoteId ? (
        <div className="permanent-editor-area">
          <PermanentEditor noteId={selectedNoteId} />
        </div>
      ) : null}
    </>
  );
}
