import { useCallback, useSyncExternalStore } from 'react';

import { getRecord, hasRecord, putGenericRecord, requestLoad, subscribe } from '../storage/db-cache';

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
  const raw = useSyncExternalStore(subscribe, () => getRecord(key));

  if (!hasRecord(key)) {
    requestLoad(key);
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- generic IndexedDB value cannot be narrowed further
  const state = isPersistedRecord(raw) ? (raw.value as T) : defaultValue;

  const setValue = useCallback(
    (value: T) => {
      putGenericRecord({ id: key, updatedAt: Date.now(), value });
    },
    [key],
  );

  return [state, setValue];
}
