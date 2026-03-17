import { useCallback, useRef } from 'react';

import { usePersistedState } from '../shared/use-persisted-state';
import { loadSampleData } from './sample-data';
import './welcome-dialog.css';

export function WelcomeDialog() {
  const [seen, setSeen] = usePersistedState<boolean>('setting:welcomeSeen', false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  if (!seen && dialogRef.current && !dialogRef.current.open) {
    dialogRef.current.showModal();
  }

  const handleDismiss = useCallback(() => {
    dialogRef.current?.close();
    setSeen(true);
  }, [setSeen]);

  const handleLoadSample = useCallback(() => {
    loadSampleData();
    dialogRef.current?.close();
    setSeen(true);
  }, [setSeen]);

  if (seen) return null;

  return (
    <dialog className="welcome-dialog" ref={dialogRef}>
      <h2 className="welcome-title">Welcome to Menta Clara</h2>
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
        <p>
          Want to see how it works? We can load a few sample notes to get you
          started, or you can jump right in with a blank slate.
        </p>
      </div>
      <div className="welcome-actions">
        <button
          className="welcome-btn welcome-btn-secondary"
          onClick={handleDismiss}
          type="button"
        >
          Start blank
        </button>
        <button
          className="welcome-btn welcome-btn-primary"
          onClick={handleLoadSample}
          type="button"
        >
          Load sample notes
        </button>
      </div>
    </dialog>
  );
}
