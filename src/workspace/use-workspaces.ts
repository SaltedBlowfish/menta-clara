import { useCallback, useContext } from 'react';

import { usePersistedState } from '../shared/use-persisted-state';
import { getDatabase, NOTES_STORE } from '../storage/database';
import { WorkspaceContext } from './workspace-context';

export interface Workspace {
  id: string;
  name: string;
}

export interface UseWorkspacesResult {
  activeWorkspace: Workspace;
  createWorkspace: (name: string) => string;
  deleteWorkspace: (workspaceId: string) => void;
  renameWorkspace: (workspaceId: string, name: string) => void;
  switchWorkspace: (workspaceId: string) => void;
  workspaces: ReadonlyArray<Workspace>;
}

const DEFAULT_WORKSPACES: ReadonlyArray<Workspace> = [
  { id: 'personal', name: 'Personal' },
];

export function useWorkspaces(): UseWorkspacesResult {
  const [workspaces, setWorkspaces] = usePersistedState<ReadonlyArray<Workspace>>(
    'setting:workspaces',
    DEFAULT_WORKSPACES,
  );
  const { activeWorkspaceId, setActiveWorkspaceId } = useContext(WorkspaceContext);

  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) ?? workspaces[0] ?? DEFAULT_WORKSPACES[0];

  const createWorkspace = useCallback(
    (name: string): string => {
      const id = `ws-${crypto.randomUUID()}`;
      setWorkspaces([...workspaces, { id, name }]);
      return id;
    },
    [workspaces, setWorkspaces],
  );

  const switchWorkspace = useCallback(
    (workspaceId: string) => {
      setActiveWorkspaceId(workspaceId);
    },
    [setActiveWorkspaceId],
  );

  const renameWorkspace = useCallback(
    (workspaceId: string, name: string) => {
      setWorkspaces(workspaces.map((w) => (w.id === workspaceId ? { ...w, name } : w)));
    },
    [workspaces, setWorkspaces],
  );

  const deleteWorkspace = useCallback(
    (workspaceId: string) => {
      if (workspaces.length <= 1) return;

      const confirmed = window.confirm(
        'All notes, templates, and settings in this workspace will be permanently deleted. This cannot be undone.',
      );
      if (!confirmed) return;

      setWorkspaces(workspaces.filter((w) => w.id !== workspaceId));

      if (activeWorkspaceId === workspaceId) {
        const remaining = workspaces.filter((w) => w.id !== workspaceId);
        setActiveWorkspaceId(remaining[0]?.id ?? 'personal');
      }

      void (async () => {
        const db = await getDatabase();
        const prefix = `ws:${workspaceId}:`;
        const range = IDBKeyRange.bound(prefix, `${prefix}\uffff`);
        const keys = await db.getAllKeys(NOTES_STORE, range);
        const tx = db.transaction(NOTES_STORE, 'readwrite');
        for (const key of keys) {
          void tx.store.delete(key);
        }
        await tx.done;
      })();
    },
    [workspaces, activeWorkspaceId, setWorkspaces, setActiveWorkspaceId],
  );

  return { activeWorkspace, createWorkspace, deleteWorkspace, renameWorkspace, switchWorkspace, workspaces };
}
