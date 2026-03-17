import { format } from 'date-fns';
import { useContext, useMemo } from 'react';

import { ActiveNoteContext } from './active-note-context';

export function useActiveNote() {
  const { activeNote, navigateToNote, returnToToday } =
    useContext(ActiveNoteContext);

  const isViewingToday = useMemo(() => {
    const todayId = `daily:${format(new Date(), 'yyyy-MM-dd')}`;
    return activeNote.type === 'daily' && activeNote.id === todayId;
  }, [activeNote]);

  return { activeNote, isViewingToday, navigateToNote, returnToToday };
}
