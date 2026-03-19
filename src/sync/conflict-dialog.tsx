import { useRef, useSyncExternalStore } from 'react';

import { format } from 'date-fns';

import { getConflicts, resolveConflict, subscribeConflicts } from './conflict-queue';
import './conflict-dialog.css';

function formatNoteId(noteId: string): string {
  if (noteId.startsWith('daily:')) {
    const date = noteId.replace('daily:', '');
    try { return `Daily note — ${format(new Date(date), 'MMMM d, yyyy')}`; } catch { return noteId; }
  }
  if (noteId.startsWith('weekly:')) return `Weekly note — ${noteId.replace('weekly:', '')}`;
  if (noteId.startsWith('permanent:')) return 'Permanent note';
  return noteId;
}

function formatTime(ts: number): string {
  return format(new Date(ts), 'MMM d, h:mm a');
}

export function ConflictDialog() {
  const conflicts = useSyncExternalStore(subscribeConflicts, getConflicts);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const conflict = conflicts[0];

  if (conflict && dialogRef.current && !dialogRef.current.open) {
    dialogRef.current.showModal();
  }

  if (!conflict) return null;

  const handleResolve = (resolution: 'incoming' | 'keep' | 'merge') => {
    resolveConflict(conflict.id, resolution);
    if (conflicts.length <= 1) {
      dialogRef.current?.close();
    }
  };

  return (
    <dialog className="conflict-dialog" ref={dialogRef}>
      <h2 className="conflict-title">Sync Conflict</h2>
      <p className="conflict-note-id">{formatNoteId(conflict.noteId)}</p>
      <p className="conflict-description">
        This note was edited on both devices. Your version is
        from {formatTime(conflict.localTime)}, and the incoming version is
        from {formatTime(conflict.incomingTime)}.
      </p>

      <div className="conflict-options">
        <button className="conflict-option" onClick={() => handleResolve('keep')} type="button">
          <span className="conflict-option-label">Keep mine</span>
          <span className="conflict-option-description">
            Discard the incoming version and keep your current note as-is.
          </span>
        </button>
        <button className="conflict-option" onClick={() => handleResolve('incoming')} type="button">
          <span className="conflict-option-label">Use theirs</span>
          <span className="conflict-option-description">
            Replace your note with the version from the other device.
          </span>
        </button>
        <button className="conflict-option" onClick={() => handleResolve('merge')} type="button">
          <span className="conflict-option-label">Keep both</span>
          <span className="conflict-option-description">
            Append the incoming version to the end of your note.
          </span>
        </button>
      </div>

      {conflicts.length > 1 && (
        <p className="conflict-counter">
          {conflicts.length - 1} more {conflicts.length === 2 ? 'conflict' : 'conflicts'} to resolve
        </p>
      )}
    </dialog>
  );
}
