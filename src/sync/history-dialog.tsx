import type { JSONContent } from '@tiptap/react';

import { useCallback, useRef, useState } from 'react';

import { Tooltip } from '../shared/tooltip';
import { type HistoryEntry, getHistory } from './note-history';
import './history-dialog.css';

interface HistoryDialogProps {
  noteId: string;
  onRestore: (content: JSONContent) => void;
}

export function HistoryDialog(props: HistoryDialogProps) {
  const { noteId, onRestore } = props;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [entries, setEntries] = useState<Array<HistoryEntry>>([]);

  const handleOpen = useCallback(() => {
    void getHistory(noteId).then(setEntries);
    dialogRef.current?.showModal();
  }, [noteId]);

  const handleRestore = useCallback(
    (entry: HistoryEntry) => {
      onRestore(entry.content);
      dialogRef.current?.close();
    },
    [onRestore],
  );

  return (
    <>
      <Tooltip label="Version history">
        <button
          aria-label="View version history"
          className="toolbar-btn"
          onClick={handleOpen}
          type="button"
        >
          <svg fill="none" height="20" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 20 20" width="20">
            <circle cx="10" cy="10" r="7" />
            <path d="M10 6v4l2.5 2.5" strokeLinecap="round" />
          </svg>
        </button>
      </Tooltip>

      <dialog className="history-dialog" ref={dialogRef}>
        <div className="history-header">
          <h3>Version History</h3>
          <button onClick={() => dialogRef.current?.close()} type="button">
            Close
          </button>
        </div>
        <div className="history-list">
          {entries.length === 0 ? (
            <p className="history-empty">
              No history yet. Snapshots are saved automatically as you edit.
            </p>
          ) : (
            entries.map((entry) => (
              <button
                className="history-entry"
                key={entry.id}
                onClick={() => handleRestore(entry)}
                type="button"
              >
                <span>{formatTimestamp(entry.timestamp)}</span>
                <span>Restore</span>
              </button>
            ))
          )}
        </div>
      </dialog>
    </>
  );
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
