import { useEffect } from 'react';

interface KeyboardShortcut {
  handler: () => void;
  key: string;
  meta: boolean;
}

export function useKeyboardShortcuts(
  shortcuts: ReadonlyArray<KeyboardShortcut>,
): void {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      for (const shortcut of shortcuts) {
        if (event.metaKey === shortcut.meta && event.key === shortcut.key) {
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
