import { useCallback, useEffect, useMemo } from 'react';

import { usePersistedState } from '../shared/use-persisted-state';

type Theme = 'dark' | 'light';

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function useTheme(): { theme: Theme; toggle: () => void } {
  const [preference, setPreference] = usePersistedState<Theme | null>(
    'setting:theme',
    null,
  );

  const resolvedTheme: Theme = preference ?? getSystemTheme();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (preference !== null) {
      return;
    }

    const mql = window.matchMedia('(prefers-color-scheme: dark)');

    function handleChange() {
      document.documentElement.setAttribute(
        'data-theme',
        getSystemTheme(),
      );
    }

    mql.addEventListener('change', handleChange);

    return () => {
      mql.removeEventListener('change', handleChange);
    };
  }, [preference]);

  const toggle = useCallback(() => {
    setPreference(resolvedTheme === 'light' ? 'dark' : 'light');
  }, [resolvedTheme, setPreference]);

  return useMemo(
    () => ({ theme: resolvedTheme, toggle }),
    [resolvedTheme, toggle],
  );
}
