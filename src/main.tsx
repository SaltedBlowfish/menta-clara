import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app/app';
import { requestPersistence } from './storage/request-persistence';
import { WorkspaceProvider } from './workspace/workspace-provider';

void requestPersistence();

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(
    <StrictMode>
      <WorkspaceProvider>
        <App />
      </WorkspaceProvider>
    </StrictMode>,
  );
}
