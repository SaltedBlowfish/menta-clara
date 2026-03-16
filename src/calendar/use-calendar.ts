import { addMonths, format, startOfMonth, subMonths } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';

import { getDatabase, NOTES_STORE } from '../storage/database';

interface UseCalendarResult {
  daysWithNotes: ReadonlySet<string>;
  displayedMonth: Date;
  goToNextMonth: () => void;
  goToPreviousMonth: () => void;
  monthLabel: string;
}

async function fetchDaysWithNotes(month: Date): Promise<ReadonlySet<string>> {
  const year = month.getFullYear();
  const monthNum = month.getMonth() + 1;
  const monthStr = `${String(year)}-${String(monthNum).padStart(2, '0')}`;
  const db = await getDatabase();
  const range = IDBKeyRange.bound(
    `daily:${monthStr}-01`,
    `daily:${monthStr}-31`,
  );
  const keys = await db.getAllKeys(NOTES_STORE, range);
  const stringKeys = keys.map(String);
  return new Set(stringKeys.map((key) => key.replace('daily:', '')));
}

export function useCalendar(selectedDate: Date): UseCalendarResult {
  const [displayedMonth, setDisplayedMonth] = useState<Date>(
    () => startOfMonth(selectedDate),
  );
  const [daysWithNotes, setDaysWithNotes] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  useEffect(() => {
    setDisplayedMonth(startOfMonth(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    let cancelled = false;

    void fetchDaysWithNotes(displayedMonth).then((dates) => {
      if (!cancelled) setDaysWithNotes(dates);
    });

    return () => { cancelled = true; };
  }, [displayedMonth]);

  const goToNextMonth = useCallback(() => {
    setDisplayedMonth((prev) => addMonths(prev, 1));
  }, []);

  const goToPreviousMonth = useCallback(() => {
    setDisplayedMonth((prev) => subMonths(prev, 1));
  }, []);

  const monthLabel = format(displayedMonth, 'MMMM yyyy');

  return { daysWithNotes, displayedMonth, goToNextMonth, goToPreviousMonth, monthLabel };
}
