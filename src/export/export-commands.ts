import { useMemo } from 'react';

import type { PaletteCommand } from '../command-palette/command-registry';

import { exportWorkspace } from './export-workspace';
import { importWorkspace } from './import-workspace';

export function useExportCommands(
  announce: (msg: string) => void,
  activeWorkspaceId: string,
): ReadonlyArray<PaletteCommand> {
  return useMemo((): ReadonlyArray<PaletteCommand> => [
    {
      action: () => {
        void exportWorkspace(activeWorkspaceId)
          .then(() => announce('Data exported successfully'))
          .catch(() => announce('Export failed. Check that your browser allows file downloads.'));
      },
      id: 'data-export',
      keywords: ['export', 'download', 'backup', 'zip'],
      name: 'Export Data',
    },
    {
      action: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.zip,.md';
        input.style.display = 'none';
        input.addEventListener('change', () => {
          const file = input.files?.[0];
          if (!file) return;
          void importWorkspace(file, activeWorkspaceId)
            .then((n) => announce(`${String(n)} notes imported`))
            .catch((err: unknown) => {
              const msg = err instanceof Error ? err.message : 'Import failed. The file could not be read.';
              announce(msg);
            });
          input.remove();
        });
        document.body.appendChild(input);
        input.click();
      },
      id: 'data-import',
      keywords: ['import', 'upload', 'restore'],
      name: 'Import Data',
    },
  ], [announce, activeWorkspaceId]);
}
