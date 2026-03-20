import type { JSONContent } from '@tiptap/react';

import { useCallback, useRef, useState } from 'react';

import { Tooltip } from '../shared/tooltip';
import { HistoryPreview, formatFull, formatTime } from './history-preview';
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
  const [selected, setSelected] = useState<HistoryEntry | null>(null);

  const handleOpen = useCallback(() => {
    void getHistory(noteId).then((result) => {
      setEntries(result);
      setSelected(result[0] ?? null);
    });
    dialogRef.current?.showModal();
  }, [noteId]);

  const handleRestore = useCallback(() => {
    if (!selected) return;
    onRestore(selected.content);
    dialogRef.current?.close();
  }, [onRestore, selected]);

  const handleClose = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  return (
    <>
      <Tooltip label="Version history">
        <button
          aria-label="View version history"
          onClick={handleOpen}
          onMouseDown={(e) => { e.preventDefault(); }}
          type="button"
        >
          <svg fill="none" height="20" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 20 20" width="20">
            <circle cx="10" cy="10" r="7" />
            <path d="M10 6v4l2.5 2.5" strokeLinecap="round" />
          </svg>
        </button>
      </Tooltip>

      <dialog className="history-dialog" ref={dialogRef}>
        {entries.length === 0 ? (
          <p className="history-empty">No history yet. Snapshots are saved as you edit.</p>
        ) : (
          <>
            <div className="history-sidebar">
              <div className="history-sidebar-header">Versions</div>
              <div className="history-version-list">
                {entries.map((entry) => (
                  <button
                    className={`history-version${entry.id === selected?.id ? ' selected' : ''}`}
                    key={entry.id}
                    onClick={() => setSelected(entry)}
                    type="button"
                  >
                    {formatTime(entry.timestamp)}
                  </button>
                ))}
              </div>
            </div>
            <div className="history-preview">
              <div className="history-preview-header">
                <span>{selected ? formatFull(selected.timestamp) : ''}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" onClick={handleRestore} type="button">
                    Restore
                  </button>
                  <button className="btn btn-secondary" onClick={handleClose} type="button">
                    Close
                  </button>
                </div>
              </div>
              {selected && <HistoryPreview content={selected.content} />}
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
