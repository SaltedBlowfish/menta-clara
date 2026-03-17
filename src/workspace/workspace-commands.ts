import { useMemo } from 'react';

import type { PaletteCommand } from '../command-palette/command-registry';
import type { Workspace } from './use-workspaces';

interface UseWorkspaceCommandsOptions {
  announce: (msg: string) => void;
  createWorkspace: (name: string) => string;
  deleteWorkspace: (id: string) => void;
  renameWorkspace: (id: string, name: string) => void;
  switchWorkspace: (id: string) => void;
  workspaces: ReadonlyArray<Workspace>;
}

function pickWorkspace(workspaces: ReadonlyArray<Workspace>, action: string): Workspace | null {
  const list = workspaces.map((w, i) => `${String(i + 1)}. ${w.name}`).join('\n');
  const input = window.prompt(`${action}:\n${list}`);
  if (!input) return null;
  const idx = parseInt(input, 10) - 1;
  return workspaces[idx] ?? null;
}

export function useWorkspaceCommands(options: UseWorkspaceCommandsOptions): ReadonlyArray<PaletteCommand> {
  const { announce, createWorkspace, deleteWorkspace, renameWorkspace, switchWorkspace, workspaces } = options;

  return useMemo((): ReadonlyArray<PaletteCommand> => [
    {
      action: () => {
        const name = window.prompt('Workspace name:');
        if (!name) return;
        createWorkspace(name);
        announce(`Workspace ${name} created`);
      },
      id: 'ws-create', keywords: ['create', 'workspace', 'new'], name: 'Create Workspace',
    },
    {
      action: () => {
        const w = pickWorkspace(workspaces, 'Switch workspace');
        if (w) { switchWorkspace(w.id); announce(`Switched to ${w.name}`); }
      },
      id: 'ws-switch', keywords: ['switch', 'workspace'], name: 'Switch Workspace',
    },
    {
      action: () => {
        const w = pickWorkspace(workspaces, 'Rename workspace');
        if (!w) return;
        const newName = window.prompt('New name:', w.name);
        if (newName) { renameWorkspace(w.id, newName); announce(`Workspace renamed to ${newName}`); }
      },
      id: 'ws-rename', keywords: ['rename', 'workspace'], name: 'Rename Workspace',
    },
    {
      action: () => {
        const w = pickWorkspace(workspaces, 'Delete workspace');
        if (w) deleteWorkspace(w.id);
      },
      id: 'ws-delete', keywords: ['delete', 'workspace', 'remove'], name: 'Delete Workspace',
    },
  ], [announce, createWorkspace, deleteWorkspace, renameWorkspace, switchWorkspace, workspaces]);
}
