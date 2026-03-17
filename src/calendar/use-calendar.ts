import { addMonths, format, startOfMonth, subMonths } from 'date-fns';
import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import { getRangeRecords, requestRangeLoad, subscribe } from '../storage/db-cache';

interface UseCalendarResult {
  daysWithNotes: ReadonlySet<string>;
  displayedMonth: Date;
  goToNextMonth: () => void;
  goToPreviousMonth: () => void;
  monthLabel: string;
}

export function useCalendar(selectedDate: Date): UseCalendarResult {
  const [monthOverride, setMonthOverride] = useState<Date | null>(null);
  const prevSelectedRef = useRef(selectedDate);

  // Reset override when selectedDate changes
  if (prevSelectedRef.current !== selectedDate) {
    prevSelectedRef.current = selectedDate;
    if (monthOverride !== null) {
      setMonthOverride(null);
    }
  }

  const displayedMonth = monthOverride ?? startOfMonth(selectedDate);

  const year = displayedMonth.getFullYear();
  const monthNum = displayedMonth.getMonth() + 1;
  const monthStr = `${String(year)}-${String(monthNum).padStart(2, '0')}`;
  const rangePrefix = `daily:${monthStr}-`;

  const rangeRecords = useSyncExternalStore(subscribe, () => getRangeRecords(rangePrefix));
  if (rangeRecords === undefined) {
    requestRangeLoad(rangePrefix);
  }

  const daysWithNotes = useMemo<ReadonlySet<string>>(() => {
    if (!rangeRecords) return new Set();
    return new Set(
      rangeRecords
        .filter((r): r is { id: string } => typeof r === 'object' && r !== null && 'id' in r)
        .map((r) => r.id.replace('daily:', '')),
    );
  }, [rangeRecords]);

  const goToNextMonth = useCallback(() => {
    setMonthOverride((prev) => addMonths(prev ?? startOfMonth(selectedDate), 1));
  }, [selectedDate]);

  const goToPreviousMonth = useCallback(() => {
    setMonthOverride((prev) => subMonths(prev ?? startOfMonth(selectedDate), 1));
  }, [selectedDate]);

  const monthLabel = format(displayedMonth, 'MMMM yyyy');

  return { daysWithNotes, displayedMonth, goToNextMonth, goToPreviousMonth, monthLabel };
}
