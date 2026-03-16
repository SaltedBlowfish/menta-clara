import './note-dropdown.css';
import { useCallback, useRef, useState } from 'react';

interface NoteDropdownProps {
  notes: ReadonlyArray<{ id: string; name: string }>;
  onCreateNote: (name: string) => void;
  onSelectNote: (noteId: string) => void;
  selectedNoteId: string | null;
}

export function NoteDropdown({
  notes,
  onCreateNote,
  onSelectNote,
  selectedNoteId,
}: NoteDropdownProps) {
  const [creating, setCreating] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCreate = useCallback(() => {
    setCreating(true);
    setInputValue('');
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const handleConfirm = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onCreateNote(trimmed);
    }
    setCreating(false);
    setInputValue('');
  }, [inputValue, onCreateNote]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleConfirm();
      } else if (e.key === 'Escape') {
        setCreating(false);
        setInputValue('');
      }
    },
    [handleConfirm],
  );

  return (
    <div className="note-dropdown">
      {creating ? (
        <input
          className="note-dropdown-input"
          onBlur={handleConfirm}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Note name"
          ref={inputRef}
          type="text"
          value={inputValue}
        />
      ) : (
        <>
          <select
            aria-label="Select a permanent note"
            onChange={(e) => onSelectNote(e.target.value)}
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
            onClick={handleCreate}
            type="button"
          >
            New Note
          </button>
        </>
      )}
    </div>
  );
}
