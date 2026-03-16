import type { RefObject } from 'react';

import { useCallback, useRef } from 'react';

import { usePersistedState } from '../shared/use-persisted-state';

const DEFAULT_RATIO = 60;
const MIN_PANE_PX = 250;
const KEYBOARD_STEP = 2;

interface UsePaneRatioResult {
  containerRef: RefObject<HTMLDivElement | null>;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  ratio: number;
  setRatio: (value: number) => void;
}

export function usePaneRatio(): UsePaneRatioResult {
  const [ratio, setRatio] = usePersistedState('setting:paneRatio', DEFAULT_RATIO);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const clampRatio = useCallback((raw: number): number => {
    const container = containerRef.current;
    if (!container) return raw;
    const width = container.getBoundingClientRect().width;
    const minRatio = (MIN_PANE_PX / width) * 100;
    const maxRatio = 100 - minRatio;
    return Math.min(maxRatio, Math.max(minRatio, raw));
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = true;
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const raw = ((e.clientX - rect.left) / rect.width) * 100;
      setRatio(clampRatio(raw));
    },
    [clampRatio, setRatio],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      e.currentTarget.releasePointerCapture(e.pointerId);
      draggingRef.current = false;
    },
    [],
  );

  return { containerRef, onPointerDown, onPointerMove, onPointerUp, ratio, setRatio };
}

export { KEYBOARD_STEP, MIN_PANE_PX };
