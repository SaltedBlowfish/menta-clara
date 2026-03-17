import { exportWorkspace } from './export-workspace';
import { importWorkspace } from './import-workspace';

const WORKSPACE_ID = 'personal';

export function handleExport(announce: (msg: string) => void): void {
  void exportWorkspace(WORKSPACE_ID)
    .then(() => announce('Data exported successfully'))
    .catch(() => announce('Export failed. Check that your browser allows file downloads.'));
}

export function handleImport(announce: (msg: string) => void): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.zip,.md';
  input.style.display = 'none';
  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (!file) return;
    void importWorkspace(file, WORKSPACE_ID)
      .then((n) => announce(`${String(n)} notes imported`))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Import failed. The file could not be read.';
        announce(msg);
      });
    input.remove();
  });
  document.body.appendChild(input);
  input.click();
}
