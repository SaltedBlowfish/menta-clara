import { createContext } from 'react';

export interface ActiveNote {
  id: string;
  type: 'daily' | 'permanent' | 'weekly';
}

export interface ActiveNoteContextValue {
  activeNote: ActiveNote;
  navigateToNote: (note: ActiveNote) => void;
  returnToToday: () => void;
}

export const ActiveNoteContext = createContext<ActiveNoteContextValue>({
  activeNote: { id: '', type: 'daily' },
  navigateToNote: () => undefined,
  returnToToday: () => undefined,
});
