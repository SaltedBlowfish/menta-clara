import { useCallback } from 'react';

interface PaneDividerProps {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  ratio: number;
  setRatio: (value: number) => void;
}

export function PaneDivider(props: PaneDividerProps) {
  const { onPointerDown, onPointerMove, onPointerUp, ratio, setRatio } = props;

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setRatio(ratio - 2);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setRatio(ratio + 2);
      }
    },
    [ratio, setRatio],
  );

  return (
    <div
      aria-controls="daily-pane"
      aria-label="Resize panes"
      aria-orientation="vertical"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.round(ratio)}
      className="pane-divider"
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      role="separator"
      tabIndex={0}
    />
  );
}
