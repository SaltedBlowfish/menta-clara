import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app/app';
import './backup/backup-scheduler';
import { requestPersistence } from './storage/request-persistence';
import { SyncProvider } from './sync/sync-provider';

void requestPersistence();

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(
    <StrictMode>
      <SyncProvider>
        <App />
      </SyncProvider>
    </StrictMode>,
  );
}
