import { buildPayload } from './build-payload';
import { getBackupSnapshot, updateBackupState } from './backup-state';

export async function runBackup(): Promise<void> {
  const { code, running } = getBackupSnapshot();
  if (running || !code.trim()) return;

  updateBackupState({ running: true });

  try {
    const payload = await buildPayload();
    const fn = new Function('payload', `return (async () => { ${code} })()`);
    await fn(payload);
    updateBackupState({ running: false, lastRunAt: Date.now(), lastRunOk: true, lastRunError: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    updateBackupState({ running: false, lastRunAt: Date.now(), lastRunOk: false, lastRunError: message });
  }
}
