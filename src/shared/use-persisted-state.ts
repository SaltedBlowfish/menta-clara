import { useCallback, useEffect, useState } from 'react';

import { getDatabase, NOTES_STORE } from '../storage/database';

interface PersistedRecord {
  id: string;
  updatedAt: number;
  value: unknown;
}

function isPersistedRecord(value: unknown): value is PersistedRecord {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'value' in value
  );
}

export function usePersistedState<T>(
  key: string,
  defaultValue: T,
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(defaultValue);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const db = await getDatabase();
      const record: unknown = await db.get(NOTES_STORE, key);

      if (!cancelled && isPersistedRecord(record)) {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- generic IndexedDB value cannot be narrowed further
        setState(record.value as T);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [key]);

  const setValue = useCallback(
    (value: T) => {
      setState(value);

      void (async () => {
        const db = await getDatabase();
        await db.put(NOTES_STORE, {
          id: key,
          updatedAt: Date.now(),
          value,
        });
      })();
    },
    [key],
  );

  return [state, setValue];
}
