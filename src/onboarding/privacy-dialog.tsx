import { useCallback, useRef } from 'react';

import { Tooltip } from '../shared/tooltip';
import './privacy-dialog.css';

export function PrivacyInfo() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleOpen = useCallback(() => {
    dialogRef.current?.showModal();
  }, []);

  const handleClose = useCallback(() => {
    dialogRef.current?.close();
  }, []);

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

      <dialog className="privacy-dialog" ref={dialogRef}>
        <h2 className="privacy-title">About Menta Clara</h2>
        <div className="privacy-body">
          <p>
            A calm, private space for daily and weekly notes.
          </p>
          <p>
            <strong>Your data never leaves your browser.</strong> Notes are
            stored in IndexedDB on this device. There is no server, no account,
            no analytics, no tracking of any kind.
          </p>
          <p>
            Nothing is transmitted. Ever. Not even anonymized usage data.
          </p>
          <p className="privacy-muted">
            Skeptical? Open your browser's Network tab and watch.
            After the initial page load, you'll see zero requests.
          </p>
        </div>
        <button className="privacy-close" onClick={handleClose} type="button">
          Got it
        </button>
      </dialog>
    </>
  );
}
