import { useMemo, useSyncExternalStore } from 'react';

import { getRangeRecords, requestRangeLoad, subscribe } from '../storage/db-cache';

export interface DailyNoteEntry {
  date: string;     // yyyy-MM-dd
  id: string;       // daily:yyyy-MM-dd
  updatedAt: number;
}

const RANGE_PREFIX = 'daily:';

export function useDailyNotesList(): {
  entries: DailyNoteEntry[];
  loading: boolean;
  refresh: () => void;
} {
  const rangeRecords = useSyncExternalStore(subscribe, () => getRangeRecords(RANGE_PREFIX));
  if (rangeRecords === undefined) {
    requestRangeLoad(RANGE_PREFIX);
  }

  const loading = rangeRecords === undefined;

  const entries = useMemo<DailyNoteEntry[]>(() => {
    if (!rangeRecords) return [];
    return rangeRecords
      .filter((note): note is { id: string; updatedAt: number } =>
        typeof note === 'object' && note !== null && 'id' in note && 'updatedAt' in note,
      )
      .map((note) => ({
        date: note.id.replace('daily:', ''),
        id: note.id,
        updatedAt: note.updatedAt,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [rangeRecords]);

  const refresh = () => {
    // Range cache is automatically invalidated on save/delete via db-cache,
    // so this is a no-op now. Kept for API compatibility.
  };

  return { entries, loading, refresh };
}
