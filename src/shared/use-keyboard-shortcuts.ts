// eslint-disable-next-line no-restricted-imports -- DOM event subscription
import { useEffect } from 'react';

interface KeyboardShortcut {
  alt?: boolean;
  handler: () => void;
  key: string;
  meta: boolean;
  shift?: boolean;
}

export function useKeyboardShortcuts(
  shortcuts: ReadonlyArray<KeyboardShortcut>,
): void {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      for (const shortcut of shortcuts) {
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        if (event.metaKey === shortcut.meta && altMatch && shiftMatch && event.key === shortcut.key) {
          event.preventDefault();
          shortcut.handler();
          return;
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => { window.removeEventListener('keydown', handleKeyDown); };
  }, [shortcuts]);
}
