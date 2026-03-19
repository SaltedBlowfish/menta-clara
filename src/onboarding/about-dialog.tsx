import { useCallback, useRef } from 'react';

import { Tooltip } from '../shared/tooltip';
import { usePersistedState } from '../shared/use-persisted-state';
import { loadSampleData } from './sample-data';
import './welcome-dialog.css';

export function AboutDialog() {
  const [seen, setSeen] = usePersistedState<boolean>('setting:welcomeSeen', false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Auto-open on first visit
  if (!seen && dialogRef.current && !dialogRef.current.open) {
    dialogRef.current.showModal();
  }

  const handleOpen = useCallback(() => {
    dialogRef.current?.showModal();
  }, []);

  const handleClose = useCallback(() => {
    dialogRef.current?.close();
    if (!seen) setSeen(true);
  }, [seen, setSeen]);

  const handleLoadSample = useCallback(() => {
    loadSampleData();
    dialogRef.current?.close();
    setSeen(true);
  }, [setSeen]);

  return (
    <>
      <Tooltip label="About & Privacy">
        <button
          aria-label="About and privacy info"
          className="toolbar-btn"
          onClick={handleOpen}
          type="button"
        >
          <svg fill="none" height="20" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 20 20" width="20">
            <circle cx="10" cy="10" r="8" />
            <path d="M10 9v5" strokeLinecap="round" />
            <circle cx="10" cy="6.5" fill="currentColor" r="0.75" stroke="none" />
          </svg>
        </button>
      </Tooltip>

      <dialog className="welcome-dialog" ref={dialogRef}>
        <h2 className="welcome-title">{seen ? 'About Menta Clara' : 'Welcome to Menta Clara'}</h2>
        <div className="welcome-body">
          <p>
            A calm, private space for daily and weekly notes.
            Write freely — everything stays on your device.
          </p>
          <div className="welcome-privacy">
            <p>
              <strong>Your data never leaves your browser.</strong> Notes are
              stored in IndexedDB on this device. There is no server, no account,
              no analytics, no tracking — nothing is transmitted. Ever.
            </p>
            <p className="welcome-muted">
              Don't take our word for it — open your browser's Network tab and see
              for yourself. After the initial page load, you'll see zero requests.
            </p>
          </div>
          {!seen && (
            <p>
              Want to see how it works? We can load a few sample notes to get you
              started, or you can jump right in with a blank slate.
            </p>
          )}
        </div>
        <div className="welcome-actions">
          {!seen ? (
            <>
              <button
                className="btn btn-secondary"
                onClick={handleClose}
                type="button"
              >
                Start blank
              </button>
              <button
                className="btn btn-primary"
                onClick={handleLoadSample}
                type="button"
              >
                Load sample notes
              </button>
            </>
          ) : (
            <button
              className="btn btn-secondary"
              onClick={handleClose}
              type="button"
            >
              Close
            </button>
          )}
        </div>
      </dialog>
    </>
  );
}
