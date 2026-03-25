import { getBackupSnapshot, subscribeBackupState } from './backup-state';
import { runBackup } from './run-backup';

let timer: ReturnType<typeof setInterval> | undefined;

function restart() {
  clearInterval(timer);
  timer = undefined;

  const { enabled, intervalMinutes } = getBackupSnapshot();
  if (!enabled || intervalMinutes <= 0) return;

  timer = setInterval(() => { void runBackup(); }, intervalMinutes * 60_000);
}

subscribeBackupState(restart);
restart();
