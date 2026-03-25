import { useCallback, useSyncExternalStore } from 'react';

import { getBackupSnapshot, subscribeBackupState, updateBackupState } from './backup-state';
import { BackupControls } from './backup-controls';
import { BackupEditor } from './backup-editor';
import { BackupStatus } from './backup-status';
import { runBackup } from './run-backup';
import './backup-tab.css';

export function BackupTab() {
  const snap = useSyncExternalStore(subscribeBackupState, getBackupSnapshot);

  const handleCodeChange = useCallback((code: string) => {
    updateBackupState({ code });
  }, []);

  const handleSelectTemplate = useCallback((code: string) => {
    updateBackupState({ code });
  }, []);

  const handleToggleEnabled = useCallback((enabled: boolean) => {
    updateBackupState({ enabled });
  }, []);

  const handleChangeInterval = useCallback((intervalMinutes: number) => {
    updateBackupState({ intervalMinutes });
  }, []);

  const handleRunNow = useCallback(() => {
    void runBackup();
  }, []);

  return (
    <div className="backup-tab">
      <p className="backup-hint">
        Write JavaScript that receives a <code>payload</code> object with your notes, images, and history.
        Use <code>fetch()</code> to send it wherever you want.
      </p>

      <BackupControls
        enabled={snap.enabled}
        intervalMinutes={snap.intervalMinutes}
        onChangeInterval={handleChangeInterval}
        onRunNow={handleRunNow}
        onSelectTemplate={handleSelectTemplate}
        onToggleEnabled={handleToggleEnabled}
        running={snap.running}
      />

      <BackupEditor code={snap.code} onChange={handleCodeChange} />

      <BackupStatus
        lastRunAt={snap.lastRunAt}
        lastRunError={snap.lastRunError}
        lastRunOk={snap.lastRunOk}
      />
    </div>
  );
}
