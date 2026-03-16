import './note-dropdown.css';

interface NoteDropdownProps {
  notes: ReadonlyArray<{ id: string; name: string }>;
  onCreateNote: () => void;
  onSelectNote: (noteId: string) => void;
  selectedNoteId: string | null;
}

export function NoteDropdown({
  notes,
  onCreateNote,
  onSelectNote,
  selectedNoteId,
}: NoteDropdownProps) {
  return (
    <div className="note-dropdown">
      <select
        aria-label="Select a permanent note"
        onChange={(e) => { onSelectNote(e.target.value); }}
        value={selectedNoteId ?? ''}
      >
        <option disabled value="">
          Select a note...
        </option>
        {notes.map((note) => (
          <option key={note.id} value={note.id}>
            {note.name}
          </option>
        ))}
      </select>
      <button
        className="note-dropdown-create"
        onClick={onCreateNote}
        type="button"
      >
        New Note
      </button>
    </div>
  );
}
