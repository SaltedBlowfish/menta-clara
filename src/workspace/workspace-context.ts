import { createContext } from 'react';

export interface WorkspaceContextValue {
  activeWorkspaceId: string;
  setActiveWorkspaceId: (id: string) => void;
}

export const WorkspaceContext = createContext<WorkspaceContextValue>({
  activeWorkspaceId: 'personal',
  setActiveWorkspaceId: () => undefined,
});
