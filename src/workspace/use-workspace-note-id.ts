import { useContext } from 'react';

import { WorkspaceContext } from './workspace-context';

export function useWorkspaceNoteId(noteId: string): string {
  const { activeWorkspaceId } = useContext(WorkspaceContext);

  if (activeWorkspaceId === 'personal') {
    return noteId;
  }

  return `ws:${activeWorkspaceId}:${noteId}`;
}
