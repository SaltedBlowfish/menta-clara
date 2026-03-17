import { useCallback, useContext, useRef, useState } from 'react';

import type { SearchResult } from '../search/search-notes';

import { searchNotes } from '../search/search-notes';
import { WorkspaceContext } from '../workspace/workspace-context';

export interface UsePaletteResult {
  activeIndex: number;
  close: () => void;
  inputValue: string;
  isCommandMode: boolean;
  isOpen: boolean;
  moveSelection: (direction: 'down' | 'up') => void;
  open: () => void;
  results: ReadonlyArray<SearchResult>;
  searchLoading: boolean;
  setInputValue: (value: string) => void;
}

export function usePalette(): UsePaletteResult {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValueState] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [results, setResults] = useState<ReadonlyArray<SearchResult>>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const savedFocusRef = useRef<Element | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { activeWorkspaceId } = useContext(WorkspaceContext);
  const isCommandMode = inputValue.startsWith('>');

  const setInputValue = useCallback((value: string) => {
    setInputValueState(value);
    clearTimeout(timerRef.current);

    const isCmd = value.startsWith('>');
    const query = value.trim();
    if (isCmd || !query) {
      setResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    timerRef.current = setTimeout(() => {
      searchNotes(query, activeWorkspaceId).then((r) => {
        setResults(r);
        setActiveIndex(0);
        setSearchLoading(false);
      }).catch(() => {
        setSearchLoading(false);
      });
    }, 200);
  }, [activeWorkspaceId]);

  const open = useCallback(() => {
    savedFocusRef.current = document.activeElement;
    setIsOpen(true);
    setInputValueState('');
    setActiveIndex(0);
    setResults([]);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    clearTimeout(timerRef.current);
    const el = savedFocusRef.current;
    if (el instanceof HTMLElement) {
      el.focus();
    }
  }, []);

  const moveSelection = useCallback(
    (direction: 'down' | 'up') => {
      setActiveIndex((prev) => {
        const count = results.length;
        if (count === 0) return 0;
        return direction === 'down'
          ? (prev + 1) % count
          : (prev - 1 + count) % count;
      });
    },
    [results.length],
  );

  return {
    activeIndex,
    close,
    inputValue,
    isCommandMode,
    isOpen,
    moveSelection,
    open,
    results,
    searchLoading,
    setInputValue,
  };
}
