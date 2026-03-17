import { useMemo, type ReactNode } from 'react';

import { usePersistedState } from '../shared/use-persisted-state';
import { WorkspaceContext, type WorkspaceContextValue } from './workspace-context';

interface WorkspaceProviderProps {
  children: ReactNode;
}

export function WorkspaceProvider(props: WorkspaceProviderProps) {
  const { children } = props;
  const [activeWorkspaceId, setActiveWorkspaceId] = usePersistedState(
    'setting:activeWorkspace',
    'personal',
  );

  const value = useMemo<WorkspaceContextValue>(
    () => ({ activeWorkspaceId, setActiveWorkspaceId }),
    [activeWorkspaceId, setActiveWorkspaceId],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}
