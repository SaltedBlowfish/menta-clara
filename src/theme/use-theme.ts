import { useCallback, useMemo, useSyncExternalStore } from 'react';

import { usePersistedState } from '../shared/use-persisted-state';

type Theme = 'dark' | 'light';

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

const mql = window.matchMedia('(prefers-color-scheme: dark)');

function subscribeToSystemTheme(cb: () => void) {
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
}

export function useTheme(): { theme: Theme; toggle: () => void } {
  const [preference, setPreference] = usePersistedState<Theme | null>(
    'setting:theme',
    null,
  );

  const systemTheme = useSyncExternalStore(subscribeToSystemTheme, getSystemTheme);
  const resolvedTheme: Theme = preference ?? systemTheme;

  // Sync DOM attribute during render
  document.documentElement.setAttribute('data-theme', resolvedTheme);

  const toggle = useCallback(() => {
    setPreference(resolvedTheme === 'light' ? 'dark' : 'light');
  }, [resolvedTheme, setPreference]);

  return useMemo(
    () => ({ theme: resolvedTheme, toggle }),
    [resolvedTheme, toggle],
  );
}
