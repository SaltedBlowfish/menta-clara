import { useEffect, useState } from 'react';

import { getDatabase, NOTES_STORE } from '../storage/database';

export interface DailyNoteEntry {
  date: string;     // yyyy-MM-dd
  id: string;       // daily:yyyy-MM-dd
  updatedAt: number;
}

export function useDailyNotesList(): {
  entries: DailyNoteEntry[];
  loading: boolean;
  refresh: () => void;
} {
  const [entries, setEntries] = useState<DailyNoteEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const refresh = () => setTick((t) => t + 1);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const db = await getDatabase();
        const range = IDBKeyRange.bound('daily:', 'daily:\uffff');
        const all = await db.getAll(NOTES_STORE, range);
        if (cancelled) return;

        const mapped: DailyNoteEntry[] = all
          .filter((note) => typeof note === 'object' && note !== null && 'id' in note)
          .map((note) => ({
            date: (note as { id: string }).id.replace('daily:', ''),
            id: (note as { id: string }).id,
            updatedAt: (note as { updatedAt: number }).updatedAt ?? 0,
          }))
          .sort((a, b) => b.date.localeCompare(a.date)); // newest first

        setEntries(mapped);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [tick]);

  return { entries, loading, refresh };
}
